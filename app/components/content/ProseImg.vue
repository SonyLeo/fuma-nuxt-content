<script setup lang="ts">
defineProps<{
  src?: string
  alt?: string
  width?: string | number
  height?: string | number
}>()
</script>

<template>
  <figure class="fd-doc-image">
    <img :src="src" :alt="alt ?? ''" :width="width" :height="height" />
    <figcaption v-if="alt">{{ alt }}</figcaption>
  </figure>
</template>
