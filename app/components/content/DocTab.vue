<script setup lang="ts">
import { computed, inject } from 'vue'
import {
  docTabsIdKey,
  docTabsSetterKey,
  docTabsValueKey,
} from '~/utils/doc-tabs'

const props = defineProps<{
  value: string
  label: string
  trigger?: boolean | 'true' | 'false'
}>()

const activeValue = inject(docTabsValueKey)
const setActiveValue = inject(docTabsSetterKey)
const tabsId = inject(docTabsIdKey, 'fd-doc-tabs')

const isActive = computed(() => activeValue?.value === props.value)
const isTrigger = computed(() => {
  if (typeof props.trigger === 'string') {
    return props.trigger === 'true'
  }

  return props.trigger === true
})
const triggerId = computed(() => `${tabsId}-trigger-${props.value}`)
const panelId = computed(() => `${tabsId}-panel-${props.value}`)

function handleClick() {
  setActiveValue?.(props.value)
}
</script>

<template>
  <button
    v-if="isTrigger"
    :id="triggerId"
    type="button"
    class="fd-doc-tab-trigger"
    :class="{ 'is-active': isActive }"
    role="tab"
    :aria-selected="isActive"
    :aria-controls="panelId"
    @click="handleClick"
  >
    {{ label }}
  </button>
  <div
    v-else-if="isActive"
    :id="panelId"
    class="fd-doc-tab-panel"
    role="tabpanel"
    :aria-labelledby="triggerId"
  >
    <slot />
  </div>
</template>
