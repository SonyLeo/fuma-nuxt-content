<script setup lang="ts" generic="T extends AcceptableValue = AcceptableValue">
import {
  ComboboxItem,
  type AcceptableValue,
  type ComboboxItemEmits,
  type ComboboxItemProps,
} from 'reka-ui'

defineOptions({
  inheritAttrs: false,
})

type UiComboboxItemProps = Pick<
  ComboboxItemProps<T>,
  'as' | 'asChild' | 'disabled' | 'textValue' | 'value'
>

const props = defineProps<UiComboboxItemProps>()
const emit = defineEmits<ComboboxItemEmits<T>>()

defineSlots<{
  default?(): unknown
}>()
</script>

<template>
  <ComboboxItem
    v-bind="$attrs"
    class="ui-combobox-item"
    :value="props.value"
    :text-value="props.textValue"
    :disabled="props.disabled"
    :as="props.as"
    :as-child="props.asChild"
    @select="emit('select', $event)"
  >
    <slot>{{ value }}</slot>
  </ComboboxItem>
</template>
