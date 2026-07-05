<script setup lang="ts">
import { DialogOverlay, DialogPortal } from 'reka-ui'
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
  <DialogPortal>
    <DialogOverlay as-child>
      <div
        v-bind="$attrs"
        class="ui-dialog-overlay"
        :data-state="dialogContext.open.value ? 'open' : 'closed'"
        @click.self="dialogContext.close"
      >
        <slot />
      </div>
    </DialogOverlay>
  </DialogPortal>
</template>
