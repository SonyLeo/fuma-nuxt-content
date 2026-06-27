<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    href?: string
    description?: string
    badge?: string
  }>(),
  {
    href: '',
    description: '',
    badge: '',
  },
)
</script>

<template>
  <component
    :is="href ? 'a' : 'div'"
    class="fd-doc-card"
    :href="href || undefined"
  >
    <div class="fd-doc-card-header">
      <h3>{{ title }}</h3>
      <span v-if="badge" class="fd-doc-card-badge">{{ badge }}</span>
    </div>
    <p v-if="description">{{ description }}</p>
    <div v-else class="fd-doc-card-slot">
      <slot />
    </div>
  </component>
</template>
