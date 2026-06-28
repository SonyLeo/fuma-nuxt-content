<script setup lang="ts">
import type { DocsTocProps } from '~/types/docs'

withDefaults(defineProps<DocsTocProps>(), {
  items: () => [],
  label: 'On this page',
})
</script>

<template>
  <aside v-if="items.length > 0" class="docs-toc">
    <div class="docs-toc-inner">
      <p class="docs-toc-label">{{ label }}</p>
      <DocsTocList :items="items" :active-id="activeId" />
    </div>
  </aside>
</template>
