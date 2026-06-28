<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    code?: string
    language?: string
    filename?: string
    highlights?: Array<number | string>
    meta?: string
    class?: string
  }>(),
  {
    code: '',
    language: undefined,
    filename: undefined,
    highlights: () => [],
    meta: undefined,
    class: undefined,
  },
)

const codeMeta = computed(() => parseCodeBlockMeta(props.meta))
const displayTitle = computed(() => codeMeta.value.title ?? props.filename)
const displayMeta = computed(() => codeMeta.value.rest || undefined)
const shouldShowLineNumbers = computed(() => codeMeta.value.lineNumbers)
const lineNumbersStart = computed(() => codeMeta.value.lineNumbersStart)

function parseCodeBlockMeta(meta?: string) {
  const attributes: Record<string, string | true> = {}
  let rest = (meta ?? '').replace(
    /(^|\s)([a-zA-Z0-9_-]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s]+)))?/g,
    (match, prefix: string, name: string, doubleValue?: string, singleValue?: string, bareValue?: string) => {
      if (!['title', 'filename', 'lineNumbers'].includes(name)) {
        return match
      }

      attributes[name] = doubleValue ?? singleValue ?? bareValue ?? true

      return prefix
    },
  )

  rest = rest.replace(/\s+/g, ' ').trim()

  const lineNumbers = attributes.lineNumbers !== undefined
  const lineNumbersStart =
    typeof attributes.lineNumbers === 'string'
      ? Number(attributes.lineNumbers)
      : 1

  return {
    title:
      typeof attributes.title === 'string'
        ? attributes.title
        : typeof attributes.filename === 'string'
          ? attributes.filename
          : undefined,
    lineNumbers,
    lineNumbersStart: Number.isFinite(lineNumbersStart) ? lineNumbersStart : 1,
    rest,
  }
}
</script>

<template>
  <DocCodeBlock
    :code="props.code"
    :language="props.language"
    :icon="props.language"
    :filename="displayTitle"
    :meta="displayMeta"
    :data-line-numbers="shouldShowLineNumbers"
    :data-line-numbers-start="lineNumbersStart"
    :class="props.class"
    :data-highlights="props.highlights.join(',')"
  >
    <slot />
  </DocCodeBlock>
</template>
