<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    as: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
    id?: string
  }>(),
  {
    id: undefined,
  },
)
</script>

<template>
  <component :is="props.as" :id="props.id" class="docs-heading">
    <a
      v-if="props.id"
      class="docs-heading-anchor"
      :href="`#${props.id}`"
      :aria-label="`Link to heading`"
    >
      <slot />
    </a>
    <slot v-else />
  </component>
</template>
