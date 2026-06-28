<script setup lang="ts">
import type { DocsPageHeaderProps } from '~/types/docs'

withDefaults(defineProps<DocsPageHeaderProps>(), {
  breadcrumbs: () => [],
})
</script>

<template>
  <header class="docs-page-header">
    <p v-if="sectionLabel" class="docs-page-kicker">{{ sectionLabel }}</p>
    <DocsTitle>{{ title }}</DocsTitle>
    <DocsDescription v-if="description">{{ description }}</DocsDescription>
    <div v-if="$slots.actions" class="docs-page-actions">
      <slot name="actions" />
    </div>
  </header>
</template>
