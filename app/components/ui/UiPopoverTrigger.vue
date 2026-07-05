<script setup lang="ts">
import { PopoverTrigger } from 'reka-ui'
import { inject } from 'vue'
import type { ComponentPublicInstance } from 'vue'
import { uiPopoverKey } from '~/utils/ui-popover'

defineOptions({
  inheritAttrs: false,
})

withDefaults(
  defineProps<{
    id?: string
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
  }>(),
  {
    id: undefined,
    type: 'button',
    disabled: false,
  },
)

const popover = inject(uiPopoverKey)

if (!popover) {
  throw new Error('UiPopoverTrigger must be used inside UiPopover.')
}

const popoverContext = popover

function setTriggerRef(element: Element | ComponentPublicInstance | null) {
  popoverContext.triggerRef.value =
    element instanceof HTMLElement ? element : null
}
</script>

<template>
  <PopoverTrigger as-child>
    <button
      v-bind="$attrs"
      :id="id"
      :ref="setTriggerRef"
      :type="type"
      :disabled="disabled"
      :aria-expanded="popoverContext.open.value"
      :aria-controls="popoverContext.contentId.value"
      :data-state="popoverContext.open.value ? 'open' : 'closed'"
    >
      <slot :open="popoverContext.open.value" />
    </button>
  </PopoverTrigger>
</template>
