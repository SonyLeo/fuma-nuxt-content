<script setup lang="ts">
import { DialogContent } from 'reka-ui'
import { computed, inject, useAttrs } from 'vue'
import type { ComponentPublicInstance } from 'vue'
import { uiDialogKey } from '~/utils/ui-dialog'

defineOptions({
  inheritAttrs: false,
})

const dialog = inject(uiDialogKey)

if (!dialog) {
  throw new Error('UiDialogContent must be used inside UiDialog.')
}

const dialogContext = dialog
const attrs = useAttrs()
const resolvedId = computed(() =>
  typeof attrs.id === 'string' ? attrs.id : dialogContext.contentId.value,
)
const labelledBy = computed(() =>
  attrs['aria-label'] ? undefined : dialogContext.titleId.value,
)

function setContentRef(element: Element | ComponentPublicInstance | null) {
  dialogContext.contentRef.value =
    element instanceof HTMLElement ? element : null
}

function handleEscapeKeydown(event: Event) {
  if (!dialogContext.closeOnEscape.value) {
    event.preventDefault()
  }
}
</script>

<template>
  <DialogContent
    as-child
    @escape-key-down="handleEscapeKeydown"
  >
    <section
      v-bind="$attrs"
      :id="resolvedId"
      :ref="setContentRef"
      class="ui-dialog-content"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="labelledBy"
      :aria-hidden="dialogContext.open.value ? 'false' : 'true'"
      :data-state="dialogContext.open.value ? 'open' : 'closed'"
      tabindex="-1"
    >
      <slot :close="dialogContext.close" />
    </section>
  </DialogContent>
</template>
