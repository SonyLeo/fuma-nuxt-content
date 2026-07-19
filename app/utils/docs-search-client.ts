import type {
  DocsSearchClient,
  DocsSearchIndexEntry,
} from '~/types/docs-search'
import { searchDocsIndex } from '~/utils/docs-search'

export function createLocalDocsSearchClient(
  index: DocsSearchIndexEntry[] | null | undefined,
): DocsSearchClient {
  return {
    search({ query, limit }) {
      return searchDocsIndex(index, query, limit)
    },
  }
}
