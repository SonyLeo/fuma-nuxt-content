<script setup lang="ts">
import type { DocsLayoutProps, DocsLayoutPublicSlots } from '~/types/docs'

withDefaults(defineProps<DocsLayoutProps>(), {
  navigation: () => [],
  currentPath: '/',
})

const slots = defineSlots<DocsLayoutPublicSlots>()
const layoutSlots = useDocsLayoutSlots(slots)
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
      <slot v-if="layoutSlots.hasSearchTrigger.value" name="search-trigger" />
    </template>
    <template #theme-switch>
      <slot
        v-if="layoutSlots.hasThemeSwitchReplacement.value"
        name="theme-switch"
      />
      <DocsThemeSwitch v-else-if="layoutSlots.showDefaultThemeSwitch.value" />
    </template>
    <template #language-select>
      <slot v-if="layoutSlots.hasLanguageSelect.value" name="language-select" />
    </template>
    <slot />
  </DocsLayoutShell>
</template>
