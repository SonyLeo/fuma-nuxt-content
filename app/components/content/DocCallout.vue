<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    tone?: 'info' | 'tip' | 'warn' | 'danger'
    title?: string
  }>(),
  {
    tone: 'info',
    title: ''
  }
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

<style scoped>
.fd-callout {
  border: 1px solid var(--fd-callout-border);
  background: var(--fd-callout-bg);
  border-radius: var(--docs-radius-lg);
  padding: 1rem 1.1rem;
  margin: 1.25rem 0;
}

.fd-callout-title {
  margin: 0 0 0.4rem;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--fd-callout-title);
}

.fd-callout-body :deep(p:last-child) {
  margin-bottom: 0;
}

.is-info {
  --fd-callout-border: color-mix(in srgb, var(--docs-color-info) 24%, transparent);
  --fd-callout-bg: color-mix(in srgb, var(--docs-color-info) 10%, transparent);
  --fd-callout-title: var(--docs-color-info);
}

.is-tip {
  --fd-callout-border: color-mix(in srgb, var(--docs-color-success) 24%, transparent);
  --fd-callout-bg: color-mix(in srgb, var(--docs-color-success) 10%, transparent);
  --fd-callout-title: var(--docs-color-success);
}

.is-warn {
  --fd-callout-border: color-mix(in srgb, var(--docs-color-warning) 24%, transparent);
  --fd-callout-bg: color-mix(in srgb, var(--docs-color-warning) 10%, transparent);
  --fd-callout-title: var(--docs-color-warning);
}

.is-danger {
  --fd-callout-border: color-mix(in srgb, var(--docs-color-danger) 24%, transparent);
  --fd-callout-bg: color-mix(in srgb, var(--docs-color-danger) 10%, transparent);
  --fd-callout-title: var(--docs-color-danger);
}
</style>
