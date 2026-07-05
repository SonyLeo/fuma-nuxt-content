<script setup lang="ts">
import { computed, inject } from 'vue'
import { PopoverContent, PopoverPortal } from 'reka-ui'
import type { ComponentPublicInstance } from 'vue'
import { type UiPopoverAlign, uiPopoverKey } from '~/utils/ui-popover'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<{
    id?: string
    align?: UiPopoverAlign
    sideOffset?: number
    portal?: boolean
  }>(),
  {
    id: undefined,
    align: undefined,
    sideOffset: undefined,
    portal: true,
  },
)

const popover = inject(uiPopoverKey)

if (!popover) {
  throw new Error('UiPopoverContent must be used inside UiPopover.')
}

const popoverContext = popover
const resolvedId = computed(() => props.id ?? popoverContext.contentId.value)
const resolvedAlign = computed(() => props.align ?? popoverContext.align.value)
const resolvedSideOffset = computed(
  () => props.sideOffset ?? popoverContext.sideOffset.value,
)
const contentStyle = computed(() => {
  return {
    maxHeight: 'var(--reka-popover-content-available-height)',
    maxWidth:
      'min(var(--reka-popover-content-available-width), calc(100vw - 16px))',
    '--ui-popover-trigger-width': 'var(--reka-popover-trigger-width)',
  }
})

function setContentRef(element: Element | ComponentPublicInstance | null) {
  popoverContext.contentRef.value =
    element instanceof HTMLElement ? element : null
}
</script>

<template>
  <PopoverPortal :disabled="!portal">
    <PopoverContent
      as-child
      side="bottom"
      :align="resolvedAlign"
      :side-offset="resolvedSideOffset"
      :collision-padding="8"
    >
      <div
        v-bind="$attrs"
        :id="resolvedId"
        :ref="setContentRef"
        class="ui-popover-content"
        :style="contentStyle"
        :data-state="popoverContext.open.value ? 'open' : 'closed'"
        :data-align="resolvedAlign"
        tabindex="-1"
      >
        <slot :close="popoverContext.close" />
      </div>
    </PopoverContent>
  </PopoverPortal>
</template>
