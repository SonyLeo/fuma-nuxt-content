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
const hiddenPositionStyle = {
  left: '0px',
  position: 'fixed',
  top: '0px',
  visibility: 'hidden',
}
const positionStyle = shallowRef<Record<string, string>>({
  ...hiddenPositionStyle,
})
const resolvedId = computed(() => props.id ?? popoverContext.contentId.value)
const resolvedAlign = computed(() => props.align ?? popoverContext.align.value)
const resolvedSideOffset = computed(
  () => props.sideOffset ?? popoverContext.sideOffset.value,
)

function setContentRef(element: Element | ComponentPublicInstance | null) {
  popoverContext.contentRef.value =
    element instanceof HTMLElement ? element : null
}

async function updatePosition() {
  if (!import.meta.client || !popoverContext.open.value) {
    return
  }

  const trigger = popoverContext.triggerRef.value
  if (!trigger) {
    return
  }

  const rect = trigger.getBoundingClientRect()
  const viewportPadding = 8
  const top = rect.bottom + resolvedSideOffset.value
  const maxHeight = Math.max(160, window.innerHeight - top - viewportPadding)
  const baseStyle = {
    ...hiddenPositionStyle,
    maxHeight: `${maxHeight}px`,
    maxWidth: `calc(100vw - ${viewportPadding * 2}px)`,
    '--ui-popover-trigger-width': `${rect.width}px`,
  }

  positionStyle.value = baseStyle
  await nextTick()

  const contentWidth = popoverContext.contentRef.value?.offsetWidth ?? rect.width
  const maxLeft = window.innerWidth - contentWidth - viewportPadding
  let left = rect.left

  if (resolvedAlign.value === 'center') {
    left = rect.left + rect.width / 2 - contentWidth / 2
  } else if (resolvedAlign.value === 'end') {
    left = rect.right - contentWidth
  }

  left = Math.max(viewportPadding, Math.min(left, maxLeft))

  positionStyle.value = {
    ...baseStyle,
    top: `${top}px`,
    left: `${left}px`,
    visibility: 'visible',
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
      positionStyle.value = { ...hiddenPositionStyle }
      return
    }

    await nextTick()
    await updatePosition()
  },
  { immediate: true },
)

function onWindowUpdatePosition() {
  void updatePosition()
}

onMounted(() => {
  window.addEventListener('resize', onWindowUpdatePosition)
  window.addEventListener('scroll', onWindowUpdatePosition, true)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onWindowUpdatePosition)
  window.removeEventListener('scroll', onWindowUpdatePosition, true)
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
