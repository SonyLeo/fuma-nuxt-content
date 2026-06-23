<script setup lang="ts">
defineProps<{
  title?: string
}>()
</script>

<template>
  <header class="docs-header">
    <div class="docs-header-inner">
      <NuxtLink to="/" class="docs-header-brand">
        <span class="docs-header-brand-mark">F</span>
        <span class="docs-header-brand-text">Fuma Nuxt Content</span>
      </NuxtLink>

      <div class="docs-header-meta">
        <span class="docs-header-section">{{ title || 'Documentation' }}</span>
      </div>
    </div>
  </header>
</template>
