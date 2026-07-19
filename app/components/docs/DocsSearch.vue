<script setup lang="ts">
import type { DocsSiteResolvedSearchConfig } from '~/types/docs-site'
import type { DocsSearchIndexEntry } from '~/types/docs-search'
import { createConfiguredDocsSearchClient } from '~/utils/docs-search-client'

const props = defineProps<{
  config: DocsSiteResolvedSearchConfig
  index?: DocsSearchIndexEntry[]
}>()

const enabled = computed(() => props.config.enabled)
const label = computed(() => props.config.label ?? 'Search')
const placeholder = computed(
  () => props.config.placeholder ?? 'Search documentation...',
)
const emptyLabel = computed(
  () => props.config.emptyLabel ?? 'No results found.',
)
const client = computed(() =>
  createConfiguredDocsSearchClient({
    provider: props.config.provider,
    endpoint: props.config.endpoint,
    index: props.index,
  }),
)
const { isOpen, query, results, status, open, close, updateQuery } =
  useDocsSearch({
    client,
    delayMs: props.config.delayMs,
    limit: props.config.limit,
  })

function closeSearch() {
  close()

  if (import.meta.client) {
    requestAnimationFrame(() => {
      document.querySelector<HTMLButtonElement>('.docs-search-trigger')?.focus()
    })
  }
}
</script>

<template>
  <template v-if="enabled">
    <DocsSearchTrigger :label="label" :placeholder="placeholder" @open="open" />
    <DocsSearchDialog
      :open="isOpen"
      :query="query"
      :results="results"
      :status="status"
      :label="label"
      :placeholder="placeholder"
      :empty-label="emptyLabel"
      @close="closeSearch"
      @update:query="updateQuery"
    />
  </template>
</template>
