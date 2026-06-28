<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

withDefaults(
  defineProps<{
    orientation?: 'vertical' | 'horizontal'
  }>(),
  {
    orientation: 'vertical',
  },
)
</script>

<template>
  <div
    v-bind="$attrs"
    class="ui-scroll-bar"
    :data-orientation="orientation"
    aria-hidden="true"
  >
    <slot />
  </div>
</template>
