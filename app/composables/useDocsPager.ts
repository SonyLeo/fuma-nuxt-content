import type { DocsNode } from '~/types/docs'
import type { DocsPageTreeRuntime } from '~/utils/docs-page-tree-runtime'
import {
  flattenDocsNodes,
  normalizeDocsRoutePath,
} from '~/utils/docs-navigation'
import { isDocsPageTreeRuntime } from '~/utils/docs-page-tree-runtime'

export function useDocsPager(
  tree: Ref<DocsNode[] | DocsPageTreeRuntime>,
  currentPath: Ref<string>,
) {
  const pages = computed(() =>
    isDocsPageTreeRuntime(tree.value)
      ? tree.value.visibleFlat.filter((item) => item.path)
      : flattenDocsNodes(tree.value).filter((item) => item.path),
  )
  const normalizedCurrentPath = computed(() =>
    normalizeDocsRoutePath(currentPath.value),
  )
  const runtimePager = computed(() => {
    return isDocsPageTreeRuntime(tree.value)
      ? tree.value.getPager(currentPath.value)
      : null
  })

  const currentIndex = computed(() => {
    return pages.value.findIndex((item) => {
      return normalizeDocsRoutePath(item.path) === normalizedCurrentPath.value
    })
  })

  const previous = computed(() => {
    if (runtimePager.value) {
      return runtimePager.value.previous
    }

    if (currentIndex.value <= 0) {
      return null
    }

    return pages.value[currentIndex.value - 1] ?? null
  })

  const next = computed(() => {
    if (runtimePager.value) {
      return runtimePager.value.next
    }

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
