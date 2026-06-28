<script setup lang="ts">
import {
  computed,
  inject,
  nextTick,
  onBeforeUnmount,
  onMounted,
  shallowRef,
  watch,
} from 'vue'
import type { ComponentPublicInstance } from 'vue'
import {
  type UiPopoverAlign,
  uiPopoverKey,
} from '~/utils/ui-popover'

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
const positionStyle = shallowRef<Record<string, string>>({})
const resolvedId = computed(() => props.id ?? popoverContext.contentId.value)
const resolvedAlign = computed(() => props.align ?? popoverContext.align.value)
const resolvedSideOffset = computed(
  () => props.sideOffset ?? popoverContext.sideOffset.value,
)

function setContentRef(element: Element | ComponentPublicInstance | null) {
  popoverContext.contentRef.value =
    element instanceof HTMLElement ? element : null
}

function updatePosition() {
  if (!import.meta.client || !popoverContext.open.value) {
    return
  }

  const trigger = popoverContext.triggerRef.value
  if (!trigger) {
    return
  }

  const rect = trigger.getBoundingClientRect()
  const contentWidth = popoverContext.contentRef.value?.offsetWidth ?? rect.width
  const viewportPadding = 8
  const maxLeft = window.innerWidth - contentWidth - viewportPadding
  let left = rect.left

  if (resolvedAlign.value === 'center') {
    left = rect.left + rect.width / 2 - contentWidth / 2
  } else if (resolvedAlign.value === 'end') {
    left = rect.right - contentWidth
  }

  left = Math.max(viewportPadding, Math.min(left, maxLeft))

  const top = rect.bottom + resolvedSideOffset.value
  const maxHeight = Math.max(160, window.innerHeight - top - viewportPadding)

  positionStyle.value = {
    position: 'fixed',
    top: `${top}px`,
    left: `${left}px`,
    minWidth: `${rect.width}px`,
    maxWidth: `calc(100vw - ${viewportPadding * 2}px)`,
    maxHeight: `${maxHeight}px`,
  }
}

watch(
  () => [
    popoverContext.open.value,
    resolvedAlign.value,
    resolvedSideOffset.value,
  ],
  async ([isOpen]) => {
    if (!isOpen) {
      return
    }

    await nextTick()
    updatePosition()
  },
  { immediate: true },
)

onMounted(() => {
  window.addEventListener('resize', updatePosition)
  window.addEventListener('scroll', updatePosition, true)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updatePosition)
  window.removeEventListener('scroll', updatePosition, true)
})
</script>

<template>
  <Teleport to="body" :disabled="!portal">
    <div
      v-if="popoverContext.open.value"
      v-bind="$attrs"
      :id="resolvedId"
      :ref="setContentRef"
      class="ui-popover-content"
      :style="positionStyle"
      :data-state="popoverContext.open.value ? 'open' : 'closed'"
      :data-align="resolvedAlign"
      tabindex="-1"
    >
      <slot :close="popoverContext.close" />
    </div>
  </Teleport>
</template>
