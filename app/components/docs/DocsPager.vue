<script setup lang="ts">
import type { DocsNode } from '~/types/docs'

defineProps<{
  previous?: DocsNode | null
  next?: DocsNode | null
}>()
</script>

<template>
  <nav v-if="previous || next" class="docs-pager" aria-label="Page navigation">
    <NuxtLink
      v-if="previous?.path"
      :to="previous.path"
      class="docs-pager-link is-previous"
    >
      <span class="docs-pager-caption">Previous</span>
      <span class="docs-pager-title">{{ previous.title }}</span>
    </NuxtLink>

    <div v-else class="docs-pager-spacer" />

    <NuxtLink v-if="next?.path" :to="next.path" class="docs-pager-link is-next">
      <span class="docs-pager-caption">Next</span>
      <span class="docs-pager-title">{{ next.title }}</span>
    </NuxtLink>
  </nav>
</template>
