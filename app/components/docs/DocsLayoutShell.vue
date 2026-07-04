<script setup lang="ts">
import type { DocsLayoutProps } from '~/types/docs'

withDefaults(defineProps<DocsLayoutProps>(), {
  navigation: () => [],
  currentPath: '/',
  links: () => [],
  nav: undefined,
})

const sidebarCollapsed = shallowRef(false)
</script>

<template>
  <div class="docs-shell">
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
          <slot name="theme-switch">
            <DocsThemeSwitch />
          </slot>
        </template>
        <template #language-select>
          <slot name="language-select" />
        </template>
      </DocsHeader>
    </slot>

    <div
      id="nd-docs-layout"
      class="docs-shell-body"
      :data-sidebar-collapsed="sidebarCollapsed ? 'true' : 'false'"
    >
      <slot name="mobile-nav">
        <DocsMobileNav
          :headline="headline"
          :items="navigation"
          :current-path="currentPath"
          :links="links"
        >
          <template #search-trigger>
            <slot name="search-trigger" />
          </template>
          <template #theme-switch>
            <slot name="theme-switch">
              <DocsThemeSwitch />
            </slot>
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
          :collapsed="sidebarCollapsed"
          @update:collapsed="sidebarCollapsed = $event"
        >
          <template #search-trigger>
            <slot name="search-trigger" />
          </template>
          <template #theme-switch>
            <slot name="theme-switch">
              <DocsThemeSwitch />
            </slot>
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
