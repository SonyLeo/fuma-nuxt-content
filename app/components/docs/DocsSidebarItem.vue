<script setup lang="ts">
import type { DocsNode } from '~/types/docs'
import { isDocsLinkActive } from '~/utils/docs-link'

const props = withDefaults(
  defineProps<{
    item: DocsNode
    currentPath: string
    level?: number
    visualLevel?: number
  }>(),
  {
    level: 0,
    visualLevel: 0,
  },
)

const emit = defineEmits<{
  navigate: []
}>()

function hasChildren(item: DocsNode) {
  return item.children.length > 0
}

function resolveItemPath(item: DocsNode) {
  if (item.type === 'page') {
    return item.path
  }

  return item.index?.path
}

function hasActiveDescendant(item: DocsNode): boolean {
  if (
    item.path === props.currentPath ||
    item.index?.path === props.currentPath
  ) {
    return true
  }

  return item.children.some((child) => hasActiveDescendant(child))
}

function isExpanded(item: DocsNode) {
  if (!hasChildren(item)) {
    return false
  }

  if (item.collapsible === false) {
    return true
  }

  if (hasActiveDescendant(item)) {
    return true
  }

  return item.defaultOpen !== false
}

function isCurrent(item: DocsNode) {
  return resolveItemPath(item) === props.currentPath
}

function isLinkCurrent(item: DocsNode) {
  return item.type === 'link' && isDocsLinkActive(item.href, props.currentPath)
}

function emitNavigate() {
  emit('navigate')
}
</script>

<template>
  <li
    class="docs-sidebar-item"
    :class="{ 'is-visual-nested': visualLevel > 0 }"
    :data-level="level"
    :data-visual-level="visualLevel"
  >
    <p
      v-if="item.type === 'separator'"
      class="docs-sidebar-separator"
      :class="{ 'is-nested': level > 0 }"
    >
      {{ item.title }}
    </p>

    <DocsLink
      v-else-if="resolveItemPath(item)"
      :href="resolveItemPath(item)!"
      class="docs-sidebar-link"
      :class="{ 'is-active': isCurrent(item) }"
      :data-level="level"
      :data-visual-level="visualLevel"
      :aria-current="isCurrent(item) ? 'page' : undefined"
      @click="emitNavigate"
    >
      <DocsNavIcon v-if="item.icon" :name="item.icon" />
      <span class="docs-sidebar-link-label">
        {{ item.title }}
      </span>
      <span class="docs-sidebar-link-meta">
        <span v-if="item.status" class="docs-sidebar-status">
          {{ item.status }}
        </span>
        <span v-if="item.badge" class="docs-sidebar-badge">
          {{ item.badge }}
        </span>
      </span>
    </DocsLink>

    <DocsLink
      v-else-if="item.type === 'link' && item.href"
      :href="item.href"
      :external="item.external"
      class="docs-sidebar-link"
      :class="{ 'is-active': isLinkCurrent(item) }"
      :data-level="level"
      :data-visual-level="visualLevel"
      :aria-current="isLinkCurrent(item) ? 'page' : undefined"
      @click="emitNavigate"
    >
      <DocsNavIcon v-if="item.icon" :name="item.icon" />
      <span class="docs-sidebar-link-label">
        {{ item.title }}
      </span>
      <span class="docs-sidebar-link-meta">
        <span v-if="item.status" class="docs-sidebar-status">
          {{ item.status }}
        </span>
        <span v-if="item.badge" class="docs-sidebar-badge">
          {{ item.badge }}
        </span>
      </span>
    </DocsLink>

    <div v-else class="docs-sidebar-group-block">
      <DocsNavIcon v-if="item.icon" :name="item.icon" />
      <p class="docs-sidebar-group">{{ item.title }}</p>
      <span class="docs-sidebar-link-meta">
        <span v-if="item.status" class="docs-sidebar-status">
          {{ item.status }}
        </span>
        <span v-if="item.badge" class="docs-sidebar-badge">
          {{ item.badge }}
        </span>
      </span>
    </div>

    <DocsSidebarTree
      v-if="hasChildren(item) && isExpanded(item)"
      :items="item.children"
      :current-path="currentPath"
      :level="level + 1"
      @navigate="emit('navigate')"
    />
  </li>
</template>
