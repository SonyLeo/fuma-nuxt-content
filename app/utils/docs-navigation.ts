import type { ContentNavigationItem } from '@nuxt/content'
import type { DocsNode } from '~/types/docs'

export const docsNavigationFields = [
  'description',
  'sectionLabel',
  'order',
  'hidden',
  'badge',
] as const

function readString(item: ContentNavigationItem, key: string) {
  const value = item[key]
  return typeof value === 'string' ? value : undefined
}

function readNumber(item: ContentNavigationItem, key: string) {
  const value = item[key]
  return typeof value === 'number' ? value : undefined
}

function readBoolean(item: ContentNavigationItem, key: string) {
  const value = item[key]
  return typeof value === 'boolean' ? value : undefined
}

function compareOrder(left?: number, right?: number) {
  if (left === undefined && right === undefined) {
    return 0
  }

  if (left === undefined) {
    return 1
  }

  if (right === undefined) {
    return -1
  }

  return left - right
}

export function normalizeDocsNavigation(
  items: ContentNavigationItem[] | null | undefined,
): DocsNode[] {
  return (items ?? [])
    .map((item, index) => {
      const node: DocsNode = {
        title: item.title || 'Untitled',
        path: item.path || undefined,
        stem: item.stem,
        description: readString(item, 'description'),
        sectionLabel: readString(item, 'sectionLabel'),
        order: readNumber(item, 'order'),
        hidden: readBoolean(item, 'hidden'),
        badge: readString(item, 'badge'),
        children: normalizeDocsNavigation(item.children),
      }

      return { index, node }
    })
    .filter(({ node }) => !node.hidden)
    .sort((left, right) => {
      return (
        compareOrder(left.node.order, right.node.order) ||
        left.index - right.index
      )
    })
    .map(({ node }) => node)
}

export function flattenDocsNodes(items: DocsNode[]): DocsNode[] {
  return items.flatMap((item) => {
    return item.path
      ? [item, ...flattenDocsNodes(item.children)]
      : flattenDocsNodes(item.children)
  })
}
