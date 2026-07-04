<script setup lang="ts">
import { Check, ChevronsUpDown, PanelLeft, Search } from '@lucide/vue'
import type {
  DocsBrandOptions,
  DocsNavLink,
  DocsNavOptions,
  DocsNode,
} from '~/types/docs'
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
  }>(),
  {
    brand: undefined,
    links: () => [],
    githubUrl: undefined,
    headline: 'Documentation',
    items: () => [],
    navigationLabel: 'Documentation navigation',
    nav: undefined,
    collapsed: false,
  },
)

const emit = defineEmits<{
  navigate: []
  'update:collapsed': [value: boolean]
}>()

const slots = useSlots()
const tabsRef = useTemplateRef<HTMLElement>('tabs')
const tabsOpen = shallowRef(false)
const sidebarHovered = shallowRef(false)
const hoverCloseTimer = shallowRef<ReturnType<typeof window.setTimeout> | null>(
  null,
)
const brandLabel = computed(() => props.brand?.label ?? props.headline)
const brandMark = computed(() => props.brand?.mark ?? brandLabel.value.charAt(0))
const brandHref = computed(() => props.brand?.href ?? '/')
const sidebarTabs = computed(() => props.nav?.tabs ?? [])
const selectedTab = computed(() => {
  return (
    [...sidebarTabs.value].reverse().find((tab) =>
      isDocsLinkActive(tab.href, props.currentPath, tab.active ?? 'url'),
    ) ?? sidebarTabs.value[0]
  )
})
const sidebarLinks = computed(() => {
  return props.links.filter((link) => {
    return (link.on ?? 'all') === 'all' || link.on === 'menu'
  })
})
const theme = useDocsTheme()
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
      slots['language-select'] ||
      theme.config.value.enabled,
  )
})

function isActive(link: DocsNavLink) {
  return isDocsLinkActive(link.href, props.currentPath, link.active ?? 'url')
}

function isTabActive(tab: DocsNavLink) {
  return selectedTab.value === tab
}

function setCollapsed(value: boolean) {
  emit('update:collapsed', value)
  closeTabs()

  if (!value) {
    sidebarHovered.value = false
    return
  }

  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur()
  }
}

function toggleCollapsed() {
  setCollapsed(!props.collapsed)
}

function clearHoverCloseTimer() {
  if (hoverCloseTimer.value) {
    window.clearTimeout(hoverCloseTimer.value)
    hoverCloseTimer.value = null
  }
}

function openHoverPreview(event: PointerEvent) {
  if (!props.collapsed || event.pointerType === 'touch') {
    return
  }

  clearHoverCloseTimer()
  sidebarHovered.value = true
}

function closeHoverPreview(event?: PointerEvent) {
  if (!props.collapsed || event?.pointerType === 'touch') {
    return
  }

  clearHoverCloseTimer()
  hoverCloseTimer.value = window.setTimeout(() => {
    sidebarHovered.value = false
  }, event && Math.min(event.clientX, document.body.clientWidth - event.clientX) > 100
    ? 0
    : 500)
}

function toggleTabs() {
  tabsOpen.value = !tabsOpen.value
}

function closeTabs() {
  tabsOpen.value = false
}

function handleTabNavigate() {
  closeTabs()
  emit('navigate')
}

function handleDocumentPointerDown(event: PointerEvent) {
  if (
    tabsOpen.value &&
    tabsRef.value &&
    event.target instanceof Node &&
    !tabsRef.value.contains(event.target)
  ) {
    closeTabs()
  }
}

function handleDocumentKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    closeTabs()
  }
}

watch(
  () => props.currentPath,
  () => {
    closeTabs()
  },
)

onMounted(() => {
  document.addEventListener('pointerdown', handleDocumentPointerDown)
  document.addEventListener('keydown', handleDocumentKeydown)
})

onBeforeUnmount(() => {
  clearHoverCloseTimer()
  document.removeEventListener('pointerdown', handleDocumentPointerDown)
  document.removeEventListener('keydown', handleDocumentKeydown)
})
</script>

<template>
  <aside
    id="nd-sidebar"
    class="docs-sidebar"
    :data-collapsed="collapsed ? 'true' : 'false'"
    :data-hovered="collapsed && sidebarHovered ? 'true' : 'false'"
  >
    <div
      v-if="collapsed"
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
      <div class="docs-sidebar-header">
        <NuxtLink :to="brandHref" class="docs-sidebar-brand">
          <span class="docs-sidebar-brand-mark">
            <span v-if="brandMark">{{ brandMark }}</span>
          </span>
          <span class="docs-sidebar-brand-text">{{ brandLabel }}</span>
        </NuxtLink>
        <button
          class="docs-sidebar-collapse"
          type="button"
          :aria-label="collapsed ? 'Pin sidebar' : 'Collapse sidebar'"
          :aria-pressed="collapsed ? 'false' : 'true'"
          @click="toggleCollapsed"
        >
          <PanelLeft class="docs-sidebar-collapse-icon" aria-hidden="true" />
        </button>
      </div>

      <div v-if="$slots['search-trigger']" class="docs-sidebar-search">
        <slot name="search-trigger" />
      </div>

      <div v-if="selectedTab" ref="tabs" class="docs-sidebar-tabs">
        <button
          class="docs-sidebar-tab-trigger"
          :class="{ 'is-open': tabsOpen }"
          type="button"
          :aria-expanded="tabsOpen ? 'true' : 'false'"
          aria-haspopup="menu"
          @click="toggleTabs"
        >
          <DocsNavIcon :name="selectedTab.icon" />
          <span>{{ selectedTab.title }}</span>
          <ChevronsUpDown class="docs-sidebar-tab-chevron" aria-hidden="true" />
        </button>

        <div v-if="tabsOpen" class="docs-sidebar-tab-panel" role="menu">
          <DocsLink
            v-for="tab in sidebarTabs"
            :key="`${tab.title}:${tab.href}`"
            :href="tab.href || '#'"
            :external="tab.external"
            class="docs-sidebar-tab-option"
            :class="{ 'is-active': isTabActive(tab) }"
            :aria-current="isTabActive(tab) ? 'page' : undefined"
            role="menuitem"
            @click="handleTabNavigate"
          >
            <DocsNavIcon :name="tab.icon" />
            <span class="docs-sidebar-tab-option-copy">
              <span class="docs-sidebar-tab-option-title">{{ tab.title }}</span>
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
        </div>
      </div>

      <nav class="docs-sidebar-nav" :aria-label="navigationLabel">
        <DocsSidebarTree
          :items="items"
          :current-path="currentPath"
          @navigate="emit('navigate')"
        />
      </nav>

      <div
        v-if="showSidebarFooter"
        class="docs-sidebar-footer"
      >
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
          <DocsThemeSwitch v-if="!$slots['theme-switch']" />
        </div>
      </div>
      </div>

    <div
      v-if="collapsed"
      class="docs-sidebar-floating"
      :class="{ 'is-hidden': sidebarHovered }"
    >
      <button
        class="docs-sidebar-floating-button"
        type="button"
        aria-label="Pin sidebar"
        @click="setCollapsed(false)"
      >
        <PanelLeft class="docs-sidebar-collapse-icon" aria-hidden="true" />
      </button>
      <span v-if="$slots['search-trigger']" class="docs-sidebar-floating-search">
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
