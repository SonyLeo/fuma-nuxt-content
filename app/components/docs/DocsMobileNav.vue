<script setup lang="ts">
import type { DocsNavLink, DocsNode } from '~/types/docs'
import { isDocsLinkActive } from '~/utils/docs-link'

const props = withDefaults(
  defineProps<{
    headline?: string
    items?: DocsNode[]
    currentPath: string
    links?: DocsNavLink[]
  }>(),
  {
    headline: 'Documentation',
    items: () => [],
    links: () => [],
  },
)

const route = useRoute()
const { open, close, toggle } = useDocsOverlay({
  id: 'docs-mobile-nav-panel',
  triggerId: 'docs-mobile-nav-trigger',
  returnFocusId: 'docs-mobile-nav-trigger',
  lockScroll: true,
})

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
</script>

<template>
  <div class="docs-mobile-nav">
    <button
      id="docs-mobile-nav-trigger"
      type="button"
      class="docs-mobile-nav-trigger"
      :aria-expanded="open"
      aria-controls="docs-mobile-nav-panel"
      @click="toggle"
    >
      Browse docs
    </button>

    <div
      v-if="open"
      id="docs-mobile-nav-panel"
      ref="docs-mobile-nav-panel"
      class="docs-mobile-nav-panel"
      tabindex="-1"
    >
      <div class="docs-mobile-nav-header">
        <p class="docs-mobile-nav-label">
          {{ props.headline }}
        </p>
        <button
          type="button"
          class="docs-mobile-nav-close"
          aria-label="Close navigation"
          @click="close"
        >
          Close
        </button>
      </div>

      <DocsSidebar
        :headline="props.headline"
        :items="props.items"
        :current-path="props.currentPath"
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
          <span>{{ link.title }}</span>
          <span v-if="link.description" class="docs-mobile-menu-description">
            {{ link.description }}
          </span>
        </DocsLink>
      </nav>
    </div>
  </div>
</template>
