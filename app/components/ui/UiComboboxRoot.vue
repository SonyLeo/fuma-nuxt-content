<script setup lang="ts" generic="T extends AcceptableValue = AcceptableValue">
import {
  ComboboxRoot,
  useForwardPropsEmits,
  type AcceptableValue,
  type ComboboxRootEmits,
  type ComboboxRootProps,
} from 'reka-ui'

defineOptions({
  inheritAttrs: false,
})

type UiComboboxRootProps = Pick<
  ComboboxRootProps<T>,
  'as' | 'asChild' | 'by' | 'disabled' | 'highlightOnHover' | 'ignoreFilter'
> & {
  open?: boolean
  defaultOpen?: boolean
  modelValue?: T
  defaultValue?: T
}

const props = defineProps<UiComboboxRootProps>()
const emit = defineEmits<ComboboxRootEmits<T>>()
const forwarded = useForwardPropsEmits(props, emit)

defineSlots<{
  default?(props: { open: boolean; modelValue: T | T[] | undefined }): unknown
}>()
</script>

<template>
  <ComboboxRoot
    v-slot="{ open: currentOpen, modelValue: currentModelValue }"
    v-bind="{ ...forwarded, ...$attrs }"
    class="ui-combobox-root"
  >
    <slot :open="currentOpen" :model-value="currentModelValue" />
  </ComboboxRoot>
</template>
