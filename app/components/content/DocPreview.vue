<template>
  <section class="fd-doc-preview">
    <div class="fd-doc-preview-canvas" role="region" aria-label="Preview">
      <slot v-if="$slots.preview" name="preview" />
      <p v-else class="fd-doc-preview-empty">Preview unavailable.</p>
    </div>
    <div v-if="$slots.description" class="fd-doc-preview-description">
      <slot name="description" />
    </div>
    <div v-if="$slots.source" class="fd-doc-preview-source">
      <slot name="source" />
    </div>
  </section>
</template>
