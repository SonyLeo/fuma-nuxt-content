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
  border: 1px solid #dbe2ea;
  border-radius: 16px;
  background: #ffffff;
}

.preview-counter-label {
  margin: 0;
  font-size: 0.875rem;
  color: #5b6472;
}

.preview-counter-value {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1;
  color: #111827;
}

.preview-counter-button {
  width: fit-content;
  min-height: 2.5rem;
  padding: 0 0.9rem;
  border: 0;
  border-radius: 999px;
  background: #2563eb;
  color: #ffffff;
  font: inherit;
  font-weight: 600;
}
</style>
