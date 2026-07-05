<script setup lang="ts">
import { DropdownMenuItem } from 'reka-ui'

defineOptions({
  inheritAttrs: false,
})

withDefaults(
  defineProps<{
    asChild?: boolean
    disabled?: boolean
    textValue?: string
  }>(),
  {
    asChild: false,
    disabled: false,
    textValue: undefined,
  },
)

const emit = defineEmits<{
  select: [event: Event]
}>()
</script>

<template>
  <DropdownMenuItem
    v-if="asChild"
    as-child
    :disabled="disabled"
    :text-value="textValue"
    @select="emit('select', $event)"
  >
    <slot />
  </DropdownMenuItem>

  <DropdownMenuItem
    v-else
    as-child
    :disabled="disabled"
    :text-value="textValue"
    @select="emit('select', $event)"
  >
    <div v-bind="$attrs">
      <slot />
    </div>
  </DropdownMenuItem>
</template>
