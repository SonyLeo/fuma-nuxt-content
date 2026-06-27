import type { DocsNode } from '~/types/docs'
import { flattenDocsNodes } from '~/utils/docs-navigation'

type DocsPageLike = {
  title?: string
  description?: string
  sectionLabel?: string
}

export function useDocsPage(
  page: Ref<DocsPageLike | null | undefined>,
  siblings: Ref<DocsNode[]>,
  currentPath: Ref<string>,
) {
  const title = computed(() => {
    return page.value?.title ?? 'Untitled'
  })

  const description = computed(() => {
    return page.value?.description ?? ''
  })

  const sectionLabel = computed(() => {
    return page.value?.sectionLabel ?? 'Guide'
  })

  const siblingItems = computed(() => {
    return flattenDocsNodes(siblings.value ?? [])
  })

  const currentIndex = computed(() => {
    return siblingItems.value.findIndex(
      (item) => item.path === currentPath.value,
    )
  })

  const previous = computed(() => {
    if (currentIndex.value <= 0) {
      return null
    }

    return siblingItems.value[currentIndex.value - 1] ?? null
  })

  const next = computed(() => {
    if (currentIndex.value < 0) {
      return null
    }

    return siblingItems.value[currentIndex.value + 1] ?? null
  })

  return {
    title,
    description,
    sectionLabel,
    previous,
    next,
  }
}
