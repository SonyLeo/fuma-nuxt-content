<script setup lang="ts">
import { Check, ChevronRight, Link2 } from '@lucide/vue'
import {
  computed,
  onBeforeUnmount,
  onMounted,
  useId,
  useTemplateRef,
} from 'vue'
import {
  readBooleanLike,
  resolveAccordionValue,
} from '~/utils/doc-accordion'
import { writeDocsClipboardText } from '~/utils/docs-clipboard'

const props = withDefaults(
  defineProps<{
    title: string
    id?: string
    value?: string
    defaultOpen?: boolean | 'true' | 'false'
  }>(),
  {
    id: undefined,
    value: undefined,
    defaultOpen: undefined,
  },
)

const rootRef = useTemplateRef<HTMLElement>('root')
const itemRef = useTemplateRef<{ open: () => void }>('item')
const fallbackId = useId()

const resolvedValue = computed(() =>
  resolveAccordionValue(props.title, props.value, props.id),
)
const resolvedId = computed(
  () => props.id?.trim() || `fd-doc-accordion-${fallbackId}`,
)
const triggerId = computed(() => `${resolvedId.value}-trigger`)
const panelId = computed(() => `${resolvedId.value}-panel`)
const canCopy = computed(() => Boolean(props.id?.trim()))

function open() {
  itemRef.value?.open()
}

function syncHashState() {
  if (!import.meta.client) {
    return
  }

  const hash = window.location.hash.slice(1)
  if (!hash) {
    return
  }

  const target = document.getElementById(hash)
  const containsTarget = Boolean(
    target && rootRef.value && rootRef.value.contains(target),
  )

  if (hash === resolvedId.value || containsTarget) {
    open()
  }
}

async function copyLink() {
  if (!import.meta.client || !props.id?.trim()) {
    return
  }

  const url = new URL(window.location.href)
  url.hash = resolvedId.value

  await writeDocsClipboardText(url.toString())
}

onMounted(() => {
  syncHashState()

  if (!import.meta.client) {
    return
  }

  window.addEventListener('hashchange', syncHashState)
})

onBeforeUnmount(() => {
  if (import.meta.client) {
    window.removeEventListener('hashchange', syncHashState)
  }
})
</script>

<template>
  <UiAccordionItem
    ref="item"
    v-slot="{ open: isOpen }"
    :value="resolvedValue"
    :default-open="readBooleanLike(defaultOpen, false)"
  >
    <section
      :id="resolvedId"
      ref="root"
      class="fd-doc-accordion-item"
      :data-state="isOpen ? 'open' : 'closed'"
      :data-accordion-value="resolvedValue"
    >
      <UiAccordionHeader class="fd-doc-accordion-header">
        <UiAccordionTrigger
          :id="triggerId"
          :controls="panelId"
          class="fd-doc-accordion-trigger"
        >
          <ChevronRight class="fd-doc-accordion-chevron" aria-hidden="true" />
          <span class="fd-doc-accordion-title">{{ title }}</span>
        </UiAccordionTrigger>
        <DocsCopyButton
          v-if="canCopy"
          :copy="copyLink"
          label="Copy link"
          copied-label="Link copied"
          failed-label="Copy failed"
          variant="ghost"
          size="icon"
          class="fd-doc-accordion-copy"
        >
          <template #default="{ state }">
            <Check v-if="state === 'copied'" :size="14" aria-hidden="true" />
            <Link2 v-else :size="14" aria-hidden="true" />
          </template>
        </DocsCopyButton>
      </UiAccordionHeader>
      <UiAccordionContent
        :id="panelId"
        :labelledby="triggerId"
        class="fd-doc-accordion-panel"
      >
        <div class="fd-doc-accordion-body">
          <slot />
        </div>
      </UiAccordionContent>
    </section>
  </UiAccordionItem>
</template>
