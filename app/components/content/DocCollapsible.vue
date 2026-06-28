<script setup lang="ts">
import { readBooleanLike } from '~/utils/doc-accordion'

const props = withDefaults(
  defineProps<{
    open?: boolean | 'true' | 'false'
    defaultOpen?: boolean | 'true' | 'false'
    disabled?: boolean | 'true' | 'false'
  }>(),
  {
    open: undefined,
    defaultOpen: false,
    disabled: false,
  },
)
const openState = computed(() =>
  props.open === undefined ? undefined : readBooleanLike(props.open),
)
const defaultOpenState = computed(() => readBooleanLike(props.defaultOpen))
const disabledState = computed(() => readBooleanLike(props.disabled))

const emit = defineEmits<{
  'update:open': [value: boolean]
  openChange: [value: boolean]
}>()

function emitOpenChange(value: boolean) {
  emit('update:open', value)
  emit('openChange', value)
}
</script>

<template>
  <UiCollapsible
    class="fd-doc-collapsible"
    :open="openState"
    :default-open="defaultOpenState"
    :disabled="disabledState"
    :data-disabled="disabledState ? 'true' : 'false'"
    @update:open="emitOpenChange"
  >
    <template #default="{ open: slotOpen, toggle, setOpen, contentId }">
      <slot
        :open="slotOpen"
        :toggle="toggle"
        :set-open="setOpen"
        :content-id="contentId"
      />
    </template>
  </UiCollapsible>
</template>
