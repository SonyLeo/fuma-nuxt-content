<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  value: string
  label: string
  trigger?: boolean | 'true' | 'false'
}>()

const isTrigger = computed(() => {
  if (typeof props.trigger === 'string') {
    return props.trigger === 'true'
  }

  return props.trigger === true
})
</script>

<template>
  <UiTabsTrigger
    v-if="isTrigger"
    :value="value"
    class="fd-doc-tab-trigger"
  >
    {{ label }}
  </UiTabsTrigger>
  <UiTabsContent
    v-else
    :value="value"
    class="fd-doc-tab-panel"
  >
    <slot />
  </UiTabsContent>
</template>
