<script setup lang="ts">
import {
  TooltipRoot,
  useForwardPropsEmits,
  type TooltipRootEmits,
  type TooltipRootProps,
} from 'reka-ui'

const props = withDefaults(defineProps<TooltipRootProps>(), {
  open: undefined,
  defaultOpen: false,
  delayDuration: undefined,
  disableHoverableContent: undefined,
  disableClosingTrigger: undefined,
  disabled: undefined,
  ignoreNonKeyboardFocus: undefined,
})
const emit = defineEmits<TooltipRootEmits>()
const forwarded = useForwardPropsEmits(props, emit)

defineSlots<{
  default(props: { open: boolean }): unknown
}>()
</script>

<template>
  <TooltipRoot v-slot="{ open }" v-bind="forwarded">
    <slot :open="open" />
  </TooltipRoot>
</template>
