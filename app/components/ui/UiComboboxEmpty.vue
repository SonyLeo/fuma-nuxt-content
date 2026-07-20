<script setup lang="ts">
import { ComboboxEmpty } from 'reka-ui'
import type { ComboboxEmptyProps } from 'reka-ui'

defineOptions({
  inheritAttrs: false,
})

type UiComboboxEmptyProps = Pick<ComboboxEmptyProps, 'as' | 'asChild'>

const props = defineProps<UiComboboxEmptyProps>()

defineSlots<{
  default?(): unknown
}>()
</script>

<template>
  <ComboboxEmpty v-bind="{ ...props, ...$attrs }" class="ui-combobox-empty">
    <slot>No options</slot>
  </ComboboxEmpty>
</template>
