<script setup lang="ts">
import { DropdownMenuRoot } from 'reka-ui'
import { computed, provide, shallowRef, useId } from 'vue'
import {
  type UiDropdownMenuAlign,
  type UiDropdownMenuSide,
  uiDropdownMenuKey,
} from '~/utils/ui-dropdown-menu'

const props = withDefaults(
  defineProps<{
    open?: boolean
    defaultOpen?: boolean
    contentId?: string
    align?: UiDropdownMenuAlign
    side?: UiDropdownMenuSide
    sideOffset?: number
    modal?: boolean
  }>(),
  {
    open: undefined,
    defaultOpen: false,
    contentId: undefined,
    align: 'start',
    side: 'bottom',
    sideOffset: 4,
    modal: false,
  },
)

const emit = defineEmits<{
  'update:open': [open: boolean]
}>()

const fallbackId = useId()
const internalOpen = shallowRef(props.defaultOpen)
const triggerRef = shallowRef<HTMLElement | null>(null)
const contentRef = shallowRef<HTMLElement | null>(null)
const ignoreCloseUntil = shallowRef(0)

const isControlled = computed(() => props.open !== undefined)
const openState = computed({
  get: () => (isControlled.value ? props.open === true : internalOpen.value),
  set: (value: boolean) => setOpen(value),
})
const contentId = computed(
  () => props.contentId ?? `ui-dropdown-menu-${fallbackId}`,
)
const align = computed(() => props.align)
const side = computed(() => props.side)
const sideOffset = computed(() => props.sideOffset)

function setOpen(nextOpen: boolean) {
  if (!nextOpen && Date.now() < ignoreCloseUntil.value) {
    return
  }

  if (!isControlled.value) {
    internalOpen.value = nextOpen
  }

  if (nextOpen) {
    ignoreCloseUntil.value = Date.now() + 120
  }

  emit('update:open', nextOpen)
}

function close() {
  setOpen(false)
}

function toggle() {
  setOpen(!openState.value)
}

provide(uiDropdownMenuKey, {
  open: openState,
  contentId,
  triggerRef,
  contentRef,
  align,
  side,
  sideOffset,
  setOpen,
  close,
  toggle,
})
</script>

<template>
  <DropdownMenuRoot
    v-model:open="openState"
    :modal="modal"
  >
    <slot :open="openState" :close="close" :toggle="toggle" />
  </DropdownMenuRoot>
</template>
