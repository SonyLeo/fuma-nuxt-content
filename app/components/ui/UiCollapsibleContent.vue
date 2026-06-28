<script setup lang="ts">
import { inject } from 'vue'
import { uiCollapsibleKey } from '~/utils/ui-collapsible'

defineOptions({
  inheritAttrs: false,
})

const collapsible = inject(uiCollapsibleKey)

if (!collapsible) {
  throw new Error('UiCollapsibleContent must be used inside UiCollapsible.')
}

const collapsibleContext = collapsible
</script>

<template>
  <div
    v-bind="$attrs"
    :id="collapsibleContext.contentId.value"
    class="ui-collapsible-content"
    :data-state="collapsibleContext.open.value ? 'open' : 'closed'"
    :hidden="collapsibleContext.open.value ? undefined : 'until-found'"
  >
    <slot :open="collapsibleContext.open.value" />
  </div>
</template>
