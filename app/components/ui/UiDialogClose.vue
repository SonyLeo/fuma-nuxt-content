<script setup lang="ts">
import { inject } from 'vue'
import { uiDialogKey } from '~/utils/ui-dialog'

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

const dialog = inject(uiDialogKey)

if (!dialog) {
  throw new Error('UiDialogClose must be used inside UiDialog.')
}

const dialogContext = dialog
</script>

<template>
  <button v-bind="$attrs" :type="type" @click="dialogContext.close">
    <slot />
  </button>
</template>
