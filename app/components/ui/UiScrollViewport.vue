<script setup lang="ts">
import { ScrollAreaViewport } from 'reka-ui'

defineOptions({
  inheritAttrs: false,
})
</script>

<template>
  <ScrollAreaViewport v-bind="$attrs" class="ui-scroll-viewport">
    <slot />
  </ScrollAreaViewport>
</template>
