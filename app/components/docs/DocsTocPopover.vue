<script setup lang="ts">
import { ChevronDown } from '@lucide/vue'
import {
  computed,
  onBeforeUnmount,
  onMounted,
  shallowRef,
  useTemplateRef,
} from 'vue'
import type { DocsTocPopoverProps } from '~/types/docs'

const props = withDefaults(defineProps<DocsTocPopoverProps>(), {
  items: () => [],
  activeLabel: 'On this page',
})

const progressCircleSize = 18
const progressCircleStrokeWidth = 1.5
const progressCircleRadius =
  progressCircleSize / 2 - progressCircleStrokeWidth
const progressCircleCircumference = 2 * Math.PI * progressCircleRadius
const open = shallowRef(false)
const rootRef = useTemplateRef<HTMLElement>('root')
const progressValue = computed(() => Math.max(0, Math.min(props.progress ?? 0, 1)))
const progressDashOffset = computed(
  () => progressCircleCircumference - progressValue.value * progressCircleCircumference,
)

function setOpen(value: boolean) {
  open.value = value
}

function toggleOpen() {
  setOpen(!open.value)
}

function close() {
  setOpen(false)
}

function onWindowClick(event: MouseEvent) {
  if (!open.value || !(event.target instanceof Node)) {
    return
  }

  if (!rootRef.value?.contains(event.target)) {
    close()
  }
}

function onWindowKeydown(event: KeyboardEvent) {
  if (open.value && event.key === 'Escape') {
    event.preventDefault()
    close()
  }
}

onMounted(() => {
  window.addEventListener('click', onWindowClick)
  window.addEventListener('keydown', onWindowKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('click', onWindowClick)
  window.removeEventListener('keydown', onWindowKeydown)
})
</script>

<template>
  <div
    v-if="items.length > 0"
    ref="root"
    class="docs-toc-popover"
    :data-state="open ? 'open' : 'closed'"
  >
    <header class="docs-toc-popover-surface" :class="{ 'is-open': open }">
      <button
        id="docs-toc-popover-trigger"
        class="docs-toc-popover-trigger"
        :class="{ 'is-open': open }"
        type="button"
        :aria-expanded="open"
        aria-controls="docs-toc-popover-panel"
        :data-state="open ? 'open' : 'closed'"
        @click="toggleOpen"
      >
        <svg
          class="docs-toc-popover-progress"
          role="progressbar"
          :aria-valuenow="progressValue"
          aria-valuemin="0"
          aria-valuemax="1"
          :viewBox="`0 0 ${progressCircleSize} ${progressCircleSize}`"
        >
          <circle
            class="docs-toc-popover-progress-track"
            :cx="progressCircleSize / 2"
            :cy="progressCircleSize / 2"
            :r="progressCircleRadius"
            fill="none"
            :stroke-width="progressCircleStrokeWidth"
          />
          <circle
            class="docs-toc-popover-progress-value"
            :cx="progressCircleSize / 2"
            :cy="progressCircleSize / 2"
            :r="progressCircleRadius"
            fill="none"
            :stroke-width="progressCircleStrokeWidth"
            :stroke-dasharray="progressCircleCircumference"
            :stroke-dashoffset="progressDashOffset"
            :transform="`rotate(-90 ${progressCircleSize / 2} ${progressCircleSize / 2})`"
            stroke-linecap="round"
          />
        </svg>
        <span class="docs-toc-popover-copy">
          <span
            class="docs-toc-popover-title"
            :class="{ 'is-hidden': activeItem?.text && !open }"
          >
            {{ activeLabel }}
          </span>
          <span
            class="docs-toc-popover-current"
            :class="{ 'is-visible': activeItem?.text && !open }"
          >
            {{ activeItem?.text }}
          </span>
        </span>
        <ChevronDown class="docs-toc-popover-chevron" aria-hidden="true" />
      </button>

      <div
        id="docs-toc-popover-panel"
        v-show="open"
        class="docs-toc-popover-panel"
        :hidden="!open"
        :data-state="open ? 'open' : 'closed'"
      >
        <UiScrollArea class="docs-toc-popover-scroll">
          <UiScrollViewport>
            <DocsTocList
              :items="items"
              :active-id="activeId"
              :progress="progress"
              @navigate="close"
            />
          </UiScrollViewport>
          <UiScrollBar>
            <UiScrollThumb />
          </UiScrollBar>
        </UiScrollArea>
      </div>
    </header>
  </div>
</template>
