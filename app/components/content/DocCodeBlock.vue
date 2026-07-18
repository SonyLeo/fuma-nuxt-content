<script setup lang="ts">
import { Check, Copy } from '@lucide/vue'
import { computed, useSlots, useTemplateRef } from 'vue'
import { writeDocsClipboardText } from '~/utils/docs-clipboard'
import { createHighlightedCodeLines } from '~/utils/docs-code-highlight'

const bodyRef = useTemplateRef<HTMLElement>('body')
const slots = useSlots()

const codeBlockIcons = {
  default: {
    viewBox: '0 0 24 24',
    fill: 'currentColor',
    d: 'M6 1c-1.65 0-3 1.35-3 3v16c0 1.65 1.35 3 3 3h12c1.65 0 3-1.35 3-3V8a1 1 0 0 0-.29-.71l-5-5A1 1 0 0 0 15 1H6Zm0 2h7v3c0 1.65 1.35 3 3 3h3v11c0 .56-.44 1-1 1H6c-.56 0-1-.44-1-1V4c0-.56.44-1 1-1Zm9 .41L18.59 7H16c-.56 0-1-.44-1-1V3.41Z',
  },
  javascript: {
    viewBox: '0 0 24 24',
    fill: 'currentColor',
    d: 'M0 0h24v24H0V0Zm22.03 18.28c-.17-1.1-.89-2.02-3-2.87-.74-.35-1.56-.59-1.8-1.14-.09-.33-.1-.51-.05-.71.15-.65.92-.84 1.52-.66.39.12.75.42.98.9l1.75-1.13c-.27-.42-.4-.6-.59-.78-.63-.7-1.47-1.06-2.83-1.03l-.71.09c-.68.16-1.32.52-1.71 1-1.14 1.3-.81 3.54.57 4.47 1.37 1.02 3.36 1.24 3.62 2.21.24 1.17-.87 1.54-1.97 1.41-.81-.18-1.26-.59-1.75-1.34l-1.83 1.05c.21.48.45.69.81 1.11 1.74 1.76 6.09 1.67 6.87-1 .03-.09.24-.71.07-1.65l.05.07Zm-8.98-7.25H10.8c0 1.94-.01 3.87-.01 5.81 0 1.23.06 2.36-.14 2.71-.33.69-1.18.6-1.57.48-.39-.2-.59-.47-.83-.86-.06-.1-.11-.19-.12-.19L6.31 20.1c.3.63.75 1.17 1.32 1.52.86.51 2 .67 3.21.4.78-.22 1.45-.69 1.81-1.41.51-.93.4-2.07.4-3.35.01-2.05 0-4.11 0-6.18v-.05Z',
  },
  typescript: {
    viewBox: '0 0 24 24',
    fill: 'currentColor',
    d: 'M1.13 0h21.75C23.5 0 24 .5 24 1.13v21.75c0 .62-.5 1.12-1.12 1.12H1.13C.5 24 0 23.5 0 22.88V1.13C0 .5.5 0 1.13 0Zm17.36 9.75c.61 0 1.15.04 1.63.11.47.08.91.19 1.3.34v2.46a3.95 3.95 0 0 0-.64-.36 5.09 5.09 0 0 0-.72-.26 5.45 5.45 0 0 0-1.43-.2c-.3 0-.57.03-.82.09-.25.06-.46.14-.62.24-.17.1-.3.23-.4.37a.89.89 0 0 0-.14.49c0 .2.05.37.16.53.1.16.25.3.44.44.19.14.43.28.7.41.27.14.58.28.93.42.47.2.89.41 1.26.63.38.22.7.47.97.75.27.28.47.6.61.96.15.36.22.78.22 1.25 0 .66-.13 1.21-.38 1.66-.25.45-.58.81-1.01 1.09-.43.28-.92.47-1.49.59-.56.12-1.16.18-1.79.18-.64 0-1.25-.05-1.84-.16-.59-.1-1.09-.27-1.51-.49v-2.63a5.03 5.03 0 0 0 3.24 1.2c.33 0 .62-.03.87-.09.25-.06.46-.14.62-.25.17-.11.29-.23.38-.38a1.02 1.02 0 0 0-.08-1.09c-.13-.18-.31-.34-.54-.5-.22-.16-.49-.31-.8-.44-.31-.14-.65-.28-1.01-.44-.92-.38-1.6-.85-2.05-1.4-.45-.56-.68-1.23-.68-2.01 0-.62.12-1.14.37-1.58.25-.45.58-.81 1-1.09a4.49 4.49 0 0 1 1.47-.63c.56-.14 1.15-.21 1.77-.21Zm-15.12.19h9.56v2.16H9.51v9.65H6.79V12.1H3.38V9.94Z',
  },
  vue: {
    viewBox: '0 0 24 24',
    fill: 'currentColor',
    d: 'M24 1.61h-9.94L12 5.16 9.94 1.61H0l12 20.78L24 1.61ZM12 14.08 5.16 2.23h4.43L12 6.41l2.41-4.18h4.43L12 14.08Z',
  },
  shellscript: {
    viewBox: '0 0 24 24',
    fill: 'currentColor',
    d: 'M4 4a1 1 0 0 0-.71 1.71L8.59 11l-5.3 5.29a1 1 0 1 0 1.42 1.42l6-6a1 1 0 0 0 0-1.42l-6-6A1 1 0 0 0 4 4Zm8 14a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2h-8Z',
  },
} as const

const iconAliases: Record<string, keyof typeof codeBlockIcons> = {
  bash: 'shellscript',
  js: 'javascript',
  sh: 'shellscript',
  shell: 'shellscript',
  ts: 'typescript',
  vue: 'vue',
  zsh: 'shellscript',
}

const props = withDefaults(
  defineProps<{
    title?: string
    filename?: string
    language?: string
    icon?: string
    code?: string
    meta?: string
    allowCopy?: boolean
    keepBackground?: boolean
    dataLineNumbers?: boolean | 'true' | 'false'
    dataLineNumbersStart?: number | string
  }>(),
  {
    title: undefined,
    filename: undefined,
    language: undefined,
    icon: undefined,
    code: undefined,
    meta: undefined,
    allowCopy: true,
    keepBackground: false,
    dataLineNumbers: false,
    dataLineNumbersStart: 1,
  },
)

const displayTitle = computed(() => props.title ?? props.filename)
const hasHeader = computed(() => {
  return Boolean(displayTitle.value || slots.actions)
})
const shouldShowLineNumbers = computed(
  () => props.dataLineNumbers === true || props.dataLineNumbers === 'true',
)
const directCodeLines = computed(() => {
  return props.code
    ? createHighlightedCodeLines(props.code, props.language)
    : []
})
const lineNumberStartOffset = computed(() => {
  const value = Number(props.dataLineNumbersStart)

  return Number.isFinite(value) ? Math.max(0, value - 1) : 0
})
const rootStyle = computed(() => ({
  '--fd-line-number-start': lineNumberStartOffset.value,
}))
const resolvedIcon = computed(() => {
  const raw = props.icon ?? props.language
  const key = raw?.toLowerCase()
  const name = key ? (iconAliases[key] ?? key) : undefined

  if (name && name in codeBlockIcons) {
    return codeBlockIcons[name as keyof typeof codeBlockIcons]
  }

  return props.icon || displayTitle.value ? codeBlockIcons.default : undefined
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
  <figure
    class="fd-doc-code-block shiki not-prose"
    :class="{ 'keep-background': keepBackground }"
    dir="ltr"
    tabindex="-1"
    :data-line-numbers="shouldShowLineNumbers ? '' : undefined"
    :data-line-numbers-start="
      shouldShowLineNumbers ? dataLineNumbersStart : undefined
    "
    :style="rootStyle"
  >
    <div v-if="hasHeader" class="fd-doc-code-block-header">
      <div class="fd-doc-code-block-meta">
        <svg
          v-if="resolvedIcon"
          class="fd-doc-code-block-icon"
          :viewBox="resolvedIcon.viewBox"
          :fill="resolvedIcon.fill"
          aria-hidden="true"
        >
          <path :d="resolvedIcon.d" />
        </svg>
        <figcaption v-if="displayTitle" class="fd-doc-code-block-title">
          {{ displayTitle }}
        </figcaption>
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
          variant="ghost"
          size="icon-xs"
          class="fd-doc-code-copy"
        >
          <template #default="{ state }">
            <Check v-if="state === 'copied'" :size="16" aria-hidden="true" />
            <Copy v-else :size="16" aria-hidden="true" />
          </template>
        </DocsCopyButton>
      </div>
    </div>
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
        variant="ghost"
        size="icon-xs"
        class="fd-doc-code-copy"
      >
        <template #default="{ state }">
          <Check v-if="state === 'copied'" :size="16" aria-hidden="true" />
          <Copy v-else :size="16" aria-hidden="true" />
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
      <pre v-else-if="code" class="fd-doc-code-block-pre"><code><span
        v-for="(line, lineIndex) in directCodeLines"
        :key="line.key"
        class="line"
      ><span
        v-for="(token, tokenIndex) in line.tokens"
        :key="`${lineIndex}:${tokenIndex}:${token.text}`"
        class="fd-doc-code-token"
        :style="token.style"
      >{{ token.text }}</span></span></code></pre>
      <p v-else class="fd-doc-code-block-empty">No code provided.</p>
    </div>
  </figure>
</template>
