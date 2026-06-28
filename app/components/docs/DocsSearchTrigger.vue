<script setup lang="ts">
import { Search } from '@lucide/vue'

withDefaults(
  defineProps<{
    label?: string
    placeholder?: string
  }>(),
  {
    label: 'Search',
    placeholder: 'Search documentation...',
  },
)

const emit = defineEmits<{
  open: []
}>()
</script>

<template>
  <UiButton
    variant="secondary"
    size="sm"
    class="docs-search-trigger"
    :aria-label="label"
    @click="emit('open')"
  >
    <Search class="docs-search-trigger-icon" aria-hidden="true" />
    <span class="docs-search-trigger-label">{{ placeholder }}</span>
    <span class="docs-search-trigger-keys" aria-hidden="true">
      <kbd>Ctrl</kbd>
      <kbd>K</kbd>
    </span>
  </UiButton>
</template>
