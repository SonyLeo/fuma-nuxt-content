<script setup lang="ts">
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  Lightbulb,
} from '@lucide/vue'
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    tone?: 'info' | 'success' | 'warn' | 'warning' | 'error' | 'idea'
    title?: string
  }>(),
  {
    tone: 'info',
    title: '',
  },
)

const normalizedTone = computed(() =>
  props.tone === 'warn' ? 'warning' : props.tone,
)
const toneClass = computed(() => `is-${normalizedTone.value}`)
const iconComponent = computed(() => {
  if (normalizedTone.value === 'success') {
    return CheckCircle2
  }

  if (normalizedTone.value === 'warning') {
    return AlertTriangle
  }

  if (normalizedTone.value === 'error') {
    return AlertCircle
  }

  if (normalizedTone.value === 'idea') {
    return Lightbulb
  }

  return Info
})
</script>

<template>
  <div class="fd-callout" :class="toneClass">
    <span class="fd-callout-bar" aria-hidden="true" />
    <component :is="iconComponent" class="fd-callout-icon" aria-hidden="true" />
    <div class="fd-callout-content">
      <p v-if="title" class="fd-callout-title">{{ title }}</p>
      <div class="fd-callout-body">
        <slot />
      </div>
    </div>
  </div>
</template>
