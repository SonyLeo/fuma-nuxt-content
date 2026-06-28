<script setup lang="ts">
import type { DocsNode } from '~/types/docs'

withDefaults(
  defineProps<{
    items?: DocsNode[]
    currentPath: string
    level?: number
  }>(),
  {
    items: () => [],
    level: 0,
  },
)

const emit = defineEmits<{
  navigate: []
}>()
</script>

<template>
  <ul :class="level === 0 ? 'docs-sidebar-list' : 'docs-sidebar-children'">
    <DocsSidebarItem
      v-for="(item, index) in items"
      :key="item.id || `${level}-${index}`"
      :item="item"
      :current-path="currentPath"
      :level="level"
      @navigate="emit('navigate')"
    />
  </ul>
</template>
