<script setup lang="ts">
import type { DocsSiteSearchConfig } from '~/types/docs-site'
import type { DocsSearchIndexEntry } from '~/types/docs-search'

const props = defineProps<{
  config?: DocsSiteSearchConfig
  index?: DocsSearchIndexEntry[]
}>()

const enabled = computed(() => props.config?.enabled === true)
const label = computed(() => props.config?.label ?? 'Search')
const placeholder = computed(
  () => props.config?.placeholder ?? 'Search documentation...',
)
const emptyLabel = computed(() => props.config?.emptyLabel ?? 'No results found.')
const { isOpen, query, results, status, open, close, updateQuery } =
  useDocsSearch({
    index: computed(() => props.index ?? []),
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
    <DocsSearchTrigger
      :label="label"
      :placeholder="placeholder"
      @open="open"
    />
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
