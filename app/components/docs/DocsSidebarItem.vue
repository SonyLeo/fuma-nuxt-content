<script setup lang="ts">
import { ChevronDown } from '@lucide/vue'
import type { DocsNode } from '~/types/docs'
import { isDocsLinkActive } from '~/utils/docs-link'

const props = withDefaults(
  defineProps<{
    item: DocsNode
    currentPath: string
    level?: number
  }>(),
  {
    level: 0,
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

function resolveItemHref(item: DocsNode) {
  if (item.type === 'link') {
    return item.href
  }

  return resolveItemPath(item) ?? item.index?.href
}

function isItemExternal(item: DocsNode) {
  if (item.type === 'link') {
    return item.external
  }

  return item.index?.external
}

function hasActiveDescendant(item: DocsNode): boolean {
  if (isCurrent(item) || isLinkCurrent(item)) {
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
  if (item.type === 'link') {
    return isDocsLinkActive(item.href, props.currentPath)
  }

  if (item.index?.type === 'link' && item.index.href) {
    return isDocsLinkActive(item.index.href, props.currentPath)
  }

  return false
}

function emitNavigate() {
  emit('navigate')
}

function createFolderContentId(item: DocsNode) {
  const raw = item.id || item.path || item.href || item.title || 'item'
  const id = raw
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-|-$/g, '')

  return `docs-sidebar-folder-${id || 'item'}`
}

const itemHasChildren = computed(() => hasChildren(props.item))
const itemHref = computed(() => resolveItemHref(props.item))
const itemExternal = computed(() => isItemExternal(props.item))
const itemIsCurrent = computed(() => isCurrent(props.item))
const itemIsLinkCurrent = computed(() => isLinkCurrent(props.item))
const itemIsActive = computed(
  () => itemIsCurrent.value || itemIsLinkCurrent.value,
)
const itemIsCollapsible = computed(() => props.item.collapsible !== false)
const itemDefaultExpanded = computed(() => isExpanded(props.item))
const folderContentId = computed(() => createFolderContentId(props.item))
const folderOpen = shallowRef(itemDefaultExpanded.value)
const folderState = computed(() => (folderOpen.value ? 'open' : 'closed'))
watch(itemDefaultExpanded, () => {
  if (itemDefaultExpanded.value) {
    folderOpen.value = true
  }
})

function isFolderIconTarget(target: EventTarget | null) {
  return (
    target instanceof Element &&
    Boolean(target.closest('[data-sidebar-folder-icon]'))
  )
}

function handleFolderLinkClick(
  event: MouseEvent,
  setOpen: (open: boolean) => void,
  toggle: () => void,
) {
  if (itemIsCollapsible.value && isFolderIconTarget(event.target)) {
    event.preventDefault()
    toggle()
    return
  }

  if (itemIsCollapsible.value) {
    setOpen(itemIsActive.value ? !folderOpen.value : true)
  }

  emitNavigate()
}
</script>

<template>
  <li
    class="docs-sidebar-item"
    :data-level="level"
  >
    <p
      v-if="item.type === 'separator'"
      class="docs-sidebar-separator"
      :class="{ 'is-nested': level > 0 }"
      :data-level="level"
    >
      {{ item.title }}
    </p>

    <UiCollapsible
      v-else-if="itemHasChildren"
      v-slot="{ setOpen, toggle }"
      v-model:open="folderOpen"
      class="docs-sidebar-folder"
      :content-id="folderContentId"
      :disabled="!itemIsCollapsible"
      :data-state="folderState"
      :data-active="hasActiveDescendant(item) ? 'true' : 'false'"
      :data-collapsible="itemIsCollapsible ? 'true' : 'false'"
    >
      <template v-if="itemHref">
        <DocsLink
          :href="itemHref"
          :external="itemExternal"
          class="docs-sidebar-link docs-sidebar-folder-link"
          :class="{ 'is-active': itemIsActive }"
          :data-level="level"
          :data-state="folderState"
          :data-active="itemIsActive ? 'true' : 'false'"
          :data-collapsible="itemIsCollapsible ? 'true' : 'false'"
          :aria-current="itemIsActive ? 'page' : undefined"
          :aria-expanded="folderOpen ? 'true' : 'false'"
          :aria-controls="folderContentId"
          @click="handleFolderLinkClick($event, setOpen, toggle)"
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
          <ChevronDown
            v-if="itemIsCollapsible"
            class="docs-sidebar-folder-chevron"
            data-sidebar-folder-icon
            aria-hidden="true"
            @click.prevent.stop="toggle()"
          />
        </DocsLink>
      </template>

      <UiCollapsibleTrigger
        v-else-if="itemIsCollapsible"
        class="docs-sidebar-link docs-sidebar-folder-trigger"
        :data-level="level"
        :data-collapsible="itemIsCollapsible ? 'true' : 'false'"
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
        <ChevronDown
          class="docs-sidebar-folder-chevron"
          data-sidebar-folder-icon
          aria-hidden="true"
        />
      </UiCollapsibleTrigger>

      <div
        v-else
        class="docs-sidebar-link docs-sidebar-folder-trigger"
        :data-level="level"
        :data-state="folderState"
        data-collapsible="false"
        :aria-expanded="folderOpen ? 'true' : 'false'"
        :aria-controls="folderContentId"
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
      </div>

      <UiCollapsibleContent class="docs-sidebar-folder-content">
        <DocsSidebarTree
          :items="item.children"
          :current-path="currentPath"
          :level="level + 1"
          @navigate="emit('navigate')"
        />
      </UiCollapsibleContent>
    </UiCollapsible>

    <DocsLink
      v-else-if="resolveItemPath(item)"
      :href="resolveItemPath(item)!"
      class="docs-sidebar-link"
      :class="{ 'is-active': isCurrent(item) }"
      :data-level="level"
      :data-active="isCurrent(item) ? 'true' : 'false'"
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
      :data-active="isLinkCurrent(item) ? 'true' : 'false'"
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
  </li>
</template>
