<script setup lang="ts">
import type { DocsTocItem } from '~/types/docs'

withDefaults(
  defineProps<{
    items?: DocsTocItem[]
    activeId?: string
  }>(),
  {
    items: () => [],
    activeId: undefined,
  },
)

const emit = defineEmits<{
  navigate: []
}>()
</script>

<template>
  <nav v-if="items.length > 0" aria-label="Table of contents">
    <ul class="docs-toc-list">
      <li
        v-for="item in items"
        :key="item.id"
        class="docs-toc-item"
        :class="{ 'is-nested': item.depth === 3 }"
      >
        <a
          class="docs-toc-link"
          :class="{ 'is-active': activeId === item.id }"
          :href="`#${item.id}`"
          :aria-current="activeId === item.id ? 'location' : undefined"
          @click="emit('navigate')"
        >
          {{ item.text }}
        </a>
      </li>
    </ul>
  </nav>
</template>
