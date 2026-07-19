import type {
  DocsSearchClient,
  DocsSearchIndexEntry,
  DocsSearchProvider,
  DocsSearchResult,
} from '~/types/docs-search'
import { searchDocsIndex } from '~/utils/docs-search'

type DocsSearchFetch = typeof globalThis.fetch

export type ApiDocsSearchClientOptions = {
  endpoint?: string
  fetch?: DocsSearchFetch
}

export type ConfiguredDocsSearchClientOptions = ApiDocsSearchClientOptions & {
  provider: DocsSearchProvider
  index?: DocsSearchIndexEntry[]
}

const DOCS_SEARCH_REQUEST_ERROR = 'Search request failed.'
const optionalResultFields = [
  'description',
  'section',
  'sourcePath',
  'excerpt',
] as const

function createDocsSearchRequestUrl(
  endpoint: string,
  query: string,
  limit: number,
) {
  const hashIndex = endpoint.indexOf('#')
  const endpointWithoutHash =
    hashIndex === -1 ? endpoint : endpoint.slice(0, hashIndex)
  const hash = hashIndex === -1 ? '' : endpoint.slice(hashIndex)
  const separator = endpointWithoutHash.includes('?')
    ? /[?&]$/.test(endpointWithoutHash)
      ? ''
      : '&'
    : '?'
  const searchParams = new URLSearchParams({
    query,
    limit: String(limit),
  })

  return `${endpointWithoutHash}${separator}${searchParams}${hash}`
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function readRequiredResultField(
  value: Record<string, unknown>,
  field: 'id' | 'title' | 'path',
) {
  const fieldValue = value[field]

  if (typeof fieldValue !== 'string' || !fieldValue.trim()) {
    throw new Error(DOCS_SEARCH_REQUEST_ERROR)
  }

  return fieldValue
}

export function decodeDocsSearchResults(value: unknown): DocsSearchResult[] {
  if (!Array.isArray(value)) {
    throw new Error(DOCS_SEARCH_REQUEST_ERROR)
  }

  return value.map((item) => {
    if (!isRecord(item)) {
      throw new Error(DOCS_SEARCH_REQUEST_ERROR)
    }

    const result: DocsSearchResult = {
      id: readRequiredResultField(item, 'id'),
      title: readRequiredResultField(item, 'title'),
      path: readRequiredResultField(item, 'path'),
    }

    for (const field of optionalResultFields) {
      const fieldValue = item[field]

      if (fieldValue === undefined) {
        continue
      }

      if (typeof fieldValue !== 'string') {
        throw new Error(DOCS_SEARCH_REQUEST_ERROR)
      }

      result[field] = fieldValue
    }

    return result
  })
}

function isAbortError(error: unknown) {
  return (
    error !== null &&
    typeof error === 'object' &&
    'name' in error &&
    error.name === 'AbortError'
  )
}

export function createLocalDocsSearchClient(
  index: DocsSearchIndexEntry[] | null | undefined,
): DocsSearchClient {
  return {
    search({ query, limit }) {
      return searchDocsIndex(index, query, limit)
    },
  }
}

export function createApiDocsSearchClient(
  options: ApiDocsSearchClientOptions = {},
): DocsSearchClient {
  const endpoint = options.endpoint ?? '/api/search'
  const fetchRequest = options.fetch ?? globalThis.fetch

  return {
    async search({ query, limit, signal }) {
      try {
        const response = await fetchRequest(
          createDocsSearchRequestUrl(endpoint, query, limit),
          { signal },
        )

        if (!response.ok) {
          throw new Error(DOCS_SEARCH_REQUEST_ERROR)
        }

        return decodeDocsSearchResults(await response.json())
      } catch (error) {
        if (isAbortError(error)) {
          throw error
        }

        // Transport errors intentionally hide provider and response details.
        // eslint-disable-next-line preserve-caught-error
        throw new Error(DOCS_SEARCH_REQUEST_ERROR)
      }
    },
  }
}

export function createConfiguredDocsSearchClient(
  options: ConfiguredDocsSearchClientOptions,
): DocsSearchClient {
  if (options.provider === 'api') {
    return createApiDocsSearchClient({
      endpoint: options.endpoint,
      fetch: options.fetch,
    })
  }

  return createLocalDocsSearchClient(options.index)
}
