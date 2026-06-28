import { shallowRef, useTemplateRef, watch } from 'vue'

type UseDocsOverlayOptions = {
  id: string
  triggerId?: string
  returnFocusId?: string
  lockScroll?: boolean
}

function lockBodyScroll() {
  const previousOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'

  return () => {
    document.body.style.overflow = previousOverflow
  }
}

function getFocusableElements(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      [
        'a[href]',
        'button:not([disabled])',
        'textarea:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
      ].join(','),
    ),
  ).filter((element) => !element.hasAttribute('disabled'))
}

export function useDocsOverlay(options: UseDocsOverlayOptions) {
  const open = shallowRef(false)
  const panelRef = useTemplateRef<HTMLElement>(options.id)
  let unlockScroll: (() => void) | null = null

  function close() {
    open.value = false
  }

  function openPanel() {
    open.value = true
  }

  function toggle() {
    open.value = !open.value
  }

  function restoreFocus() {
    if (!options.returnFocusId) {
      return
    }

    const target = document.getElementById(options.returnFocusId)
    target?.focus()
  }

  function onWindowKeydown(event: KeyboardEvent) {
    if (!open.value) {
      return
    }

    if (event.key === 'Escape') {
      close()
      return
    }

    if (event.key !== 'Tab') {
      return
    }

    const panel = panelRef.value
    if (!panel) {
      return
    }

    const focusable = getFocusableElements(panel)
    if (focusable.length === 0) {
      event.preventDefault()
      panel.focus()
      return
    }

    const first = focusable[0]
    const last = focusable.at(-1)

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last?.focus()
      return
    }

    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first?.focus()
    }
  }

  function onWindowPointerDown(event: MouseEvent | PointerEvent) {
    if (!open.value) {
      return
    }

    const panel = panelRef.value
    const target = event.target
    const trigger = options.triggerId
      ? document.getElementById(options.triggerId)
      : null

    if (!panel || !(target instanceof Node)) {
      return
    }

    if (trigger?.contains(target)) {
      return
    }

    if (!panel.contains(target)) {
      close()
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', onWindowKeydown)
    window.addEventListener('pointerdown', onWindowPointerDown)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', onWindowKeydown)
    window.removeEventListener('pointerdown', onWindowPointerDown)

    if (unlockScroll) {
      unlockScroll()
      unlockScroll = null
    }
  })

  watch(open, async (isOpen) => {
    if (isOpen) {
      if (options.lockScroll) {
        unlockScroll = lockBodyScroll()
      }

      await nextTick()

      const panel = panelRef.value
      const firstFocusable = panel ? getFocusableElements(panel)[0] : null
      firstFocusable?.focus()
      if (!firstFocusable) {
        panel?.focus()
      }
      return
    }

    if (unlockScroll) {
      unlockScroll()
      unlockScroll = null
    }

    await nextTick()
    restoreFocus()
  })

  return {
    open,
    panelRef,
    close,
    openPanel,
    toggle,
  }
}
