<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
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

const componentTag = computed(() => {
  if (!props.href) {
    return 'div'
  }

  return props.href.startsWith('/') ? 'NuxtLink' : 'a'
})
</script>

<template>
  <component
    :is="componentTag"
    class="fd-doc-card"
    :to="componentTag === 'NuxtLink' ? href || undefined : undefined"
    :href="componentTag === 'a' ? href || undefined : undefined"
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
