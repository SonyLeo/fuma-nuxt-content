<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

function onKeydown(event: KeyboardEvent) {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
    return
  }

  const list = event.currentTarget
  if (!(list instanceof HTMLElement)) {
    return
  }

  const tabs = Array.from(
    list.querySelectorAll<HTMLButtonElement>('[role="tab"]:not(:disabled)'),
  )
  const currentIndex = tabs.findIndex((tab) => tab === document.activeElement)

  if (tabs.length === 0) {
    return
  }

  event.preventDefault()

  if (event.key === 'Home') {
    tabs[0]?.focus()
    tabs[0]?.click()
    return
  }

  if (event.key === 'End') {
    tabs.at(-1)?.focus()
    tabs.at(-1)?.click()
    return
  }

  const direction = event.key === 'ArrowRight' ? 1 : -1
  const nextIndex = (currentIndex + direction + tabs.length) % tabs.length
  tabs[nextIndex]?.focus()
  tabs[nextIndex]?.click()
}
</script>

<template>
  <div v-bind="$attrs" class="ui-tabs-list" role="tablist" @keydown="onKeydown">
    <slot />
  </div>
</template>
