<script setup lang="ts">
import type { DocsNavLink } from '~/types/docs'
import { isDocsLinkActive } from '~/utils/docs-link'

const props = withDefaults(
  defineProps<{
    title?: string
    links?: DocsNavLink[]
    currentPath?: string
    githubUrl?: string
  }>(),
  {
    title: undefined,
    links: () => [],
    currentPath: '/',
    githubUrl: undefined,
  },
)

const navLinks = computed(() => {
  return props.links.filter((link) => {
    return (link.on ?? 'all') === 'all' || link.on === 'nav'
  })
})

function isActive(link: DocsNavLink) {
  return isDocsLinkActive(link.href, props.currentPath, link.active ?? 'url')
}
</script>

<template>
  <header class="docs-header">
    <div class="docs-header-inner">
      <NuxtLink to="/" class="docs-header-brand">
        <span class="docs-header-brand-mark">F</span>
        <span class="docs-header-brand-text">Fuma Nuxt Content</span>
      </NuxtLink>

      <nav
        v-if="navLinks.length > 0"
        class="docs-header-nav"
        :aria-label="title || 'Documentation navigation'"
      >
        <DocsLink
          v-for="link in navLinks"
          :key="`${link.title}:${link.href}`"
          :href="link.href || '#'"
          :external="link.external"
          class="docs-header-nav-link"
          :class="{
            'is-active': isActive(link),
            'is-button': link.type === 'button',
            'is-icon': link.type === 'icon',
          }"
          :aria-label="link.ariaLabel"
          :aria-current="isActive(link) ? 'page' : undefined"
        >
          {{
            link.type === 'icon' ? (link.ariaLabel ?? link.title) : link.title
          }}
        </DocsLink>
      </nav>

      <div class="docs-header-meta">
        <span class="docs-header-section">{{ title || 'Documentation' }}</span>
        <slot name="search-trigger" />
        <slot name="theme-switch" />
        <slot name="language-select" />
        <DocsLink
          v-if="githubUrl"
          :href="githubUrl"
          external
          class="docs-header-icon-link"
          aria-label="GitHub repository"
        >
          GH
        </DocsLink>
      </div>
    </div>
  </header>
</template>
