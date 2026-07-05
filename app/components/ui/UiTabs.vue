<script setup lang="ts">
import { TabsRoot } from 'reka-ui'
import { computed, onMounted, provide, shallowRef, useId } from 'vue'
import { uiTabsKey } from '~/utils/ui-tabs'

const props = withDefaults(
  defineProps<{
    value?: string
    defaultValue?: string
    groupId?: string
    persist?: boolean
    updateAnchor?: boolean
  }>(),
  {
    value: undefined,
    defaultValue: '',
    groupId: undefined,
    persist: false,
    updateAnchor: false,
  },
)

const emit = defineEmits<{
  'update:value': [value: string]
}>()

const fallbackId = useId()
const internalValue = shallowRef(props.defaultValue)
const valueToId = new Map<string, string>()

const isControlled = computed(() => props.value !== undefined)
const activeValue = computed({
  get: () => (isControlled.value ? props.value ?? '' : internalValue.value),
  set: (value: string) => setValue(value),
})
const updateAnchor = computed(() => props.updateAnchor)

function setValue(value: string) {
  if (!isControlled.value) {
    internalValue.value = value
  }

  if (props.updateAnchor && import.meta.client) {
    const id = valueToId.get(value)
    if (id) {
      window.history.replaceState(null, '', `#${id}`)
    }
  }

  if (props.groupId && import.meta.client) {
    sessionStorage.setItem(props.groupId, value)
    if (props.persist) {
      localStorage.setItem(props.groupId, value)
    }
  }

  emit('update:value', value)
}

function registerContent(value: string, id: string) {
  valueToId.set(value, id)
}

onMounted(() => {
  if (!props.groupId) {
    return
  }

  let stored = sessionStorage.getItem(props.groupId)
  if (!stored && props.persist) {
    stored = localStorage.getItem(props.groupId)
  }

  if (stored) {
    setValue(stored)
  }
})

provide(uiTabsKey, {
  value: activeValue,
  baseId: `ui-tabs-${fallbackId}`,
  updateAnchor,
  setValue,
  registerContent,
})
</script>

<template>
  <TabsRoot
    v-model="activeValue"
    :unmount-on-hide="false"
    as-child
  >
  <div class="ui-tabs" :data-value="activeValue">
    <slot :value="activeValue" />
  </div>
  </TabsRoot>
</template>
