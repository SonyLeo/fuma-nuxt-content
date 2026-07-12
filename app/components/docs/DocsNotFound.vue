<script setup lang="ts">
import { Home } from '@lucide/vue'
import type { DocsNotFoundProps } from '~/types/docs'

const props = withDefaults(defineProps<DocsNotFoundProps>(), {
  layout: () => ({}),
  statusCode: 404,
  title: 'Page Not Found',
  description:
    'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.',
  actionLabel: 'Back to Home',
  actionHref: '/',
})

const emit = defineEmits<{
  action: []
}>()
</script>

<template>
  <DocsHomeLayout v-bind="props.layout">
    <section class="docs-not-found" data-docs-not-found>
      <p class="docs-not-found-code">{{ props.statusCode }}</p>
      <h1 class="docs-not-found-title">{{ props.title }}</h1>
      <p class="docs-not-found-description">
        {{ props.description }}
      </p>
      <DocsLink
        :href="props.actionHref"
        class="docs-not-found-action"
        @click="emit('action')"
      >
        <Home class="docs-not-found-action-icon" aria-hidden="true" />
        <span>{{ props.actionLabel }}</span>
      </DocsLink>
    </section>
  </DocsHomeLayout>
</template>
