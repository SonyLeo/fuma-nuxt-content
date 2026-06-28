<script setup lang="ts">
import { Check, Copy } from '@lucide/vue'
import {
  computed,
  onBeforeUnmount,
  shallowRef,
  useSlots,
  useTemplateRef,
} from 'vue'
import { writeDocsClipboardText } from '~/utils/docs-clipboard'

type CopyState = 'idle' | 'copied' | 'failed'

const bodyRef = useTemplateRef<HTMLElement>('body')
const slots = useSlots()
const copyState = shallowRef<CopyState>('idle')
let resetTimer: ReturnType<typeof setTimeout> | undefined

const props = withDefaults(
  defineProps<{
    title?: string
    filename?: string
    language?: string
    code?: string
    meta?: string
    allowCopy?: boolean
  }>(),
  {
    title: undefined,
    filename: undefined,
    language: undefined,
    code: undefined,
    meta: undefined,
    allowCopy: true,
  },
)

const displayTitle = computed(() => props.title ?? props.filename)
const hasHeader = computed(() => {
  return Boolean(
    displayTitle.value ||
    props.language ||
    props.meta ||
    slots.actions ||
    props.allowCopy,
  )
})
const copyLabel = computed(() => {
  if (copyState.value === 'copied') {
    return 'Code copied'
  }

  if (copyState.value === 'failed') {
    return 'Copy failed'
  }

  return 'Copy code'
})

function readRenderedCode() {
  const container = bodyRef.value
  if (!container) {
    return ''
  }

  const clone = container.cloneNode(true) as HTMLElement
  clone.querySelectorAll('[data-doc-copy-ignore]').forEach((node) => {
    node.remove()
  })

  return clone.textContent?.trimEnd() ?? ''
}

function scheduleReset() {
  if (resetTimer) {
    clearTimeout(resetTimer)
  }

  resetTimer = setTimeout(() => {
    copyState.value = 'idle'
  }, 1800)
}

async function copyCode() {
  try {
    await writeDocsClipboardText(props.code || readRenderedCode())
    copyState.value = 'copied'
  } catch {
    copyState.value = 'failed'
  } finally {
    scheduleReset()
  }
}

onBeforeUnmount(() => {
  if (resetTimer) {
    clearTimeout(resetTimer)
  }
})
</script>

<template>
  <figure class="fd-doc-code-block">
    <figcaption v-if="hasHeader" class="fd-doc-code-block-header">
      <div class="fd-doc-code-block-meta">
        <span v-if="displayTitle" class="fd-doc-code-block-title">
          {{ displayTitle }}
        </span>
        <span v-if="language" class="fd-doc-code-block-language">
          {{ language }}
        </span>
        <span v-if="meta" class="fd-doc-code-block-language">
          {{ meta }}
        </span>
      </div>
      <div
        v-if="$slots.actions || allowCopy"
        class="fd-doc-code-block-actions"
        data-doc-copy-ignore
      >
        <slot name="actions" />
        <button
          v-if="allowCopy"
          type="button"
          class="fd-doc-code-copy"
          :aria-label="copyLabel"
          @click="copyCode"
        >
          <Check v-if="copyState === 'copied'" :size="15" aria-hidden="true" />
          <Copy v-else :size="15" aria-hidden="true" />
        </button>
      </div>
    </figcaption>
    <div ref="body" class="fd-doc-code-block-body">
      <slot v-if="$slots.default" />
      <pre
        v-else-if="code"
        class="fd-doc-code-block-pre"
      ><code>{{ code }}</code></pre>
      <p v-else class="fd-doc-code-block-empty">No code provided.</p>
    </div>
  </figure>
</template>
