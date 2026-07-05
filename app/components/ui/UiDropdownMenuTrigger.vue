<script setup lang="ts">
import { injectDropdownMenuRootContext } from 'reka-ui'
import { inject } from 'vue'
import type { ComponentPublicInstance } from 'vue'
import { uiDropdownMenuKey } from '~/utils/ui-dropdown-menu'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<{
    id?: string
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
  }>(),
  {
    id: undefined,
    type: 'button',
    disabled: false,
  },
)

const menu = inject(uiDropdownMenuKey)

if (!menu) {
  throw new Error('UiDropdownMenuTrigger must be used inside UiDropdownMenu.')
}

const menuContext = menu
const rekaMenuContext = injectDropdownMenuRootContext()

function setTriggerRef(element: Element | ComponentPublicInstance | null) {
  const trigger = element instanceof HTMLElement ? element : null

  menuContext.triggerRef.value = trigger
  rekaMenuContext.triggerElement.value = trigger ?? undefined
}

function onClick(event: MouseEvent) {
  if (props.disabled || event.button !== 0 || event.ctrlKey) {
    return
  }

  menuContext.toggle()
}

function onKeydown(event: KeyboardEvent) {
  if (props.disabled || event.isComposing) {
    return
  }

  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    menuContext.toggle()
    return
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    menuContext.setOpen(true)
  }
}
</script>

<template>
  <button
    v-bind="$attrs"
    :id="id"
    :ref="setTriggerRef"
    :type="type"
    :disabled="disabled"
    aria-haspopup="menu"
    :aria-expanded="menuContext.open.value ? 'true' : 'false'"
    :aria-controls="menuContext.contentId.value"
    :data-state="menuContext.open.value ? 'open' : 'closed'"
    @click="onClick"
    @keydown="onKeydown"
  >
    <slot :open="menuContext.open.value" />
  </button>
</template>
