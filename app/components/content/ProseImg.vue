<script setup lang="ts">
withDefaults(
  defineProps<{
    src?: string
    alt?: string
    title?: string
    caption?: string
    width?: string | number
    height?: string | number
    loading?: 'eager' | 'lazy'
    zoom?: boolean
    zoomSrc?: string
  }>(),
  {
    src: undefined,
    alt: undefined,
    title: undefined,
    caption: undefined,
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
    :title="title"
    :caption="caption"
    :width="width"
    :height="height"
    :loading="loading"
    :zoom="zoom"
    :zoom-src="zoomSrc"
  />
</template>
