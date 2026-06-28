<script setup lang="ts">
import { ListTree } from '@lucide/vue'
import type { DocsTocPopoverProps } from '~/types/docs'

const props = withDefaults(defineProps<DocsTocPopoverProps>(), {
  items: () => [],
  activeLabel: 'On this page',
})

const { open, close, toggle } = useDocsOverlay({
  id: 'docs-toc-popover-panel',
  triggerId: 'docs-toc-popover-trigger',
  returnFocusId: 'docs-toc-popover-trigger',
  lockScroll: false,
})

const progressStyle = computed(() => {
  const ratio = Math.max(0, Math.min(props.progress ?? 0, 1))
  return {
    '--docs-toc-progress': `${ratio * 100}%`,
  }
})
</script>

<template>
  <div v-if="items.length > 0" class="docs-toc-popover">
    <button
      id="docs-toc-popover-trigger"
      type="button"
      class="docs-toc-popover-trigger"
      :aria-expanded="open"
      aria-controls="docs-toc-popover-panel"
      @click="toggle"
    >
      <span class="docs-toc-popover-progress" :style="progressStyle" />
      <ListTree class="docs-toc-popover-icon" aria-hidden="true" />
      <span class="docs-toc-popover-copy">
        <span class="docs-toc-popover-label">{{ activeLabel }}</span>
        <span class="docs-toc-popover-current">
          {{ activeItem?.text || activeLabel }}
        </span>
      </span>
    </button>

    <div
      v-if="open"
      id="docs-toc-popover-panel"
      ref="docs-toc-popover-panel"
      class="docs-toc-popover-panel"
      tabindex="-1"
    >
      <div class="docs-toc-popover-header">
        <p class="docs-toc-label">{{ activeLabel }}</p>
        <button
          type="button"
          class="docs-toc-popover-close"
          aria-label="Close table of contents"
          @click="close"
        >
          Close
        </button>
      </div>

      <DocsTocList :items="items" :active-id="activeId" @navigate="close" />
    </div>
  </div>
</template>
