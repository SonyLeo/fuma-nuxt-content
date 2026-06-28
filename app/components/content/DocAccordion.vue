<script setup lang="ts">
import { Check, ChevronRight, Link2 } from '@lucide/vue'
import {
  computed,
  inject,
  onBeforeUnmount,
  onMounted,
  shallowRef,
  useId,
  useTemplateRef,
} from 'vue'
import {
  docAccordionKey,
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

const accordion = inject(docAccordionKey, null)
const rootRef = useTemplateRef<HTMLElement>('root')
const localOpen = shallowRef(false)
const copied = shallowRef(false)
const fallbackId = useId()
let copyResetTimer: ReturnType<typeof setTimeout> | undefined

const resolvedValue = computed(() =>
  resolveAccordionValue(props.title, props.value, props.id),
)
const resolvedId = computed(
  () => props.id?.trim() || `fd-doc-accordion-${fallbackId}`,
)
const triggerId = computed(() => `${resolvedId.value}-trigger`)
const panelId = computed(() => `${resolvedId.value}-panel`)
const canCopy = computed(() => Boolean(props.id?.trim()))
const isOpen = computed(() =>
  accordion ? accordion.isOpen(resolvedValue.value) : localOpen.value,
)

function open() {
  if (accordion) {
    accordion.open(resolvedValue.value)
    return
  }

  localOpen.value = true
}

function toggle() {
  if (accordion) {
    accordion.toggle(resolvedValue.value)
    return
  }

  localOpen.value = !localOpen.value
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

  try {
    await writeDocsClipboardText(url.toString())
    copied.value = true
  } catch {
    copied.value = false
  }

  if (copyResetTimer) {
    clearTimeout(copyResetTimer)
  }

  copyResetTimer = setTimeout(() => {
    copied.value = false
  }, 1500)
}

onMounted(() => {
  if (!accordion) {
    localOpen.value = readBooleanLike(props.defaultOpen, false)
  }

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

  if (copyResetTimer) {
    clearTimeout(copyResetTimer)
  }
})
</script>

<template>
  <section
    :id="resolvedId"
    ref="root"
    class="fd-doc-accordion-item"
    :data-state="isOpen ? 'open' : 'closed'"
    :data-accordion-value="resolvedValue"
  >
    <div class="fd-doc-accordion-header">
      <button
        :id="triggerId"
        type="button"
        class="fd-doc-accordion-trigger"
        :aria-expanded="isOpen"
        :aria-controls="panelId"
        @click="toggle"
      >
        <ChevronRight class="fd-doc-accordion-chevron" aria-hidden="true" />
        <span class="fd-doc-accordion-title">{{ title }}</span>
      </button>
      <button
        v-if="canCopy"
        type="button"
        class="fd-doc-accordion-copy"
        :aria-label="copied ? 'Link copied' : 'Copy link'"
        @click="copyLink"
      >
        <Check v-if="copied" :size="14" aria-hidden="true" />
        <Link2 v-else :size="14" aria-hidden="true" />
      </button>
    </div>
    <div
      :id="panelId"
      class="fd-doc-accordion-panel"
      :data-state="isOpen ? 'open' : 'closed'"
      :hidden="isOpen ? undefined : 'until-found'"
      role="region"
      :aria-labelledby="triggerId"
    >
      <div class="fd-doc-accordion-body">
        <slot />
      </div>
    </div>
  </section>
</template>
