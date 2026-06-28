<script setup lang="ts">
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
</script>

<template>
  <DocCodeBlock
    :code="props.code"
    :language="props.language"
    :filename="props.filename"
    :meta="props.meta"
    :class="props.class"
    :data-highlights="props.highlights.join(',')"
  >
    <slot />
  </DocCodeBlock>
</template>
