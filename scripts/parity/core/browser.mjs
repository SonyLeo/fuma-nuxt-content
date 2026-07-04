import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

function tokenForSelector(selector) {
  if (selector.startsWith('#')) {
    return `id="${selector.slice(1)}"`
  }

  if (selector.startsWith('.')) {
    return selector.slice(1)
  }

  return `<${selector}`
}

export async function httpPreflight(options) {
  const checks = []
  let body = ''
  let status = 0
  const expectedStatus = Number(options.expectedStatus || 200)

  try {
    const response = await fetch(options.url, {
      headers: {
        accept: 'text/html',
      },
    })
    status = response.status
    body = await response.text()
    checks.push({
      label: `http ${expectedStatus}`,
      pass: response.status === expectedStatus,
      message: `received ${response.status}`,
    })
  } catch (error) {
    checks.push({
      label: 'fetch url',
      pass: false,
      message: error instanceof Error ? error.message : String(error),
    })
  }

  checks.push({
    label: 'minimum html size',
    pass: body.length >= options.minBytes,
    message: `received ${body.length} bytes`,
  })
  checks.push({
    label: 'not nuxt error page',
    pass: body.length > 0 && !body.includes('An error has occurred'),
    message: body.includes('An error has occurred')
      ? 'Nuxt error page detected'
      : 'no Nuxt error marker',
  })

  if (options.selector) {
    const token = tokenForSelector(options.selector)
    checks.push({
      label: `ssr selector ${options.selector}`,
      pass: body.includes(token),
      message: `looked for ${JSON.stringify(token)}`,
    })
  }

  return {
    bytes: body.length,
    checks,
    status,
  }
}

async function waitForChrome(port, attempts = 40) {
  for (let index = 0; index < attempts; index++) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/version`)

      if (response.ok) {
        return true
      }
    } catch {
      // Chrome is still starting.
    }

    await new Promise((resolve) => setTimeout(resolve, 125))
  }

  return false
}

export async function ensureChrome(options) {
  if (await waitForChrome(options.chromePort, 1)) {
    return {
      close() {},
      owned: false,
    }
  }

  if (!existsSync(options.chromePath)) {
    throw new Error(`Chrome executable not found: ${options.chromePath}`)
  }

  const profile = await mkdtemp(join(tmpdir(), 'codex-parity-run-'))
  const child = spawn(
    options.chromePath,
    [
      '--headless=new',
      `--remote-debugging-port=${options.chromePort}`,
      `--user-data-dir=${profile}`,
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      'about:blank',
    ],
    {
      stdio: 'ignore',
      windowsHide: true,
    },
  )

  if (!(await waitForChrome(options.chromePort))) {
    child.kill()
    throw new Error(`Chrome did not start on port ${options.chromePort}`)
  }

  return {
    close() {
      child.kill()
    },
    owned: true,
  }
}

async function connectCdp(webSocketDebuggerUrl) {
  const ws = new WebSocket(webSocketDebuggerUrl)

  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true })
    ws.addEventListener('error', reject, { once: true })
  })

  let id = 0
  const events = []
  const pending = new Map()

  ws.addEventListener('message', (event) => {
    const message = JSON.parse(event.data)

    if (message.id && pending.has(message.id)) {
      const { reject, resolve } = pending.get(message.id)
      pending.delete(message.id)

      if (message.error) {
        reject(new Error(JSON.stringify(message.error)))
      } else {
        resolve(message.result)
      }

      return
    }

    if (message.method) {
      events.push(message)
    }
  })

  return {
    close() {
      ws.close()
    },
    events,
    send(method, params = {}) {
      const callId = ++id
      ws.send(JSON.stringify({ id: callId, method, params }))

      return new Promise((resolve, reject) => {
        pending.set(callId, { reject, resolve })
      })
    },
  }
}

export async function evaluateProfile(options, viewport, expression) {
  const target = await fetch(
    `http://127.0.0.1:${options.chromePort}/json/new?${encodeURIComponent('about:blank')}`,
    { method: 'PUT' },
  ).then((response) => response.json())
  const cdp = await connectCdp(target.webSocketDebuggerUrl)

  try {
    await cdp.send('Page.enable')
    await cdp.send('Runtime.enable')
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      deviceScaleFactor: 1,
      height: viewport.height,
      mobile: false,
      width: viewport.width,
    })
    await cdp.send('Page.navigate', { url: options.url })

    for (let index = 0; index < 80; index++) {
      if (cdp.events.some((event) => event.method === 'Page.loadEventFired')) {
        break
      }

      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    await new Promise((resolve) => setTimeout(resolve, options.settleMs))

    const result = await cdp.send('Runtime.evaluate', {
      awaitPromise: true,
      expression,
      returnByValue: true,
    })

    if (result.exceptionDetails) {
      throw new Error(
        result.exceptionDetails.exception?.description ??
          result.exceptionDetails.text ??
          'Runtime.evaluate failed',
      )
    }

    return result.result.value
  } finally {
    cdp.close()
  }
}
