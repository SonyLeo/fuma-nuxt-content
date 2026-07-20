<script setup lang="ts">
import {
  ComboboxContent,
  useForwardPropsEmits,
  type ComboboxContentEmits,
  type ComboboxContentProps,
} from 'reka-ui'

defineOptions({
  inheritAttrs: false,
})

type UiComboboxContentProps = Pick<
  ComboboxContentProps,
  | 'bodyLock'
  | 'disableOutsidePointerEvents'
  | 'forceMount'
  | 'hideWhenEmpty'
  | 'position'
>

const props = withDefaults(defineProps<UiComboboxContentProps>(), {
  position: 'inline',
})
const emit = defineEmits<ComboboxContentEmits>()
const forwarded = useForwardPropsEmits(props, emit)

defineSlots<{
  default?(): unknown
}>()
</script>

<template>
  <ComboboxContent
    v-bind="{ ...forwarded, ...$attrs }"
    class="ui-combobox-content"
  >
    <slot />
  </ComboboxContent>
</template>
