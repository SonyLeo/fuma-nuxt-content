<script setup lang="ts">
const count = shallowRef(0)
</script>

<template>
  <div class="preview-counter">
    <p class="preview-counter-label">Preview Counter</p>
    <p class="preview-counter-value">{{ count }}</p>
    <button class="preview-counter-button" type="button" @click="count += 1">
      Increment
    </button>
  </div>
</template>

<style scoped>
.preview-counter {
  display: inline-flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  border: 1px solid var(--docs-color-border-strong);
  border-radius: var(--docs-radius-lg);
  background: var(--docs-color-card);
  color: var(--docs-color-card-foreground);
}

.preview-counter-label {
  margin: 0;
  font-size: 0.875rem;
  color: var(--docs-color-muted-foreground);
}

.preview-counter-value {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1;
  color: var(--docs-color-card-foreground);
}

.preview-counter-button {
  width: fit-content;
  min-height: 2.5rem;
  padding: 0 0.9rem;
  border: 0;
  border-radius: var(--docs-radius-pill);
  background: var(--docs-color-primary);
  color: var(--docs-color-primary-foreground);
  font: inherit;
  font-weight: 600;
}

.preview-counter-button:focus-visible {
  outline: 2px solid var(--docs-color-ring);
  outline-offset: 2px;
}
</style>
