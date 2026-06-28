<script setup lang="ts">
import { computed, provide, shallowRef, watch } from 'vue'
import {
  docAccordionKey,
  normalizeAccordionType,
  normalizeAccordionValues,
  readBooleanLike,
  type DocAccordionType,
} from '~/utils/doc-accordion'

const props = withDefaults(
  defineProps<{
    type?: DocAccordionType
    defaultValue?: string | string[]
    collapsible?: boolean | 'true' | 'false'
  }>(),
  {
    type: 'multiple',
    defaultValue: undefined,
    collapsible: true,
  },
)

const accordionType = computed(() => normalizeAccordionType(props.type))
const canCollapse = computed(() => readBooleanLike(props.collapsible, true))
const openValues = shallowRef(
  normalizeAccordionValues(accordionType.value, props.defaultValue),
)

watch(accordionType, (type) => {
  openValues.value = normalizeAccordionValues(type, openValues.value)
})

watch(
  () => props.defaultValue,
  (value) => {
    openValues.value = normalizeAccordionValues(accordionType.value, value)
  },
)

function isOpen(value: string) {
  return openValues.value.includes(value)
}

function open(value: string) {
  if (accordionType.value === 'single') {
    openValues.value = [value]
    return
  }

  if (!openValues.value.includes(value)) {
    openValues.value = [...openValues.value, value]
  }
}

function close(value: string) {
  if (accordionType.value === 'single' && !canCollapse.value) {
    return
  }

  openValues.value = openValues.value.filter((item) => item !== value)
}

function toggle(value: string) {
  if (isOpen(value)) {
    close(value)
    return
  }

  open(value)
}

provide(docAccordionKey, {
  isOpen,
  open,
  close,
  toggle,
})
</script>

<template>
  <div class="fd-doc-accordions" :data-type="accordionType">
    <slot />
  </div>
</template>
