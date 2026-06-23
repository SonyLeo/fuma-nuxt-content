<template>
  <section class="fd-doc-preview">
    <div class="fd-doc-preview-canvas">
      <slot name="preview" />
    </div>
    <div v-if="$slots.description" class="fd-doc-preview-description">
      <slot name="description" />
    </div>
    <div v-if="$slots.source" class="fd-doc-preview-source">
      <slot name="source" />
    </div>
  </section>
</template>

<style scoped>
.fd-doc-preview {
  margin: 1.5rem 0;
  border: 1px solid var(--docs-color-border);
  border-radius: var(--docs-radius-xl);
  background: var(--docs-color-card);
  box-shadow: var(--docs-shadow-panel);
  overflow: hidden;
}

.fd-doc-preview-canvas {
  padding: 1rem;
  background:
    radial-gradient(circle at top left, color-mix(in srgb, var(--docs-color-primary) 8%, transparent), transparent 32%),
    linear-gradient(180deg, color-mix(in srgb, var(--docs-color-bg-soft) 80%, transparent), transparent 120%);
}

.fd-doc-preview-description {
  padding: 0 1rem 1rem;
  color: var(--docs-color-text-soft);
}

.fd-doc-preview-source {
  border-top: 1px solid var(--docs-color-border);
}
</style>
