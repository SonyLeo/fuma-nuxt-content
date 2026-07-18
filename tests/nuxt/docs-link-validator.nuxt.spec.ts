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
    expect(result.exitCode, result.stderr).toBe(0)
    expect(result.stdout).toContain('2 pages, 1 links')
  })

  test('accepts canonical duplicate, Unicode, inline markup, and custom heading anchors', async () => {
    const content = await createFixture({
      'source.md': `---
title: Source
---

[Duplicate](./target.md#duplicate-heading-1)
[Unicode](./target.md#%E4%B8%AD%E6%96%87-%E6%A0%87%E9%A2%98)
[Inline](./target.md#inline-emphasis-code-link)
[Custom](./target.md#custom-heading)
`,
      'target.md': `---
title: Target
---

## Duplicate Heading
## Duplicate Heading
## 中文 标题
## Inline _emphasis_ \`code\` [link](/source)
## Custom _Heading_ [#custom-heading]
`,
    })

    const result = await runValidator(content)

    expect(result.exitCode, result.stderr).toBe(0)
    expect(result.stdout).toContain('2 pages, 5 links')
  })

  test('uses the runtime source/route policy for root, dot, and bare targets', async () => {
    const content = await createFixture({
      'index.md': '# Home\n',
      'guide/index.md': '# Guide\n',
      'guide/source.md': `# Source

[Root route](/guide/)
[Root source](/guide/target.mdx?from=root#target)
[Dot source](./target.md#target)
[Bare source](target#target)
[Parent index](../index.md#home)
[Query](?mode=compact)
[Hash](#source)
[Unicode](/guide/%E8%B7%AF%E5%BE%84.md#%E9%A2%84%E6%9C%9F)
[External](https://example.com)
[Protocol relative](//example.com/docs)
[Email](mailto:docs@example.com)
[Telephone](tel:+123456789)
`,
      'guide/target.md': `---
title: Target
slug: custom-target
---

# Target
`,
      'guide/路径.md': `---
title: Unicode
slug: 真实 路径
---

# Unicode

## 预期
`,
    })

    const result = await runValidator(content)

    expect(result.exitCode, result.stderr).toBe(0)
    expect(result.stdout).toContain('5 pages, 12 links')
  })

  test('rejects unsafe authored schemes that MDC can preserve', async () => {
    const content = await createFixture({
      'source.md': `# Source

[JavaScript](<javascript:alert>)
[Data](<data:text/plain,hello>)
[VBScript](<vbscript:msgbox>)
`,
    })

    const result = await runValidator(content)

    expect(result.exitCode).not.toBe(0)
    expect(result.stderr.match(/Unsafe authored scheme/g)).toHaveLength(3)
  })

  test('rejects hashes that differ from canonical duplicate and custom IDs', async () => {
    const content = await createFixture({
      'source.md': `# Source

[Wrong duplicate](./target.md#duplicate-heading-2)
[Wrong custom](./target.md#custom-heading-1)
`,
      'target.md': `# Target

## Duplicate Heading
## Duplicate Heading
## Custom Heading [#custom-heading]
`,
    })

    const result = await runValidator(content)

    expect(result.exitCode).not.toBe(0)
    expect(result.stderr.match(/Missing hash anchor/g)).toHaveLength(2)
  })

  test('accepts canonical numbered and marked Step heading anchors', async () => {
    const content = await createFixture({
      'source.md': `# Source

[Numbered Step](./target.md#install)
[Marked Step](./target.md#configure)
`,
      'target.md': `# Target

## 1. Install

Install body.

## Configure [step]

Configure body.
`,
    })

    const result = await runValidator(content)

    expect(result.exitCode, result.stderr).toBe(0)
    expect(result.stdout).toContain('2 pages, 2 links')
  })

  test('rejects pre-transform Step marker-derived anchors', async () => {
    const content = await createFixture({
      'source.md': `# Source

[Raw numbered Step](./target.md#1-install)
[Raw marked Step](./target.md#configure-step)
`,
      'target.md': `# Target

## 1. Install

Install body.

## Configure [step]

Configure body.
`,
    })

    const result = await runValidator(content)

    expect(result.exitCode).not.toBe(0)
    expect(result.stderr.match(/Missing hash anchor/g)).toHaveLength(2)
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
