<script setup lang="ts">
import { inject } from 'vue'
import { uiPopoverKey } from '~/utils/ui-popover'

defineOptions({
  inheritAttrs: false,
})

withDefaults(
  defineProps<{
    type?: 'button' | 'submit' | 'reset'
  }>(),
  {
    type: 'button',
  },
)

const popover = inject(uiPopoverKey)

if (!popover) {
  throw new Error('UiPopoverClose must be used inside UiPopover.')
}

const popoverContext = popover
</script>

<template>
  <button v-bind="$attrs" :type="type" @click="popoverContext.close">
    <slot />
  </button>
</template>
