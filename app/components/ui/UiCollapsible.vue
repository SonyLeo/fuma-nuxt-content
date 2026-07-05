<script setup lang="ts">
import { CollapsibleRoot } from 'reka-ui'
import {
  computed,
  onBeforeUnmount,
  onMounted,
  provide,
  shallowRef,
  useId,
  useTemplateRef,
} from 'vue'
import { uiCollapsibleKey } from '~/utils/ui-collapsible'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<{
    open?: boolean
    defaultOpen?: boolean
    disabled?: boolean
    contentId?: string
    closeOnEscape?: boolean
    closeOnOutside?: boolean
  }>(),
  {
    open: undefined,
    defaultOpen: false,
    disabled: false,
    contentId: undefined,
    closeOnEscape: false,
    closeOnOutside: false,
  },
)

const emit = defineEmits<{
  'update:open': [open: boolean]
}>()

const fallbackId = useId()
const rootRef = useTemplateRef<HTMLElement>('root')
const localOpen = shallowRef(props.defaultOpen)
const disabledState = computed(() => props.disabled)
const isControlled = computed(() => props.open !== undefined)
const openState = computed({
  get: () => (isControlled.value ? props.open === true : localOpen.value),
  set: (value: boolean) => setOpen(value),
})
const contentId = computed(() => props.contentId ?? `ui-collapsible-${fallbackId}`)

function setOpen(open: boolean) {
  if (props.disabled || open === openState.value) {
    return
  }

  if (!isControlled.value) {
    localOpen.value = open
  }

  emit('update:open', open)
}

function toggle() {
  setOpen(!openState.value)
}

function onWindowClick(event: MouseEvent) {
  if (
    !props.closeOnOutside ||
    !openState.value ||
    !(event.target instanceof Node)
  ) {
    return
  }

  if (!rootRef.value?.contains(event.target)) {
    setOpen(false)
  }
}

function onWindowKeydown(event: KeyboardEvent) {
  if (!props.closeOnEscape || !openState.value || event.key !== 'Escape') {
    return
  }

  event.preventDefault()
  setOpen(false)
}

onMounted(() => {
  if (props.closeOnOutside) {
    window.addEventListener('click', onWindowClick)
  }

  if (props.closeOnEscape) {
    window.addEventListener('keydown', onWindowKeydown)
  }
})

onBeforeUnmount(() => {
  if (props.closeOnOutside) {
    window.removeEventListener('click', onWindowClick)
  }

  if (props.closeOnEscape) {
    window.removeEventListener('keydown', onWindowKeydown)
  }
})

provide(uiCollapsibleKey, {
  open: openState,
  disabled: disabledState,
  contentId,
  setOpen,
  toggle,
})
</script>

<template>
  <CollapsibleRoot
    v-model:open="openState"
    :disabled="disabledState"
    :unmount-on-hide="false"
    as-child
  >
    <div
      ref="root"
      v-bind="$attrs"
      class="ui-collapsible"
      :data-state="openState ? 'open' : 'closed'"
      :data-open="openState ? 'true' : 'false'"
      :data-disabled="disabled ? 'true' : undefined"
    >
      <slot
        :open="openState"
        :toggle="toggle"
        :set-open="setOpen"
        :content-id="contentId"
      />
    </div>
  </CollapsibleRoot>
</template>
