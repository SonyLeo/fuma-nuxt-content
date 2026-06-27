import type { ContentNavigationItem } from '@nuxt/content'
import type { DocsNode } from '~/types/docs'
import {
  flattenDocsNodes,
  normalizeDocsNavigation,
} from '~/utils/docs-navigation'

function containsPath(item: DocsNode, path: string): boolean {
  if (item.path === path) {
    return true
  }

  return item.children.some((child) => containsPath(child, path))
}

function findAncestors(
  items: DocsNode[],
  path: string,
  trail: DocsNode[] = [],
): DocsNode[] {
  for (const item of items) {
    const nextTrail = item.path ? [...trail, item] : trail

    if (item.path === path) {
      return nextTrail
    }

    if (item.children.length > 0) {
      const result = findAncestors(item.children, path, nextTrail)
      if (result.length > 0) {
        return result
      }
    }
  }

  return []
}

function findSectionHeadline(items: DocsNode[], path: string): string | null {
  for (const item of items) {
    if (item.path === path) {
      return item.title
    }

    if (item.children.length > 0) {
      const foundInChildren = flattenDocsNodes(item.children).some(
        (child) => child.path === path,
      )
      if (foundInChildren) {
        return item.sectionLabel ?? item.title
      }
    }
  }

  return null
}

export function useDocsNavigation(
  navigation: Ref<ContentNavigationItem[] | null>,
  path: Ref<string>,
) {
  const items = computed(() => normalizeDocsNavigation(navigation.value))

  const flattened = computed(() => flattenDocsNodes(items.value))

  const current = computed(() => {
    return flattened.value.find((item) => item.path === path.value) ?? null
  })

  const headline = computed(() => {
    return (
      findSectionHeadline(items.value, path.value) ??
      current.value?.title ??
      'Docs'
    )
  })

  const sidebarItems = computed(() => {
    const section = items.value.find(
      (item) => item.children.length > 0 && containsPath(item, path.value),
    )

    if (section && section.children.length > 0) {
      return section.children
    }

    return items.value.filter((item) => item.path !== '/')
  })

  const breadcrumbs = computed(() => {
    return findAncestors(items.value, path.value)
  })

  const siblings = computed(() => {
    const parentTrail = findAncestors(items.value, path.value)
    const parent = parentTrail.at(-2)

    if (!parent) {
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
