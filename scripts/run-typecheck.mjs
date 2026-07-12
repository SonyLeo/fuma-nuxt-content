import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { spawn } from 'node:child_process'

const root = resolve(process.cwd())
const nuxtCli = resolve(root, 'node_modules', 'nuxt', 'bin', 'nuxt.mjs')

if (!existsSync(nuxtCli)) {
  console.error(`Nuxt CLI not found: ${nuxtCli}`)
  process.exit(1)
}

const child = spawn(process.execPath, [nuxtCli, 'typecheck'], {
  cwd: root,
  env: {
    ...process.env,
    NUXT_BUILD_DIR: '.nuxt-typecheck',
  },
  shell: false,
  stdio: 'inherit',
})

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    return
  }

  process.exit(code ?? 1)
})
