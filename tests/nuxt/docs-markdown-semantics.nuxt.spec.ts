import { Blob as NodeBlob, Buffer as NodeBuffer } from 'node:buffer'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { DecompressionStream as NodeDecompressionStream } from 'node:stream/web'
import { parseMarkdown } from '@nuxtjs/mdc/runtime'
import { decompressTree } from '@nuxt/content/runtime'
import { registerEndpoint } from '@nuxt/test-utils/runtime'
import { queryCollection } from '#imports'
import { describe, expect, test } from 'vitest'
import docsMarkdownSemantics from '~/utils/docs-markdown-semantics'
import type { MdcConfig } from '@nuxtjs/mdc'

type ParsedMarkdown = Awaited<ReturnType<typeof parseMarkdown>>
type CompressedMarkdownTree = Parameters<typeof decompressTree>[0]
type RenderedMarkdownNode = {
  type?: string
  tag?: string
  value?: string
  props?: Record<string, unknown>
  children?: RenderedMarkdownNode[]
  toc?: ParsedMarkdown['toc']
}

const compressedContentDumpPath = resolve(
  process.cwd(),
  '.nuxt/content/database.compressed.mjs',
)
const docsMarkdownMdcConfig = docsMarkdownSemantics as unknown as MdcConfig

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

function parseDocsMarkdown(markdown: string) {
  return parseMarkdown(markdown, {
    configs: [docsMarkdownMdcConfig],
    remark: {
      plugins: {
        docsMarkdownSemantics: {
          instance: docsMarkdownSemantics,
        },
      },
    },
  })
}

function flattenRenderedText(node: RenderedMarkdownNode): string {
  if (typeof node.value === 'string') {
    return node.value
  }

  return (node.children ?? []).map(flattenRenderedText).join('')
}

function collectRenderedHeadings(
  node: RenderedMarkdownNode,
): Array<{ id?: string; text: string }> {
  const headings = (node.children ?? []).flatMap(collectRenderedHeadings)

  if (!node.tag || !/^h[1-6]$/.test(node.tag)) {
    return headings
  }

  return [
    {
      id: typeof node.props?.id === 'string' ? node.props.id : undefined,
      text: flattenRenderedText(node).trim(),
    },
    ...headings,
  ]
}

function flattenTocLinks(
  links: NonNullable<ParsedMarkdown['toc']>['links'],
): Array<{ id?: string; text?: string }> {
  return links.flatMap((link) => [
    { id: link.id, text: link.text },
    ...flattenTocLinks(link.children ?? []),
  ])
}

describe('docs Markdown semantic owner', () => {
  registerEndpoint('/__nuxt_content/docs/sql_dump.txt', async () => {
    return new Response(await readCompressedDocsDump(), {
      headers: {
        'content-type': 'text/plain',
      },
    })
  })

  test('uses canonical github-slugger IDs for headings and TOC records', async () => {
    const parsed = await parseDocsMarkdown(`# Title

## Duplicate
## Duplicate
## 123 Start
## A_B
## 中文 标题
## Punctuation: a/b & c!
## Inline *emphasis* \`code\` [link](/target)
## Custom *Heading* [#custom-heading]
`)

    const expected = [
      ['title', 'Title'],
      ['duplicate', 'Duplicate'],
      ['duplicate-1', 'Duplicate'],
      ['123-start', '123 Start'],
      ['a_b', 'A_B'],
      ['中文-标题', '中文 标题'],
      ['punctuation-ab--c', 'Punctuation: a/b & c!'],
      ['inline-emphasis-code-link', 'Inline emphasis code link'],
      ['custom-heading', 'Custom Heading'],
    ]

    expect(parsed.data.structuredData).toEqual({
      headings: expected.map(([id, content]) => ({ id, content })),
      contents: [],
    })

    const renderedHeadings = collectRenderedHeadings(parsed.body)

    expect(renderedHeadings).toEqual(
      expected.map(([id, text]) => ({ id, text })),
    )
    expect(flattenTocLinks(parsed.toc?.links ?? [])).toEqual(
      expected.slice(1).map(([id, text]) => ({ id, text })),
    )
    expect(JSON.stringify(parsed.body)).not.toContain('[#custom-heading]')
    expect(JSON.stringify(parsed.toc)).not.toContain('[#custom-heading]')
    expect(JSON.stringify(parsed.data.structuredData)).not.toContain(
      '[#custom-heading]',
    )
  })

  test('extracts each structured semantic block once', async () => {
    const parsed = await parseDocsMarkdown(`# Structure

Paragraph with [link](/target) and \`code\`.

> Quoted **content** with
> a second line.

- First list paragraph.
- Second list paragraph.

| Name | Value |
| ---- | ----- |
| A    | B     |

::doc-callout
MDC component paragraph.
::

## Next Section

Next paragraph.
`)

    expect(parsed.data.structuredData).toEqual({
      headings: [
        { id: 'structure', content: 'Structure' },
        { id: 'next-section', content: 'Next Section' },
      ],
      contents: [
        {
          heading: 'structure',
          content: 'Paragraph with link and code.',
        },
        {
          heading: 'structure',
          content: 'Quoted content with a second line.',
        },
        { heading: 'structure', content: 'First list paragraph.' },
        { heading: 'structure', content: 'Second list paragraph.' },
        { heading: 'structure', content: 'Name' },
        { heading: 'structure', content: 'Value' },
        { heading: 'structure', content: 'A' },
        { heading: 'structure', content: 'B' },
        { heading: 'structure', content: 'MDC component paragraph.' },
        { heading: 'next-section', content: 'Next paragraph.' },
      ],
    })
  })

  test('keeps canonical semantics in real Nuxt Content collection output', async () => {
    installNodeDecompressionStream()
    window.localStorage.removeItem('content_checksum_docs')
    window.localStorage.removeItem('content_collection_docs')

    const page = await queryCollection('docs')
      .path('/guide/markdown-semantics')
      .first()

    expect(page).toBeTruthy()

    const body = page?.body as unknown as RenderedMarkdownNode
    const renderedBody =
      body.type === 'minimark'
        ? decompressTree(body as unknown as CompressedMarkdownTree)
        : body
    const expectedHeadings = [
      ['markdown-semantics-fixture', 'Markdown Semantics Fixture'],
      ['duplicate-heading', 'Duplicate Heading'],
      ['duplicate-heading-1', 'Duplicate Heading'],
      ['123-start', '123 Start'],
      ['a_b', 'A_B'],
      ['中文-标题', '中文 标题'],
      ['punctuation-ab--c', 'Punctuation: a/b & c!'],
      ['inline-emphasis-code-link', 'Inline emphasis code link'],
      ['custom-heading', 'Custom Heading'],
    ]

    expect(collectRenderedHeadings(renderedBody)).toEqual(
      expectedHeadings.map(([id, text]) => ({ id, text })),
    )
    expect(flattenTocLinks(body.toc?.links ?? [])).toEqual(
      expectedHeadings.slice(1).map(([id, text]) => ({ id, text })),
    )
    expect(page?.structuredData).toEqual({
      headings: expectedHeadings.map(([id, content]) => ({ id, content })),
      contents: [
        {
          heading: 'markdown-semantics-fixture',
          content: 'Intro paragraph.',
        },
        {
          heading: 'duplicate-heading',
          content: 'First duplicate paragraph.',
        },
        {
          heading: 'duplicate-heading-1',
          content: 'Second duplicate paragraph.',
        },
        { heading: '123-start', content: 'Numeric heading paragraph.' },
        { heading: 'a_b', content: 'Underscore heading paragraph.' },
        { heading: '中文-标题', content: 'Unicode heading paragraph.' },
        {
          heading: 'punctuation-ab--c',
          content: 'Punctuation heading paragraph.',
        },
        {
          heading: 'inline-emphasis-code-link',
          content: 'Inline heading paragraph.',
        },
        { heading: 'custom-heading', content: 'Custom heading paragraph.' },
        {
          heading: 'custom-heading',
          content: 'Quoted content remains one semantic block.',
        },
        { heading: 'custom-heading', content: 'First list paragraph.' },
        {
          heading: 'custom-heading',
          content: 'Second list paragraph with markup.',
        },
        { heading: 'custom-heading', content: 'Name' },
        { heading: 'custom-heading', content: 'Value' },
        { heading: 'custom-heading', content: 'Alpha' },
        { heading: 'custom-heading', content: 'Beta' },
        { heading: 'custom-heading', content: 'MDC component paragraph.' },
      ],
    })

    expect(JSON.stringify(body)).not.toContain('[#custom-heading]')
    expect(JSON.stringify(body.toc)).not.toContain('[#custom-heading]')
    expect(JSON.stringify(page?.structuredData)).not.toContain(
      '[#custom-heading]',
    )
  })
})
