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
const open = computed(() => sidebarState.mobileOpen.value)

watch(
  () => route.path,
  () => {
    close()
  },
)

const menuLinks = computed(() => {
  return props.links.filter((link) => {
    return (link.on ?? 'all') === 'all' || link.on === 'menu'
  })
})

function isActive(link: DocsNavLink) {
  return isDocsLinkActive(link.href, props.currentPath, link.active ?? 'url')
}

function close() {
  setOpen(false)
}

function setOpen(value: boolean) {
  sidebarState.setMobileOpen(value)

  if (!value && import.meta.client) {
    void nextTick(() => {
      document.getElementById('docs-header-sidebar-trigger')?.focus()
    })
  }
}
</script>

<template>
  <div class="docs-mobile-nav" :data-open="open ? 'true' : 'false'">
    <UiDialog :open="open" :unmount-on-hide="false" @update:open="setOpen">
      <UiDialogOverlay class="docs-mobile-nav-overlay" role="presentation" />
      <UiDialogContent
        id="nd-sidebar-mobile"
        class="docs-mobile-nav-panel"
        :aria-label="`${props.headline} sidebar`"
        :inert="open ? undefined : true"
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
          scroll-ownership="panel"
          :headline="props.headline"
          :items="props.items"
          :current-path="props.currentPath"
          :nav="props.nav"
          @navigate="close"
        />

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
      </UiDialogContent>
    </UiDialog>
  </div>
</template>
