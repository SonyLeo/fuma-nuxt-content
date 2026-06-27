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
