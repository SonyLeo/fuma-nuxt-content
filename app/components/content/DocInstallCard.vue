<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    command?: string
    title?: string
    description?: string
  }>(),
  {
    title: 'Install to your codebase',
    description: 'Easier customization & control.',
  },
)
</script>

<template>
  <section class="fd-doc-install-card">
    <div class="fd-doc-install-copy">
      <p class="fd-doc-install-title">{{ title }}</p>
      <p v-if="description" class="fd-doc-install-description">
        {{ description }}
      </p>
    </div>
    <div class="fd-doc-install-command">
      <slot v-if="$slots.default" />
      <DocCodeBlock
        v-else-if="props.command"
        :code="props.command"
        language="bash"
        :allow-copy="true"
      />
    </div>
  </section>
</template>
