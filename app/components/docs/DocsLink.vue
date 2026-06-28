<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<{
    href?: string
    external?: boolean | null
    target?: string
    rel?: string
  }>(),
  {
    href: '#',
    external: null,
    target: undefined,
    rel: undefined,
  },
)

const resolved = useDocsResolvedLink(
  computed(() => props.href),
  computed(() => ({
    external: props.external ?? undefined,
    target: props.target,
    rel: props.rel,
  })),
)
</script>

<template>
  <a
    v-if="resolved.external || resolved.hashOnly"
    v-bind="$attrs"
    :href="resolved.href"
    :target="resolved.target"
    :rel="resolved.rel"
  >
    <slot />
  </a>
  <NuxtLink
    v-else
    v-bind="$attrs"
    :to="resolved.href"
    :target="resolved.target"
    :rel="resolved.rel"
  >
    <slot />
  </NuxtLink>
</template>
