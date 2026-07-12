// @vitest-environment node

import { execFile } from 'node:child_process'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'
import { afterEach, describe, expect, test } from 'vitest'

const execFileAsync = promisify(execFile)
const validatorPath = path.resolve('scripts/validate-docs-links.mjs')
const ownedDirectories: string[] = []

async function createFixture(files: Record<string, string>) {
  const directory = await mkdtemp(path.join(tmpdir(), 'docs-validator-'))
  ownedDirectories.push(directory)

  await Promise.all(
    Object.entries(files).map(async ([relativePath, content]) => {
      const file = path.join(directory, relativePath)
      await mkdir(path.dirname(file), { recursive: true })
      await writeFile(file, content, 'utf8')
    }),
  )

  return directory
}

async function runValidator(contentDirectory: string) {
  try {
    const result = await execFileAsync(
      process.execPath,
      [validatorPath, contentDirectory],
      { cwd: process.cwd(), windowsHide: true },
    )
    return { exitCode: 0, ...result }
  } catch (error) {
    const result = error as { code?: number; stdout?: string; stderr?: string }
    return {
      exitCode: result.code ?? 1,
      stdout: result.stdout ?? '',
      stderr: result.stderr ?? '',
    }
  }
}

afterEach(async () => {
  await Promise.all(
    ownedDirectories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true })),
  )
})

describe('docs link validator hard gate', () => {
  test('passes a valid isolated content fixture', async () => {
    const content = await createFixture({
      'guide/meta.json': '{"title":"Guide"}',
      'guide/index.md': '---\ntitle: Guide\n---\n\n[Child](/guide/child)\n',
      'guide/child.md': '---\ntitle: Child\n---\n',
    })

    const result = await runValidator(content)
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toContain('2 pages, 1 links')
  })

  test('fails duplicate normalized public routes with all source owners', async () => {
    const content = await createFixture({
      'one.md': '---\ntitle: One\nslug: /shared\n---\n',
      'nested/two.md': '---\ntitle: Two\nslug: /shared\n---\n',
    })

    const result = await runValidator(content)
    expect(result.exitCode).not.toBe(0)
    expect(result.stderr).toContain('Duplicate docs route paths detected')
    expect(result.stderr).toContain('/shared: /nested/two, /one')
  })

  test('fails an orphan meta-only directory with its owner and stem', async () => {
    const content = await createFixture({
      'guide/page.md': '---\ntitle: Page\n---\n',
      'orphan/meta.json': '{"title":"Orphan"}',
    })

    const result = await runValidator(content)
    expect(result.exitCode).not.toBe(0)
    expect(result.stderr).toContain('orphan/meta.json')
    expect(result.stderr).toContain('directory stem /orphan')
    expect(result.stderr).toContain('meta-only directory is unsupported')
    expect(result.stderr).toContain(
      'add a content page or delete this meta file',
    )
  })
})
