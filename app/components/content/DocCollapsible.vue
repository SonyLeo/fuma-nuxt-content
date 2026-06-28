<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    open?: boolean
    defaultOpen?: boolean
    disabled?: boolean
  }>(),
  {
    open: undefined,
    defaultOpen: false,
    disabled: false,
  },
)

const emit = defineEmits<{
  'update:open': [value: boolean]
  openChange: [value: boolean]
}>()

const localOpen = shallowRef(props.defaultOpen)
const contentId = `fd-doc-collapsible-${useId()}`
const isOpen = computed(() => props.open ?? localOpen.value)

function setOpen(value: boolean) {
  if (props.disabled || value === isOpen.value) {
    return
  }

  if (props.open === undefined) {
    localOpen.value = value
  }

  emit('update:open', value)
  emit('openChange', value)
}

function toggle() {
  setOpen(!isOpen.value)
}
</script>

<template>
  <div
    class="fd-doc-collapsible"
    :data-open="isOpen ? 'true' : 'false'"
    :data-disabled="disabled ? 'true' : 'false'"
  >
    <slot
      :open="isOpen"
      :toggle="toggle"
      :set-open="setOpen"
      :content-id="contentId"
    />
  </div>
</template>
