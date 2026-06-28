<script setup lang="ts">
import { computed, provide, shallowRef, watch } from 'vue'
import {
  type UiAccordionType,
  uiAccordionKey,
} from '~/utils/ui-accordion'

const props = withDefaults(
  defineProps<{
    type?: UiAccordionType
    value?: string | string[]
    defaultValue?: string | string[]
    collapsible?: boolean
  }>(),
  {
    type: 'multiple',
    value: undefined,
    defaultValue: undefined,
    collapsible: true,
  },
)

const emit = defineEmits<{
  'update:value': [value: string | string[]]
}>()

function normalize(value?: string | string[]) {
  const values = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(',')
      : []

  return values.map((item) => item.trim()).filter(Boolean)
}

const internalValues = shallowRef(normalize(props.defaultValue))
const isControlled = computed(() => props.value !== undefined)
const type = computed(() => props.type)
const collapsible = computed(() => props.collapsible)
const openValues = computed(() =>
  isControlled.value ? normalize(props.value) : internalValues.value,
)

watch(type, (nextType) => {
  if (nextType === 'single' && openValues.value.length > 1) {
    setValues(openValues.value.slice(0, 1))
  }
})

function setValues(values: string[]) {
  const nextValues = props.type === 'single' ? values.slice(0, 1) : values

  if (!isControlled.value) {
    internalValues.value = nextValues
  }

  emit('update:value', props.type === 'single' ? nextValues[0] ?? '' : nextValues)
}

function isOpen(value: string) {
  return openValues.value.includes(value)
}

function open(value: string) {
  if (props.type === 'single') {
    setValues([value])
    return
  }

  if (!isOpen(value)) {
    setValues([...openValues.value, value])
  }
}

function close(value: string) {
  if (props.type === 'single' && !props.collapsible) {
    return
  }

  setValues(openValues.value.filter((item) => item !== value))
}

function toggle(value: string) {
  if (isOpen(value)) {
    close(value)
    return
  }

  open(value)
}

provide(uiAccordionKey, {
  type,
  collapsible,
  isOpen,
  open,
  close,
  toggle,
})
</script>

<template>
  <div class="ui-accordion" :data-type="type">
    <slot />
  </div>
</template>
