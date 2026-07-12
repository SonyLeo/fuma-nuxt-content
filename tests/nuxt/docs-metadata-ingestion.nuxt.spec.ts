// @vitest-environment node

import type {
  FileAfterParseHook,
  FileBeforeParseHook,
  ResolvedCollection,
} from '@nuxt/content'
import { describe, expect, test } from 'vitest'
import {
  DocsMetadataValidationError,
  normalizeDocsDirectoryMetadata,
  normalizeDocsPageMetadata,
} from '../../shared/docs-metadata'
import {
  captureDocsMetadataProvenance,
  normalizeDocsMetadataContent,
} from '../../build/docs-metadata-ingestion'

function createCollection(name: string, type: 'page' | 'data') {
  return {
    name,
    type,
  } as ResolvedCollection
}

function createBeforeParseHook(
  body: string,
  collection = createCollection('docs', 'page'),
) {
  return {
    collection,
    file: {
      id: `${collection.name}/guide/example.md`,
      path: 'D:/content/guide/example.md',
      body,
    },
    parserOptions: {},
  } as FileBeforeParseHook
}

function createAfterParseHook(
  before: FileBeforeParseHook,
  content: Record<string, unknown>,
) {
  return {
    collection: before.collection,
    file: before.file,
    content,
  } as FileAfterParseHook
}

describe('docs page metadata normalization', () => {
  test('keeps explicit false distinct from missing and defaults only missing', () => {
    const explicitFalse = normalizeDocsPageMetadata({
      title: '  Explicit title  ',
      toc: false,
    })
    const missing = normalizeDocsPageMetadata({
      title: 'Missing Boolean',
    })

    expect(explicitFalse).toEqual({
      title: 'Explicit title',
      toc: false,
    })
    expect(Object.hasOwn(explicitFalse, 'toc')).toBe(true)
    expect(Object.hasOwn(missing, 'toc')).toBe(false)
    expect(explicitFalse.toc ?? true).toBe(false)
    expect(missing.toc ?? true).toBe(true)
  })

  test.each([
    ['missing', {}, 'undefined'],
    ['empty', { title: '' }, '""'],
    ['whitespace-only', { title: '   ' }, '"   "'],
  ])(
    'rejects %s title with source-aware diagnostics',
    (_name, input, value) => {
      expect(() => normalizeDocsPageMetadata(input)).toThrow(
        new RegExp(`field "title"[\\s\\S]*value ${value}`),
      )
    },
  )

  test.each([
    ['false', 'false'],
    ['true', 'true'],
    ['nope', 'nope'],
    ['zero', 0],
    ['one', 1],
    ['null', null],
  ])('rejects wrong Boolean %s before SQL coercion', (_name, value) => {
    expect(() =>
      normalizeDocsPageMetadata({
        title: 'Wrong Boolean',
        toc: value,
      }),
    ).toThrow(/field "toc"[\s\S]*rule: Expected boolean/)
  })

  test('accepts explicit true and explicit false Booleans', () => {
    expect(
      normalizeDocsPageMetadata({
        title: 'Boolean values',
        toc: true,
        full: false,
      }),
    ).toMatchObject({
      toc: true,
      full: false,
    })
  })
})

describe('docs directory metadata normalization', () => {
  test('normalizes the meta stem and preserves Boolean presence', () => {
    const metadata = normalizeDocsDirectoryMetadata({
      stem: 'guide/protocol/meta',
      title: '  Protocol  ',
      root: false,
    })

    expect(metadata).toEqual({
      stem: 'guide/protocol',
      title: 'Protocol',
      root: false,
    })
    expect(Object.hasOwn(metadata, 'root')).toBe(true)
    expect(Object.hasOwn(metadata, 'hidden')).toBe(false)
  })

  test.each([
    [{ stem: 'guide/meta', root: 'false' }, 'root'],
    [{ stem: 'guide/meta', title: 42 }, 'title'],
  ])('rejects invalid directory metadata %#', (input, field) => {
    expect(() => normalizeDocsDirectoryMetadata(input)).toThrow(
      new RegExp(`field "${field}"`),
    )
  })
})

describe('Nuxt Content metadata ingestion adapter', () => {
  test('captures native parsed provenance before generated title fallback', () => {
    const before = createBeforeParseHook(`---
title: Hook page
toc: false
---

# Rendered heading`)

    const transformed = captureDocsMetadataProvenance({
      id: before.file.id,
      title: 'Hook page',
      toc: false,
    })

    const after = createAfterParseHook(before, {
      id: before.file.id,
      path: '/guide/example',
      stem: 'guide/example',
      title: 'Hook page',
      toc: false,
      meta: {
        __docsMetadataSource: transformed.__docsMetadataSource,
      },
    })

    normalizeDocsMetadataContent(after)

    expect(after.content.docsMetadata).toEqual({
      title: 'Hook page',
      toc: false,
    })
    expect(after.content.toc).toBe(false)
  })

  test('does not allow a path or heading title to replace explicit title', () => {
    const before = createBeforeParseHook(`---
description: Missing explicit title
---

# Derived heading`)

    const transformed = captureDocsMetadataProvenance({
      id: before.file.id,
      title: undefined,
    })

    const after = createAfterParseHook(before, {
      id: before.file.id,
      path: '/guide/example',
      stem: 'guide/example',
      title: 'Derived heading',
      meta: {
        __docsMetadataSource: transformed.__docsMetadataSource,
      },
    })

    expect(() => normalizeDocsMetadataContent(after)).toThrow(
      /field "title"[\s\S]*value undefined/,
    )
  })

  test('rejects a truthy Boolean string before Nuxt can store it as true', () => {
    const before = createBeforeParseHook(`---
title: Wrong Boolean
toc: nope
---`)

    const transformed = captureDocsMetadataProvenance({
      id: before.file.id,
      title: 'Wrong Boolean',
      toc: 'nope',
    })

    const after = createAfterParseHook(before, {
      id: before.file.id,
      path: '/guide/example',
      stem: 'guide/example',
      title: 'Wrong Boolean',
      toc: 'nope',
      meta: {
        __docsMetadataSource: transformed.__docsMetadataSource,
      },
    })

    expect(() => normalizeDocsMetadataContent(after)).toThrow(
      /field "toc"[\s\S]*value "nope" \(string\)/,
    )
    expect(after.content.docsMetadata).toBeUndefined()
  })

  test('normalizes docsMeta content before SQL insertion', () => {
    const collection = createCollection('docsMeta', 'data')
    const before = createBeforeParseHook('{}', collection)
    before.file.id = 'docsMeta/guide/meta.json'
    before.file.path = 'D:/content/guide/meta.json'

    const after = createAfterParseHook(before, {
      id: before.file.id,
      stem: 'guide/meta',
      title: 'Guide',
      hidden: false,
    })

    normalizeDocsMetadataContent(after)

    expect(after.content.docsMetadata).toEqual({
      stem: 'guide',
      title: 'Guide',
      hidden: false,
    })
  })

  test('ignores collections outside docs and docsMeta', () => {
    const collection = createCollection('blog', 'page')
    const before = createBeforeParseHook('No frontmatter', collection)
    const after = createAfterParseHook(before, {
      title: 'Blog',
    })

    normalizeDocsMetadataContent(after)

    expect(after.content).toEqual({ title: 'Blog' })
  })

  test('does not capture provenance for another Markdown collection', () => {
    const transformed = captureDocsMetadataProvenance({
      id: 'nativeDocs/guide/example.md',
      title: 'Native page',
      toc: false,
    })

    expect(transformed).toEqual({
      id: 'nativeDocs/guide/example.md',
      title: 'Native page',
      toc: false,
    })
  })

  test('adds source context to shared validation failures', () => {
    const before = createBeforeParseHook('')
    const after = createAfterParseHook(before, {
      title: 'Generated title',
      meta: {
        __docsMetadataSource: { title: undefined },
      },
    })

    expect(() => normalizeDocsMetadataContent(after)).toThrow(
      /collection "docs"[\s\S]*source "docs\/guide\/example.md"[\s\S]*field "title"/,
    )
    expect(() => normalizeDocsPageMetadata({})).toThrow(
      DocsMetadataValidationError,
    )
  })
})
