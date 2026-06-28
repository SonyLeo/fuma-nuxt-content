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

const visualItems = computed(() => {
  let inNestedVisualSection = false

  return props.items.map((item) => {
    if (props.level === 0 && item.type === 'separator') {
      inNestedVisualSection = item.title === 'Components'
    }

    return {
      item,
      visualLevel:
        props.level === 0 && inNestedVisualSection && item.type !== 'separator'
          ? 1
          : props.level,
    }
  })
})
</script>

<template>
  <ul :class="level === 0 ? 'docs-sidebar-list' : 'docs-sidebar-children'">
    <DocsSidebarItem
      v-for="({ item, visualLevel }, index) in visualItems"
      :key="item.id || `${level}-${index}`"
      :current-path="currentPath"
      :item="item"
      :level="level"
      :visual-level="visualLevel"
      @navigate="emit('navigate')"
    />
  </ul>
</template>
