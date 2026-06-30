<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'frame' | 'sandbox'
    label?: string
    description?: string
    sourceCode?: string
    sourceTitle?: string
    sourceLanguage?: string
  }>(),
  {
    variant: 'frame',
    label: 'Preview',
    description: undefined,
    sourceCode: undefined,
    sourceTitle: undefined,
    sourceLanguage: 'vue',
  },
)
</script>

<template>
  <section class="fd-doc-preview" :class="`is-${variant}`">
    <div class="fd-doc-preview-canvas" role="region" :aria-label="label">
      <slot v-if="$slots.preview" name="preview" />
      <p v-else class="fd-doc-preview-empty">Preview unavailable.</p>
    </div>
    <div
      v-if="$slots.description || description"
      class="fd-doc-preview-description"
    >
      <slot name="description">{{ description }}</slot>
    </div>
    <div v-if="$slots.source || sourceCode" class="fd-doc-preview-source">
      <slot name="source">
        <DocCodeBlock
          :title="sourceTitle"
          :language="sourceLanguage"
          :code="sourceCode"
        />
      </slot>
    </div>
  </section>
</template>
