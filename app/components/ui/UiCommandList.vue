<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})
</script>

<template>
  <div v-bind="$attrs" class="ui-command-list">
    <slot />
  </div>
</template>
