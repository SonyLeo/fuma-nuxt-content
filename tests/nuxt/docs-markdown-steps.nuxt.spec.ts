import { Blob as NodeBlob, Buffer as NodeBuffer } from 'node:buffer'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { DecompressionStream as NodeDecompressionStream } from 'node:stream/web'
import { parseMarkdown } from '@nuxtjs/mdc/runtime'
import { decompressTree } from '@nuxt/content/runtime'
import { registerEndpoint } from '@nuxt/test-utils/runtime'
import { queryCollection } from '#imports'
import { describe, expect, test } from 'vitest'
import docsMarkdownSemantics, {
  docsCanonicalTocKey,
} from '~/utils/docs-markdown-semantics'
import docsMarkdownSteps from '~/utils/docs-markdown-steps'
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

type TestMarkdownNode = {
  type: string
  value?: string
  depth?: number
  name?: string
  attributes?: Record<string, unknown>
  data?: {
    hProperties?: Record<string, unknown>
  }
  children?: TestMarkdownNode[]
  [key: string]: unknown
}

type TestMarkdownRoot = TestMarkdownNode & {
  type: 'root'
  children: TestMarkdownNode[]
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

function text(value: string): TestMarkdownNode {
  return { type: 'text', value }
}

function heading(
  depth: number,
  children: TestMarkdownNode[],
): TestMarkdownNode {
  return { type: 'heading', depth, children }
}

function paragraph(value: string): TestMarkdownNode {
  return { type: 'paragraph', children: [text(value)] }
}

function root(children: TestMarkdownNode[]): TestMarkdownRoot {
  return { type: 'root', children }
}

function runDocsMarkdownSteps(tree: TestMarkdownRoot) {
  const transform = docsMarkdownSteps()

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

function collectTags(node: RenderedMarkdownNode): string[] {
  return [
    ...(node.tag ? [node.tag] : []),
    ...(node.children ?? []).flatMap(collectTags),
  ]
}

function getStepContainers(tree: TestMarkdownRoot) {
  const steps = tree.children.filter((node) => node.name === 'doc-steps')
  const stepItems = steps.flatMap((node) => node.children ?? [])

  return { steps, stepItems }
}

describe('docs Markdown Steps authoring transform', () => {
  registerEndpoint('/__nuxt_content/docs/sql_dump.txt', async () => {
    return new Response(await readCompressedDocsDump(), {
      headers: {
        'content-type': 'text/plain',
      },
    })
  })

  test('converts numbered and marked headings into MDC Step containers', () => {
    const tree = runDocsMarkdownSteps(
      root([
        heading(2, [text('1. Install')]),
        paragraph('Install paragraph.'),
        heading(2, [text('Configure [step]')]),
        paragraph('Configure paragraph.'),
      ]),
    )
    const { steps, stepItems } = getStepContainers(tree)

    expect(steps).toHaveLength(1)
    expect(stepItems).toHaveLength(2)
    expect(stepItems.map((item) => item.name)).toEqual(['doc-step', 'doc-step'])
    expect(stepItems[0]?.children?.[0]).toMatchObject({
      type: 'heading',
      depth: 2,
      data: { hProperties: { 'data-fd-step': 1 } },
      children: [{ type: 'text', value: 'Install' }],
    })
    expect(stepItems[0]?.children?.[1]).toEqual(paragraph('Install paragraph.'))
    expect(stepItems[1]?.children?.[0]).toMatchObject({
      type: 'heading',
      depth: 2,
      data: { hProperties: { 'data-fd-step': 2 } },
      children: [{ type: 'text', value: 'Configure' }],
    })
  })

  test('leaves invalid numbered boundaries ordinary', () => {
    const tree = runDocsMarkdownSteps(
      root([
        heading(2, [text('2. Starts at two')]),
        heading(2, [text('2026. Roadmap')]),
        heading(2, [text('1. First')]),
        heading(2, [text('3. Gap')]),
        heading(2, [text('1. Restart')]),
        heading(2, [text('1. Out of order')]),
      ]),
    )

    expect(tree.children.map((node) => node.name ?? node.type)).toEqual([
      'heading',
      'heading',
      'doc-steps',
      'heading',
      'doc-steps',
      'heading',
    ])
    expect(tree.children[0]).toMatchObject({
      type: 'heading',
      children: [{ value: '2. Starts at two' }],
    })
    expect(tree.children[1]).toMatchObject({
      type: 'heading',
      children: [{ value: '2026. Roadmap' }],
    })
    expect(tree.children[3]).toMatchObject({
      type: 'heading',
      children: [{ value: '3. Gap' }],
    })
    expect(tree.children[5]).toMatchObject({
      type: 'heading',
      children: [{ value: '1. Out of order' }],
    })
  })

  test('supports terminal marker textComponent shape only in headings', () => {
    const tree = runDocsMarkdownSteps(
      root([
        paragraph('Paragraph [step]'),
        heading(2, [
          text('Span marker '),
          {
            type: 'textComponent',
            name: 'span',
            attributes: {},
            children: [text('step')],
          },
        ]),
        heading(2, [text('Non terminal [step] marker')]),
      ]),
    )
    const { stepItems } = getStepContainers(tree)

    expect(tree.children[0]).toEqual(paragraph('Paragraph [step]'))
    expect(stepItems).toHaveLength(1)
    expect(stepItems[0]?.children?.[0]).toMatchObject({
      type: 'heading',
      children: [{ type: 'text', value: 'Span marker' }],
    })
    expect(tree.children[2]).toMatchObject({
      type: 'heading',
      children: [{ value: 'Non terminal [step] marker' }],
    })
  })

  test('removes terminal marker text without deleting preceding inline images', () => {
    const imageNode: TestMarkdownNode = {
      type: 'image',
      url: '/logo.png',
      alt: 'Logo',
    }
    const tree = runDocsMarkdownSteps(
      root([heading(2, [text('Keep image '), imageNode, text(' [step]')])]),
    )
    const stepHeading = tree.children[0]?.children?.[0]?.children?.[0]

    expect(stepHeading).toMatchObject({
      type: 'heading',
      depth: 2,
      data: { hProperties: { 'data-fd-step': 1 } },
    })
    expect(stepHeading?.children).toHaveLength(2)
    expect(stepHeading?.children?.[0]).toEqual(text('Keep image '))
    expect(stepHeading?.children?.[1]).toBe(imageNode)
    expect(JSON.stringify(stepHeading)).not.toContain('[step]')
  })

  test('preserves semantic child nodes and supports nested Steps recursively', () => {
    const listNode: TestMarkdownNode = {
      type: 'list',
      children: [{ type: 'listItem', children: [paragraph('List item.')] }],
    }
    const blockquoteNode: TestMarkdownNode = {
      type: 'blockquote',
      children: [paragraph('Quoted child.')],
    }
    const codeNode: TestMarkdownNode = {
      type: 'code',
      lang: 'ts',
      value: 'const answer = 42',
    }
    const tree = runDocsMarkdownSteps(
      root([
        heading(2, [text('1. Outer')]),
        paragraph('Outer paragraph.'),
        listNode,
        blockquoteNode,
        codeNode,
        heading(3, [text('1. Nested')]),
        paragraph('Nested paragraph.'),
        heading(3, [text('2. Nested follow-up')]),
        heading(2, [text('2. Next outer')]),
      ]),
    )
    const outerSteps = tree.children[0]
    const firstOuterStep = outerSteps?.children?.[0]
    const nestedSteps = firstOuterStep?.children?.find(
      (node) => node.name === 'doc-steps',
    )

    expect(firstOuterStep?.children).toEqual(
      expect.arrayContaining([listNode, blockquoteNode, codeNode]),
    )
    expect(nestedSteps?.children).toHaveLength(2)
    expect(nestedSteps?.children?.[0]?.children?.[0]).toMatchObject({
      type: 'heading',
      depth: 3,
      data: { hProperties: { 'data-fd-step': 1 } },
      children: [{ value: 'Nested' }],
    })
    expect(outerSteps?.children?.[1]?.children?.[0]).toMatchObject({
      type: 'heading',
      depth: 2,
      data: { hProperties: { 'data-fd-step': 2 } },
      children: [{ value: 'Next outer' }],
    })
  })

  test('leaves manual Steps unchanged and a second pass is idempotent', () => {
    const tree = runDocsMarkdownSteps(
      root([
        {
          type: 'containerComponent',
          name: 'doc-steps',
          children: [
            {
              type: 'containerComponent',
              name: 'doc-step',
              children: [heading(3, [text('Manual Step')])],
            },
          ],
        },
        heading(2, [text('1. Generated')]),
        paragraph('Generated body.'),
      ]),
    )
    const afterFirstPass = JSON.stringify(tree)

    runDocsMarkdownSteps(tree)

    expect(JSON.stringify(tree)).toBe(afterFirstPass)
    expect(tree.children[0]).toEqual({
      type: 'containerComponent',
      name: 'doc-steps',
      children: [
        {
          type: 'containerComponent',
          name: 'doc-step',
          children: [heading(3, [text('Manual Step')])],
        },
      ],
    })
  })

  test('feeds cleaned Step headings to the B1 semantic owner', async () => {
    const parsed = await parseDocsMarkdown(`## 1. Install *deps* [#install-deps]

Install paragraph.

## Configure **app** [#configure-app] [step]

Configure paragraph.
`)

    expect(parsed.data[docsCanonicalTocKey]).toEqual([
      {
        id: 'install-deps',
        text: 'Install deps',
        depth: 2,
        owner: 'steps',
        step: 1,
      },
      {
        id: 'configure-app',
        text: 'Configure app',
        depth: 2,
        owner: 'steps',
        step: 2,
      },
    ])
    expect(parsed.data.structuredData).toEqual({
      headings: [
        { id: 'install-deps', content: 'Install deps' },
        { id: 'configure-app', content: 'Configure app' },
      ],
      contents: [
        { heading: 'install-deps', content: 'Install paragraph.' },
        { heading: 'configure-app', content: 'Configure paragraph.' },
      ],
    })
    expect(JSON.stringify(parsed.body)).not.toContain('[step]')
    expect(JSON.stringify(parsed.body)).not.toContain('1. Install')
  })

  test('keeps the real Steps collection output canonical', async () => {
    installNodeDecompressionStream()
    window.localStorage.removeItem('content_checksum_docs')
    window.localStorage.removeItem('content_collection_docs')

    const page = await queryCollection('docs').path('/guide/steps').first()

    expect(page).toBeTruthy()

    const body = page?.body as unknown as RenderedMarkdownNode
    const renderedBody =
      body.type === 'minimark'
        ? decompressTree(body as unknown as CompressedMarkdownTree)
        : body
    const renderedHeadings = collectRenderedHeadings(renderedBody)
    const tocLinks = flattenTocLinks(body.toc?.links ?? [])
    const tags = collectTags(renderedBody)

    expect(tags).toEqual(expect.arrayContaining(['doc-steps', 'doc-step']))
    expect(renderedHeadings).toEqual(
      expect.arrayContaining([
        { id: 'install-dependencies', text: 'Install dependencies' },
        { id: 'pick-a-package-manager', text: 'Pick a package manager' },
        { id: 'confirm-the-lockfile', text: 'Confirm the lockfile' },
        { id: 'configure-workspace', text: 'Configure workspace' },
        { id: '2026-roadmap', text: '2026. Roadmap' },
        { id: 'hidden-component-heading', text: 'Hidden component heading' },
        { id: 'restart-after-boundary', text: 'Restart after boundary' },
        { id: '3-gap-remains-ordinary', text: '3. Gap remains ordinary' },
      ]),
    )
    expect(tocLinks).toEqual([
      { id: 'install-dependencies', text: 'Install dependencies' },
      { id: 'pick-a-package-manager', text: 'Pick a package manager' },
      { id: 'confirm-the-lockfile', text: 'Confirm the lockfile' },
      { id: 'configure-workspace', text: 'Configure workspace' },
      { id: '2026-roadmap', text: '2026. Roadmap' },
      { id: 'restart-after-boundary', text: 'Restart after boundary' },
      { id: '3-gap-remains-ordinary', text: '3. Gap remains ordinary' },
    ])
    expect(tocLinks.map((link) => link.id)).not.toContain(
      'hidden-component-heading',
    )
    expect(page?.structuredData).toEqual(
      expect.objectContaining({
        headings: expect.arrayContaining([
          { id: 'install-dependencies', content: 'Install dependencies' },
          { id: 'configure-workspace', content: 'Configure workspace' },
          {
            id: 'hidden-component-heading',
            content: 'Hidden component heading',
          },
          { id: '3-gap-remains-ordinary', content: '3. Gap remains ordinary' },
        ]),
      }),
    )
    expect(JSON.stringify(renderedBody)).toContain('pnpm install')
    expect(JSON.stringify(page)).not.toContain('[step]')
    expect(JSON.stringify(page)).not.toContain('1. Install dependencies')
    expect(JSON.stringify(page)).not.toContain(docsCanonicalTocKey)
  })
})
