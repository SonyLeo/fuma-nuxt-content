<script setup lang="ts">
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  Lightbulb,
} from '@lucide/vue'
import type { Component } from 'vue'

type DocCalloutType =
  | 'info'
  | 'success'
  | 'warn'
  | 'warning'
  | 'error'
  | 'idea'
  | 'tip'

const props = withDefaults(
  defineProps<{
    type?: DocCalloutType
    tone?: DocCalloutType
    icon?: Component | string
  }>(),
  {
    type: undefined,
    tone: 'info',
    icon: undefined,
  },
)

const normalizedTone = computed(() => {
  const input = props.type ?? props.tone

  if (input === 'warn') {
    return 'warning'
  }

  if (input === 'tip') {
    return 'info'
  }

  return input
})
const toneClass = computed(() => `is-${normalizedTone.value}`)
const iconComponent = computed(() => {
  if (props.icon) {
    return props.icon
  }

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
  <div
    class="fd-callout"
    :class="toneClass"
    :data-callout-type="normalizedTone"
  >
    <span class="fd-callout-bar" aria-hidden="true" />
    <slot name="icon">
      <component :is="iconComponent" class="fd-callout-icon" aria-hidden="true" />
    </slot>
    <div class="fd-callout-content">
      <slot />
    </div>
  </div>
</template>
