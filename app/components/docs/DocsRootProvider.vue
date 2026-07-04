<script setup lang="ts">
import type {
  DocsDirection,
  DocsRootLanguageOptions,
  DocsRootSearchOptions,
} from '~/types/docs'

const props = withDefaults(
  defineProps<{
    dir?: DocsDirection
    search?: DocsRootSearchOptions
    language?: DocsRootLanguageOptions
  }>(),
  {
    dir: 'ltr',
    search: undefined,
    language: undefined,
  },
)

const root = provideDocsRootProvider(props)

useHead({
  htmlAttrs: {
    dir: computed(() => root.dir.value),
    'data-docs-root-provider': 'true',
    'data-docs-search-enabled': computed(() =>
      root.searchEnabled.value ? 'true' : 'false',
    ),
    'data-docs-language-enabled': computed(() =>
      root.languageEnabled.value ? 'true' : 'false',
    ),
  },
})
</script>

<template>
  <slot />
</template>
