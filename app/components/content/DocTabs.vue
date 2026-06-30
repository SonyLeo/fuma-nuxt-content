<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

defineProps<{
  defaultValue: string
}>()
</script>

<template>
  <UiTabs v-bind="$attrs" class="fd-doc-tabs" :default-value="defaultValue">
    <UiTabsList class="fd-doc-tabs-list">
      <slot name="triggers" />
    </UiTabsList>
    <div class="fd-doc-tabs-panels">
      <slot />
    </div>
  </UiTabs>
</template>
