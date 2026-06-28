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
  let observer: IntersectionObserver | null = null
  let activeRafId = 0

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

  function getAbsoluteTop(element: HTMLElement) {
    let current: HTMLElement | null = element
    let offsetTop = 0

    while (current && current !== document.body) {
      offsetTop += current.offsetTop
      current = current.offsetParent as HTMLElement | null
    }

    return current ? offsetTop : Number.NaN
  }

  function getHeadingElement(id: string) {
    return (
      document.getElementById(id) ??
      document.querySelector<HTMLElement>(
        `${options.headingSelector ?? '.docs-page-body'} #${CSS.escape(id)}`,
      )
    )
  }

  function updateActiveId() {
    if (items.value.length === 0) {
      activeId.value = undefined
      return
    }

    const positionedHeadings = items.value
      .map((item) => {
        const element = getHeadingElement(item.id)

        return {
          id: item.id,
          top: element ? getAbsoluteTop(element) : Number.NaN,
        }
      })
      .filter((item) => !Number.isNaN(item.top))
      .sort((a, b) => a.top - b.top)

    if (positionedHeadings.length === 0) {
      activeId.value = items.value[0]?.id
      return
    }

    const scrollY = window.scrollY
    const scrollHeight = Math.max(
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
    )
    const isBottom = Math.abs(scrollY + window.innerHeight - scrollHeight) < 2

    if (isBottom) {
      activeId.value = positionedHeadings[positionedHeadings.length - 1]?.id
      return
    }

    const scrollPosition = scrollY + 128
    let current = positionedHeadings[0]?.id

    for (const heading of positionedHeadings) {
      if (heading.top > scrollPosition) {
        break
      }

      current = heading.id
    }

    activeId.value = current ?? items.value[0]?.id
  }

  function queueActiveUpdate() {
    window.cancelAnimationFrame(activeRafId)
    activeRafId = window.requestAnimationFrame(updateActiveId)
  }

  function syncActiveId() {
    queueActiveUpdate()
  }

  function disconnect() {
    observer?.disconnect()
    observer = null
  }

  function observeHeadings() {
    disconnect()

    if (items.value.length === 0) {
      activeId.value = undefined
      return
    }

    const headings = items.value
      .map((item) => getHeadingElement(item.id))
      .filter((heading): heading is HTMLElement => Boolean(heading))

    if (headings.length === 0) {
      activeId.value = items.value[0]?.id
      return
    }

    observer = new IntersectionObserver(syncActiveId, {
      rootMargin: options.rootMargin ?? '-96px 0px -60% 0px',
      threshold: [0, 0.1, 0.25, 0.5, 1],
    })

    for (const heading of headings) {
      observer.observe(heading)
    }

    queueActiveUpdate()
  }

  onMounted(() => {
    observeHeadings()
    window.addEventListener('scroll', queueActiveUpdate, { passive: true })
    window.addEventListener('resize', queueActiveUpdate)
  })

  onBeforeUnmount(() => {
    window.cancelAnimationFrame(activeRafId)
    window.removeEventListener('scroll', queueActiveUpdate)
    window.removeEventListener('resize', queueActiveUpdate)
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
