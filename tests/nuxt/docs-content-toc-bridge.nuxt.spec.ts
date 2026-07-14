import type { FileAfterParseHook, ResolvedCollection } from '@nuxt/content'
import { describe, expect, test } from 'vitest'
import {
  buildDocsContentToc,
  normalizeDocsContentToc,
} from '../../build/docs-content-toc-bridge'
import {
  docsCanonicalTocKey,
  type DocsCanonicalTocRecord,
} from '../../app/utils/docs-markdown-semantics'

function createCollection(name = 'docs') {
  return {
    name,
    type: 'page',
  } as ResolvedCollection
}

function createAfterParseHook(content: Record<string, unknown>) {
  return {
    collection: createCollection(),
    file: {
      id: 'docs/guide/example.md',
      path: 'D:/content/guide/example.md',
    },
    content,
  } as FileAfterParseHook
}

function flattenTocLinks(
  links: Array<{ id: string; children?: Array<{ id: string }> }>,
): string[] {
  return links.flatMap((link) => [
    link.id,
    ...flattenTocLinks(link.children ?? []),
  ])
}

describe('docs canonical TOC bridge', () => {
  test('preserves the existing MDC TOC when no Step records are added', () => {
    const context = createAfterParseHook({})
    const existingToc = {
      title: '',
      searchDepth: 2,
      depth: 2,
      links: [
        {
          id: 'intro',
          depth: 2,
          text: 'Intro',
          dataOriginal: 'keep me',
          children: [{ id: 'usage', depth: 3, text: 'Usage' }],
        },
      ],
      customTopLevel: true,
    }
    const result = buildDocsContentToc(
      existingToc,
      [
        { id: 'title', text: 'Title', depth: 1 },
        { id: 'intro', text: 'Intro', depth: 2 },
        { id: 'usage', text: 'Usage', depth: 3 },
        { id: 'excluded', text: 'Excluded', depth: 3 },
      ],
      context,
    )

    expect(result).toEqual(existingToc)
  })

  test('projects existing MDC IDs plus Step-owned records in canonical order', () => {
    const context = createAfterParseHook({})
    const result = buildDocsContentToc(
      {
        title: 'Contents',
        searchDepth: 2,
        depth: 2,
        links: [
          { id: 'intro', depth: 2, text: 'Intro', source: 'mdc' },
          { id: 'usage', depth: 3, text: 'Usage' },
        ],
      },
      [
        { id: 'title', text: 'Title', depth: 1 },
        { id: 'intro', text: 'Intro', depth: 2 },
        { id: 'hidden-component', text: 'Hidden Component', depth: 3 },
        {
          id: 'step-one',
          text: 'Step One',
          depth: 3,
          owner: 'steps',
          step: 1,
        },
        {
          id: 'too-deep-step',
          text: 'Too Deep Step',
          depth: 4,
          owner: 'steps',
        },
        { id: 'usage', text: 'Usage', depth: 3 },
      ],
      context,
    )

    expect(result).toMatchObject({
      title: 'Contents',
      searchDepth: 2,
      depth: 2,
      links: [
        {
          id: 'intro',
          text: 'Intro',
          depth: 2,
          source: 'mdc',
          children: [
            { id: 'step-one', text: 'Step One', depth: 3 },
            { id: 'usage', text: 'Usage', depth: 3 },
          ],
        },
      ],
    })
    expect(flattenTocLinks(result.links)).toEqual([
      'intro',
      'step-one',
      'usage',
    ])
    expect(JSON.stringify(result)).not.toContain('hidden-component')
    expect(JSON.stringify(result)).not.toContain('too-deep-step')
  })

  test('keeps h1 and over-depth Step records excluded by the MDC depth policy', () => {
    const context = createAfterParseHook({})
    const result = buildDocsContentToc(
      {
        title: '',
        searchDepth: 2,
        depth: 1,
        links: [{ id: 'selected', depth: 2, text: 'Selected' }],
      },
      [
        { id: 'step-title', text: 'Step Title', depth: 1, owner: 'steps' },
        { id: 'selected', text: 'Selected', depth: 2 },
        { id: 'allowed-step', text: 'Allowed Step', depth: 2, owner: 'steps' },
        { id: 'deep-step', text: 'Deep Step', depth: 3, owner: 'steps' },
      ],
      context,
    )

    expect(flattenTocLinks(result.links)).toEqual(['selected', 'allowed-step'])
  })

  test('deletes ephemeral records without generating a disabled TOC', () => {
    const content = {
      body: {
        toc: false,
        children: [{ type: 'element', tag: 'h2' }],
      },
      structuredData: { headings: [], contents: [] },
      meta: {
        [docsCanonicalTocKey]: [
          { id: 'step', text: 'Step', depth: 2, owner: 'steps' },
        ],
      },
    }

    normalizeDocsContentToc(createAfterParseHook(content))

    expect(content.body.toc).toBe(false)
    expect(content.body.children).toEqual([{ type: 'element', tag: 'h2' }])
    expect(content.structuredData).toEqual({ headings: [], contents: [] })
    expect(content.meta).toEqual({})
  })

  test('deletes ephemeral records after successful projection', () => {
    const content = {
      body: {
        children: [{ type: 'element', tag: 'p', value: 'Body stays put' }],
        toc: {
          title: '',
          searchDepth: 2,
          depth: 2,
          links: [{ id: 'selected', depth: 2, text: 'Selected' }],
        },
      },
      meta: {
        [docsCanonicalTocKey]: [
          { id: 'selected', text: 'Selected', depth: 2 },
          { id: 'step', text: 'Step', depth: 3, owner: 'steps' },
        ],
      },
      structuredData: {
        headings: [{ id: 'selected', content: 'Selected' }],
        contents: [],
      },
    }

    normalizeDocsContentToc(createAfterParseHook(content))

    expect(JSON.stringify(content)).not.toContain(docsCanonicalTocKey)
    expect(content.body.children).toEqual([
      { type: 'element', tag: 'p', value: 'Body stays put' },
    ])
    expect(content.structuredData).toEqual({
      headings: [{ id: 'selected', content: 'Selected' }],
      contents: [],
    })
    expect(
      flattenTocLinks(
        (
          content.body.toc as {
            links: Array<{ id: string; children?: Array<{ id: string }> }>
          }
        ).links,
      ),
    ).toEqual(['selected', 'step'])
  })

  test('fails when an existing MDC link is missing from canonical records', () => {
    const context = createAfterParseHook({})

    expect(() =>
      buildDocsContentToc(
        {
          title: '',
          searchDepth: 2,
          depth: 2,
          links: [{ id: 'missing', depth: 2, text: 'Missing' }],
        },
        [],
        context,
      ),
    ).toThrow(/missing" maps to 0 canonical records/)
  })

  test('fails when an existing MDC link maps to duplicate canonical records', () => {
    const context = createAfterParseHook({})

    expect(() =>
      buildDocsContentToc(
        {
          title: '',
          searchDepth: 2,
          depth: 2,
          links: [{ id: 'duplicate', depth: 2, text: 'Duplicate' }],
        },
        [
          { id: 'duplicate', text: 'Duplicate', depth: 2 },
          { id: 'duplicate', text: 'Duplicate', depth: 3 },
        ],
        context,
      ),
    ).toThrow(/duplicate" maps to 2 canonical records/)
  })

  test('rejects canonical records with non-semantic fields', () => {
    const content = {
      body: {
        toc: {
          title: '',
          searchDepth: 2,
          depth: 2,
          links: [],
        },
      },
      meta: {
        [docsCanonicalTocKey]: [
          {
            id: 'bad',
            text: 'Bad',
            depth: 2,
            position: { start: 0 },
          },
        ],
      },
    }

    expect(() =>
      normalizeDocsContentToc(createAfterParseHook(content)),
    ).toThrow(/unsupported field "position"/)
    expect(content.meta).toEqual({})
  })

  test('supports canonical records from a top-level transport key', () => {
    const content = {
      body: {
        toc: {
          title: '',
          searchDepth: 2,
          depth: 2,
          links: [{ id: 'selected', depth: 2, text: 'Selected' }],
        },
      },
      [docsCanonicalTocKey]: [
        { id: 'selected', text: 'Selected', depth: 2 },
      ] satisfies DocsCanonicalTocRecord[],
    }

    normalizeDocsContentToc(createAfterParseHook(content))

    expect(JSON.stringify(content)).not.toContain(docsCanonicalTocKey)
  })
})
