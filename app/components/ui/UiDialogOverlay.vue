<script setup lang="ts">
import { inject } from 'vue'
import { uiDialogKey } from '~/utils/ui-dialog'

defineOptions({
  inheritAttrs: false,
})

const dialog = inject(uiDialogKey)

if (!dialog) {
  throw new Error('UiDialogOverlay must be used inside UiDialog.')
}

const dialogContext = dialog
</script>

<template>
  <Teleport to="body">
    <div
      v-if="dialogContext.open.value"
      v-bind="$attrs"
      class="ui-dialog-overlay"
      data-state="open"
      @click.self="dialogContext.close"
    >
      <slot />
    </div>
  </Teleport>
</template>
