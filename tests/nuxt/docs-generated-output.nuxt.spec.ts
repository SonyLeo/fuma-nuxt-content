import { readFile } from 'node:fs/promises'
import { describe, expect, test } from 'vitest'
import type { DocsSiteSeoDefaults } from '~/types/docs-site'
import type { DocsGeneratedPageRecord } from '../../server/utils/docs-generated-pages'
import { createDocsGeneratedPageEntries } from '../../server/utils/docs-generated-pages'

const seo: DocsSiteSeoDefaults = {
  siteTitle: 'Generated Docs',
  siteUrl: 'https://docs.example.com',
}

describe('generated docs output contract', () => {
  test('uses normalized metadata and public identity instead of raw fields', () => {
    const records = [
      {
        path: '/guide/source',
        stem: 'guide/source',
        slug: '/raw-route',
        title: 'Raw title',
        description: 'Raw description',
        hidden: true,
        docsMetadata: {
          title: 'Normalized title',
          description: 'Normalized description',
          slug: '/指南/开始',
          hidden: false,
        },
      },
    ] as unknown as DocsGeneratedPageRecord[]

    expect(
      createDocsGeneratedPageEntries(records, seo, 'http://localhost'),
    ).toEqual([
      {
        identity: {
          contentPath: '/guide/source',
          sourcePath: '/guide/source',
          routePath: '/%E6%8C%87%E5%8D%97/%E5%BC%80%E5%A7%8B',
          stem: 'guide/source',
          slug: '/指南/开始',
        },
        title: 'Normalized title',
        description: 'Normalized description',
        url: 'https://docs.example.com/%E6%8C%87%E5%8D%97/%E5%BC%80%E5%A7%8B',
      },
    ])
  })

  test('excludes normalized hidden pages and retains ordinary context-only records', () => {
    const entries = createDocsGeneratedPageEntries(
      [
        {
          path: '/guide/hidden',
          stem: 'guide/hidden',
          docsMetadata: {
            title: 'Hidden',
            hidden: true,
          },
        },
        {
          path: '/guide/context-only',
          stem: 'guide/context-only',
          docsMetadata: {
            title: 'Context only',
            description: 'Excluded from navigation, but still published.',
          },
        },
      ],
      seo,
      'http://localhost',
    )

    expect(entries.map((entry) => entry.title)).toEqual(['Context only'])
    expect(entries[0]?.identity.routePath).toBe('/guide/context-only')
  })

  test('sorts canonical public URLs independently of content query order', () => {
    const entries = createDocsGeneratedPageEntries(
      [
        {
          path: '/z-last',
          stem: 'z-last',
          docsMetadata: {
            title: 'Last',
          },
        },
        {
          path: '/a-first',
          stem: 'a-first',
          docsMetadata: {
            title: 'First',
          },
        },
      ],
      seo,
      'http://localhost',
    )

    expect(entries.map((entry) => entry.url)).toEqual([
      'https://docs.example.com/a-first',
      'https://docs.example.com/z-last',
    ])
  })

  test('uses shared identity diagnostics for duplicate public routes', () => {
    expect(() =>
      createDocsGeneratedPageEntries(
        [
          {
            path: '/one',
            stem: 'one',
            docsMetadata: {
              title: 'One',
              slug: '/shared',
            },
          },
          {
            path: '/two',
            stem: 'two',
            docsMetadata: {
              title: 'Two',
              slug: '/shared',
            },
          },
        ],
        seo,
        'http://localhost',
      ),
    ).toThrow('Duplicate docs route paths detected: /shared: /one, /two')
  })

  test('server routes query only the normalized generated-output fields', async () => {
    for (const path of [
      '../../server/routes/llms.txt.ts',
      '../../server/routes/sitemap.xml.ts',
    ]) {
      const source = await readFile(new URL(path, import.meta.url), 'utf8')

      expect(source).toContain(".select('path', 'stem', 'docsMetadata')")
      expect(source).not.toMatch(/\.select\([^)]*\bslug\b/)
      expect(source).not.toMatch(/\.select\([^)]*\btitle\b/)
      expect(source).not.toMatch(/\.select\([^)]*\bdescription\b/)
      expect(source).not.toMatch(/\.select\([^)]*\bhidden\b/)
      expect(source).not.toContain('resolveDocsRoutePath')
    }
  })
})
