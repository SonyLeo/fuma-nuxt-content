import type { DocsTocItem } from '~/types/docs'

type UseDocsTocStateOptions = {
  headingSelector?: string
  rootMargin?: string
}

export function useDocsTocState(
  items: Ref<DocsTocItem[]>,
  options: UseDocsTocStateOptions = {},
) {
  const activeId = shallowRef<string>()
  const visibleIds = shallowRef<string[]>([])
  let observer: IntersectionObserver | null = null

  const activeIndex = computed(() => {
    if (!activeId.value) {
      return -1
    }

    return items.value.findIndex((item) => item.id === activeId.value)
  })

  const activeItem = computed(() => {
    if (activeIndex.value < 0) {
      return items.value[0]
    }

    return items.value[activeIndex.value]
  })

  const progress = computed(() => {
    if (items.value.length === 0) {
      return 0
    }

    const index = activeIndex.value < 0 ? 0 : activeIndex.value + 1
    return index / items.value.length
  })

  function syncActiveId(entries: IntersectionObserverEntry[]) {
    const currentVisible = new Set(visibleIds.value)

    for (const entry of entries) {
      const targetId = (entry.target as HTMLElement).id
      if (!targetId) {
        continue
      }

      if (entry.isIntersecting) {
        currentVisible.add(targetId)
      } else {
        currentVisible.delete(targetId)
      }
    }

    visibleIds.value = items.value
      .map((item) => item.id)
      .filter((id) => currentVisible.has(id))

    if (visibleIds.value.length > 0) {
      activeId.value = visibleIds.value[0]
      return
    }

    const scrollPosition = window.scrollY + 128
    const lastReached = items.value.findLast((item) => {
      const element = document.getElementById(item.id)
      return element ? element.offsetTop <= scrollPosition : false
    })

    activeId.value = lastReached?.id ?? items.value[0]?.id
  }

  function disconnect() {
    observer?.disconnect()
    observer = null
  }

  function observeHeadings() {
    disconnect()

    if (items.value.length === 0) {
      activeId.value = undefined
      visibleIds.value = []
      return
    }

    const headings = items.value
      .map(
        (item) =>
          document.getElementById(item.id) ??
          document.querySelector<HTMLElement>(
            `${options.headingSelector ?? '.docs-page-body'} #${CSS.escape(item.id)}`,
          ),
      )
      .filter((heading): heading is HTMLElement => Boolean(heading))

    if (headings.length === 0) {
      activeId.value = items.value[0]?.id
      visibleIds.value = []
      return
    }

    observer = new IntersectionObserver(syncActiveId, {
      rootMargin: options.rootMargin ?? '-96px 0px -60% 0px',
      threshold: [0, 0.1, 0.25, 0.5, 1],
    })

    for (const heading of headings) {
      observer.observe(heading)
    }

    activeId.value = items.value[0]?.id
  }

  onMounted(() => {
    observeHeadings()
  })

  onBeforeUnmount(() => {
    disconnect()
  })

  watch(items, async () => {
    await nextTick()
    observeHeadings()
  })

  return {
    activeId: readonly(activeId),
    activeItem,
    progress,
  }
}
