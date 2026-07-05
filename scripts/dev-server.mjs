import { spawn } from 'node:child_process'
import {
  closeSync,
  existsSync,
  mkdirSync,
  openSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { resolve } from 'node:path'
import { execFileSync } from 'node:child_process'

const root = resolve(process.cwd())
const controlDir = resolve(root, '.nuxt', 'dev-control')
const stateFile = resolve(controlDir, 'server.json')
const logFile = resolve(controlDir, 'server.log')
const errFile = resolve(controlDir, 'server.err.log')
const nuxtLockFile = resolve(root, '.nuxt', 'nuxt.lock')
const contentCacheFiles = [
  resolve(root, '.data', 'content', 'contents.sqlite'),
  resolve(root, '.data', 'content', 'contents.sqlite-shm'),
  resolve(root, '.data', 'content', 'contents.sqlite-wal'),
]
const defaultHost = '127.0.0.1'
const defaultPort = 8888
const defaultPath = '/guide/code-block'

function parseArgs(argv) {
  const options = {
    action: argv[0] || 'status',
    host: defaultHost,
    port: defaultPort,
    path: defaultPath,
    timeout: 45_000,
    wait: true,
    cleanContentCache: false,
    preserveContentCache: false,
  }

  for (const arg of argv.slice(1)) {
    if (!arg.startsWith('--')) {
      continue
    }

    const [key, value = ''] = arg.slice(2).split('=')

    if (key === 'host') {
      options.host = value || defaultHost
    } else if (key === 'port') {
      options.port = Number(value || defaultPort)
    } else if (key === 'path') {
      options.path = value || defaultPath
    } else if (key === 'timeout') {
      options.timeout = Number(value || options.timeout)
    } else if (key === 'clean-content-cache') {
      options.cleanContentCache = true
    } else if (key === 'preserve-content-cache') {
      options.preserveContentCache = true
    } else if (key === 'no-wait') {
      options.wait = false
    }
  }

  return options
}

function ensureControlDir() {
  mkdirSync(controlDir, { recursive: true })
}

function readJson(path) {
  if (!existsSync(path)) {
    return null
  }

  try {
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch {
    return null
  }
}

function writeJson(path, value) {
  ensureControlDir()
  writeFileSync(path, JSON.stringify(value, null, 2) + '\n')
}

function resetLogFiles() {
  ensureControlDir()
  writeFileSync(logFile, '')
  writeFileSync(errFile, '')
}

function isAlive(pid) {
  if (!pid || Number.isNaN(Number(pid))) {
    return false
  }

  try {
    process.kill(Number(pid), 0)
    return true
  } catch {
    return false
  }
}

function powerShellPath() {
  const pwsh = 'C:\\Program Files\\PowerShell\\7\\pwsh.exe'

  return existsSync(pwsh) ? pwsh : 'powershell.exe'
}

function listWindowsProcesses() {
  if (process.platform !== 'win32') {
    return []
  }

  const output = execFileSync(
    powerShellPath(),
    [
      '-NoProfile',
      '-ExecutionPolicy',
      'Bypass',
      '-Command',
      'Get-CimInstance Win32_Process | Select-Object ProcessId,ParentProcessId,CommandLine | ConvertTo-Json -Compress',
    ],
    {
      encoding: 'utf8',
      maxBuffer: 16 * 1024 * 1024,
    },
  ).trim()

  if (!output) {
    return []
  }

  const parsed = JSON.parse(output)

  return Array.isArray(parsed) ? parsed : [parsed]
}

function normalizePathText(value) {
  return String(value || '').replaceAll('/', '\\').toLowerCase()
}

function isWorkspaceNuxtDevProcess(processInfo) {
  const commandLine = normalizePathText(processInfo.CommandLine)
  const workspace = normalizePathText(root)

  if (!commandLine.includes(workspace)) {
    return false
  }

  return (
    (commandLine.includes('nuxt.mjs') && commandLine.includes(' dev')) ||
    commandLine.includes('@nuxt\\cli') && commandLine.includes('\\dev\\index.mjs')
  )
}

function findWorkspaceNuxtDevProcesses() {
  if (process.platform !== 'win32') {
    return []
  }

  return listWindowsProcesses().filter(isWorkspaceNuxtDevProcess)
}

function findRootWorkspaceNuxtDevProcesses(processes) {
  const devPids = new Set(processes.map((item) => Number(item.ProcessId)))

  return processes.filter((item) => !devPids.has(Number(item.ParentProcessId)))
}

function clearNuxtContentCache(options = {}) {
  const removed = []

  for (const file of contentCacheFiles) {
    if (!existsSync(file)) {
      continue
    }

    rmSync(file, { force: true })
    removed.push(file)
  }

  if (options.print !== false) {
    console.log(
      removed.length > 0
        ? `Cleared Nuxt Content cache: ${removed.join(', ')}`
        : 'Nuxt Content cache was already clean.',
    )
  }

  return removed
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function readTextFile(path) {
  if (!existsSync(path)) {
    return ''
  }

  try {
    return readFileSync(path, 'utf8')
  } catch {
    return ''
  }
}

async function waitForStartupLog(timeout) {
  const deadline = Date.now() + timeout

  while (Date.now() < deadline) {
    const log = readTextFile(logFile)

    if (log.includes('Processed ') && log.includes('Nuxt Nitro server built')) {
      return true
    }

    await sleep(500)
  }

  return false
}

function stopPid(pid) {
  if (!isAlive(pid)) {
    return false
  }

  try {
    process.kill(Number(pid), 'SIGTERM')
  } catch {
    return false
  }

  const deadline = Date.now() + 4000

  while (Date.now() < deadline) {
    if (!isAlive(pid)) {
      return true
    }
  }

  try {
    process.kill(Number(pid), 'SIGKILL')
  } catch {
    return false
  }

  return !isAlive(pid)
}

function cleanupStaleNuxtLock() {
  const lock = readJson(nuxtLockFile)

  if (!lock?.pid || isAlive(lock.pid)) {
    return false
  }

  rmSync(nuxtLockFile, { force: true })
  return true
}

async function canConnect(host, port) {
  try {
    const response = await fetch(`http://${host}:${port}/`, {
      signal: AbortSignal.timeout(1500),
    })

    return response.status > 0
  } catch {
    return false
  }
}

async function health(options) {
  const url = `http://${options.host}:${options.port}${options.path}`

  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(options.timeout),
    })
    const body = await response.text()

    return {
      ok: response.ok,
      status: response.status,
      bytes: body.length,
      hasNuxtError: body.includes('An error has occurred'),
      hasPageNotFound: body.includes('Page not found'),
      hasCodeBlock: body.includes('fd-doc-code-block'),
      url,
    }
  } catch (error) {
    return {
      ok: false,
      status: 0,
      bytes: 0,
      hasNuxtError: false,
      hasPageNotFound: false,
      hasCodeBlock: false,
      url,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

async function waitForHealth(options) {
  const deadline = Date.now() + options.timeout
  let last = null

  while (Date.now() < deadline) {
    last = await health({ ...options, timeout: 4000 })

    if (last.ok && !last.hasNuxtError && !last.hasPageNotFound) {
      return last
    }

    await sleep(1000)
  }

  return last ?? (await health({ ...options, timeout: 4000 }))
}

function nuxtBin() {
  const path = resolve(root, 'node_modules', 'nuxt', 'bin', 'nuxt.mjs')

  if (!existsSync(path)) {
    throw new Error(`Nuxt CLI not found: ${path}`)
  }

  return path
}

async function stop(options) {
  const state = readJson(stateFile)
  const stopped = []

  if (state?.pid) {
    if (stopPid(state.pid)) {
      stopped.push(Number(state.pid))
    }
  }

  for (const item of findWorkspaceNuxtDevProcesses()) {
    const pid = Number(item.ProcessId)

    if (pid !== process.pid && !stopped.includes(pid) && stopPid(pid)) {
      stopped.push(pid)
    }
  }

  rmSync(stateFile, { force: true })

  if (options.print !== false) {
    console.log(
      stopped.length > 0
        ? `Stopped dev server process(es): ${stopped.join(', ')}`
        : 'No managed dev server process was running.',
    )
  }

  return stopped
}

async function start(options) {
  const state = readJson(stateFile)

  if (state?.pid && isAlive(state.pid)) {
    console.log(`Dev server already managed: pid=${state.pid}`)
    return state
  }

  cleanupStaleNuxtLock()

  if (await canConnect(options.host, options.port)) {
    throw new Error(
      `Port ${options.host}:${options.port} is already reachable. Run stop/restart first.`,
    )
  }

  if (options.cleanContentCache) {
    clearNuxtContentCache()
  }

  resetLogFiles()
  const out = openSync(logFile, 'a')
  const err = openSync(errFile, 'a')
  const child = spawn(
    process.execPath,
    [nuxtBin(), 'dev', '--host', options.host, '--port', String(options.port)],
    {
      cwd: root,
      detached: true,
      stdio: ['ignore', out, err],
      windowsHide: true,
      env: {
        ...process.env,
        NUXT_TELEMETRY_DISABLED: '1',
      },
    },
  )

  child.unref()
  closeSync(out)
  closeSync(err)

  const nextState = {
    pid: child.pid,
    host: options.host,
    port: options.port,
    url: `http://${options.host}:${options.port}/`,
    cwd: root,
    startedAt: new Date().toISOString(),
    logFile,
    errFile,
  }

  writeJson(stateFile, nextState)
  console.log(`Started dev server: pid=${child.pid}, url=${nextState.url}`)
  console.log(`Logs: ${logFile}`)

  if (options.wait) {
    await waitForStartupLog(options.timeout)
    const result = await waitForHealth(options)
    const ok = result.ok && !result.hasNuxtError && !result.hasPageNotFound

    console.log(
      `Health: ${ok ? 'ok' : 'fail'} status=${result.status} bytes=${result.bytes} nuxtError=${result.hasNuxtError} pageNotFound=${result.hasPageNotFound} url=${result.url}`,
    )

    if (!ok) {
      process.exitCode = 1
    }
  }

  return nextState
}

async function status(options) {
  const state = readJson(stateFile)
  const processes = findWorkspaceNuxtDevProcesses()
  const rootProcesses = findRootWorkspaceNuxtDevProcesses(processes)
  const childProcesses = processes.filter(
    (item) => !rootProcesses.includes(item),
  )
  const portReachable = await canConnect(options.host, options.port)

  console.log(`State file: ${existsSync(stateFile) ? stateFile : 'missing'}`)
  console.log(`Managed pid: ${state?.pid ?? 'none'}`)
  console.log(`Managed alive: ${state?.pid ? isAlive(state.pid) : false}`)
  console.log(`Workspace Nuxt dev root processes: ${rootProcesses.map((item) => item.ProcessId).join(', ') || 'none'}`)
  console.log(`Workspace Nuxt dev child processes: ${childProcesses.map((item) => item.ProcessId).join(', ') || 'none'}`)
  console.log(`Port reachable: ${portReachable}`)
  console.log(`Log file: ${logFile}`)
}

async function main() {
  const options = parseArgs(process.argv.slice(2))

  if (options.action === 'start') {
    await start(options)
  } else if (options.action === 'stop') {
    await stop(options)
  } else if (options.action === 'restart') {
    await stop({ ...options, print: true })
    if (!options.preserveContentCache) {
      clearNuxtContentCache()
    }
    await start({ ...options, cleanContentCache: false })
  } else if (options.action === 'health') {
    const result = await health(options)
    console.log(
      `Health: ${result.ok && !result.hasNuxtError && !result.hasPageNotFound ? 'ok' : 'fail'} status=${result.status} bytes=${result.bytes} nuxtError=${result.hasNuxtError} pageNotFound=${result.hasPageNotFound} url=${result.url}`,
    )

    if (result.error) {
      console.log(`Error: ${result.error}`)
    }

    if (!result.ok || result.hasNuxtError || result.hasPageNotFound) {
      process.exitCode = 1
    }
  } else if (options.action === 'status') {
    await status(options)
  } else {
    console.error('Usage: node scripts/dev-server.mjs start|stop|restart|status|health [--host=127.0.0.1] [--port=8888] [--path=/guide/code-block] [--clean-content-cache] [--preserve-content-cache]')
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
