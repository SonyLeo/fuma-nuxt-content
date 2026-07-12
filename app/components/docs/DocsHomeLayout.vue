<script setup lang="ts">
import type { DocsHomeLayoutProps, DocsNavLink } from '~/types/docs'
import { isDocsLinkActive } from '~/utils/docs-link'

const props = withDefaults(defineProps<DocsHomeLayoutProps>(), {
  title: 'Documentation',
  brand: undefined,
  links: () => [],
  currentPath: '/',
  githubUrl: undefined,
})

const slots = useSlots()
const layoutSlots = useDocsLayoutSlots(slots)
const brandLabel = computed(() => props.brand?.label ?? props.title)
const brandMark = computed(
  () => props.brand?.mark ?? brandLabel.value.charAt(0),
)
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
  <div class="docs-home-layout" data-docs-home-layout>
    <header class="docs-home-header">
      <div class="docs-home-header-inner">
        <NuxtLink :to="brandHref" class="docs-home-brand">
          <span class="docs-home-brand-mark">
            <span v-if="brandMark">{{ brandMark }}</span>
          </span>
          <span class="docs-home-brand-text">{{ brandLabel }}</span>
        </NuxtLink>

        <nav
          v-if="navLinks.length > 0"
          class="docs-home-nav"
          :aria-label="title || 'Documentation navigation'"
        >
          <DocsLink
            v-for="link in navLinks"
            :key="`${link.title}:${link.href}`"
            :href="link.href || '#'"
            :external="link.external"
            class="docs-home-nav-link"
            :class="{
              'is-active': isActive(link),
              'is-button': link.type === 'button',
              'is-icon': link.type === 'icon',
            }"
            :aria-label="link.ariaLabel"
            :aria-current="isActive(link) ? 'page' : undefined"
          >
            <DocsNavIcon v-if="link.icon" :name="link.icon" />
            <span v-if="link.type !== 'icon'">{{ link.title }}</span>
            <span v-else class="docs-sr-only">
              {{ link.ariaLabel ?? link.title }}
            </span>
          </DocsLink>
        </nav>

        <div class="docs-home-tools">
          <slot
            v-if="layoutSlots.hasSearchTrigger.value"
            name="search-trigger"
          />
          <slot
            v-if="layoutSlots.hasThemeSwitchReplacement.value"
            name="theme-switch"
          />
          <DocsThemeSwitch
            v-else-if="layoutSlots.showDefaultThemeSwitch.value"
          />
          <slot
            v-if="layoutSlots.hasLanguageSelect.value"
            name="language-select"
          />
          <DocsLink
            v-if="showGithubShortcut"
            :href="githubUrl"
            external
            class="docs-home-icon-link"
            aria-label="GitHub repository"
          >
            <DocsNavIcon name="github" />
          </DocsLink>
        </div>
      </div>
    </header>

    <main class="docs-home">
      <slot />
    </main>
  </div>
</template>
