// @vitest-environment node

import type { ContentNavigationItem } from '@nuxt/content'
import { describe, expect, test, vi } from 'vitest'
import type { DocsDirectoryMeta } from '~/types/docs'
import type { DocsSearchRequest } from '~/types/docs-search'
import {
  createApiDocsSearchClient,
  createConfiguredDocsSearchClient,
  decodeDocsSearchResults,
} from '~/utils/docs-search-client'
import {
  createDocsSearchResults,
  DocsSearchRequestValidationError,
  parseDocsSearchQuery,
  type DocsSearchContentRecord,
} from '../../server/utils/docs-search'

function createRequest(
  patch: Partial<DocsSearchRequest> = {},
): DocsSearchRequest {
  return {
    query: 'canonical route',
    limit: 8,
    signal: new AbortController().signal,
    ...patch,
  }
}

function createSearchPage(
  path: string,
  stem: string,
  title: string,
  patch: Partial<DocsSearchContentRecord['docsMetadata']> = {},
  body = `${title} searchable body`,
): DocsSearchContentRecord {
  return {
    path,
    stem,
    docsMetadata: { title, ...patch },
    structuredData: {
      headings: [{ id: 'contract', content: `${title} heading` }],
      contents: [{ content: body }],
    },
  }
}

describe('docs search API query parser', () => {
  test('accepts an empty query, defaults the limit, and ignores unknown params', () => {
    expect(parseDocsSearchQuery(new URLSearchParams('unused=value'))).toEqual({
      query: '',
      limit: 8,
    })
    expect(
      parseDocsSearchQuery(
        new URLSearchParams('query=%20%E8%B7%AF%E5%BE%84%20&limit=20&x=1'),
      ),
    ).toEqual({ query: '路径', limit: 20 })

    expect(
      parseDocsSearchQuery(
        new URLSearchParams(`query=%20${'x'.repeat(200)}%20`),
      ),
    ).toEqual({ query: 'x'.repeat(200), limit: 8 })
  })

  test.each([
    'query=first&query=second',
    'limit=8&limit=9',
    `query=${'x'.repeat(201)}`,
    'limit=',
    'limit=0',
    'limit=21',
    'limit=-1',
    'limit=1.5',
    'limit=8e0',
    'limit=%208',
  ])('rejects invalid params: %s', (value) => {
    expect(() => parseDocsSearchQuery(new URLSearchParams(value))).toThrow(
      DocsSearchRequestValidationError,
    )
  })
})

describe('docs search API canonical service', () => {
  const navigation = [
    {
      title: 'Guide',
      path: '/guide',
      stem: 'guide',
      page: false,
      children: [
        {
          title: 'Raw path policy',
          path: '/guide/path-policy',
          stem: 'guide/path-policy',
        },
        {
          title: 'Raw archive',
          path: '/guide/archive',
          stem: 'guide/archive',
        },
        {
          title: 'Raw hidden',
          path: '/guide/hidden',
          stem: 'guide/hidden',
        },
      ],
    },
  ] as ContentNavigationItem[]
  const pages = [
    createSearchPage(
      '/guide/path-policy',
      'guide/path-policy',
      'Path Policy',
      { slug: '真实 路径' },
      'breadcrumb、pager、sidebar canonical policy',
    ),
    createSearchPage('/guide/archive', 'guide/archive', 'Archive Note', {
      slug: '/context-entry',
    }),
    createSearchPage('/guide/hidden', 'guide/hidden', 'Hidden Note', {
      hidden: true,
    }),
  ]
  const directoryMeta: DocsDirectoryMeta[] = [
    {
      stem: 'guide',
      title: 'Guide',
      pages: ['path-policy', '!archive', 'hidden'],
    },
  ]

  test('rebuilds context searchability and canonical routes from page-tree policy', () => {
    const input = { navigation, pages, directoryMeta }

    expect(
      createDocsSearchResults(input, { query: 'Archive Note', limit: 8 }),
    ).toMatchObject([
      {
        title: 'Archive Note',
        path: '/context-entry',
        sourcePath: '/guide/archive',
      },
    ])
    expect(
      createDocsSearchResults(input, {
        query: 'breadcrumb、pager、sidebar',
        limit: 8,
      }),
    ).toMatchObject([
      {
        title: 'Path Policy',
        path: '/guide/%E7%9C%9F%E5%AE%9E%20%E8%B7%AF%E5%BE%84',
      },
    ])
    expect(
      createDocsSearchResults(input, { query: 'Hidden Note', limit: 8 }),
    ).toEqual([])
  })
})

describe('API docs search client', () => {
  test('selects local and API clients without changing the shared contract', async () => {
    const index = [
      {
        id: 'local',
        title: 'Local result',
        path: '/guide/local',
      },
    ]
    const fetchRequest = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify([
          {
            id: 'api',
            title: 'API result',
            path: '/guide/api',
          },
        ]),
        { status: 200 },
      ),
    )
    const localRequest = createRequest({ query: 'local' })
    const apiRequest = createRequest({ query: 'api' })

    expect(
      await createConfiguredDocsSearchClient({
        provider: 'local',
        index,
        fetch: fetchRequest,
      }).search(localRequest),
    ).toMatchObject([{ id: 'local', path: '/guide/local' }])
    expect(fetchRequest).not.toHaveBeenCalled()

    expect(
      await createConfiguredDocsSearchClient({
        provider: 'api',
        endpoint: '/internal/search',
        index,
        fetch: fetchRequest,
      }).search(apiRequest),
    ).toEqual([
      {
        id: 'api',
        title: 'API result',
        path: '/guide/api',
      },
    ])
    expect(fetchRequest).toHaveBeenCalledWith(
      '/internal/search?query=api&limit=8',
      { signal: apiRequest.signal },
    )
  })

  test('passes query, limit, and signal to relative and absolute endpoints', async () => {
    const responseBody = [
      {
        id: 'guide/path-policy',
        title: 'Path Policy',
        path: '/guide/path-policy',
        section: 'Guide',
        unknown: 'discarded',
      },
    ]
    const fetchRequest = vi
      .fn<typeof fetch>()
      .mockImplementation(() =>
        Promise.resolve(
          new Response(JSON.stringify(responseBody), { status: 200 }),
        ),
      )
    const request = createRequest({ query: '路径 & policy', limit: 3 })

    await expect(
      createApiDocsSearchClient({ fetch: fetchRequest }).search(request),
    ).resolves.toEqual([
      {
        id: 'guide/path-policy',
        title: 'Path Policy',
        path: '/guide/path-policy',
        section: 'Guide',
      },
    ])
    expect(fetchRequest).toHaveBeenCalledWith(
      '/api/search?query=%E8%B7%AF%E5%BE%84+%26+policy&limit=3',
      { signal: request.signal },
    )

    fetchRequest.mockClear()
    await createApiDocsSearchClient({
      endpoint: 'https://docs.example/api/search?locale=zh',
      fetch: fetchRequest,
    }).search(request)
    expect(fetchRequest).toHaveBeenCalledWith(
      'https://docs.example/api/search?locale=zh&query=%E8%B7%AF%E5%BE%84+%26+policy&limit=3',
      { signal: request.signal },
    )
  })

  test.each([
    null,
    {},
    [{ id: '', title: 'Title', path: '/guide' }],
    [{ id: 'id', title: 1, path: '/guide' }],
    [{ id: 'id', title: 'Title', path: '/guide', excerpt: null }],
  ])('rejects invalid decoded payloads: %j', (value) => {
    expect(() => decodeDocsSearchResults(value)).toThrow(
      'Search request failed.',
    )
  })

  test('uses one generic error for non-2xx responses without reading the body', async () => {
    const json = vi.fn(() => Promise.resolve({ secret: 'internal detail' }))
    const fetchRequest = vi.fn<typeof fetch>().mockResolvedValue({
      ok: false,
      json,
    } as unknown as Response)

    await expect(
      createApiDocsSearchClient({ fetch: fetchRequest }).search(
        createRequest(),
      ),
    ).rejects.toThrow('Search request failed.')
    expect(json).not.toHaveBeenCalled()
  })

  test.each([
    ['malformed JSON', () => Promise.reject(new SyntaxError('secret JSON'))],
    ['invalid JSON', () => Promise.resolve({ data: [] })],
  ])('uses one generic error for %s', async (_label, json) => {
    const fetchRequest = vi.fn<typeof fetch>().mockResolvedValue({
      ok: true,
      json,
    } as unknown as Response)

    await expect(
      createApiDocsSearchClient({ fetch: fetchRequest }).search(
        createRequest(),
      ),
    ).rejects.toThrow('Search request failed.')
  })

  test('uses the generic error for network failures without leaking details', async () => {
    const fetchRequest = vi
      .fn<typeof fetch>()
      .mockRejectedValue(new Error('private upstream hostname'))

    await expect(
      createApiDocsSearchClient({ fetch: fetchRequest }).search(
        createRequest(),
      ),
    ).rejects.toEqual(new Error('Search request failed.'))
  })

  test('rethrows AbortError unchanged', async () => {
    const abortError = Object.assign(new Error('aborted'), {
      name: 'AbortError',
    })
    const fetchRequest = vi.fn<typeof fetch>().mockRejectedValue(abortError)

    await expect(
      createApiDocsSearchClient({ fetch: fetchRequest }).search(
        createRequest(),
      ),
    ).rejects.toBe(abortError)
  })
})
