import type { ContentNavigationItem } from '@nuxt/content'
import {
  queryCollection,
  queryCollectionNavigation,
} from '@nuxt/content/server'
import type { H3Event } from 'h3'
import type { DocsDirectoryMeta, DocsPageRecord } from '~/types/docs'
import type { DocsSearchResult } from '~/types/docs-search'
import {
  createDirectoryMetaMap,
  createDocsPageTreePageMap,
} from '~/utils/docs-navigation'
import { createDocsPageTreeRuntime } from '~/utils/docs-page-tree-runtime'
import {
  createDocsSearchIndex,
  searchDocsIndex,
  type DocsSearchPageInput,
} from '~/utils/docs-search'

export const DEFAULT_DOCS_SEARCH_LIMIT = 8
export const MAX_DOCS_SEARCH_LIMIT = 20
export const MAX_DOCS_SEARCH_QUERY_LENGTH = 200

export type DocsSearchQuery = {
  query: string
  limit: number
}

export type DocsSearchContentRecord = DocsSearchPageInput & DocsPageRecord

export type DocsSearchServiceInput = {
  navigation: ContentNavigationItem[]
  pages: DocsSearchContentRecord[]
  directoryMeta: DocsDirectoryMeta[]
}

type DocsDirectoryMetaRecord = {
  docsMetadata: DocsDirectoryMeta
}

export class DocsSearchRequestValidationError extends Error {
  constructor() {
    super('Invalid docs search request.')
    this.name = 'DocsSearchRequestValidationError'
  }
}

function invalidRequest(): never {
  throw new DocsSearchRequestValidationError()
}

export function parseDocsSearchQuery(
  searchParams: URLSearchParams,
): DocsSearchQuery {
  const queryValues = searchParams.getAll('query')
  const limitValues = searchParams.getAll('limit')

  if (queryValues.length > 1 || limitValues.length > 1) {
    return invalidRequest()
  }

  const query = (queryValues[0] ?? '').trim()

  if (query.length > MAX_DOCS_SEARCH_QUERY_LENGTH) {
    return invalidRequest()
  }

  if (limitValues.length === 0) {
    return { query, limit: DEFAULT_DOCS_SEARCH_LIMIT }
  }

  const rawLimit = limitValues[0]!

  if (!/^\d+$/.test(rawLimit)) {
    return invalidRequest()
  }

  const limit = Number(rawLimit)

  if (
    !Number.isSafeInteger(limit) ||
    limit < 1 ||
    limit > MAX_DOCS_SEARCH_LIMIT
  ) {
    return invalidRequest()
  }

  return { query, limit }
}

export function createDocsSearchResults(
  input: DocsSearchServiceInput,
  request: DocsSearchQuery,
): DocsSearchResult[] {
  const runtime = createDocsPageTreeRuntime({
    navigation: input.navigation,
    pageBySourcePath: createDocsPageTreePageMap(input.pages),
    directoryMetaByStem: createDirectoryMetaMap(input.directoryMeta),
  })
  const index = createDocsSearchIndex(input.pages, runtime)

  return searchDocsIndex(index, request.query, request.limit)
}

export async function queryDocsSearchResults(
  event: H3Event,
  request: DocsSearchQuery,
): Promise<DocsSearchResult[]> {
  const [navigation, pages, directoryMetaRecords] = await Promise.all([
    queryCollectionNavigation(event, 'docs'),
    queryCollection(event, 'docs')
      .select('path', 'stem', 'docsMetadata', 'structuredData', 'body')
      .all() as unknown as Promise<DocsSearchContentRecord[]>,
    queryCollection(event, 'docsMeta')
      .select('docsMetadata')
      .all() as unknown as Promise<DocsDirectoryMetaRecord[]>,
  ])

  return createDocsSearchResults(
    {
      navigation,
      pages,
      directoryMeta: directoryMetaRecords.map((record) => record.docsMetadata),
    },
    request,
  )
}
