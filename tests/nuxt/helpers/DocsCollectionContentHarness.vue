<script setup lang="ts">
import { computed } from 'vue'
import { provideDocsLinkContext } from '~/composables/useDocsLink'
import type { DocsContentPage, DocsPageRecord } from '~/types/docs'

const props = defineProps<{
  page: DocsContentPage
  pages: DocsPageRecord[]
  sourcePath: string
}>()

provideDocsLinkContext({
  currentSourcePath: computed(() => props.sourcePath),
  pages: computed(() => props.pages),
})
</script>

<template>
  <DocsBody>
    <ContentRenderer :value="props.page" />
  </DocsBody>
</template>
