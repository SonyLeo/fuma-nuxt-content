import type {
  DocsContentPage,
  DocsTocItem,
  DocsTocTreeItem,
} from '~/types/docs'

function flattenItems(
  items: DocsTocTreeItem[] | undefined,
  depth = 2,
): DocsTocItem[] {
  if (!Array.isArray(items)) {
    return []
  }

  return items.flatMap((item) => {
    const current =
      item.id && item.text ? [{ id: item.id, text: item.text, depth }] : []
    const children = flattenItems(item.children, depth + 1)
    return [...current, ...children]
  })
}

export function useDocsToc(page: Ref<DocsContentPage | null | undefined>) {
  const items = computed<DocsTocItem[]>(() => {
    return flattenItems(page.value?.body?.toc?.links).filter(
      (item) => item.depth <= 3,
    )
  })

  return {
    items,
  }
}
