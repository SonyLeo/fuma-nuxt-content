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
import {
  type UiPopoverAlign,
  uiPopoverKey,
} from '~/utils/ui-popover'

const props = withDefaults(
  defineProps<{
    open?: boolean
    defaultOpen?: boolean
    contentId?: string
    align?: UiPopoverAlign
    sideOffset?: number
  }>(),
  {
    open: undefined,
    defaultOpen: false,
    contentId: undefined,
    align: 'center',
    sideOffset: 4,
  },
)

const emit = defineEmits<{
  'update:open': [open: boolean]
}>()

const fallbackId = useId()
const internalOpen = shallowRef(props.defaultOpen)
const triggerRef = shallowRef<HTMLElement | null>(null)
const contentRef = shallowRef<HTMLElement | null>(null)

const isControlled = computed(() => props.open !== undefined)
const openState = computed(() =>
  isControlled.value ? props.open === true : internalOpen.value,
)
const contentId = computed(() => props.contentId ?? `ui-popover-${fallbackId}`)
const align = computed(() => props.align)
const sideOffset = computed(() => props.sideOffset)

function setOpen(nextOpen: boolean) {
  if (!isControlled.value) {
    internalOpen.value = nextOpen
  }

  emit('update:open', nextOpen)
}

function close() {
  setOpen(false)
}

function toggle() {
  setOpen(!openState.value)
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
  if (!openState.value || event.key !== 'Escape') {
    return
  }

  event.preventDefault()
  close()
}

function onWindowPointerDown(event: PointerEvent) {
  if (!openState.value || !(event.target instanceof Node)) {
    return
  }

  if (triggerRef.value?.contains(event.target)) {
    return
  }

  if (contentRef.value?.contains(event.target)) {
    return
  }

  close()
}

onMounted(() => {
  window.addEventListener('keydown', onWindowKeydown)
  window.addEventListener('pointerdown', onWindowPointerDown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onWindowKeydown)
  window.removeEventListener('pointerdown', onWindowPointerDown)
})

watch(openState, async (isOpen) => {
  await nextTick()

  if (isOpen) {
    const content = contentRef.value
    const firstFocusable = content ? getFocusableElements(content)[0] : null
    firstFocusable?.focus()
    if (!firstFocusable) {
      content?.focus()
    }
    return
  }

  triggerRef.value?.focus()
})

provide(uiPopoverKey, {
  open: openState,
  contentId,
  triggerRef,
  contentRef,
  align,
  sideOffset,
  setOpen,
  toggle,
  close,
})
</script>

<template>
  <slot :open="openState" :close="close" :toggle="toggle" />
</template>
