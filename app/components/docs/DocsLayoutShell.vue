<script setup lang="ts">
import type { DocsLayoutProps } from '~/types/docs'

const props = withDefaults(defineProps<DocsLayoutProps>(), {
  navigation: () => [],
  currentPath: '/',
  links: () => [],
  nav: undefined,
})

const root = useDocsRootProvider()
const sidebarState = provideDocsSidebarState({
  currentPath: computed(() => props.currentPath),
})
</script>

<template>
  <div
    class="docs-shell"
    :data-docs-dir="root.dir.value"
    data-docs-layout-provider="true"
  >
    <slot name="banner" />

    <slot name="header">
      <DocsHeader
        :title="title"
        :brand="brand"
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

    <div
      id="nd-docs-layout"
      class="docs-shell-body"
      :data-sidebar-collapsed="sidebarState.collapsed.value ? 'true' : 'false'"
      :data-sidebar-mobile-open="sidebarState.mobileOpen.value ? 'true' : 'false'"
      data-sidebar-provider="true"
    >
      <slot name="mobile-nav">
        <DocsMobileNav
          :headline="headline"
          :items="navigation"
          :current-path="currentPath"
          :links="links"
          :nav="nav"
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
        </DocsMobileNav>
      </slot>

      <slot name="sidebar">
        <DocsSidebar
          :brand="brand"
          :links="links"
          :github-url="githubUrl"
          :headline="headline"
          :items="navigation"
          :current-path="currentPath"
          :nav="nav"
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
        </DocsSidebar>
      </slot>

      <main class="docs-shell-content">
        <slot />
      </main>
    </div>
  </div>
</template>
