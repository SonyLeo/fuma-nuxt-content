<script setup lang="ts">
defineProps<{
  defaultValue: string
}>()
</script>

<template>
  <UiTabs class="fd-doc-tabs" :default-value="defaultValue">
    <UiTabsList class="fd-doc-tabs-list">
      <slot name="triggers" />
    </UiTabsList>
    <div class="fd-doc-tabs-panels">
      <slot />
    </div>
  </UiTabs>
</template>
