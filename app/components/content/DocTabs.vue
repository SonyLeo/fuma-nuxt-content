<script setup lang="ts">
import { computed, provide, shallowRef } from 'vue'

const props = defineProps<{
  defaultValue: string
}>()

const activeValue = shallowRef(props.defaultValue)

provide(
  'fd-doc-tabs-value',
  computed(() => activeValue.value),
)
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
