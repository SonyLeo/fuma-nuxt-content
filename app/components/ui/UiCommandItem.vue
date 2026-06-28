<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

withDefaults(
  defineProps<{
    active?: boolean
  }>(),
  {
    active: false,
  },
)
</script>

<template>
  <div
    v-bind="$attrs"
    class="ui-command-item"
    :data-active="active ? 'true' : undefined"
    :aria-selected="active"
  >
    <slot />
  </div>
</template>
