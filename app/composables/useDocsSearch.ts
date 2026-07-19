import type { MaybeRefOrGetter } from 'vue'
import type {
  DocsSearchClient,
  DocsSearchError,
  DocsSearchResult,
  DocsSearchStatus,
} from '~/types/docs-search'

type UseDocsSearchOptions = {
  client?: MaybeRefOrGetter<DocsSearchClient | undefined>
  minQueryLength?: number
  limit?: number
  delayMs?: number
}

function isSearchPromise(
  value: DocsSearchResult[] | Promise<DocsSearchResult[]>,
): value is Promise<DocsSearchResult[]> {
  return typeof (value as Promise<DocsSearchResult[]>).then === 'function'
}

function normalizeSearchError(error: unknown): DocsSearchError {
  return {
    message:
      error instanceof Error && error.message
        ? error.message
        : 'Search failed. Try again.',
  }
}

export function useDocsSearch(options: UseDocsSearchOptions = {}) {
  const isOpen = shallowRef(false)
  const query = shallowRef('')
  const results = shallowRef<DocsSearchResult[]>([])
  const status = shallowRef<DocsSearchStatus>('idle')
  const error = shallowRef<DocsSearchError | null>(null)
  const minQueryLength = options.minQueryLength ?? 1
  const limit = options.limit ?? 8
  const delayMs = Math.max(0, options.delayMs ?? 0)
  const trimmedQuery = computed(() => query.value.trim())
  const publicResults = computed(() => results.value)
  const publicStatus = computed(() => status.value)
  const publicError = computed(() => error.value)
  let requestIdentity = 0
  let activeController: AbortController | undefined
  let debounceTimer: ReturnType<typeof setTimeout> | undefined
  let disposed = false

  function invalidateRequest() {
    requestIdentity += 1
    activeController?.abort()
    activeController = undefined

    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = undefined
    }
  }

  function commitResults(nextResults: DocsSearchResult[]) {
    results.value = nextResults
    status.value = nextResults.length > 0 ? 'results' : 'empty'
    error.value = null
  }

  async function runSearch(
    client: DocsSearchClient,
    searchQuery: string,
    identity: number,
  ) {
    const controller = new AbortController()
    activeController = controller

    try {
      const response = client.search({
        query: searchQuery,
        limit,
        signal: controller.signal,
      })

      if (isSearchPromise(response)) {
        status.value = 'loading'
        const nextResults = await response

        if (disposed || identity !== requestIdentity) {
          return
        }

        commitResults(nextResults)
        return
      }

      if (disposed || identity !== requestIdentity) {
        return
      }

      commitResults(response)
    } catch (cause) {
      if (disposed || identity !== requestIdentity) {
        return
      }

      results.value = []
      status.value = 'error'
      error.value = normalizeSearchError(cause)
    } finally {
      if (identity === requestIdentity) {
        activeController = undefined
      }
    }
  }

  function scheduleSearch(searchQuery: string, client?: DocsSearchClient) {
    invalidateRequest()
    results.value = []
    error.value = null

    if (searchQuery.length < minQueryLength) {
      status.value = 'idle'
      return
    }

    if (!client) {
      status.value = 'empty'
      return
    }

    status.value = 'loading'
    const identity = requestIdentity
    const execute = () => {
      debounceTimer = undefined
      void runSearch(client, searchQuery, identity)
    }

    if (delayMs > 0) {
      debounceTimer = setTimeout(execute, delayMs)
      return
    }

    execute()
  }

  watch(
    [trimmedQuery, () => toValue(options.client)],
    ([searchQuery, client]) => {
      scheduleSearch(searchQuery, client)
    },
    { immediate: true },
  )

  function open() {
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
  }

  function updateQuery(value: string) {
    query.value = value
  }

  onScopeDispose(() => {
    disposed = true
    invalidateRequest()
  })

  return {
    isOpen,
    query,
    results: publicResults,
    status: publicStatus,
    error: publicError,
    open,
    close,
    updateQuery,
  }
}
