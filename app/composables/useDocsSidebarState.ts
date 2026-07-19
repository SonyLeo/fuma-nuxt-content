import type { InjectionKey, Ref } from 'vue'

type DocsSidebarStateOptions = {
  currentPath?: Ref<string | undefined>
}

type DocsSidebarStateContext = ReturnType<typeof createDocsSidebarState>

const docsSidebarStateKey: InjectionKey<DocsSidebarStateContext> =
  Symbol('docs-sidebar-state')

function createDocsSidebarState(options: DocsSidebarStateOptions = {}) {
  const collapsed = shallowRef(false)
  const pointerPreviewOpen = shallowRef(false)
  const focusPreviewOpen = shallowRef(false)
  const mobileOpen = shallowRef(false)
  const tabsOpen = shallowRef(false)
  const closeOnNavigate = shallowRef(true)
  const hoverCloseTimer = shallowRef<ReturnType<typeof setTimeout> | null>(null)
  const previewOpen = computed(
    () => pointerPreviewOpen.value || focusPreviewOpen.value,
  )

  function clearHoverCloseTimer() {
    if (!hoverCloseTimer.value) {
      return
    }

    clearTimeout(hoverCloseTimer.value)
    hoverCloseTimer.value = null
  }

  function closeTabs() {
    tabsOpen.value = false
  }

  function closePreview() {
    clearHoverCloseTimer()
    pointerPreviewOpen.value = false
    focusPreviewOpen.value = false
  }

  function setTabsOpen(value: boolean) {
    tabsOpen.value = value
  }

  function toggleTabs() {
    tabsOpen.value = !tabsOpen.value
  }

  function setCollapsed(value: boolean) {
    collapsed.value = value
    closeTabs()
    closePreview()
  }

  function toggleCollapsed() {
    setCollapsed(!collapsed.value)
  }

  function openHoverPreview(event?: PointerEvent) {
    if (!collapsed.value || event?.pointerType === 'touch') {
      return
    }

    clearHoverCloseTimer()
    pointerPreviewOpen.value = true
  }

  function closeHoverPreview(event?: PointerEvent) {
    if (!collapsed.value || event?.pointerType === 'touch') {
      return
    }

    clearHoverCloseTimer()
    hoverCloseTimer.value = setTimeout(() => {
      pointerPreviewOpen.value = false
      hoverCloseTimer.value = null
    }, resolveHoverCloseDelay(event))
  }

  function resolveHoverCloseDelay(event?: PointerEvent) {
    if (!event) {
      return 500
    }

    const currentTarget = event.currentTarget as HTMLElement | null
    const viewportWidth =
      currentTarget?.ownerDocument?.documentElement.clientWidth ??
      event.view?.innerWidth ??
      0

    return Math.min(event.clientX, viewportWidth - event.clientX) > 100
      ? 0
      : 500
  }

  function openFocusPreview() {
    if (!collapsed.value) {
      return
    }

    focusPreviewOpen.value = true
  }

  function closeFocusPreview() {
    focusPreviewOpen.value = false
  }

  function setMobileOpen(value: boolean) {
    mobileOpen.value = value
  }

  function openMobile() {
    setMobileOpen(true)
  }

  function closeMobile() {
    setMobileOpen(false)
  }

  function toggleMobile() {
    setMobileOpen(!mobileOpen.value)
  }

  function keepOpenOnNextNavigate() {
    closeOnNavigate.value = false
  }

  if (options.currentPath) {
    watch(options.currentPath, () => {
      closeTabs()
      closePreview()

      if (closeOnNavigate.value) {
        closeMobile()
      }

      closeOnNavigate.value = true
    })
  }

  onBeforeUnmount(() => {
    closePreview()
  })

  return {
    closeHoverPreview,
    closeFocusPreview,
    closeMobile,
    closePreview,
    closeTabs,
    collapsed,
    focusPreviewOpen,
    hovered: pointerPreviewOpen,
    keepOpenOnNextNavigate,
    mobileOpen,
    openFocusPreview,
    openHoverPreview,
    openMobile,
    pointerPreviewOpen,
    previewOpen,
    setCollapsed,
    setMobileOpen,
    setTabsOpen,
    tabsOpen,
    toggleCollapsed,
    toggleMobile,
    toggleTabs,
  }
}

export function provideDocsSidebarState(options: DocsSidebarStateOptions = {}) {
  const state = createDocsSidebarState(options)

  provide(docsSidebarStateKey, state)

  return state
}

export function useDocsSidebarState() {
  return inject(docsSidebarStateKey, null) ?? createDocsSidebarState()
}
