import type { ContentNavigationItem } from '@nuxt/content'

function flattenItems(items: ContentNavigationItem[]): ContentNavigationItem[] {
  return items.flatMap((item) => {
    const children = Array.isArray(item.children) ? flattenItems(item.children) : []
    return item.path ? [item, ...children] : children
  })
}

export function useDocsPage(page: Ref<any>, siblings: Ref<ContentNavigationItem[]>, currentPath: Ref<string>) {
  const title = computed(() => {
    return page.value?.title ?? 'Untitled'
  })

  const description = computed(() => {
    return page.value?.description ?? ''
  })

  const siblingItems = computed(() => {
    return flattenItems(siblings.value ?? [])
  })

  const currentIndex = computed(() => {
    return siblingItems.value.findIndex(item => item.path === currentPath.value)
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
    previous,
    next,
  }
}
