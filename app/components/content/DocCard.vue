<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    href?: string
    description?: string
    badge?: string
  }>(),
  {
    href: '',
    description: '',
    badge: ''
  }
)
</script>

<template>
  <component :is="href ? 'a' : 'div'" class="fd-doc-card" :href="href || undefined">
    <div class="fd-doc-card-header">
      <h3>{{ title }}</h3>
      <span v-if="badge" class="fd-doc-card-badge">{{ badge }}</span>
    </div>
    <p v-if="description">{{ description }}</p>
    <div v-else class="fd-doc-card-slot">
      <slot />
    </div>
  </component>
</template>

<style scoped>
.fd-doc-card {
  display: block;
  min-height: 100%;
  border: 1px solid var(--docs-color-border);
  background: var(--docs-color-card);
  border-radius: var(--docs-radius-xl);
  padding: 1rem 1rem 1.05rem;
  box-shadow: var(--docs-shadow-panel);
  transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
  text-decoration: none;
}

.fd-doc-card:hover {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--docs-color-primary) 20%, transparent);
  box-shadow: var(--docs-shadow-card);
}

.fd-doc-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.fd-doc-card-header h3 {
  margin: 0;
  font-size: 1rem;
  color: var(--docs-color-text);
}

.fd-doc-card p,
.fd-doc-card-slot {
  margin: 0.55rem 0 0;
  color: var(--docs-color-text-soft);
  line-height: 1.7;
}

.fd-doc-card-badge {
  flex-shrink: 0;
  border-radius: 999px;
  padding: 0.22rem 0.55rem;
  font-size: 0.72rem;
  font-weight: 700;
  background: var(--docs-color-primary-soft);
  color: var(--docs-color-primary);
}
</style>
