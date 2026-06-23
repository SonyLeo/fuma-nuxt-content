<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

defineProps<{
  headline?: string
  items: ContentNavigationItem[]
  currentPath: string
}>()

function hasChildren(item: ContentNavigationItem) {
  return Array.isArray(item.children) && item.children.length > 0
}
</script>

<template>
  <aside class="docs-sidebar">
    <div class="docs-sidebar-inner">
      <p class="docs-sidebar-label">{{ headline || 'Documentation' }}</p>

      <nav class="docs-sidebar-tree" aria-label="Documentation navigation">
        <ul class="docs-sidebar-list">
          <li v-for="item in items" :key="item.path || item.title" class="docs-sidebar-item">
            <NuxtLink
              v-if="item.path"
              :to="item.path"
              class="docs-sidebar-link"
              :class="{ 'is-active': item.path === currentPath }"
            >
              {{ item.title }}
            </NuxtLink>
            <p v-else class="docs-sidebar-group">{{ item.title }}</p>

            <ul v-if="hasChildren(item)" class="docs-sidebar-children">
              <li v-for="child in item.children" :key="child.path || child.title" class="docs-sidebar-child">
                <NuxtLink
                  v-if="child.path"
                  :to="child.path"
                  class="docs-sidebar-link"
                  :class="{ 'is-active': child.path === currentPath }"
                >
                  {{ child.title }}
                </NuxtLink>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  </aside>
</template>
