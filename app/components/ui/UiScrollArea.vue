<script setup lang="ts">
import { ScrollAreaRoot } from 'reka-ui'

defineOptions({
  inheritAttrs: false,
})

type UiScrollAreaType = 'auto' | 'always' | 'scroll' | 'hover' | 'glimpse'

withDefaults(
  defineProps<{
    type?: UiScrollAreaType
    dir?: 'ltr' | 'rtl'
    scrollHideDelay?: number
  }>(),
  {
    type: 'hover',
    dir: undefined,
    scrollHideDelay: 600,
  },
)
</script>

<template>
  <ScrollAreaRoot
    v-bind="$attrs"
    class="ui-scroll-area"
    :type="type"
    :dir="dir"
    :scroll-hide-delay="scrollHideDelay"
  >
    <slot />
  </ScrollAreaRoot>
</template>
