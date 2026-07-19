<script setup lang="ts">
import { Check, ChevronsUpDown, PanelLeft, Search } from '@lucide/vue'
import type {
  DocsBrandOptions,
  DocsNavLink,
  DocsNavOptions,
  DocsNode,
} from '~/types/docs'
import {
  findActiveDocsLayoutTab,
  resolveDocsLayoutTabs,
} from '~/utils/docs-layout-tabs'
import { isDocsLinkActive } from '~/utils/docs-link'

const props = withDefaults(
  defineProps<{
    brand?: DocsBrandOptions
    links?: DocsNavLink[]
    githubUrl?: string
    headline?: string
    items?: DocsNode[]
    currentPath: string
    navigationLabel?: string
    nav?: DocsNavOptions
    collapsed?: boolean
    sidebarId?: string | null
    allowCollapse?: boolean
    showHeader?: boolean
  }>(),
  {
    brand: undefined,
    links: () => [],
    githubUrl: undefined,
    headline: 'Documentation',
    items: () => [],
    navigationLabel: 'Documentation navigation',
    nav: undefined,
    collapsed: undefined,
    sidebarId: 'nd-sidebar',
    allowCollapse: true,
    showHeader: true,
  },
)

const emit = defineEmits<{
  navigate: []
  'update:collapsed': [value: boolean]
}>()

const slots = useSlots()
const sidebarState = useDocsSidebarState()
const brandLabel = computed(() => props.brand?.label ?? props.headline)
const brandMark = computed(
  () => props.brand?.mark ?? brandLabel.value.charAt(0),
)
const brandHref = computed(() => props.brand?.href ?? '/')
const sidebarTabs = computed(() => resolveDocsLayoutTabs(props.nav))
const selectedTab = computed(() => {
  return findActiveDocsLayoutTab(sidebarTabs.value, props.currentPath)
})
const isCollapsed = computed(() => {
  if (!props.allowCollapse) {
    return false
  }

  return props.collapsed ?? sidebarState.collapsed.value
})
const sidebarLinks = computed(() => {
  return props.links.filter((link) => {
    return (link.on ?? 'all') === 'all' || link.on === 'menu'
  })
})
const showGithubShortcut = computed(() => {
  return Boolean(
    props.githubUrl &&
    !sidebarLinks.value.some((link) => link.href === props.githubUrl),
  )
})
const showSidebarFooter = computed(() => {
  return Boolean(
    sidebarLinks.value.length > 0 ||
    showGithubShortcut.value ||
    slots['theme-switch'] ||
    slots['language-select'],
  )
})
const collapseLabel = computed(() =>
  isCollapsed.value ? 'Pin sidebar' : 'Collapse sidebar',
)

function isActive(link: DocsNavLink) {
  return isDocsLinkActive(link.href, props.currentPath, link.active ?? 'url')
}

function isTabActive(tab: DocsNavLink) {
  return selectedTab.value === tab
}

function setCollapsed(value: boolean) {
  sidebarState.setCollapsed(value)
  emit('update:collapsed', value)
}

function toggleCollapsed() {
  setCollapsed(!isCollapsed.value)
}

function openHoverPreview(event: PointerEvent) {
  sidebarState.openHoverPreview(event)
}

function closeHoverPreview(event?: PointerEvent) {
  sidebarState.closeHoverPreview(event)
}

function closeTabs() {
  sidebarState.closeTabs()
}

function handleTabNavigate() {
  closeTabs()
  emit('navigate')
}

watch(
  () => props.currentPath,
  () => {
    closeTabs()
  },
)
</script>

<template>
  <aside
    :id="sidebarId ?? undefined"
    class="docs-sidebar"
    :data-collapsed="isCollapsed ? 'true' : 'false'"
    :data-hovered="isCollapsed && sidebarState.hovered.value ? 'true' : 'false'"
  >
    <div
      v-if="isCollapsed"
      class="docs-sidebar-hover-zone"
      aria-hidden="true"
      @pointerenter="openHoverPreview"
      @pointerleave="closeHoverPreview"
    />

    <div
      class="docs-sidebar-inner"
      @pointerenter="openHoverPreview"
      @pointerleave="closeHoverPreview"
    >
      <div v-if="showHeader" class="docs-sidebar-header">
        <NuxtLink :to="brandHref" class="docs-sidebar-brand">
          <span class="docs-sidebar-brand-mark">
            <span v-if="brandMark">{{ brandMark }}</span>
          </span>
          <span class="docs-sidebar-brand-text">{{ brandLabel }}</span>
        </NuxtLink>
        <UiTooltip v-if="allowCollapse">
          <UiTooltipTrigger>
            <button
              class="docs-sidebar-collapse"
              type="button"
              :aria-label="collapseLabel"
              :aria-pressed="isCollapsed ? 'false' : 'true'"
              @click="toggleCollapsed"
            >
              <PanelLeft
                class="docs-sidebar-collapse-icon"
                aria-hidden="true"
              />
            </button>
          </UiTooltipTrigger>
          <UiTooltipContent data-sidebar-tooltip="collapse" side="right">
            {{ collapseLabel }}
          </UiTooltipContent>
        </UiTooltip>
      </div>

      <div v-if="$slots['search-trigger']" class="docs-sidebar-search">
        <slot name="search-trigger" />
      </div>

      <UiDropdownMenu
        v-if="selectedTab"
        :key="currentPath"
        v-slot="{ open }"
        :modal="false"
        align="start"
        :side-offset="4"
      >
        <div class="docs-sidebar-tabs">
          <UiDropdownMenuTrigger
            class="docs-sidebar-tab-trigger"
            :class="{ 'is-open': open }"
          >
            <DocsNavIcon :name="selectedTab.icon" />
            <span>{{ selectedTab.title }}</span>
            <ChevronsUpDown
              class="docs-sidebar-tab-chevron"
              aria-hidden="true"
            />
          </UiDropdownMenuTrigger>

          <UiDropdownMenuContent
            id="docs-sidebar-tab-panel"
            class="docs-sidebar-tab-panel"
            :portal="false"
          >
            <UiDropdownMenuItem
              v-for="tab in sidebarTabs"
              :key="`${tab.title}:${tab.href}`"
              as-child
              :text-value="tab.title"
              @select="handleTabNavigate"
            >
              <DocsLink
                :href="tab.href || '#'"
                :external="tab.external"
                class="docs-sidebar-tab-option"
                :class="{ 'is-active': isTabActive(tab) }"
                :aria-current="isTabActive(tab) ? 'page' : undefined"
              >
                <DocsNavIcon :name="tab.icon" />
                <span class="docs-sidebar-tab-option-copy">
                  <span class="docs-sidebar-tab-option-title">{{
                    tab.title
                  }}</span>
                  <span
                    v-if="tab.description"
                    class="docs-sidebar-tab-option-description"
                  >
                    {{ tab.description }}
                  </span>
                </span>
                <Check
                  class="docs-sidebar-tab-option-check"
                  :class="{ 'is-visible': isTabActive(tab) }"
                  aria-hidden="true"
                />
              </DocsLink>
            </UiDropdownMenuItem>
          </UiDropdownMenuContent>
        </div>
      </UiDropdownMenu>

      <nav class="docs-sidebar-nav" :aria-label="navigationLabel">
        <DocsSidebarTree
          :items="items"
          :current-path="currentPath"
          @navigate="emit('navigate')"
        />
      </nav>

      <div v-if="showSidebarFooter" class="docs-sidebar-footer">
        <nav
          v-if="sidebarLinks.length > 0 || showGithubShortcut"
          class="docs-sidebar-footer-links"
          aria-label="Additional navigation"
        >
          <DocsLink
            v-for="link in sidebarLinks"
            :key="`${link.title}:${link.href}`"
            :href="link.href || '#'"
            :external="link.external"
            class="docs-sidebar-footer-link"
            :class="{
              'is-active': isActive(link),
              'is-icon': link.type === 'icon',
            }"
            :aria-label="link.ariaLabel"
            :aria-current="isActive(link) ? 'page' : undefined"
          >
            <DocsNavIcon v-if="link.icon" :name="link.icon" />
            <span>{{ link.title }}</span>
          </DocsLink>
          <DocsLink
            v-if="showGithubShortcut"
            :href="githubUrl"
            external
            class="docs-sidebar-footer-link is-icon"
            aria-label="GitHub repository"
          >
            <DocsNavIcon name="github" />
            <span>GitHub</span>
          </DocsLink>
        </nav>
        <div class="docs-sidebar-footer-controls">
          <slot name="theme-switch" />
          <slot name="language-select" />
        </div>
      </div>
    </div>

    <div
      v-if="isCollapsed"
      class="docs-sidebar-floating"
      :class="{ 'is-hidden': sidebarState.hovered.value }"
    >
      <UiTooltip>
        <UiTooltipTrigger>
          <button
            class="docs-sidebar-floating-button"
            type="button"
            aria-label="Pin sidebar"
            @click="setCollapsed(false)"
          >
            <PanelLeft class="docs-sidebar-collapse-icon" aria-hidden="true" />
          </button>
        </UiTooltipTrigger>
        <UiTooltipContent data-sidebar-tooltip="pin" side="right">
          Pin sidebar
        </UiTooltipContent>
      </UiTooltip>
      <span
        v-if="$slots['search-trigger']"
        class="docs-sidebar-floating-search"
      >
        <slot name="search-trigger" />
      </span>
      <button
        v-else
        class="docs-sidebar-floating-button"
        type="button"
        aria-label="Search documentation"
      >
        <Search class="docs-sidebar-collapse-icon" aria-hidden="true" />
      </button>
    </div>
  </aside>
</template>
