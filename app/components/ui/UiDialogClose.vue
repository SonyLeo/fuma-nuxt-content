<script setup lang="ts">
import { DialogClose } from 'reka-ui'
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
</script>

<template>
  <DialogClose as-child>
  <button v-bind="$attrs" :type="type">
    <slot />
  </button>
  </DialogClose>
</template>
