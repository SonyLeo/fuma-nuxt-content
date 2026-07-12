import type { InjectionKey, Ref } from 'vue'

type DocsSidebarStateOptions = {
  currentPath?: Ref<string | undefined>
}

type DocsSidebarStateContext = ReturnType<typeof createDocsSidebarState>

const docsSidebarStateKey: InjectionKey<DocsSidebarStateContext> = Symbol(
  'docs-sidebar-state',
)

function createDocsSidebarState(options: DocsSidebarStateOptions = {}) {
  const collapsed = shallowRef(false)
  const hovered = shallowRef(false)
  const mobileOpen = shallowRef(false)
  const tabsOpen = shallowRef(false)
  const closeOnNavigate = shallowRef(true)
  const hoverCloseTimer = shallowRef<ReturnType<typeof setTimeout> | null>(null)

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

  function setTabsOpen(value: boolean) {
    tabsOpen.value = value
  }

  function toggleTabs() {
    tabsOpen.value = !tabsOpen.value
  }

  function setCollapsed(value: boolean) {
    collapsed.value = value
    closeTabs()

    if (!value) {
      hovered.value = false
      return
    }

    if (import.meta.client && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
  }

  function toggleCollapsed() {
    setCollapsed(!collapsed.value)
  }

  function openHoverPreview(event?: PointerEvent) {
    if (!collapsed.value || event?.pointerType === 'touch') {
      return
    }

    clearHoverCloseTimer()
    hovered.value = true
  }

  function closeHoverPreview(event?: PointerEvent) {
    if (!collapsed.value || event?.pointerType === 'touch') {
      return
    }

    clearHoverCloseTimer()
    hoverCloseTimer.value = setTimeout(() => {
      hovered.value = false
    }, event && Math.min(event.clientX, document.body.clientWidth - event.clientX) > 100
      ? 0
      : 500)
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

      if (closeOnNavigate.value) {
        closeMobile()
      }

      closeOnNavigate.value = true
    })
  }

  onBeforeUnmount(() => {
    clearHoverCloseTimer()
  })

  return {
    closeHoverPreview,
    closeMobile,
    closeTabs,
    collapsed,
    hovered,
    keepOpenOnNextNavigate,
    mobileOpen,
    openHoverPreview,
    openMobile,
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
