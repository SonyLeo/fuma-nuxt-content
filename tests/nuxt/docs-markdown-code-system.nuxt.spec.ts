import { Blob as NodeBlob, Buffer as NodeBuffer } from 'node:buffer'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { DecompressionStream as NodeDecompressionStream } from 'node:stream/web'
import { decompressTree } from '@nuxt/content/runtime'
import { parseMarkdown } from '@nuxtjs/mdc/runtime'
import { registerEndpoint } from '@nuxt/test-utils/runtime'
import { queryCollection } from '#imports'
import { describe, expect, test } from 'vitest'
import { parseDocsCodeBlockMeta } from '~/utils/docs-code-meta'
import docsMarkdownCodeSystem from '~/utils/docs-markdown-code-system'
import docsMarkdownPipeline from '~/utils/docs-markdown-pipeline'
import docsMarkdownSemantics from '~/utils/docs-markdown-semantics'
import type { MdcConfig } from '@nuxtjs/mdc'

type CompressedMarkdownTree = Parameters<typeof decompressTree>[0]

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
const docCodeBlockPath = resolve(
  process.cwd(),
  'app/components/content/DocCodeBlock.vue',
)
const docsMarkdownMdcConfigs = [
  docsMarkdownSemantics,
  docsMarkdownCodeSystem,
] as unknown as MdcConfig[]

async function readCompressedDocsDump() {
  const source = await readFile(compressedContentDumpPath, 'utf8')
  const match = source.match(/export const docs = "([^"]+)"/)

  if (!match?.[1]) {
    throw new Error('Unable to read compressed docs content dump')
  }

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

function renderedText(node: RenderedMarkdownNode): string {
  return (
    node.value ??
    (node.children ?? []).map((child) => renderedText(child)).join('')
  )
}

function classNames(node: RenderedMarkdownNode) {
  const value = node.props?.className ?? node.props?.class

  if (Array.isArray(value)) {
    return value.flatMap((className) => String(className).split(/\s+/))
  }

  return typeof value === 'string' ? value.split(/\s+/) : []
}

function hasClass(node: RenderedMarkdownNode, className: string) {
  return classNames(node).includes(className)
}

function findCodeBlock(
  node: RenderedMarkdownNode,
  predicate: (node: RenderedMarkdownNode) => boolean,
) {
  return collectRenderedNodes(
    node,
    (child) => child.tag === 'pre' && predicate(child),
  )[0]
}

async function parseDocsMarkdown(markdown: string) {
  return parseMarkdown(markdown, {
    configs: docsMarkdownMdcConfigs,
    rehype: {
      plugins: {
        docsMarkdownPipeline: { instance: docsMarkdownPipeline },
      },
    },
  })
}

describe('docs Markdown code system', () => {
  registerEndpoint('/__nuxt_content/docs/sql_dump.txt', async () => {
    return new Response(await readCompressedDocsDump(), {
      headers: { 'content-type': 'text/plain' },
    })
  })

  test('pure: parses canonical code metadata aliases and preserves unknown rest', () => {
    const parsed = parseDocsCodeBlockMeta(
      `filename='fallback.ts' TITLE="Primary.ts" ICON=vue Keep-Background LINE-NUMBERS=7 tab="TypeScript" tab-group="language" custom='kept'`,
    )

    expect(parsed).toEqual({
      attributes: {
        filename: 'fallback.ts',
        title: 'Primary.ts',
        icon: 'vue',
        keepBackground: true,
        lineNumbers: '7',
      },
      icon: 'vue',
      keepBackground: true,
      lineNumbers: true,
      lineNumbersStart: 7,
      rest: `tab="TypeScript" tab-group="language" custom='kept'`,
      title: 'Primary.ts',
    })

    expect(
      parseDocsCodeBlockMeta(
        'keepBackground=false KEEP-BACKGROUND lineNumbers=0 LINE-NUMBERS=3',
      ),
    ).toMatchObject({
      keepBackground: true,
      lineNumbers: true,
      lineNumbersStart: 3,
    })
    expect(
      parseDocsCodeBlockMeta('keep-background=off line-numbers=false'),
    ).toMatchObject({
      keepBackground: false,
      lineNumbers: false,
      lineNumbersStart: 1,
    })
  })

  test('direct MDC: applies the registered B6 Shiki config before runtime', async () => {
    const parsed = await parseDocsMarkdown(`
\`\`\`ts [fallback.ts] {1} title="Primary.ts" ICON=typescript LINE-NUMBERS=5 keep-background custom="kept"
const curly = true
const notation = true // [!code highlight]
// [!code word:stable-owner]
const owner = 'stable-owner'
const removed = false // [!code --]
const added = true // [!code ++]
const focused = true // [!code focus]
\`\`\`
`)
    const pre = findCodeBlock(
      parsed.body as RenderedMarkdownNode,
      (node) => node.props?.title === 'Primary.ts',
    )

    expect(pre).toBeDefined()
    expect(pre?.props).toMatchObject({
      filename: 'fallback.ts',
      icon: 'typescript',
      language: 'ts',
      title: 'Primary.ts',
      dataLineNumbers: true,
      dataLineNumbersStart: 5,
      'data-code-meta': 'custom="kept"',
    })
    expect(hasClass(pre ?? {}, 'shiki')).toBe(true)
    expect(hasClass(pre ?? {}, 'has-highlighted')).toBe(true)
    expect(hasClass(pre ?? {}, 'has-diff')).toBe(true)
    expect(hasClass(pre ?? {}, 'has-focused')).toBe(true)

    const lines = collectRenderedNodes(pre ?? {}, (node) =>
      hasClass(node, 'line'),
    )
    const tokenSpans = collectRenderedNodes(
      pre ?? {},
      (node) => node.tag === 'span' && typeof node.props?.style === 'string',
    )

    expect(lines.some((line) => hasClass(line, 'highlighted'))).toBe(true)
    expect(lines.some((line) => hasClass(line, 'highlight'))).toBe(false)
    expect(
      lines.some((line) => hasClass(line, 'diff') && hasClass(line, 'add')),
    ).toBe(true)
    expect(
      lines.some((line) => hasClass(line, 'diff') && hasClass(line, 'remove')),
    ).toBe(true)
    expect(lines.some((line) => hasClass(line, 'focused'))).toBe(true)
    expect(
      collectRenderedNodes(pre ?? {}, (node) =>
        hasClass(node, 'highlighted-word'),
      ).map(renderedText),
    ).toContain('stable-owner')
    expect(renderedText(pre ?? {})).not.toContain('[!code')
    expect(tokenSpans.length).toBeGreaterThan(0)
    expect(
      tokenSpans.some((span) =>
        String(span.props?.style).includes('--shiki-default'),
      ),
    ).toBe(true)
    expect(
      tokenSpans.some((span) =>
        String(span.props?.style).includes('--shiki-light'),
      ),
    ).toBe(true)
    expect(
      tokenSpans.some((span) =>
        String(span.props?.style).includes('--shiki-dark'),
      ),
    ).toBe(true)
  })

  test('collection closeout: preserves B6 SSR output and B4 code panels', async () => {
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
    const primary = findCodeBlock(
      renderedBody,
      (node) => node.props?.title === 'components/mdx.tsx',
    )
    const codeTabs = collectRenderedNodes(
      renderedBody,
      (node) =>
        node.tag === 'doc-tabs' && node.props?.groupId === 'code-tab-language',
    )[0]
    const tabCodeBlocks = collectRenderedNodes(
      codeTabs ?? {},
      (node) => node.tag === 'pre',
    )
    const lines = collectRenderedNodes(primary ?? {}, (node) =>
      hasClass(node, 'line'),
    )
    const styles = collectRenderedNodes(
      renderedBody,
      (node) => node.tag === 'style',
    ).map(renderedText)

    expect(primary).toBeDefined()
    expect(primary?.props).toMatchObject({
      filename: 'components/mdx.tsx',
      icon: 'typescript',
      language: 'tsx',
      title: 'components/mdx.tsx',
      dataLineNumbers: true,
      dataLineNumbersStart: 1,
    })
    expect(hasClass(primary ?? {}, 'shiki')).toBe(true)
    expect(hasClass(primary ?? {}, 'has-highlighted')).toBe(true)
    expect(hasClass(primary ?? {}, 'has-diff')).toBe(true)
    expect(hasClass(primary ?? {}, 'has-focused')).toBe(true)
    expect(lines.some((line) => hasClass(line, 'highlighted'))).toBe(true)
    expect(lines.some((line) => hasClass(line, 'highlight'))).toBe(false)
    expect(
      collectRenderedNodes(primary ?? {}, (node) =>
        hasClass(node, 'highlighted-word'),
      )
        .map(renderedText)
        .filter(Boolean),
    ).toContain('stable-owner')
    expect(renderedText(primary ?? {})).not.toContain('[!code')
    expect(styles.join('\n')).toContain('--shiki-default')
    expect(styles.join('\n')).toContain('--shiki-light')
    expect(styles.join('\n')).toContain('--shiki-dark')
    expect(tabCodeBlocks).toHaveLength(2)
    expect(tabCodeBlocks.every((node) => hasClass(node, 'shiki'))).toBe(true)
    expect(
      tabCodeBlocks.every((node) => {
        const remainingMeta = `${node.props?.meta ?? ''} ${node.props?.['data-code-meta'] ?? ''}`
        return (
          !remainingMeta.includes('tab=') &&
          !remainingMeta.includes('tab-group=')
        )
      }),
    ).toBe(true)

    const componentSource = await readFile(docCodeBlockPath, 'utf8')
    expect(componentSource).not.toContain('applyWordHighlightFallback')
    expect(componentSource).not.toContain('createTreeWalker')
  })
})
