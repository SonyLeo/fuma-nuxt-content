<script setup lang="ts">
withDefaults(
  defineProps<{
    src?: string
    alt?: string
    width?: string | number
    height?: string | number
    loading?: 'eager' | 'lazy'
    zoom?: boolean
    zoomSrc?: string
  }>(),
  {
    src: undefined,
    alt: undefined,
    width: undefined,
    height: undefined,
    loading: 'lazy',
    zoom: true,
    zoomSrc: undefined,
  },
)
</script>

<template>
  <DocImageZoom
    :src="src"
    :alt="alt"
    :width="width"
    :height="height"
    :loading="loading"
    :zoom="zoom"
    :zoom-src="zoomSrc"
  />
</template>
