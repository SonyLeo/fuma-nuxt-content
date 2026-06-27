<script setup lang="ts">
import type { DocsNode } from '~/types/docs'

defineProps<{
  headline?: string
  items: DocsNode[]
  currentPath: string
}>()

function hasChildren(item: DocsNode) {
  return item.children.length > 0
}
</script>

<template>
  <aside class="docs-sidebar">
    <div class="docs-sidebar-inner">
      <p class="docs-sidebar-label">{{ headline || 'Documentation' }}</p>

      <nav class="docs-sidebar-tree" aria-label="Documentation navigation">
        <ul class="docs-sidebar-list">
          <li
            v-for="item in items"
            :key="item.path || item.title"
            class="docs-sidebar-item"
          >
            <NuxtLink
              v-if="item.path"
              :to="item.path"
              class="docs-sidebar-link"
              :class="{ 'is-active': item.path === currentPath }"
            >
              <span class="docs-sidebar-link-label">{{ item.title }}</span>
              <span v-if="item.badge" class="docs-sidebar-badge">
                {{ item.badge }}
              </span>
            </NuxtLink>
            <p v-else class="docs-sidebar-group">{{ item.title }}</p>

            <ul v-if="hasChildren(item)" class="docs-sidebar-children">
              <li
                v-for="child in item.children"
                :key="child.path || child.title"
                class="docs-sidebar-child"
              >
                <NuxtLink
                  v-if="child.path"
                  :to="child.path"
                  class="docs-sidebar-link"
                  :class="{ 'is-active': child.path === currentPath }"
                >
                  <span class="docs-sidebar-link-label">
                    {{ child.title }}
                  </span>
                  <span v-if="child.badge" class="docs-sidebar-badge">
                    {{ child.badge }}
                  </span>
                </NuxtLink>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  </aside>
</template>
