<script setup lang="ts">
import { computed, inject, provide, shallowRef, useId } from 'vue'
import {
  uiAccordionItemKey,
  uiAccordionKey,
} from '~/utils/ui-accordion'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<{
    value: string
    defaultOpen?: boolean
  }>(),
  {
    defaultOpen: false,
  },
)

const accordion = inject(uiAccordionKey, null)
const fallbackId = useId()
const localOpen = shallowRef(props.defaultOpen)

const itemValue = computed(() => props.value)
const isOpen = computed(() =>
  accordion ? accordion.isOpen(props.value) : localOpen.value,
)
const triggerId = computed(() => `ui-accordion-${fallbackId}-trigger`)
const contentId = computed(() => `ui-accordion-${fallbackId}-content`)

function toggle() {
  if (accordion) {
    accordion.toggle(props.value)
    return
  }

  localOpen.value = !localOpen.value
}

function open() {
  if (accordion) {
    accordion.open(props.value)
    return
  }

  localOpen.value = true
}

function close() {
  if (accordion) {
    accordion.close(props.value)
    return
  }

  localOpen.value = false
}

defineExpose({
  open,
  close,
  toggle,
})

provide(uiAccordionItemKey, {
  value: itemValue,
  open: isOpen,
  triggerId,
  contentId,
  toggle,
})
</script>

<template>
  <div
    v-bind="$attrs"
    class="ui-accordion-item"
    :data-state="isOpen ? 'open' : 'closed'"
    :data-value="value"
  >
    <slot :open="isOpen" :toggle="toggle" />
  </div>
</template>
