<script setup lang="ts">
import { useTemplateRef } from 'vue'
import {
  ComboboxInput,
  useForwardPropsEmits,
  type ComboboxInputEmits,
  type ComboboxInputProps,
} from 'reka-ui'

defineOptions({
  inheritAttrs: false,
})

type UiComboboxInputProps = Pick<
  ComboboxInputProps,
  'as' | 'asChild' | 'autoFocus' | 'disabled' | 'displayValue' | 'modelValue'
>

const props = defineProps<UiComboboxInputProps>()
const emit = defineEmits<ComboboxInputEmits>()
const forwarded = useForwardPropsEmits(props, emit)

defineSlots<{
  default?(): unknown
}>()

const inputRef = useTemplateRef<{ $el?: HTMLInputElement }>('input')

function focus() {
  inputRef.value?.$el?.focus()
}

defineExpose({
  focus,
})
</script>

<template>
  <ComboboxInput
    ref="input"
    v-bind="{ ...forwarded, ...$attrs }"
    class="ui-combobox-input"
  >
    <slot />
  </ComboboxInput>
</template>
