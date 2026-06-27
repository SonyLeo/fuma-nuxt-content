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
