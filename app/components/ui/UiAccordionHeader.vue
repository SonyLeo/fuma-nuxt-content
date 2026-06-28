<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})
</script>

<template>
  <div v-bind="$attrs" class="ui-accordion-header">
    <slot />
  </div>
</template>
