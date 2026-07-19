import { effectScope, nextTick } from 'vue'
import { describe, expect, test, vi } from 'vitest'
import type {
  DocsSearchClient,
  DocsSearchIndexEntry,
  DocsSearchResult,
} from '~/types/docs-search'
import { useDocsSearch } from '~/composables/useDocsSearch'
import { createLocalDocsSearchClient } from '~/utils/docs-search-client'
import { searchDocsIndex } from '~/utils/docs-search'

function createResult(id: string): DocsSearchResult {
  return {
    id,
    title: id,
    path: `/guide/${id}`,
    sourcePath: `guide/${id}`,
  }
}

function createDeferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })

  return { promise, resolve, reject }
}

function mountSearch(options: Parameters<typeof useDocsSearch>[0] = {}) {
  const scope = effectScope()
  const search = scope.run(() => useDocsSearch(options))

  if (!search) {
    throw new Error('Search composable did not initialize.')
  }

  return { scope, search }
}

async function flushSearch() {
  await nextTick()
  await Promise.resolve()
  await nextTick()
}

describe('docs search provider contract', () => {
  test('adapts local ranking without changing result identity or limit', async () => {
    const index: DocsSearchIndexEntry[] = [
      {
        id: 'encoded-path',
        title: 'Search contract',
        description: 'Provider result',
        path: '/guide/%E7%9C%9F%E5%AE%9E%20%E8%B7%AF%E5%BE%84#heading',
        sourcePath: 'guide/真实 路径',
        excerpt: 'Canonical excerpt',
      },
      {
        id: 'second',
        title: 'Search provider details',
        path: '/guide/second',
      },
    ]
    const request = {
      query: 'search',
      limit: 1,
      signal: new AbortController().signal,
    }

    expect(createLocalDocsSearchClient(index).search(request)).toEqual(
      searchDocsIndex(index, request.query, request.limit),
    )
    expect(createLocalDocsSearchClient(index).search(request)).toEqual([
      {
        id: 'encoded-path',
        title: 'Search contract',
        description: 'Provider result',
        path: '/guide/%E7%9C%9F%E5%AE%9E%20%E8%B7%AF%E5%BE%84#heading',
        section: undefined,
        sourcePath: 'guide/真实 路径',
        excerpt: 'Canonical excerpt',
      },
    ])

    const { scope, search } = mountSearch({
      client: createLocalDocsSearchClient(index),
      limit: 1,
    })
    search.updateQuery('search')
    await flushSearch()
    expect(search.status.value).toBe('results')
    expect(search.results.value[0]?.path).toBe(index[0]?.path)
    scope.stop()
  })

  test('keeps short queries idle and does not call the client', async () => {
    const client: DocsSearchClient = { search: vi.fn(() => []) }
    const { scope, search } = mountSearch({ client, minQueryLength: 2 })

    search.updateQuery(' a ')
    await flushSearch()

    expect(search.status.value).toBe('idle')
    expect(search.results.value).toEqual([])
    expect(search.error.value).toBeNull()
    expect(client.search).not.toHaveBeenCalled()
    scope.stop()
  })

  test('moves async queries through loading, results, empty, error, and recovery', async () => {
    const pending = createDeferred<DocsSearchResult[]>()
    const client: DocsSearchClient = {
      search: vi
        .fn()
        .mockReturnValueOnce(pending.promise)
        .mockResolvedValueOnce([])
        .mockRejectedValueOnce(new Error('Provider unavailable'))
        .mockResolvedValueOnce([createResult('recovered')]),
    }
    const { scope, search } = mountSearch({ client })

    search.updateQuery('pending')
    await nextTick()
    expect(search.status.value).toBe('loading')

    pending.resolve([createResult('pending')])
    await flushSearch()
    expect(search.status.value).toBe('results')
    expect(search.results.value.map((result) => result.id)).toEqual(['pending'])

    search.updateQuery('empty')
    await flushSearch()
    expect(search.status.value).toBe('empty')
    expect(search.results.value).toEqual([])

    search.updateQuery('failed')
    await flushSearch()
    expect(search.status.value).toBe('error')
    expect(search.results.value).toEqual([])
    expect(search.error.value).toEqual({ message: 'Provider unavailable' })

    search.updateQuery('recovered')
    await flushSearch()
    expect(search.status.value).toBe('results')
    expect(search.error.value).toBeNull()
    expect(search.results.value.map((result) => result.id)).toEqual([
      'recovered',
    ])
    scope.stop()
  })

  test('aborts and ignores a stale response when a newer query wins', async () => {
    const first = createDeferred<DocsSearchResult[]>()
    const second = createDeferred<DocsSearchResult[]>()
    const signals: AbortSignal[] = []
    const client: DocsSearchClient = {
      search: vi.fn(({ query, signal }) => {
        signals.push(signal)
        return query === 'first' ? first.promise : second.promise
      }),
    }
    const { scope, search } = mountSearch({ client, limit: 3 })

    search.updateQuery('first')
    await nextTick()
    search.updateQuery('second')
    await nextTick()

    expect(signals[0]?.aborted).toBe(true)
    expect(client.search).toHaveBeenLastCalledWith({
      query: 'second',
      limit: 3,
      signal: signals[1],
    })

    second.resolve([createResult('second')])
    await flushSearch()
    first.resolve([createResult('first')])
    await flushSearch()

    expect(search.status.value).toBe('results')
    expect(search.results.value.map((result) => result.id)).toEqual(['second'])
    scope.stop()
  })

  test('clearing a query prevents an in-flight response from repopulating results', async () => {
    const pending = createDeferred<DocsSearchResult[]>()
    let signal: AbortSignal | undefined
    const client: DocsSearchClient = {
      search: vi.fn((request) => {
        signal = request.signal
        return pending.promise
      }),
    }
    const { scope, search } = mountSearch({ client })

    search.updateQuery('pending')
    await nextTick()
    search.updateQuery('')
    await nextTick()
    pending.resolve([createResult('stale')])
    await flushSearch()

    expect(signal?.aborted).toBe(true)
    expect(search.status.value).toBe('idle')
    expect(search.results.value).toEqual([])
    scope.stop()
  })

  test('debounces in the composable and cancels work when its scope stops', async () => {
    vi.useFakeTimers()
    const client: DocsSearchClient = { search: vi.fn(() => []) }
    const { scope, search } = mountSearch({ client, delayMs: 20 })

    search.updateQuery('first')
    await nextTick()
    search.updateQuery('second')
    await nextTick()
    expect(search.status.value).toBe('loading')
    expect(client.search).not.toHaveBeenCalled()

    scope.stop()
    await vi.runAllTimersAsync()
    expect(client.search).not.toHaveBeenCalled()
    vi.useRealTimers()
  })

  test('aborts active work and ignores completion after its scope stops', async () => {
    const pending = createDeferred<DocsSearchResult[]>()
    let signal: AbortSignal | undefined
    const client: DocsSearchClient = {
      search: vi.fn((request) => {
        signal = request.signal
        return pending.promise
      }),
    }
    const { scope, search } = mountSearch({ client })

    search.updateQuery('pending')
    await nextTick()
    scope.stop()
    pending.resolve([createResult('late')])
    await flushSearch()

    expect(signal?.aborted).toBe(true)
    expect(search.results.value).toEqual([])
  })
})
