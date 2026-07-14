<script setup lang="ts">
import { TabsRoot } from 'reka-ui'
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  provide,
  shallowRef,
  useId,
  watch,
} from 'vue'
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
const groupEventName = 'docs-tabs-group-change'
type ValueProvenance = 'direct' | 'peer' | 'restore'
let isMounted = false
let isSubscribed = false

const isControlled = computed(() => props.value !== undefined)
const activeValue = computed({
  get: () => (isControlled.value ? (props.value ?? '') : internalValue.value),
  set: (value: string) => setValue(value),
})
const updateAnchor = computed(() => props.updateAnchor)

function applyValue(value: string, provenance: ValueProvenance) {
  if (!isControlled.value) {
    internalValue.value = value
  }

  if (provenance === 'direct' && props.updateAnchor && import.meta.client) {
    const id = valueToId.get(value)
    if (id) {
      window.history.replaceState(null, '', `#${id}`)
    }
  }

  if (provenance === 'direct' && props.groupId && import.meta.client) {
    try {
      sessionStorage.setItem(props.groupId, value)
      if (props.persist) {
        localStorage.setItem(props.groupId, value)
      }
    } catch {
      // Storage can be unavailable in private or hardened browser contexts.
    }

    window.dispatchEvent(
      new CustomEvent(groupEventName, {
        detail: { groupId: props.groupId, sourceId: fallbackId, value },
      }),
    )
  }

  emit('update:value', value)
}

function setValue(value: string) {
  applyValue(value, 'direct')
}

function registerContent(value: string, id: string) {
  valueToId.set(value, id)
}

function queueRestore(groupId: string) {
  try {
    let stored = sessionStorage.getItem(groupId)
    if (stored === null && props.persist) {
      stored = localStorage.getItem(groupId)
    }

    if (stored !== null) {
      applyValue(stored, 'restore')
    }
  } catch {
    // Storage can be unavailable in private or hardened browser contexts.
  }
}

function handleGroupChange(event: Event) {
  const detail = (event as CustomEvent).detail as
    | { groupId?: string; sourceId?: string; value?: string }
    | undefined

  if (!detail) {
    return
  }

  if (
    detail.groupId === props.groupId &&
    detail.sourceId !== fallbackId &&
    detail.value &&
    valueToId.has(detail.value)
  ) {
    applyValue(detail.value, 'peer')
  }
}

function subscribeToGroup() {
  if (!isSubscribed) {
    window.addEventListener(groupEventName, handleGroupChange)
    isSubscribed = true
  }
}

function unsubscribeFromGroup() {
  if (isSubscribed) {
    window.removeEventListener(groupEventName, handleGroupChange)
    isSubscribed = false
  }
}

watch(
  () => props.groupId,
  (groupId) => {
    if (!import.meta.client) {
      return
    }

    if (!isMounted) {
      return
    }

    unsubscribeFromGroup()
    if (!groupId) {
      return
    }

    subscribeToGroup()
    nextTick(() => queueRestore(groupId))
  },
  { immediate: true },
)

onMounted(() => {
  isMounted = true
  const groupId = props.groupId
  if (!groupId) {
    return
  }

  subscribeToGroup()
  nextTick(() => queueRestore(groupId))
})

onBeforeUnmount(() => {
  if (import.meta.client) {
    unsubscribeFromGroup()
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
  <TabsRoot v-model="activeValue" :unmount-on-hide="false" as-child>
    <div class="ui-tabs" :data-value="activeValue">
      <slot :value="activeValue" />
    </div>
  </TabsRoot>
</template>
