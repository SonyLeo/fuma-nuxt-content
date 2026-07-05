<script setup lang="ts">
import { computed } from 'vue'
import { parseDocsCodeBlockMeta } from '~/utils/docs-code-meta'

const props = withDefaults(
  defineProps<{
    code?: string
    language?: string
    title?: string
    filename?: string
    icon?: string
    highlights?: Array<number | string>
    meta?: string
    keepBackground?: boolean | 'true' | 'false'
    dataLineNumbers?: boolean | 'true' | 'false'
    dataLineNumbersStart?: number | string
    class?: string
  }>(),
  {
    code: '',
    language: undefined,
    title: undefined,
    filename: undefined,
    icon: undefined,
    highlights: () => [],
    meta: undefined,
    keepBackground: false,
    dataLineNumbers: false,
    dataLineNumbersStart: undefined,
    class: undefined,
  },
)

const codeMeta = computed(() => parseDocsCodeBlockMeta(props.meta))
const displayTitle = computed(
  () => props.title ?? codeMeta.value.title ?? props.filename,
)
const displayMeta = computed(() => codeMeta.value.rest || undefined)
const shouldShowLineNumbers = computed(
  () =>
    props.dataLineNumbers === true ||
    props.dataLineNumbers === 'true' ||
    codeMeta.value.lineNumbers,
)
const lineNumbersStart = computed(() => {
  const value = Number(
    props.dataLineNumbersStart ?? codeMeta.value.lineNumbersStart,
  )

  return Number.isFinite(value) ? value : 1
})
const resolvedIcon = computed(() => props.icon ?? codeMeta.value.icon ?? props.language)
const shouldKeepBackground = computed(
  () =>
    props.keepBackground === true ||
    props.keepBackground === 'true' ||
    codeMeta.value.keepBackground,
)
</script>

<template>
  <DocCodeBlock
    :code="props.code"
    :language="props.language"
    :icon="resolvedIcon"
    :filename="displayTitle"
    :meta="displayMeta"
    :keep-background="shouldKeepBackground"
    :data-line-numbers="shouldShowLineNumbers"
    :data-line-numbers-start="lineNumbersStart"
    :class="props.class"
    :data-highlights="props.highlights.join(',')"
  >
    <pre class="fd-doc-code-block-pre shiki"><slot /></pre>
  </DocCodeBlock>
</template>
