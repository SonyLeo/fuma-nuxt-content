import type { ContentNavigationItem } from '@nuxt/content'

function flattenNavigation(items: ContentNavigationItem[]): ContentNavigationItem[] {
  return items.flatMap((item) => {
    const children = Array.isArray(item.children) ? flattenNavigation(item.children) : []
    return [item, ...children]
  })
}

function containsPath(item: ContentNavigationItem, path: string): boolean {
  if (item.path === path) {
    return true
  }

  if (!Array.isArray(item.children)) {
    return false
  }

  return item.children.some(child => containsPath(child, path))
}

function findAncestors(items: ContentNavigationItem[], path: string, trail: ContentNavigationItem[] = []): ContentNavigationItem[] {
  for (const item of items) {
    const nextTrail = item.path ? [...trail, item] : trail

    if (item.path === path) {
      return nextTrail
    }

    if (Array.isArray(item.children) && item.children.length > 0) {
      const result = findAncestors(item.children, path, nextTrail)
      if (result.length > 0) {
        return result
      }
    }
  }

  return []
}

function findSectionHeadline(items: ContentNavigationItem[], path: string): string | null {
  for (const item of items) {
    if (item.path === path) {
      return item.title
    }

    if (Array.isArray(item.children) && item.children.length > 0) {
      const foundInChildren = flattenNavigation(item.children).some(child => child.path === path)
      if (foundInChildren) {
        return item.title
      }
    }
  }

  return null
}

export function useDocsNavigation(navigation: Ref<ContentNavigationItem[] | null>, path: Ref<string>) {
  const items = computed(() => navigation.value ?? [])

  const flattened = computed(() => flattenNavigation(items.value))

  const current = computed(() => {
    return flattened.value.find(item => item.path === path.value) ?? null
  })

  const headline = computed(() => {
    return findSectionHeadline(items.value, path.value) ?? current.value?.title ?? 'Docs'
  })

  const sidebarItems = computed(() => {
    const section = items.value.find(item => Array.isArray(item.children) && item.children.length > 0 && containsPath(item, path.value))

    if (section?.children?.length) {
      return section.children
    }

    return items.value.filter(item => item.path !== '/')
  })

  const breadcrumbs = computed(() => {
    return findAncestors(items.value, path.value)
  })

  const siblings = computed(() => {
    const parentTrail = findAncestors(items.value, path.value)
    const parent = parentTrail.at(-2)

    if (!parent || !Array.isArray(parent.children)) {
      return items.value
    }

    return parent.children
  })

  return {
    items,
    current,
    headline,
    sidebarItems,
    breadcrumbs,
    siblings,
  }
}
