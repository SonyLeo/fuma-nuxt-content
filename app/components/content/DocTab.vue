<script setup lang="ts">
import type { ComputedRef } from 'vue'
import { computed, inject } from 'vue'

const props = defineProps<{
  value: string
  label: string
  trigger?: boolean
}>()

const activeValue = inject<ComputedRef<string>>('fd-doc-tabs-value')
const setActiveValue = inject<(value: string) => void>('fd-doc-tabs-setter')

const isActive = computed(() => activeValue?.value === props.value)

function handleClick() {
  setActiveValue?.(props.value)
}
</script>

<template>
  <button
    v-if="trigger"
    type="button"
    class="fd-doc-tab-trigger"
    :class="{ 'is-active': isActive }"
    @click="handleClick"
  >
    {{ label }}
  </button>
  <div v-else-if="isActive" class="fd-doc-tab-panel" role="tabpanel">
    <slot />
  </div>
</template>

<style scoped>
.fd-doc-tab-trigger {
  border: 0;
  border-radius: 0.75rem;
  padding: 0.55rem 0.9rem;
  background: transparent;
  color: var(--docs-color-text-soft);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.fd-doc-tab-trigger:hover {
  background: var(--docs-color-primary-soft);
  color: var(--docs-color-text);
}

.fd-doc-tab-trigger.is-active {
  background: #ffffff;
  color: var(--docs-color-text);
  box-shadow: inset 0 0 0 1px var(--docs-color-border);
}

.fd-doc-tab-panel {
  padding: 1rem 1rem 1.1rem;
}
</style>
