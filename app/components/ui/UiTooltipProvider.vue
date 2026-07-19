<script setup lang="ts">
import { TooltipProvider } from 'reka-ui'
import type { TooltipProviderProps } from 'reka-ui'

const props = withDefaults(defineProps<TooltipProviderProps>(), {
  delayDuration: 400,
  skipDelayDuration: 300,
  disableHoverableContent: true,
  disableClosingTrigger: false,
  disabled: false,
  ignoreNonKeyboardFocus: true,
})

defineSlots<{
  default(): unknown
}>()
</script>

<template>
  <TooltipProvider v-bind="props">
    <slot />
  </TooltipProvider>
</template>
