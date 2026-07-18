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
import docsMarkdownSemantics from '~/utils/docs-markdown-semantics'
import docsMarkdownSteps from '~/utils/docs-markdown-steps'
import type { MdcConfig } from '@nuxtjs/mdc'

type CompressedMarkdownTree = Parameters<typeof decompressTree>[0]

type TestMarkdownNode = {
  type: string
  name?: string
  attributes?: Record<string, unknown>
  data?: {
    hName?: string
    hProperties?: Record<string, unknown>
  }
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

  if (!match?.[1]) {
    throw new Error('Unable to read compressed docs content dump')
  }

  return match[1]
}

function installNodeDecompressionStream() {
  Object.defineProperty(globalThis, 'Buffer', {
    configurable: true,
    value: NodeBuffer,
  })

  if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'Buffer', {
      configurable: true,
      value: NodeBuffer,
    })
  }

  Object.defineProperty(globalThis, 'Blob', {
    configurable: true,
    value: NodeBlob,
  })

  if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'Blob', {
      configurable: true,
      value: NodeBlob,
    })
  }

  Object.defineProperty(globalThis, 'DecompressionStream', {
    configurable: true,
    value: NodeDecompressionStream,
  })

  if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'DecompressionStream', {
      configurable: true,
      value: NodeDecompressionStream,
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

function paragraph(value: string): TestMarkdownNode {
  return {
    type: 'paragraph',
    children: [{ type: 'text', value }],
  }
}

function root(children: TestMarkdownNode[]): TestMarkdownRoot {
  return { type: 'root', children }
}

function runDocsMarkdownCodeTabs(tree: TestMarkdownRoot) {
  const transform = docsMarkdownCodeTabs()

  transform(tree as Parameters<typeof transform>[0])

  return tree
}

function parseDocsMarkdown(markdown: string) {
  return parseMarkdown(markdown, {
    configs: docsMarkdownMdcConfigs,
    remark: {
      plugins: {
        docsMarkdownSteps: {
          instance: docsMarkdownSteps,
        },
        docsMarkdownCodeTabs: {
          instance: docsMarkdownCodeTabs,
        },
        docsMarkdownSemantics: {
          instance: docsMarkdownSemantics,
        },
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

function findRenderedTabGroup(rootNode: RenderedMarkdownNode, groupId: string) {
  return collectRenderedNodes(
    rootNode,
    (node) => node.tag === 'doc-tabs' && node.props?.groupId === groupId,
  )[0]
}

function collectAttributeNames(node: TestMarkdownNode): string[] {
  return [
    ...Object.keys(node.attributes ?? {}),
    ...(node.children ?? []).flatMap(collectAttributeNames),
  ]
}

describe('docs Markdown code-tab authoring transform', () => {
  registerEndpoint('/__nuxt_content/docs/sql_dump.txt', async () => {
    return new Response(await readCompressedDocsDump(), {
      headers: {
        'content-type': 'text/plain',
      },
    })
  })

  test('pure: groups raw labels while retaining original code node identity', () => {
    const firstPosition = {
      start: { line: 1, column: 1, offset: 0 },
      end: { line: 3, column: 4, offset: 80 },
    }
    const typed = code(
      'ts',
      "const message: string = 'typed'",
      'tab="Type Script" tab-group="package manager" title="typed.ts" {1} diff focus',
      firstPosition,
    )
    const javascript = code(
      'js',
      "const message = 'plain'",
      "tab='日本語 / JavaScript' title='plain.js'",
    )
    const repeated = code(
      'ts',
      "const second: string = 'typed'",
      'tab="Type Script" keepBackground',
    )
    const tree = runDocsMarkdownCodeTabs(root([typed, javascript, repeated]))
    const tabs = tree.children[0]
    const triggers = tabs?.children?.[0]
    const panels = tabs?.children?.slice(1) ?? []

    expect(tree.children).toHaveLength(1)
    expect(tabs).toMatchObject({
      type: 'containerComponent',
      name: 'doc-tabs',
      attributes: {
        defaultValue: 'Type Script',
        groupId: 'package manager',
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
      children: [
        {
          name: 'doc-tab',
          attributes: { value: 'Type Script', trigger: true },
        },
        {
          name: 'doc-tab',
          attributes: { value: '日本語 / JavaScript', trigger: true },
        },
      ],
    })
    expect(panels.map((panel) => panel.attributes?.value)).toEqual([
      'Type Script',
      '日本語 / JavaScript',
    ])
    expect(panels[0]?.children).toEqual([typed, repeated])
    expect(panels[1]?.children).toEqual([javascript])
    expect(panels[0]?.children?.[0]).toBe(typed)
    expect(panels[0]?.children?.[1]).toBe(repeated)
    expect(panels[1]?.children?.[0]).toBe(javascript)
    expect(typed).toMatchObject({
      type: 'code',
      lang: 'ts',
      value: "const message: string = 'typed'",
      meta: 'title="typed.ts" {1} diff focus',
      position: firstPosition,
    })
    expect(javascript.meta).toBe("title='plain.js'")
    expect(repeated.meta).toBe('keepBackground')
    expect(collectAttributeNames(tabs ?? { type: '' })).not.toEqual(
      expect.arrayContaining(['tabs', 'code', 'rawCode', 'raw-code']),
    )
  })

  test('pure: enforces run boundaries and leaves invalid grammar unchanged', () => {
    const first = code('ts', 'first', 'tab="First"')
    const second = code('ts', 'second', 'tab="Second"')
    const ordinary = code('ts', 'ordinary', 'title="ordinary.ts"')
    const bare = code('ts', 'bare', 'tab title="bare.ts"')
    const empty = code('ts', 'empty', 'tab="" title="empty.ts"')
    const parentOne = {
      type: 'blockquote',
      children: [code('ts', 'nested-one', 'tab="Nested One"')],
    }
    const parentTwo = {
      type: 'blockquote',
      children: [code('ts', 'nested-two', 'tab="Nested Two"')],
    }
    const tree = runDocsMarkdownCodeTabs(
      root([
        first,
        paragraph('Boundary.'),
        second,
        ordinary,
        bare,
        empty,
        parentOne,
        parentTwo,
      ]),
    )

    expect(tree.children.map((node) => node.name ?? node.type)).toEqual([
      'doc-tabs',
      'paragraph',
      'doc-tabs',
      'code',
      'code',
      'code',
      'blockquote',
      'blockquote',
    ])
    expect(ordinary).toEqual(code('ts', 'ordinary', 'title="ordinary.ts"'))
    expect(bare).toEqual(code('ts', 'bare', 'tab title="bare.ts"'))
    expect(empty).toEqual(code('ts', 'empty', 'tab="" title="empty.ts"'))
    expect(parentOne.children?.[0]).toMatchObject({
      name: 'doc-tabs',
      attributes: { defaultValue: 'Nested One' },
    })
    expect(parentTwo.children?.[0]).toMatchObject({
      name: 'doc-tabs',
      attributes: { defaultValue: 'Nested Two' },
    })
  })

  test('pure: ignores later group ownership and preserves manual tabs', () => {
    const first = code('ts', 'first', 'tab="First"')
    const second = code('ts', 'second', 'tab="Second" tab-group="later-owner"')
    const manualCode = code('ts', 'manual', 'tab="Manual"')
    const manualLegacyCode = code('ts', 'legacy', 'tab="Legacy"')
    const manualTabs: TestMarkdownNode = {
      type: 'containerComponent',
      name: 'doc-tabs',
      attributes: { defaultValue: 'manual' },
      children: [
        {
          type: 'containerComponent',
          name: 'doc-tab',
          attributes: { value: 'manual' },
          children: [manualCode],
        },
      ],
    }
    const manualCodeTabs: TestMarkdownNode = {
      type: 'containerComponent',
      name: 'DocCodeTabs',
      children: [manualLegacyCode],
    }
    const tree = runDocsMarkdownCodeTabs(
      root([first, second, manualTabs, manualCodeTabs]),
    )
    const generated = tree.children[0]

    expect(generated?.attributes).toEqual({ defaultValue: 'First' })
    expect(first.meta).toBe('')
    expect(second.meta).toBe('')
    expect(tree.children[1]).toBe(manualTabs)
    expect(manualTabs.children?.[0]?.children?.[0]).toBe(manualCode)
    expect(manualCode.meta).toBe('tab="Manual"')
    expect(tree.children[2]).toBe(manualCodeTabs)
    expect(manualCodeTabs.children?.[0]).toBe(manualLegacyCode)
    expect(manualLegacyCode.meta).toBe('tab="Legacy"')
  })

  test('pure: transforms inside Steps and remains idempotent', () => {
    const typed = code('ts', 'typed', 'tab="TypeScript"')
    const javascript = code('js', 'plain', 'tab="JavaScript"')
    const tree = runDocsMarkdownCodeTabs(
      root([
        {
          type: 'containerComponent',
          name: 'doc-steps',
          children: [
            {
              type: 'containerComponent',
              name: 'doc-step',
              children: [typed, javascript],
            },
          ],
        },
      ]),
    )
    const firstPass = JSON.stringify(tree)
    const tabs = tree.children[0]?.children?.[0]?.children?.[0]

    expect(tabs).toMatchObject({
      type: 'containerComponent',
      name: 'doc-tabs',
      attributes: { defaultValue: 'TypeScript' },
    })

    runDocsMarkdownCodeTabs(tree)

    expect(JSON.stringify(tree)).toBe(firstPass)
  })

  test('focused: compiles the MDC named triggers slot without raw-code props', async () => {
    const parsed = await parseDocsMarkdown(`## 1. Choose a language

\`\`\`ts tab="TypeScript" tab-group="language-choice" title="typed.ts"
const message: string = 'typed'
\`\`\`

\`\`\`js tab='日本語 / JavaScript' title="plain.js"
const message = 'plain'
\`\`\`
`)
    const body = parsed.body as unknown as RenderedMarkdownNode
    const tabs = findRenderedTabGroup(body, 'language-choice')
    const triggersSlot = collectRenderedNodes(
      tabs ?? {},
      (node) =>
        node.tag === 'template' && 'v-slot:triggers' in (node.props ?? {}),
    )[0]
    const panels = (tabs?.children ?? []).filter(
      (node) => node.tag === 'doc-tab',
    )

    expect(tabs?.props).toMatchObject({
      defaultValue: 'TypeScript',
      groupId: 'language-choice',
    })
    expect(tabs?.props).toHaveProperty('persist', '')
    expect(
      collectRenderedNodes(
        triggersSlot ?? {},
        (node) => node.tag === 'doc-tab',
      ).map((node) => node.props?.value),
    ).toEqual(['TypeScript', '日本語 / JavaScript'])
    expect(
      collectRenderedNodes(
        triggersSlot ?? {},
        (node) => node.tag === 'doc-tab',
      ).every((node) => Object.hasOwn(node.props ?? {}, 'trigger')),
    ).toBe(true)
    expect(panels.map((panel) => panel.props?.value)).toEqual([
      'TypeScript',
      '日本語 / JavaScript',
    ])
    expect(
      panels.map(
        (panel) =>
          collectRenderedNodes(panel, (node) => node.tag === 'pre').length,
      ),
    ).toEqual([1, 1])
    expect(tabs?.props).not.toHaveProperty('tabs')
    expect(panels.every((panel) => !('code' in (panel.props ?? {})))).toBe(true)
  })

  test('collection closeout: keeps real code tabs on the Shiki pipeline', async () => {
    installNodeDecompressionStream()
    window.localStorage.removeItem('content_checksum_docs')
    window.localStorage.removeItem('content_collection_docs')

    const page = await queryCollection('docs').path('/guide/code-block').first()

    expect(page).toBeTruthy()

    const body = page?.body as unknown as RenderedMarkdownNode
    const renderedBody =
      body.type === 'minimark'
        ? decompressTree(body as unknown as CompressedMarkdownTree)
        : body
    const tabs = findRenderedTabGroup(renderedBody, 'code-tab-language')
    const triggersSlot = collectRenderedNodes(
      tabs ?? {},
      (node) =>
        node.tag === 'template' && 'v-slot:triggers' in (node.props ?? {}),
    )[0]
    const triggers = collectRenderedNodes(
      triggersSlot ?? {},
      (node) => node.tag === 'doc-tab',
    )
    const panels = (tabs?.children ?? []).filter(
      (node) => node.tag === 'doc-tab',
    )
    const preNodes = panels.flatMap((panel) =>
      collectRenderedNodes(panel, (node) => node.tag === 'pre'),
    )

    expect(tabs?.props).toMatchObject({
      defaultValue: 'TypeScript',
      groupId: 'code-tab-language',
    })
    expect(tabs?.props).toHaveProperty('persist', '')
    expect(triggers.map((node) => node.props?.value)).toEqual([
      'TypeScript',
      'JavaScript',
    ])
    expect(
      triggers.every((node) => Object.hasOwn(node.props ?? {}, 'trigger')),
    ).toBe(true)
    expect(panels.map((panel) => panel.props?.value)).toEqual([
      'TypeScript',
      'JavaScript',
    ])
    expect(preNodes).toHaveLength(2)
    expect(
      preNodes.every((node) =>
        Array.isArray(node.props?.className)
          ? node.props.className.includes('shiki')
          : String(node.props?.className).includes('shiki'),
      ),
    ).toBe(true)
    expect(preNodes.map((node) => node.props?.language)).toEqual(['ts', 'js'])
    expect(preNodes.map((node) => node.props?.title)).toEqual([
      'typed.ts',
      'plain.js',
    ])
    expect(preNodes.map((node) => node.props?.meta)).toEqual([
      'title="typed.ts"',
      'title="plain.js" focus',
    ])
    expect(
      preNodes.every(
        (node) =>
          collectRenderedNodes(
            node,
            (child) => child.tag === 'span' && child.props?.line === 1,
          ).length > 0,
      ),
    ).toBe(true)
    expect(JSON.stringify(preNodes.map((node) => node.props))).not.toContain(
      'tab=',
    )
    expect(
      collectRenderedNodes(
        renderedBody,
        (node) => node.tag === 'doc-code-tabs',
      ),
    ).toHaveLength(0)
    expect(tabs?.props).not.toHaveProperty('tabs')
    expect(panels.every((panel) => !('code' in (panel.props ?? {})))).toBe(true)
  })
})
