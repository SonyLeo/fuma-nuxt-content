<script setup lang="ts">
import type { DocsNode } from '~/types/docs'

const props = withDefaults(
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
      :current-path="currentPath"
      :item="item"
      :level="level"
      @navigate="emit('navigate')"
    />
  </ul>
</template>
