<script setup lang="ts">
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
const labelledBy = computed(() =>
  attrs['aria-label'] ? undefined : dialogContext.titleId.value,
)

function setContentRef(element: Element | ComponentPublicInstance | null) {
  dialogContext.contentRef.value =
    element instanceof HTMLElement ? element : null
}
</script>

<template>
  <section
    v-bind="$attrs"
    :id="dialogContext.contentId.value"
    :ref="setContentRef"
    class="ui-dialog-content"
    role="dialog"
    aria-modal="true"
    :aria-labelledby="labelledBy"
    data-state="open"
    tabindex="-1"
  >
    <slot :close="dialogContext.close" />
  </section>
</template>
