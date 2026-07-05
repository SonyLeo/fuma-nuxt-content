<script setup lang="ts">
import { computed, inject } from 'vue'
import {
  DropdownMenuContent,
  DropdownMenuPortal,
} from 'reka-ui'
import type { ComponentPublicInstance } from 'vue'
import {
  type UiDropdownMenuAlign,
  type UiDropdownMenuSide,
  uiDropdownMenuKey,
} from '~/utils/ui-dropdown-menu'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<{
    id?: string
    align?: UiDropdownMenuAlign
    side?: UiDropdownMenuSide
    sideOffset?: number
    portal?: boolean
  }>(),
  {
    id: undefined,
    align: undefined,
    side: undefined,
    sideOffset: undefined,
    portal: true,
  },
)

const menu = inject(uiDropdownMenuKey)

if (!menu) {
  throw new Error('UiDropdownMenuContent must be used inside UiDropdownMenu.')
}

const menuContext = menu
const resolvedId = computed(() => props.id ?? menuContext.contentId.value)
const resolvedAlign = computed(() => props.align ?? menuContext.align.value)
const resolvedSide = computed(() => props.side ?? menuContext.side.value)
const resolvedSideOffset = computed(
  () => props.sideOffset ?? menuContext.sideOffset.value,
)
const contentStyle = computed(() => {
  return {
    maxHeight: 'var(--reka-dropdown-menu-content-available-height)',
    maxWidth:
      'min(var(--reka-dropdown-menu-content-available-width), calc(100vw - 16px))',
    '--ui-dropdown-menu-trigger-width':
      'var(--reka-dropdown-menu-trigger-width)',
  }
})

function setContentRef(element: Element | ComponentPublicInstance | null) {
  menuContext.contentRef.value =
    element instanceof HTMLElement ? element : null
}
</script>

<template>
  <DropdownMenuPortal :disabled="!portal">
    <DropdownMenuContent
      as-child
      :side="resolvedSide"
      :align="resolvedAlign"
      :side-offset="resolvedSideOffset"
      :collision-padding="8"
    >
      <div
        v-bind="$attrs"
        :id="resolvedId"
        :ref="setContentRef"
        class="ui-dropdown-menu-content"
        :style="contentStyle"
        :data-state="menuContext.open.value ? 'open' : 'closed'"
        :data-side="resolvedSide"
        :data-align="resolvedAlign"
      >
        <slot :close="menuContext.close" />
      </div>
    </DropdownMenuContent>
  </DropdownMenuPortal>
</template>
