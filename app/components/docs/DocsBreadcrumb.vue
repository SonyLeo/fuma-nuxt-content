<script setup lang="ts">
import type { DocsBreadcrumbItem } from '~/types/docs'

const props = defineProps<{
  items: DocsBreadcrumbItem[]
}>()

function resolveItemPath(item: DocsBreadcrumbItem) {
  return item.path
}
</script>

<template>
  <nav
    v-if="props.items.length > 0"
    class="docs-breadcrumb"
    aria-label="Breadcrumb"
  >
    <ol class="docs-breadcrumb-list">
      <li
        v-for="item in props.items"
        :key="item.id"
        class="docs-breadcrumb-item"
      >
        <DocsLink
          v-if="resolveItemPath(item)"
          :href="resolveItemPath(item)!"
          class="docs-breadcrumb-link"
          :class="{ 'is-current': item === props.items.at(-1) }"
          :aria-current="item === props.items.at(-1) ? 'page' : undefined"
        >
          {{ item.title }}
        </DocsLink>
        <span v-else class="docs-breadcrumb-current">{{ item.title }}</span>
      </li>
    </ol>
  </nav>
</template>
