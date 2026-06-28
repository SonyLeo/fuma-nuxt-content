<script setup lang="ts">
import type { DocsLayoutProps } from '~/types/docs'

const props = withDefaults(defineProps<DocsLayoutProps>(), {
  navigation: () => [],
  currentPath: '/',
  links: () => [],
  nav: undefined,
})
</script>

<template>
  <div class="docs-shell">
    <slot name="banner" />

    <slot name="header">
      <DocsHeader
        :title="title"
        :links="links"
        :current-path="currentPath"
        :github-url="githubUrl"
      >
        <template #search-trigger>
          <slot name="search-trigger" />
        </template>
        <template #theme-switch>
          <slot name="theme-switch" />
        </template>
        <template #language-select>
          <slot name="language-select" />
        </template>
      </DocsHeader>
    </slot>

    <div class="docs-shell-body">
      <slot name="mobile-nav">
        <DocsMobileNav
          :headline="headline"
          :items="navigation"
          :current-path="currentPath"
          :links="links"
        />
      </slot>

      <slot name="sidebar">
        <DocsSidebar
          :headline="headline"
          :items="navigation"
          :current-path="currentPath"
        />
      </slot>

      <main class="docs-shell-content">
        <slot />
      </main>
    </div>
  </div>
</template>
