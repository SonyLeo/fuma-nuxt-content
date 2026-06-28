<script setup lang="ts">
import type { DocsNode } from '~/types/docs'

withDefaults(
  defineProps<{
    headline?: string
    items?: DocsNode[]
    currentPath: string
    navigationLabel?: string
  }>(),
  {
    headline: 'Documentation',
    items: () => [],
    navigationLabel: 'Documentation navigation',
  },
)

const emit = defineEmits<{
  navigate: []
}>()
</script>

<template>
  <aside class="docs-sidebar">
    <div class="docs-sidebar-inner">
      <p class="docs-sidebar-label">{{ headline }}</p>

      <nav class="docs-sidebar-nav" :aria-label="navigationLabel">
        <DocsSidebarTree
          :items="items"
          :current-path="currentPath"
          @navigate="emit('navigate')"
        />
      </nav>
    </div>
  </aside>
</template>
