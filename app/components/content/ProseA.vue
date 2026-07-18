<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    href?: string
    target?: string
    rel?: string
  }>(),
  {
    href: '#',
    target: undefined,
    rel: undefined,
  },
)
</script>

<template>
  <DocsLink :href="props.href" :target="props.target" :rel="props.rel" authored>
    <slot />
  </DocsLink>
</template>
