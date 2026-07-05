<script setup lang="ts">
import { ChevronDown } from '@lucide/vue'
import { computed, shallowRef } from 'vue'
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
const progressValue = computed(() => Math.max(0, Math.min(props.progress ?? 0, 1)))
const progressDashOffset = computed(
  () => progressCircleCircumference - progressValue.value * progressCircleCircumference,
)

function close() {
  open.value = false
}
</script>

<template>
  <UiCollapsible
    v-if="items.length > 0"
    v-model:open="open"
    class="docs-toc-popover"
    content-id="docs-toc-popover-panel"
    close-on-escape
    close-on-outside
  >
    <header class="docs-toc-popover-surface" :class="{ 'is-open': open }">
      <UiCollapsibleTrigger
        id="docs-toc-popover-trigger"
        class="docs-toc-popover-trigger"
        :class="{ 'is-open': open }"
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
      </UiCollapsibleTrigger>

      <UiCollapsibleContent
        v-show="open"
        class="docs-toc-popover-panel"
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
      </UiCollapsibleContent>
    </header>
  </UiCollapsible>
</template>
