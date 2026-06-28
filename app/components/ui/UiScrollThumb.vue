<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})
</script>

<template>
  <div v-bind="$attrs" class="ui-scroll-thumb" aria-hidden="true" />
</template>
