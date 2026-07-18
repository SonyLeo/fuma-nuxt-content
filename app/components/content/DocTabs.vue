<script setup lang="ts">
import { readBooleanLike } from '~/utils/doc-accordion'

const props = withDefaults(
  defineProps<{
    defaultValue?: string
    items?: string[] | string
    defaultIndex?: number | string
    label?: string
    groupId?: string
    persist?: boolean | 'true' | 'false'
    updateAnchor?: boolean | 'true' | 'false'
  }>(),
  {
    defaultValue: undefined,
    items: undefined,
    defaultIndex: 0,
    label: undefined,
    groupId: undefined,
    persist: false,
    updateAnchor: false,
  },
)

defineOptions({
  inheritAttrs: false,
})

function parseItems(value: string[] | string | undefined) {
  if (Array.isArray(value)) {
    return value
  }

  if (!value) {
    return []
  }

  try {
    const parsed = JSON.parse(
      value.replaceAll('&quot;', '"').replaceAll('&apos;', "'"),
    )
    return Array.isArray(parsed) ? parsed.map(String) : []
  } catch {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }
}

function escapeTabValue(value: string) {
  return value.toLowerCase().replace(/\s/, '-')
}

const resolvedItems = computed(() => parseItems(props.items))
const persistState = computed(() => readBooleanLike(props.persist))
const updateAnchorState = computed(() => readBooleanLike(props.updateAnchor))
const resolvedDefaultIndex = computed(() => {
  const index = Number(props.defaultIndex)

  return Number.isFinite(index) ? index : 0
})
const resolvedDefaultValue = computed(() => {
  if (props.defaultValue) {
    return props.defaultValue
  }

  const item = resolvedItems.value[resolvedDefaultIndex.value]

  return item ? escapeTabValue(item) : ''
})
</script>

<template>
  <UiTabs
    v-bind="$attrs"
    class="fd-doc-tabs"
    :default-value="resolvedDefaultValue"
    :group-id="groupId"
    :persist="persistState"
    :update-anchor="updateAnchorState"
  >
    <UiTabsList class="fd-doc-tabs-list">
      <span v-if="label" class="fd-doc-tabs-label">{{ label }}</span>
      <UiTabsTrigger
        v-for="item in resolvedItems"
        :key="item"
        :value="escapeTabValue(item)"
        class="fd-doc-tab-trigger"
      >
        {{ item }}
      </UiTabsTrigger>
      <slot name="triggers" />
    </UiTabsList>
    <div class="fd-doc-tabs-panels">
      <slot />
    </div>
  </UiTabs>
</template>
