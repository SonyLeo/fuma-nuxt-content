<script setup lang="ts">
import { CollapsibleTrigger } from 'reka-ui'
import { inject } from 'vue'
import { uiCollapsibleKey } from '~/utils/ui-collapsible'

defineOptions({
  inheritAttrs: false,
})

const collapsible = inject(uiCollapsibleKey)

if (!collapsible) {
  throw new Error('UiCollapsibleTrigger must be used inside UiCollapsible.')
}

const collapsibleContext = collapsible
</script>

<template>
  <CollapsibleTrigger as-child>
  <button
    v-bind="$attrs"
    type="button"
    class="ui-collapsible-trigger"
    :aria-expanded="collapsibleContext.open.value"
    :aria-controls="collapsibleContext.contentId.value"
    :disabled="collapsibleContext.disabled.value"
    :data-state="collapsibleContext.open.value ? 'open' : 'closed'"
  >
    <slot :open="collapsibleContext.open.value" />
  </button>
  </CollapsibleTrigger>
</template>
