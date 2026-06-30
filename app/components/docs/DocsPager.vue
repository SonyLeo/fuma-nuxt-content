<script setup lang="ts">
import { ChevronLeft, ChevronRight } from '@lucide/vue'
import type { DocsPagerItem, DocsPagerLabels } from '~/types/docs'

withDefaults(
  defineProps<{
    previous?: DocsPagerItem | null
    next?: DocsPagerItem | null
    labels?: DocsPagerLabels
  }>(),
  {
    previous: null,
    next: null,
    labels: () => ({
      previous: 'Previous',
      next: 'Next',
      previousDescription: 'Previous page',
      nextDescription: 'Next page',
    }),
  },
)
</script>

<template>
  <nav
    v-if="previous || next"
    class="docs-pager"
    :class="{ 'has-both': previous && next }"
    aria-label="Page navigation"
  >
    <DocsLink
      v-if="previous?.path"
      :href="previous.path"
      class="docs-pager-link is-previous"
    >
      <span class="docs-pager-title-row">
        <ChevronLeft class="docs-pager-icon" aria-hidden="true" />
        <span class="docs-pager-title">{{ previous.title }}</span>
      </span>
      <span class="docs-pager-description">
        {{ previous.description || labels.previousDescription }}
      </span>
    </DocsLink>

    <DocsLink
      v-if="next?.path"
      :href="next.path"
      class="docs-pager-link is-next"
    >
      <span class="docs-pager-title-row">
        <ChevronRight class="docs-pager-icon" aria-hidden="true" />
        <span class="docs-pager-title">{{ next.title }}</span>
      </span>
      <span class="docs-pager-description">
        {{ next.description || labels.nextDescription }}
      </span>
    </DocsLink>
  </nav>
</template>
