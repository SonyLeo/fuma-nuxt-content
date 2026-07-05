<script setup lang="ts">
import { ScrollAreaScrollbar } from 'reka-ui'

defineOptions({
  inheritAttrs: false,
})

withDefaults(
  defineProps<{
    orientation?: 'vertical' | 'horizontal'
    forceMount?: boolean
  }>(),
  {
    orientation: 'vertical',
    forceMount: false,
  },
)
</script>

<template>
  <ScrollAreaScrollbar
    v-bind="$attrs"
    class="ui-scroll-bar"
    :data-orientation="orientation"
    :orientation="orientation"
    :force-mount="forceMount"
    aria-hidden="true"
  >
    <slot />
  </ScrollAreaScrollbar>
</template>
