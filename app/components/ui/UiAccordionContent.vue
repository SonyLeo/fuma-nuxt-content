<script setup lang="ts">
import { inject } from 'vue'
import { uiAccordionItemKey } from '~/utils/ui-accordion'

defineOptions({
  inheritAttrs: false,
})

const item = inject(uiAccordionItemKey)

if (!item) {
  throw new Error('UiAccordionContent must be used inside UiAccordionItem.')
}

const itemContext = item

defineProps<{
  id?: string
  labelledby?: string
}>()
</script>

<template>
  <div
    v-bind="$attrs"
    :id="id ?? itemContext.contentId.value"
    class="ui-accordion-content"
    :data-state="itemContext.open.value ? 'open' : 'closed'"
    :hidden="itemContext.open.value ? undefined : 'until-found'"
    role="region"
    :aria-labelledby="labelledby ?? itemContext.triggerId.value"
  >
    <slot />
  </div>
</template>
