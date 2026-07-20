<script setup lang="ts">
import { ComboboxViewport } from 'reka-ui'
import type { ComboboxViewportProps } from 'reka-ui'

defineOptions({
  inheritAttrs: false,
})

type UiComboboxViewportProps = Pick<
  ComboboxViewportProps,
  'as' | 'asChild' | 'nonce'
>

const props = defineProps<UiComboboxViewportProps>()

defineSlots<{
  default?(): unknown
}>()
</script>

<template>
  <ComboboxViewport
    v-bind="{ ...props, ...$attrs }"
    class="ui-combobox-viewport"
  >
    <slot />
  </ComboboxViewport>
</template>
