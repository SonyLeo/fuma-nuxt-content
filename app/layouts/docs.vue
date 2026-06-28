<script setup lang="ts">
import type { DocsLayoutProps } from '~/types/docs'

withDefaults(defineProps<DocsLayoutProps>(), {
  navigation: () => [],
  currentPath: '/',
})
</script>

<template>
  <DocsLayoutShell
    :title="title"
    :headline="headline"
    :brand="brand"
    :navigation="navigation"
    :current-path="currentPath"
    :github-url="githubUrl"
    :links="links"
    :nav="nav"
  >
    <template #banner>
      <slot name="banner" />
    </template>
    <template #search-trigger>
      <slot name="search-trigger" />
    </template>
    <template #theme-switch>
      <slot name="theme-switch" />
    </template>
    <template #language-select>
      <slot name="language-select" />
    </template>
    <slot />
  </DocsLayoutShell>
</template>
