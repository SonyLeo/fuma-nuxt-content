<script setup lang="ts">
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
  <button
    v-bind="$attrs"
    type="button"
    class="ui-collapsible-trigger"
    :aria-expanded="collapsibleContext.open.value"
    :aria-controls="collapsibleContext.contentId.value"
    :disabled="collapsibleContext.disabled.value"
    :data-state="collapsibleContext.open.value ? 'open' : 'closed'"
    @click="collapsibleContext.toggle"
  >
    <slot :open="collapsibleContext.open.value" />
  </button>
</template>
