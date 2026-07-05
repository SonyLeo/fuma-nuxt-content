import type { DocsTocItem, DocsTocItemState } from '~/types/docs'

type UseDocsTocStateOptions = {
  headingSelector?: string
  rootMargin?: string
  single?: boolean
}

export function useDocsTocState(
  items: Ref<DocsTocItem[]>,
  options: UseDocsTocStateOptions = {},
) {
  const itemStates = shallowRef<DocsTocItemState[]>([])
  let observer: IntersectionObserver | null = null
  let fallbackRafId = 0

  const activeStates = computed(() =>
    itemStates.value.filter((state) => state.active),
  )

  const activeIds = computed(() => activeStates.value.map((state) => state.id))

  const activeItems = computed(() =>
    activeStates.value.map((state) => state.item),
  )

  const activeState = computed(() => {
    let current: DocsTocItemState | undefined

    for (const state of activeStates.value) {
      if (!current || current.updatedAt < state.updatedAt) {
        current = state
      }
    }

    return current
  })

  const activeId = computed(() => activeState.value?.id ?? items.value[0]?.id)

  const activeItem = computed(
    () => activeState.value?.item ?? items.value[0],
  )

  const progress = computed(() => {
    if (items.value.length === 0) {
      return 0
    }

    const index = activeId.value
      ? items.value.findIndex((item) => item.id === activeId.value)
      : -1
    return (index < 0 ? 1 : index + 1) / items.value.length
  })

  function getHeadingElement(id: string) {
    return (
      document.getElementById(id) ??
      document.querySelector<HTMLElement>(
        `${options.headingSelector ?? '.docs-page-body'} #${CSS.escape(id)}`,
      )
    )
  }

  function isScrolledToBottom() {
    const scrollHeight = Math.max(
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
    )

    return Math.abs(window.scrollY + window.innerHeight - scrollHeight) < 2
  }

  function getFallbackId(viewTop = 0) {
    const positioned = itemStates.value
      .map((state) => {
        const element = getHeadingElement(state.id)

        return {
          id: state.id,
          top: element?.getBoundingClientRect().top ?? Number.NaN,
        }
      })
      .filter((state) => !Number.isNaN(state.top))

    if (positioned.length === 0) {
      return itemStates.value[0]?.id
    }

    if (isScrolledToBottom()) {
      return positioned[positioned.length - 1]?.id
    }

    let fallback = positioned[0]
    let minDistance = Number.MAX_VALUE

    for (const state of positioned) {
      const distance = Math.abs(viewTop - state.top)

      if (distance < minDistance) {
        fallback = state
        minDistance = distance
      }
    }

    return fallback?.id
  }

  function withFallbackState(
    states: DocsTocItemState[],
    fallbackId = getFallbackId(),
  ) {
    const updatedAt = Date.now()

    return states.map((state) => {
      const active = state.id === fallbackId
      const fallback = active

      if (state.active === active && state.fallback === fallback) {
        return state
      }

      return {
        ...state,
        active,
        fallback,
        updatedAt,
      }
    })
  }

  function syncFallbackState(viewTop = 0) {
    if (itemStates.value.length === 0) {
      return
    }

    if (isScrolledToBottom()) {
      itemStates.value = withFallbackState(itemStates.value)
      return
    }

    if (itemStates.value.some((state) => state.active && !state.fallback)) {
      return
    }

    itemStates.value = withFallbackState(itemStates.value, getFallbackId(viewTop))
  }

  function queueFallbackSync() {
    window.cancelAnimationFrame(fallbackRafId)
    fallbackRafId = window.requestAnimationFrame(() => syncFallbackState())
  }

  function updateFromEntries(entries: IntersectionObserverEntry[]) {
    if (entries.length === 0) {
      return
    }

    const updatedAt = Date.now()
    let hasActive = false
    const updated = itemStates.value.map((state) => {
      const entry = entries.find((entry) => entry.target.id === state.id)
      let active = entry
        ? entry.isIntersecting
        : state.active && !state.fallback

      if (options.single && hasActive) {
        active = false
      }

      const fallback = false
      const changed = state.active !== active || state.fallback !== fallback

      if (active) {
        hasActive = true
      }

      if (!changed) {
        return state
      }

      return {
        ...state,
        active,
        fallback,
        updatedAt,
      }
    })

    if (!hasActive) {
      itemStates.value = withFallbackState(
        updated,
        getFallbackId(entries[0]?.rootBounds?.top ?? 0),
      )
      return
    }

    if (isScrolledToBottom()) {
      itemStates.value = withFallbackState(updated)
      return
    }

    itemStates.value = updated
  }

  function disconnect() {
    observer?.disconnect()
    observer = null
  }

  function resetItemStates() {
    itemStates.value = items.value.map((item) => ({
      id: item.id,
      item,
      active: false,
      fallback: false,
      updatedAt: 0,
    }))
  }

  function observeHeadings() {
    disconnect()
    resetItemStates()

    if (itemStates.value.length === 0) {
      return
    }

    const headings = itemStates.value
      .map((state) => getHeadingElement(state.id))
      .filter((heading): heading is HTMLElement => Boolean(heading))

    if (headings.length === 0) {
      itemStates.value = withFallbackState(itemStates.value)
      return
    }

    observer = new IntersectionObserver(updateFromEntries, {
      rootMargin: options.rootMargin,
      threshold: 0.9,
    })

    for (const heading of headings) {
      observer.observe(heading)
    }

    queueFallbackSync()
  }

  onMounted(() => {
    observeHeadings()
    window.addEventListener('scroll', queueFallbackSync, { passive: true })
    window.addEventListener('resize', queueFallbackSync)
  })

  onBeforeUnmount(() => {
    window.cancelAnimationFrame(fallbackRafId)
    window.removeEventListener('scroll', queueFallbackSync)
    window.removeEventListener('resize', queueFallbackSync)
    disconnect()
  })

  watch(items, async () => {
    await nextTick()
    observeHeadings()
  })

  return {
    activeId,
    activeIds,
    activeItem,
    activeItems,
    itemStates: readonly(itemStates),
    progress,
  }
}
