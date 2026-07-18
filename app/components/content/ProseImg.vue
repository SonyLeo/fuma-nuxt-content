<script setup lang="ts">
import { readBooleanLike } from '~/utils/doc-accordion'

const props = withDefaults(
  defineProps<{
    src?: string
    alt?: string
    title?: string
    caption?: string
    width?: string | number
    height?: string | number
    loading?: 'eager' | 'lazy'
    zoom?: boolean | 'true' | 'false'
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

const zoomState = computed(() => readBooleanLike(props.zoom, true))
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
    :zoom="zoomState"
    :zoom-src="zoomSrc"
  />
</template>
