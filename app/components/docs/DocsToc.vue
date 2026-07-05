<script setup lang="ts">
import { Text } from '@lucide/vue'
import type { DocsTocProps } from '~/types/docs'

withDefaults(defineProps<DocsTocProps>(), {
  items: () => [],
  label: 'On this page',
})
</script>

<template>
  <div v-if="items.length > 0" id="nd-toc" class="docs-toc">
    <h3 id="toc-title" class="docs-toc-label">
      <Text class="docs-toc-label-icon" aria-hidden="true" />
      <span>{{ label }}</span>
    </h3>
    <DocsTocList
      :items="items"
      :active-id="activeId"
      :item-states="itemStates"
      :progress="progress"
    />
  </div>
</template>
