<script setup lang="ts">
import { Check, Copy } from '@lucide/vue'
import { computed, useSlots, useTemplateRef } from 'vue'
import { writeDocsClipboardText } from '~/utils/docs-clipboard'

const bodyRef = useTemplateRef<HTMLElement>('body')
const slots = useSlots()

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
    displayTitle.value || props.language || props.meta || slots.actions,
  )
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

async function copyCode() {
  await writeDocsClipboardText(props.code || readRenderedCode())
}
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
        <DocsCopyButton
          v-if="allowCopy"
          :copy="copyCode"
          label="Copy Text"
          copied-label="Copied Text"
          failed-label="Copy failed"
          variant="outline"
          size="icon-sm"
          class="fd-doc-code-copy"
        >
          <template #default="{ state }">
            <Check v-if="state === 'copied'" :size="15" aria-hidden="true" />
            <Copy v-else :size="15" aria-hidden="true" />
          </template>
        </DocsCopyButton>
      </div>
    </figcaption>
    <div
      v-if="!hasHeader && allowCopy"
      class="fd-doc-code-block-floating-actions"
      data-doc-copy-ignore
    >
      <DocsCopyButton
        :copy="copyCode"
        label="Copy Text"
        copied-label="Copied Text"
        failed-label="Copy failed"
        variant="outline"
        size="icon-sm"
        class="fd-doc-code-copy"
      >
        <template #default="{ state }">
          <Check v-if="state === 'copied'" :size="15" aria-hidden="true" />
          <Copy v-else :size="15" aria-hidden="true" />
        </template>
      </DocsCopyButton>
    </div>
    <div
      ref="body"
      class="fd-doc-code-block-body"
      role="region"
      tabindex="0"
      aria-label="Code"
    >
      <slot v-if="$slots.default" />
      <pre
        v-else-if="code"
        class="fd-doc-code-block-pre"
      ><code>{{ code }}</code></pre>
      <p v-else class="fd-doc-code-block-empty">No code provided.</p>
    </div>
  </figure>
</template>
