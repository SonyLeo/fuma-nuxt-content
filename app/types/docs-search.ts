export type DocsSearchProvider = 'local'

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

export type DocsSearchStatus = 'idle' | 'query' | 'results' | 'empty'
