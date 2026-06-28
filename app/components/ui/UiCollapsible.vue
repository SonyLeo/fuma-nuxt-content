<script setup lang="ts">
import { computed, provide, shallowRef, useId } from 'vue'
import { uiCollapsibleKey } from '~/utils/ui-collapsible'

const props = withDefaults(
  defineProps<{
    open?: boolean
    defaultOpen?: boolean
    disabled?: boolean
  }>(),
  {
    open: undefined,
    defaultOpen: false,
    disabled: false,
  },
)

const emit = defineEmits<{
  'update:open': [open: boolean]
}>()

const fallbackId = useId()
const localOpen = shallowRef(props.defaultOpen)
const disabledState = computed(() => props.disabled)
const isControlled = computed(() => props.open !== undefined)
const openState = computed(() =>
  isControlled.value ? props.open === true : localOpen.value,
)
const contentId = computed(() => `ui-collapsible-${fallbackId}`)

function setOpen(open: boolean) {
  if (props.disabled || open === openState.value) {
    return
  }

  if (!isControlled.value) {
    localOpen.value = open
  }

  emit('update:open', open)
}

function toggle() {
  setOpen(!openState.value)
}

provide(uiCollapsibleKey, {
  open: openState,
  disabled: disabledState,
  contentId,
  setOpen,
  toggle,
})
</script>

<template>
  <div
    class="ui-collapsible"
    :data-state="openState ? 'open' : 'closed'"
    :data-open="openState ? 'true' : 'false'"
    :data-disabled="disabled ? 'true' : undefined"
  >
    <slot
      :open="openState"
      :toggle="toggle"
      :set-open="setOpen"
      :content-id="contentId"
    />
  </div>
</template>
