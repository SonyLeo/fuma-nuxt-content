<script setup lang="ts">
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
  <nav v-if="previous || next" class="docs-pager" aria-label="Page navigation">
    <DocsLink
      v-if="previous?.path"
      :href="previous.path"
      class="docs-pager-link is-previous"
    >
      <span class="docs-pager-caption">{{ labels.previous }}</span>
      <span class="docs-pager-title">{{ previous.title }}</span>
      <span class="docs-pager-description">
        {{ previous.description || labels.previousDescription }}
      </span>
    </DocsLink>

    <div v-else class="docs-pager-spacer" />

    <DocsLink
      v-if="next?.path"
      :href="next.path"
      class="docs-pager-link is-next"
    >
      <span class="docs-pager-caption">{{ labels.next }}</span>
      <span class="docs-pager-title">{{ next.title }}</span>
      <span class="docs-pager-description">
        {{ next.description || labels.nextDescription }}
      </span>
    </DocsLink>

    <div v-else class="docs-pager-spacer" />
  </nav>
</template>
