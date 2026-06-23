type TocItem = {
  id: string
  text: string
  depth: number
}

type RawTocItem = TocItem & {
  children?: RawTocItem[]
}

function flattenItems(items: RawTocItem[] | undefined, depth = 2): TocItem[] {
  if (!Array.isArray(items)) {
    return []
  }

  return items.flatMap((item) => {
    const current = item.id && item.text
      ? [{ id: item.id, text: item.text, depth }]
      : []
    const children = flattenItems(item.children, depth + 1)
    return [...current, ...children]
  })
}

export function useDocsToc(page: Ref<any>) {
  const items = computed<TocItem[]>(() => {
    return flattenItems(page.value?.body?.toc?.links).filter(item => item.depth <= 3)
  })

  return {
    items,
  }
}
