<script setup lang="ts">
import type { DocsRootProviderProps } from '~/types/docs'

const props = defineProps<DocsRootProviderProps>()

defineSlots<{
  default(): unknown
}>()

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
  <UiTooltipProvider>
    <slot />
  </UiTooltipProvider>
</template>
