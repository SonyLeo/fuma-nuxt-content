<script setup lang="ts">
import { computed, provide, shallowRef } from 'vue'

const props = defineProps<{
  defaultValue: string
}>()

const activeValue = shallowRef(props.defaultValue)

provide('fd-doc-tabs-value', computed(() => activeValue.value))
provide('fd-doc-tabs-setter', (value: string) => {
  activeValue.value = value
})
</script>

<template>
  <div class="fd-doc-tabs">
    <div class="fd-doc-tabs-list">
      <slot name="triggers" />
    </div>
    <div class="fd-doc-tabs-panels">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.fd-doc-tabs {
  display: grid;
  gap: 0;
  margin: 1.5rem 0;
  border: 1px solid var(--docs-color-border);
  border-radius: var(--docs-radius-xl);
  background: var(--docs-color-card);
  box-shadow: var(--docs-shadow-panel);
  overflow: hidden;
}

.fd-doc-tabs-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.75rem;
  border-bottom: 1px solid var(--docs-color-border);
  background: color-mix(in srgb, var(--docs-color-bg-soft) 86%, transparent);
}

.fd-doc-tabs-panels {
  min-width: 0;
}
</style>
