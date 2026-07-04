<script setup lang="ts">
import type { DocsBrandOptions, DocsNavLink } from '~/types/docs'
import { isDocsLinkActive } from '~/utils/docs-link'

const props = withDefaults(
  defineProps<{
    title?: string
    brand?: DocsBrandOptions
    links?: DocsNavLink[]
    currentPath?: string
    githubUrl?: string
  }>(),
  {
    title: undefined,
    brand: undefined,
    links: () => [],
    currentPath: '/',
    githubUrl: undefined,
  },
)

const brandLabel = computed(() => props.brand?.label ?? 'Documentation')
const brandMark = computed(() => props.brand?.mark ?? brandLabel.value.charAt(0))
const brandHref = computed(() => props.brand?.href ?? '/')
const navLinks = computed(() => {
  return props.links.filter((link) => {
    return (link.on ?? 'all') === 'all' || link.on === 'nav'
  })
})
const showGithubShortcut = computed(() => {
  return Boolean(
    props.githubUrl &&
      !navLinks.value.some((link) => link.href === props.githubUrl),
  )
})

function isActive(link: DocsNavLink) {
  return isDocsLinkActive(link.href, props.currentPath, link.active ?? 'url')
}
</script>

<template>
  <header class="docs-header">
    <div class="docs-header-inner">
      <NuxtLink :to="brandHref" class="docs-header-brand">
        <span class="docs-header-brand-mark">{{ brandMark }}</span>
        <span class="docs-header-brand-text">{{ brandLabel }}</span>
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
          <DocsNavIcon v-if="link.icon" :name="link.icon" />
          <span v-if="link.type !== 'icon'" class="docs-header-nav-label">
            {{ link.title }}
          </span>
          <span v-else class="docs-sr-only">
            {{ link.ariaLabel ?? link.title }}
          </span>
        </DocsLink>
      </nav>

      <div class="docs-header-meta">
        <span class="docs-header-section">{{ title || 'Documentation' }}</span>
        <slot name="search-trigger" />
        <slot name="theme-switch">
          <DocsThemeSwitch />
        </slot>
        <slot name="language-select" />
        <DocsLink
          v-if="showGithubShortcut"
          :href="githubUrl"
          external
          class="docs-header-icon-link"
          aria-label="GitHub repository"
        >
          <DocsNavIcon name="github" />
        </DocsLink>
      </div>
    </div>
  </header>
</template>
