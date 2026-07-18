<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title: string
    href?: string
    description?: string
    badge?: string
    icon?: string
    external?: boolean | 'true' | 'false'
  }>(),
  {
    href: '',
    description: '',
    badge: '',
    icon: '',
    external: false,
  },
)

const isExternal = computed(() => {
  return props.external === true || props.external === 'true'
})
</script>

<template>
  <DocsLink
    v-if="href"
    class="fd-doc-card"
    data-card
    :href="href"
    :external="isExternal"
    authored
  >
    <span v-if="icon" class="fd-doc-card-icon">
      <DocsNavIcon :name="icon" />
    </span>
    <span class="fd-doc-card-header">
      <h3>{{ title }}</h3>
      <span v-if="badge" class="fd-doc-card-badge">{{ badge }}</span>
    </span>
    <p v-if="description" class="fd-doc-card-description">
      {{ description }}
    </p>
    <div class="fd-doc-card-slot">
      <slot />
    </div>
  </DocsLink>

  <div v-else class="fd-doc-card" data-card>
    <span v-if="icon" class="fd-doc-card-icon">
      <DocsNavIcon :name="icon" />
    </span>
    <span class="fd-doc-card-header">
      <h3>{{ title }}</h3>
      <span v-if="badge" class="fd-doc-card-badge">{{ badge }}</span>
    </span>
    <p v-if="description" class="fd-doc-card-description">
      {{ description }}
    </p>
    <div class="fd-doc-card-slot">
      <slot />
    </div>
  </div>
</template>
