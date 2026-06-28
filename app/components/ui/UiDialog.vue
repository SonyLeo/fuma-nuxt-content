<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  provide,
  shallowRef,
  useId,
  watch,
} from 'vue'
import { uiDialogKey } from '~/utils/ui-dialog'

const props = withDefaults(
  defineProps<{
    open?: boolean
    defaultOpen?: boolean
    contentId?: string
    titleId?: string
    closeOnEscape?: boolean
    trapFocus?: boolean
  }>(),
  {
    open: undefined,
    defaultOpen: false,
    contentId: undefined,
    titleId: undefined,
    closeOnEscape: true,
    trapFocus: true,
  },
)

const emit = defineEmits<{
  'update:open': [open: boolean]
}>()

const fallbackId = useId()
const internalOpen = shallowRef(props.defaultOpen)
const contentRef = shallowRef<HTMLElement | null>(null)
const previouslyFocused = shallowRef<HTMLElement | null>(null)

const isControlled = computed(() => props.open !== undefined)
const openState = computed(() =>
  isControlled.value ? props.open === true : internalOpen.value,
)
const contentId = computed(() => props.contentId ?? `ui-dialog-${fallbackId}`)
const titleId = computed(() => props.titleId ?? `${contentId.value}-title`)

function setOpen(nextOpen: boolean) {
  if (!isControlled.value) {
    internalOpen.value = nextOpen
  }

  emit('update:open', nextOpen)
}

function close() {
  setOpen(false)
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

function onWindowKeydown(event: KeyboardEvent) {
  if (!openState.value) {
    return
  }

  if (event.key === 'Escape' && props.closeOnEscape) {
    event.preventDefault()
    close()
    return
  }

  if (event.key !== 'Tab' || !props.trapFocus) {
    return
  }

  const content = contentRef.value
  if (!content) {
    return
  }

  const focusable = getFocusableElements(content)
  if (focusable.length === 0) {
    event.preventDefault()
    content.focus()
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

onMounted(() => {
  window.addEventListener('keydown', onWindowKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onWindowKeydown)
})

watch(openState, async (isOpen) => {
  if (isOpen) {
    previouslyFocused.value =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null

    await nextTick()
    const content = contentRef.value
    const firstFocusable = content ? getFocusableElements(content)[0] : null
    firstFocusable?.focus()
    if (!firstFocusable) {
      content?.focus()
    }
    return
  }

  await nextTick()
  previouslyFocused.value?.focus()
})

provide(uiDialogKey, {
  open: openState,
  contentId,
  titleId,
  contentRef,
  setOpen,
  close,
})
</script>

<template>
  <slot :open="openState" :close="close" />
</template>
