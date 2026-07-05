<script setup lang="ts">
import { ScrollAreaThumb } from 'reka-ui'

defineOptions({
  inheritAttrs: false,
})
</script>

<template>
  <ScrollAreaThumb v-bind="$attrs" class="ui-scroll-thumb" aria-hidden="true">
    <slot />
  </ScrollAreaThumb>
</template>
