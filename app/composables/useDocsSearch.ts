import type { MaybeRefOrGetter } from 'vue'
import type {
  DocsSearchIndexEntry,
  DocsSearchResult,
  DocsSearchStatus,
} from '~/types/docs-search'
import { searchDocsIndex } from '~/utils/docs-search'

type UseDocsSearchOptions = {
  index?: MaybeRefOrGetter<DocsSearchIndexEntry[]>
  results?: MaybeRefOrGetter<DocsSearchResult[]>
  minQueryLength?: number
}

export function useDocsSearch(options: UseDocsSearchOptions = {}) {
  const isOpen = shallowRef(false)
  const query = shallowRef('')
  const minQueryLength = options.minQueryLength ?? 1
  const trimmedQuery = computed(() => query.value.trim())
  const results = computed(() => {
    const directResults = toValue(options.results)

    if (directResults) {
      return directResults
    }

    return searchDocsIndex(toValue(options.index), trimmedQuery.value)
  })
  const status = computed<DocsSearchStatus>(() => {
    if (trimmedQuery.value.length < minQueryLength) {
      return 'idle'
    }

    if (results.value.length > 0) {
      return 'results'
    }

    return 'empty'
  })

  function open() {
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
  }

  function updateQuery(value: string) {
    query.value = value
  }

  return {
    isOpen,
    query,
    results,
    status,
    open,
    close,
    updateQuery,
  }
}
