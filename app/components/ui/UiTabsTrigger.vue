<script setup lang="ts">
import { computed, inject } from 'vue'
import { uiTabsKey } from '~/utils/ui-tabs'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<{
  value: string
  id?: string
  controls?: string
}>()

const tabs = inject(uiTabsKey)

if (!tabs) {
  throw new Error('UiTabsTrigger must be used inside UiTabs.')
}

const tabsContext = tabs
const isActive = computed(() => tabsContext.value.value === props.value)
const triggerId = computed(
  () => props.id ?? `${tabsContext.baseId}-trigger-${props.value}`,
)
const panelId = computed(
  () => props.controls ?? `${tabsContext.baseId}-panel-${props.value}`,
)
</script>

<template>
  <button
    v-bind="$attrs"
    :id="triggerId"
    type="button"
    class="ui-tabs-trigger"
    role="tab"
    :aria-selected="isActive"
    :aria-controls="panelId"
    :tabindex="isActive ? 0 : -1"
    :data-state="isActive ? 'active' : 'inactive'"
    @click="tabsContext.setValue(value)"
  >
    <slot :active="isActive" />
  </button>
</template>
