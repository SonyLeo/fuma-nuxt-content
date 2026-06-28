<script setup lang="ts">
import { ChevronDown } from '@lucide/vue'
import type { DocsTocPopoverProps } from '~/types/docs'

const props = withDefaults(defineProps<DocsTocPopoverProps>(), {
  items: () => [],
  activeLabel: 'On this page',
})

const progressStyle = computed(() => {
  const ratio = Math.max(0, Math.min(props.progress ?? 0, 1))
  return {
    '--docs-toc-progress': `${ratio * 100}%`,
  }
})
</script>

<template>
  <UiPopover
    v-if="items.length > 0"
    content-id="docs-toc-popover-panel"
    align="start"
    :side-offset="8"
  >
    <template #default="{ close, open }">
      <div class="docs-toc-popover">
        <UiPopoverTrigger
          id="docs-toc-popover-trigger"
          class="docs-toc-popover-trigger"
          :class="{ 'is-open': open }"
        >
          <span class="docs-toc-popover-progress" :style="progressStyle" />
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
        </UiPopoverTrigger>

        <UiPopoverContent class="docs-toc-popover-panel">
          <div class="docs-toc-popover-header">
            <h3 class="docs-toc-popover-panel-title">{{ activeLabel }}</h3>
            <UiPopoverClose
              class="docs-toc-popover-close"
              aria-label="Close table of contents"
            >
              Close
            </UiPopoverClose>
          </div>

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
        </UiPopoverContent>
      </div>
    </template>
  </UiPopover>
</template>
