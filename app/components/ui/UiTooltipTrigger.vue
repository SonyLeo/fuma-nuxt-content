<script setup lang="ts">
import { TooltipTrigger } from 'reka-ui'
import type { TooltipTriggerProps } from 'reka-ui'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<TooltipTriggerProps>(), {
  as: 'button',
  asChild: true,
  reference: undefined,
})

defineSlots<{
  default(): unknown
}>()
</script>

<template>
  <TooltipTrigger v-bind="{ ...props, ...$attrs }">
    <slot />
  </TooltipTrigger>
</template>
