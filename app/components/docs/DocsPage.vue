<script setup lang="ts">
defineProps<{
  title: string
  description?: string
  sectionLabel?: string
}>()
</script>

<template>
  <article class="docs-page">
    <header class="docs-page-header">
      <p class="docs-page-kicker">{{ sectionLabel || 'Guide' }}</p>
      <h1 class="docs-page-title">{{ title }}</h1>
      <p v-if="description" class="docs-page-description">{{ description }}</p>
    </header>

    <div class="docs-page-body">
      <slot />
    </div>
  </article>
</template>
