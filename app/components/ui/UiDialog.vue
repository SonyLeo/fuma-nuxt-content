<script setup lang="ts">
import { DialogRoot } from 'reka-ui'
import { computed, provide, shallowRef, useId } from 'vue'
import { uiDialogKey } from '~/utils/ui-dialog'

const props = withDefaults(
  defineProps<{
    open?: boolean
    defaultOpen?: boolean
    contentId?: string
    titleId?: string
    closeOnEscape?: boolean
    trapFocus?: boolean
    unmountOnHide?: boolean
  }>(),
  {
    open: undefined,
    defaultOpen: false,
    contentId: undefined,
    titleId: undefined,
    closeOnEscape: true,
    trapFocus: true,
    unmountOnHide: true,
  },
)

const emit = defineEmits<{
  'update:open': [open: boolean]
}>()

const fallbackId = useId()
const internalOpen = shallowRef(props.defaultOpen)
const contentRef = shallowRef<HTMLElement | null>(null)

const isControlled = computed(() => props.open !== undefined)
const openState = computed({
  get: () => (isControlled.value ? props.open === true : internalOpen.value),
  set: (value: boolean) => setOpen(value),
})
const contentId = computed(() => props.contentId ?? `ui-dialog-${fallbackId}`)
const titleId = computed(() => props.titleId ?? `${contentId.value}-title`)
const closeOnEscape = computed(() => props.closeOnEscape)
const trapFocus = computed(() => props.trapFocus)
const unmountOnHide = computed(() => props.unmountOnHide)

function setOpen(nextOpen: boolean) {
  if (!isControlled.value) {
    internalOpen.value = nextOpen
  }

  emit('update:open', nextOpen)
}

function close() {
  setOpen(false)
}

provide(uiDialogKey, {
  open: openState,
  contentId,
  titleId,
  closeOnEscape,
  unmountOnHide,
  contentRef,
  setOpen,
  close,
})
</script>

<template>
  <DialogRoot
    v-model:open="openState"
    :modal="trapFocus"
    :unmount-on-hide="unmountOnHide"
  >
    <slot :open="openState" :close="close" />
  </DialogRoot>
</template>
