import { Blob as NodeBlob, Buffer as NodeBuffer } from 'node:buffer'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { DecompressionStream as NodeDecompressionStream } from 'node:stream/web'
import { decompressTree } from '@nuxt/content/runtime'
import { parseMarkdown } from '@nuxtjs/mdc/runtime'
import { registerEndpoint } from '@nuxt/test-utils/runtime'
import { queryCollection } from '#imports'
import { describe, expect, test } from 'vitest'
import docsMarkdownCodeTabs from '~/utils/docs-markdown-code-tabs'
import docsMarkdownPackageManager from '~/utils/docs-markdown-package-manager'
import docsMarkdownSemantics from '~/utils/docs-markdown-semantics'
import docsMarkdownSteps from '~/utils/docs-markdown-steps'
import type { MdcConfig } from '@nuxtjs/mdc'

type CompressedMarkdownTree = Parameters<typeof decompressTree>[0]

type TestMarkdownNode = {
  type: string
  name?: string
  attributes?: Record<string, unknown>
  data?: Record<string, unknown>
  children?: TestMarkdownNode[]
  lang?: string
  meta?: string
  position?: unknown
  value?: string
  [key: string]: unknown
}

type TestMarkdownRoot = TestMarkdownNode & {
  type: 'root'
  children: TestMarkdownNode[]
}

type RenderedMarkdownNode = {
  type?: string
  tag?: string
  value?: string
  props?: Record<string, unknown>
  children?: RenderedMarkdownNode[]
}

const compressedContentDumpPath = resolve(
  process.cwd(),
  '.nuxt/content/database.compressed.mjs',
)
const docsMarkdownMdcConfigs = [docsMarkdownSemantics] as unknown as MdcConfig[]

async function readCompressedDocsDump() {
  const source = await readFile(compressedContentDumpPath, 'utf8')
  const match = source.match(/export const docs = "([^"]+)"/)

  if (!match?.[1])
    throw new Error('Unable to read compressed docs content dump')
  return match[1]
}

function installNodeDecompressionStream() {
  for (const target of [globalThis, window]) {
    Object.defineProperties(target, {
      Blob: { configurable: true, value: NodeBlob },
      Buffer: { configurable: true, value: NodeBuffer },
      DecompressionStream: {
        configurable: true,
        value: NodeDecompressionStream,
      },
    })
  }
}

function code(
  lang: string,
  value: string,
  meta?: string,
  position?: unknown,
): TestMarkdownNode {
  return {
    type: 'code',
    lang,
    value,
    ...(typeof meta === 'string' ? { meta } : {}),
    ...(position ? { position } : {}),
  }
}

function root(children: TestMarkdownNode[]): TestMarkdownRoot {
  return { type: 'root', children }
}

function runPackageManager(tree: TestMarkdownRoot) {
  const transform = docsMarkdownPackageManager()
  transform(tree as Parameters<typeof transform>[0])
  return tree
}

function parseDocsMarkdown(markdown: string) {
  return parseMarkdown(markdown, {
    configs: docsMarkdownMdcConfigs,
    remark: {
      plugins: {
        docsMarkdownSteps: { instance: docsMarkdownSteps },
        docsMarkdownCodeTabs: { instance: docsMarkdownCodeTabs },
        docsMarkdownPackageManager: { instance: docsMarkdownPackageManager },
        docsMarkdownSemantics: { instance: docsMarkdownSemantics },
      },
    },
  })
}

function collectRenderedNodes(
  node: RenderedMarkdownNode,
  predicate: (node: RenderedMarkdownNode) => boolean,
): RenderedMarkdownNode[] {
  return [
    ...(predicate(node) ? [node] : []),
    ...(node.children ?? []).flatMap((child) =>
      collectRenderedNodes(child, predicate),
    ),
  ]
}

function packageManagerGroups(node: RenderedMarkdownNode) {
  return collectRenderedNodes(
    node,
    (child) =>
      child.tag === 'doc-tabs' && child.props?.groupId === 'package-manager',
  )
}

function tabPanels(node: TestMarkdownNode) {
  return (node.children ?? []).filter((child) => child.name === 'doc-tab')
}

function renderedPanels(node: RenderedMarkdownNode) {
  return (node.children ?? []).filter((child) => child.tag === 'doc-tab')
}

function collectAttributeNames(node: TestMarkdownNode): string[] {
  return [
    ...Object.keys(node.attributes ?? {}),
    ...(node.children ?? []).flatMap(collectAttributeNames),
  ]
}

describe('docs Markdown package-manager authoring transform', () => {
  registerEndpoint('/__nuxt_content/docs/sql_dump.txt', async () => {
    return new Response(await readCompressedDocsDump(), {
      headers: { 'content-type': 'text/plain' },
    })
  })

  test('pure: expands package-install with stable group state and semantic code nodes', () => {
    const position = {
      start: { line: 1, column: 1, offset: 0 },
      end: { line: 3, column: 4, offset: 72 },
    }
    const source = code(
      'package-install',
      '@scope/pkg package-b -D',
      'title="install.sh" focus',
      position,
    )
    const tree = runPackageManager(root([source]))
    const tabs = tree.children[0]
    const triggers = tabs?.children?.[0]
    const panels = tabPanels(tabs ?? { type: '' })

    expect(tabs).toMatchObject({
      type: 'containerComponent',
      name: 'doc-tabs',
      attributes: {
        defaultValue: 'npm',
        groupId: 'package-manager',
        persist: true,
      },
    })
    expect(triggers).toMatchObject({
      type: 'componentContainerSection',
      name: 'triggers',
      data: {
        hName: 'component-slot',
        hProperties: { 'v-slot:triggers': '' },
      },
    })
    expect(triggers?.children?.map((trigger) => trigger.attributes)).toEqual(
      ['npm', 'pnpm', 'yarn', 'bun'].map((value) => ({
        value,
        trigger: true,
      })),
    )
    expect(panels.map((panel) => panel.attributes?.value)).toEqual([
      'npm',
      'pnpm',
      'yarn',
      'bun',
    ])
    expect(panels.map((panel) => panel.children?.[0]?.value)).toEqual([
      'npm install @scope/pkg package-b -D',
      'pnpm add @scope/pkg package-b -D',
      'yarn add @scope/pkg package-b --dev',
      'bun add @scope/pkg package-b --dev',
    ])
    expect(
      panels.every((panel) => {
        const generated = panel.children?.[0]
        return (
          generated?.type === 'code' &&
          generated.lang === 'bash' &&
          generated.meta === source.meta &&
          generated.position === position
        )
      }),
    ).toBe(true)
    expect(collectAttributeNames(tabs ?? { type: '' })).not.toEqual(
      expect.arrayContaining(['tabs', 'code', 'rawCode', 'raw-code']),
    )
  })

  test('pure: retains authored npm and npx commands and converts multiline npm input', () => {
    const tree = runPackageManager(
      root([
        code('package-install', 'npm install package-a'),
        code('package-install', 'npx create-vite app'),
        code(
          'npm',
          'npm install package-b\nnpm run test',
          'title="commands.sh"',
        ),
      ]),
    )
    const groups = tree.children
    const npmCommands = groups.map(
      (group) => tabPanels(group)[0]?.children?.[0]?.value,
    )
    const pnpmCommands = groups.map(
      (group) => tabPanels(group)[1]?.children?.[0]?.value,
    )
    const yarnCommands = groups.map(
      (group) => tabPanels(group)[2]?.children?.[0]?.value,
    )

    expect(npmCommands).toEqual([
      'npm install package-a',
      'npx create-vite app',
      'npm install package-b\nnpm run test',
    ])
    expect(pnpmCommands).toEqual([
      'pnpm add package-a',
      'pnpm dlx create-vite app',
      'pnpm add package-b\npnpm run test',
    ])
    expect(yarnCommands).toEqual([
      'yarn add package-a',
      'yarn dlx create-vite app',
      'yarn add package-b\nyarn run test',
    ])
  })

  test('pure: respects tab boundaries, nested parents, and idempotence', () => {
    const ordinary = code('bash', 'npm install ordinary')
    const manualNpm = code('npm', 'npm install manual')
    const codeTabNpm = code('npm', 'npm install code-tab', 'tab="npm"')
    const manualTabs: TestMarkdownNode = {
      type: 'containerComponent',
      name: 'DocTabs',
      children: [manualNpm],
    }
    const codeTabsTree = root([codeTabNpm])
    docsMarkdownCodeTabs()(
      codeTabsTree as Parameters<ReturnType<typeof docsMarkdownCodeTabs>>[0],
    )
    const generatedCodeTabs = codeTabsTree.children[0]
    const nested = code('npm', 'npm install nested')
    const tree = root([
      ordinary,
      manualTabs,
      generatedCodeTabs ?? { type: '' },
      { type: 'blockquote', children: [nested] },
    ])

    runPackageManager(tree)
    const firstPass = JSON.stringify(tree)

    expect(tree.children[0]).toBe(ordinary)
    expect(tree.children[1]).toBe(manualTabs)
    expect(manualTabs.children?.[0]).toBe(manualNpm)
    expect(tree.children[2]).toBe(generatedCodeTabs)
    expect(codeTabNpm.lang).toBe('npm')
    expect(tree.children[3]?.children?.[0]).toMatchObject({
      name: 'doc-tabs',
      attributes: { groupId: 'package-manager' },
    })

    runPackageManager(tree)
    expect(JSON.stringify(tree)).toBe(firstPass)
  })

  test('focused: compiles named slots while retaining Shiki code output', async () => {
    const parsed = await parseDocsMarkdown(`
\`\`\`package-install title="install.sh" focus
@scope/pkg package-b -D
\`\`\`
`)
    const body = parsed.body as unknown as RenderedMarkdownNode
    const tabs = packageManagerGroups(body)[0]
    const triggersSlot = collectRenderedNodes(
      tabs ?? {},
      (node) =>
        node.tag === 'template' && 'v-slot:triggers' in (node.props ?? {}),
    )[0]
    const triggers = collectRenderedNodes(
      triggersSlot ?? {},
      (node) => node.tag === 'doc-tab',
    )
    const panels = renderedPanels(tabs ?? {})
    const preNodes = panels.flatMap((panel) =>
      collectRenderedNodes(panel, (node) => node.tag === 'pre'),
    )

    expect(tabs?.props).toMatchObject({
      defaultValue: 'npm',
      groupId: 'package-manager',
    })
    expect(tabs?.props).toHaveProperty('persist', '')
    expect(triggers.map((node) => node.props?.value)).toEqual([
      'npm',
      'pnpm',
      'yarn',
      'bun',
    ])
    expect(panels.map((node) => node.props?.value)).toEqual([
      'npm',
      'pnpm',
      'yarn',
      'bun',
    ])
    expect(preNodes).toHaveLength(4)
    expect(preNodes.every((node) => node.props?.language === 'bash')).toBe(true)
    expect(preNodes.every((node) => node.props?.title === 'install.sh')).toBe(
      true,
    )
    expect(tabs?.props).not.toHaveProperty('tabs')
    expect(panels.every((panel) => !('code' in (panel.props ?? {})))).toBe(true)
  })

  test('collection closeout: keeps package-manager fences on the Shiki pipeline', async () => {
    installNodeDecompressionStream()
    window.localStorage.removeItem('content_checksum_docs')
    window.localStorage.removeItem('content_collection_docs')

    const page = await queryCollection('docs')
      .path('/guide/package-manager')
      .first()
    expect(page).toBeTruthy()

    const body = page?.body as unknown as RenderedMarkdownNode
    const renderedBody =
      body.type === 'minimark'
        ? decompressTree(body as unknown as CompressedMarkdownTree)
        : body
    const groups = packageManagerGroups(renderedBody)

    expect(groups).toHaveLength(2)
    for (const tabs of groups) {
      const panels = renderedPanels(tabs)
      const preNodes = panels.flatMap((panel) =>
        collectRenderedNodes(panel, (node) => node.tag === 'pre'),
      )

      expect(tabs.props).toMatchObject({
        defaultValue: 'npm',
        groupId: 'package-manager',
      })
      expect(tabs.props).toHaveProperty('persist', '')
      expect(panels.map((panel) => panel.props?.value)).toEqual([
        'npm',
        'pnpm',
        'yarn',
        'bun',
      ])
      expect(preNodes).toHaveLength(4)
      expect(
        preNodes.every((node) =>
          Array.isArray(node.props?.className)
            ? node.props.className.includes('shiki')
            : String(node.props?.className).includes('shiki'),
        ),
      ).toBe(true)
      expect(preNodes.every((node) => node.props?.language === 'bash')).toBe(
        true,
      )
      expect(tabs.props).not.toHaveProperty('tabs')
      expect(panels.every((panel) => !('code' in (panel.props ?? {})))).toBe(
        true,
      )
    }

    const preNodes = groups.flatMap((tabs) =>
      renderedPanels(tabs).flatMap((panel) =>
        collectRenderedNodes(panel, (node) => node.tag === 'pre'),
      ),
    )
    expect(preNodes.slice(0, 4).map((node) => node.props?.title)).toEqual(
      Array(4).fill('install.sh'),
    )
    expect(preNodes.slice(4).map((node) => node.props?.title)).toEqual(
      Array(4).fill('commands.sh'),
    )
  })
})
