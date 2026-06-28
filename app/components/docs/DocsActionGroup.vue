<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})
</script>

<template>
  <div v-bind="$attrs" class="docs-action-group">
    <slot />
  </div>
</template>
