<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    tone?: 'info' | 'success' | 'warning' | 'error' | 'idea'
    title?: string
  }>(),
  {
    tone: 'info',
    title: '',
  },
)

const toneClass = computed(() => `is-${props.tone}`)
</script>

<template>
  <div class="fd-callout" :class="toneClass">
    <p v-if="title" class="fd-callout-title">{{ title }}</p>
    <div class="fd-callout-body">
      <slot />
    </div>
  </div>
</template>
