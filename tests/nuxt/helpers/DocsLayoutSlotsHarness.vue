<script setup lang="ts">
import type { DocsLayoutPublicSlots } from '~/types/docs'
import DocsLayout from '~/layouts/docs.vue'

withDefaults(
  defineProps<{
    searchEnabled?: boolean
    languageEnabled?: boolean
  }>(),
  {
    searchEnabled: true,
    languageEnabled: false,
  },
)

defineSlots<DocsLayoutPublicSlots>()
</script>

<template>
  <DocsRootProvider
    :search="{ enabled: searchEnabled }"
    :language="{ enabled: languageEnabled, label: 'Language' }"
  >
    <DocsLayout
      title="Documentation"
      headline="Documentation"
      :navigation="[]"
      current-path="/guide"
      :links="[]"
    >
      <template v-if="$slots.banner" #banner>
        <slot name="banner" />
      </template>
      <template v-if="$slots['search-trigger']" #search-trigger>
        <slot name="search-trigger" />
      </template>
      <template v-if="$slots['theme-switch']" #theme-switch>
        <slot name="theme-switch" />
      </template>
      <template v-if="$slots['language-select']" #language-select>
        <slot name="language-select" />
      </template>
      <slot />
    </DocsLayout>
  </DocsRootProvider>
</template>
