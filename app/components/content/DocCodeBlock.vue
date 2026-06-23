<script setup lang="ts">
defineProps<{
  title?: string
  language?: string
  code?: string
}>()
</script>

<template>
  <figure class="fd-doc-code-block">
    <figcaption v-if="title || language || $slots.actions" class="fd-doc-code-block-header">
      <div class="fd-doc-code-block-meta">
        <span v-if="title" class="fd-doc-code-block-title">{{ title }}</span>
        <span v-if="language" class="fd-doc-code-block-language">{{ language }}</span>
      </div>
      <div v-if="$slots.actions" class="fd-doc-code-block-actions">
        <slot name="actions" />
      </div>
    </figcaption>
    <div class="fd-doc-code-block-body">
      <pre v-if="code" class="fd-doc-code-block-pre"><code>{{ code }}</code></pre>
      <slot v-else />
    </div>
  </figure>
</template>

<style scoped>
.fd-doc-code-block {
  margin: 1.4rem 0;
  border: 1px solid var(--docs-color-border);
  border-radius: var(--docs-radius-xl);
  background: var(--docs-color-card);
  box-shadow: var(--docs-shadow-panel);
  overflow: hidden;
}

.fd-doc-code-block-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.8rem 0.95rem;
  border-bottom: 1px solid var(--docs-color-border);
  background: color-mix(in srgb, var(--docs-color-bg-soft) 86%, transparent);
}

.fd-doc-code-block-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.7rem;
}

.fd-doc-code-block-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--docs-color-text);
}

.fd-doc-code-block-language {
  font-family: var(--docs-font-mono);
  font-size: 0.8rem;
  color: var(--docs-color-text-soft);
}

.fd-doc-code-block-body {
  min-width: 0;
}

.fd-doc-code-block-pre {
  margin: 0;
  padding: 0.95rem 1rem 1rem;
  overflow-x: auto;
  font-family: var(--docs-font-mono);
  font-size: 0.84rem;
  line-height: 1.7;
  color: var(--docs-color-text);
  background: color-mix(in srgb, var(--docs-color-bg-soft) 86%, transparent);
}

.fd-doc-code-block-pre code {
  display: block;
  white-space: pre;
  background: transparent;
  padding: 0;
}
</style>
