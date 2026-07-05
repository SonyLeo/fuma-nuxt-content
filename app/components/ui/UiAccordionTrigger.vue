<script setup lang="ts">
import { AccordionTrigger } from 'reka-ui'
import { inject } from 'vue'
import { uiAccordionItemKey } from '~/utils/ui-accordion'

defineOptions({
  inheritAttrs: false,
})

const item = inject(uiAccordionItemKey)

if (!item) {
  throw new Error('UiAccordionTrigger must be used inside UiAccordionItem.')
}

const itemContext = item

defineProps<{
  id?: string
  controls?: string
}>()
</script>

<template>
  <AccordionTrigger v-if="itemContext.rekaEnabled.value" as-child>
  <button
    v-bind="$attrs"
    :id="id ?? itemContext.triggerId.value"
    type="button"
    class="ui-accordion-trigger"
    :aria-expanded="itemContext.open.value"
    :aria-controls="controls ?? itemContext.contentId.value"
    :data-state="itemContext.open.value ? 'open' : 'closed'"
  >
    <slot :open="itemContext.open.value" />
  </button>
  </AccordionTrigger>

  <button
    v-else
    v-bind="$attrs"
    :id="id ?? itemContext.triggerId.value"
    type="button"
    class="ui-accordion-trigger"
    :aria-expanded="itemContext.open.value"
    :aria-controls="controls ?? itemContext.contentId.value"
    :data-state="itemContext.open.value ? 'open' : 'closed'"
    @click="itemContext.toggle"
  >
    <slot :open="itemContext.open.value" />
  </button>
</template>
