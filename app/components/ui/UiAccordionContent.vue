<script setup lang="ts">
import { inject, onMounted, useTemplateRef, watch } from 'vue'
import { uiAccordionItemKey } from '~/utils/ui-accordion'

defineOptions({
  inheritAttrs: false,
})

const item = inject(uiAccordionItemKey)

if (!item) {
  throw new Error('UiAccordionContent must be used inside UiAccordionItem.')
}

const itemContext = item
const contentRef = useTemplateRef<HTMLElement>('content')

defineProps<{
  id?: string
  labelledby?: string
}>()

function syncHiddenUntilFound(open: boolean) {
  const content = contentRef.value
  if (!content) {
    return
  }

  if (open) {
    content.removeAttribute('hidden')
    return
  }

  content.setAttribute('hidden', 'until-found')
}

function onBeforeMatch() {
  if (!itemContext.open.value) {
    itemContext.toggle()
  }
}

watch(itemContext.open, syncHiddenUntilFound, {
  immediate: true,
  flush: 'post',
})

onMounted(() => {
  syncHiddenUntilFound(itemContext.open.value)
})
</script>

<template>
  <div
    v-bind="$attrs"
    :id="id ?? itemContext.contentId.value"
    ref="content"
    class="ui-accordion-content"
    :data-state="itemContext.open.value ? 'open' : 'closed'"
    role="region"
    :aria-labelledby="labelledby ?? itemContext.triggerId.value"
    @beforematch="onBeforeMatch"
  >
    <slot />
  </div>
</template>
