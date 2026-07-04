<script setup lang="ts">
import { PanelLeft } from '@lucide/vue'
import type { DocsNavLink, DocsNavOptions, DocsNode } from '~/types/docs'
import { isDocsLinkActive } from '~/utils/docs-link'

const props = withDefaults(
  defineProps<{
    headline?: string
    items?: DocsNode[]
    currentPath: string
    links?: DocsNavLink[]
    nav?: DocsNavOptions
  }>(),
  {
    headline: 'Documentation',
    items: () => [],
    links: () => [],
    nav: undefined,
  },
)

const route = useRoute()
const sidebarState = useDocsSidebarState()
const { open, close, toggle } = useDocsOverlay({
  id: 'nd-sidebar-mobile',
  triggerId: 'docs-header-sidebar-trigger',
  returnFocusId: 'docs-header-sidebar-trigger',
  lockScroll: true,
})

watch(
  () => route.path,
  () => {
    close()
  },
)

watch(open, (value) => {
  sidebarState.setMobileOpen(value)
})

watch(sidebarState.mobileOpen, (value) => {
  if (value === open.value) {
    return
  }

  if (value) {
    toggle()
    return
  }

  close()
})

const menuLinks = computed(() => {
  return props.links.filter((link) => {
    return (link.on ?? 'all') === 'all' || link.on === 'menu'
  })
})

function isActive(link: DocsNavLink) {
  return isDocsLinkActive(link.href, props.currentPath, link.active ?? 'url')
}
</script>

<template>
  <div class="docs-mobile-nav" :data-open="open ? 'true' : 'false'">
    <div
      class="docs-mobile-nav-overlay"
      :data-state="open ? 'open' : 'closed'"
      aria-hidden="true"
      @click="close"
    />

    <aside
      id="nd-sidebar-mobile"
      ref="nd-sidebar-mobile"
      class="docs-mobile-nav-panel"
      :data-state="open ? 'open' : 'closed'"
      :aria-label="`${props.headline} sidebar`"
      :aria-hidden="open ? 'false' : 'true'"
      :inert="open ? undefined : true"
      tabindex="-1"
    >
      <div class="docs-mobile-nav-header">
        <div class="docs-mobile-nav-tools">
          <slot name="theme-switch" />
          <slot name="language-select" />
        </div>
        <button
          type="button"
          class="docs-mobile-nav-close"
          aria-label="Close navigation"
          @click="close"
        >
          <PanelLeft class="docs-mobile-nav-close-icon" aria-hidden="true" />
        </button>
      </div>

      <DocsSidebar
        :sidebar-id="null"
        :allow-collapse="false"
        :show-header="false"
        :headline="props.headline"
        :items="props.items"
        :current-path="props.currentPath"
        :nav="props.nav"
        @navigate="close"
      >
      </DocsSidebar>

      <nav
        v-if="menuLinks.length > 0"
        class="docs-mobile-menu-links"
        aria-label="Additional navigation"
      >
        <DocsLink
          v-for="link in menuLinks"
          :key="`${link.title}:${link.href}`"
          :href="link.href || '#'"
          :external="link.external"
          class="docs-mobile-menu-link"
          :class="{ 'is-active': isActive(link) }"
          :aria-label="link.ariaLabel"
          :aria-current="isActive(link) ? 'page' : undefined"
          @click="close"
        >
          <span class="docs-mobile-menu-link-main">
            <DocsNavIcon v-if="link.icon" :name="link.icon" />
            <span>{{ link.title }}</span>
          </span>
          <span v-if="link.description" class="docs-mobile-menu-description">
            {{ link.description }}
          </span>
          </DocsLink>
        </nav>
    </aside>
  </div>
</template>
