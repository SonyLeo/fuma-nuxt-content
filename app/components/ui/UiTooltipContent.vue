<script setup lang="ts">
import { TooltipContent, TooltipPortal } from 'reka-ui'
import type { TooltipContentEmits, TooltipContentProps } from 'reka-ui'

defineOptions({
  inheritAttrs: false,
})

withDefaults(
  defineProps<{
    portal?: boolean
    side?: TooltipContentProps['side']
    align?: TooltipContentProps['align']
    sideOffset?: number
    alignOffset?: number
    avoidCollisions?: boolean
    collisionPadding?: TooltipContentProps['collisionPadding']
    forceMount?: boolean
    ariaLabel?: string
  }>(),
  {
    portal: true,
    side: 'top',
    align: 'center',
    sideOffset: 8,
    alignOffset: 0,
    avoidCollisions: true,
    collisionPadding: 8,
    forceMount: undefined,
    ariaLabel: undefined,
  },
)

const emit = defineEmits<TooltipContentEmits>()

defineSlots<{
  default(): unknown
}>()
</script>

<template>
  <TooltipPortal :disabled="!portal">
    <TooltipContent
      v-bind="$attrs"
      class="ui-tooltip-content"
      :side="side"
      :align="align"
      :side-offset="sideOffset"
      :align-offset="alignOffset"
      :avoid-collisions="avoidCollisions"
      :collision-padding="collisionPadding"
      :force-mount="forceMount"
      :aria-label="ariaLabel"
      @escape-key-down="emit('escapeKeyDown', $event)"
      @pointer-down-outside="emit('pointerDownOutside', $event)"
    >
      <slot />
    </TooltipContent>
  </TooltipPortal>
</template>
