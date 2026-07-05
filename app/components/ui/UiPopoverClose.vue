<script setup lang="ts">
import { PopoverClose } from 'reka-ui'
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
</script>

<template>
  <PopoverClose as-child>
    <button v-bind="$attrs" :type="type">
      <slot />
    </button>
  </PopoverClose>
</template>
