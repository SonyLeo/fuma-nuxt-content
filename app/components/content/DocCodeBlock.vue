<script setup lang="ts">
defineProps<{
  title?: string
  language?: string
  code?: string
}>()
</script>

<template>
  <figure class="fd-doc-code-block">
    <figcaption
      v-if="title || language || $slots.actions"
      class="fd-doc-code-block-header"
    >
      <div class="fd-doc-code-block-meta">
        <span v-if="title" class="fd-doc-code-block-title">{{ title }}</span>
        <span v-if="language" class="fd-doc-code-block-language">{{
          language
        }}</span>
      </div>
      <div v-if="$slots.actions" class="fd-doc-code-block-actions">
        <slot name="actions" />
      </div>
    </figcaption>
    <div class="fd-doc-code-block-body">
      <pre
        v-if="code"
        class="fd-doc-code-block-pre"
      ><code>{{ code }}</code></pre>
      <slot v-else />
    </div>
  </figure>
</template>
