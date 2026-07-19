export type DocsSearchProvider = 'local' | 'api'

export type DocsSearchRequest = {
  query: string
  limit: number
  signal: AbortSignal
}

export type DocsSearchResult = {
  id: string
  title: string
  description?: string
  path: string
  section?: string
  sourcePath?: string
  excerpt?: string
}

export type DocsSearchIndexEntry = DocsSearchResult & {
  headings?: string[]
  body?: string
}

export type DocsSearchClient = {
  search: (
    request: DocsSearchRequest,
  ) => DocsSearchResult[] | Promise<DocsSearchResult[]>
}

export type DocsSearchStatus =
  | 'idle'
  | 'loading'
  | 'results'
  | 'empty'
  | 'error'

export type DocsSearchError = {
  message: string
}
