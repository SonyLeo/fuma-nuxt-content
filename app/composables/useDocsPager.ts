import type { DocsNode } from '~/types/docs'
import {
  flattenDocsNodes,
  normalizeDocsRoutePath,
} from '~/utils/docs-navigation'

export function useDocsPager(items: Ref<DocsNode[]>, currentPath: Ref<string>) {
  const pages = computed(() =>
    flattenDocsNodes(items.value).filter((item) => item.path),
  )
  const normalizedCurrentPath = computed(() =>
    normalizeDocsRoutePath(currentPath.value),
  )

  const currentIndex = computed(() => {
    return pages.value.findIndex((item) => {
      return normalizeDocsRoutePath(item.path) === normalizedCurrentPath.value
    })
  })

  const previous = computed(() => {
    if (currentIndex.value <= 0) {
      return null
    }

    return pages.value[currentIndex.value - 1] ?? null
  })

  const next = computed(() => {
    if (currentIndex.value < 0) {
      return null
    }

    return pages.value[currentIndex.value + 1] ?? null
  })

  return {
    previous,
    next,
  }
}
