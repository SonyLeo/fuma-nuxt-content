<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})
</script>

<template>
  <div v-bind="$attrs" class="ui-scroll-area">
    <slot />
  </div>
</template>
