<script setup lang="ts">
import { computed, inject, onMounted } from 'vue'
import { uiTabsKey } from '~/utils/ui-tabs'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<{
  value: string
  id?: string
  labelledby?: string
}>()

const tabs = inject(uiTabsKey)

if (!tabs) {
  throw new Error('UiTabsContent must be used inside UiTabs.')
}

const tabsContext = tabs
const isActive = computed(() => tabsContext.value.value === props.value)
const panelId = computed(
  () => props.id ?? `${tabsContext.baseId}-panel-${props.value}`,
)
const triggerId = computed(
  () => props.labelledby ?? `${tabsContext.baseId}-trigger-${props.value}`,
)

onMounted(() => {
  tabsContext.registerContent(props.value, panelId.value)
})
</script>

<template>
  <div
    v-bind="$attrs"
    :id="panelId"
    class="ui-tabs-content"
    role="tabpanel"
    :aria-labelledby="triggerId"
    :data-state="isActive ? 'active' : 'inactive'"
    :hidden="!isActive"
  >
    <slot />
  </div>
</template>
