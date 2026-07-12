<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const route = useRoute()
const site = useDocsSite()
const statusCode = computed(() => props.error.statusCode ?? 500)
const isNotFound = computed(() => statusCode.value === 404)
const title = computed(() =>
  isNotFound.value ? 'Page Not Found' : 'Something went wrong',
)
const description = computed(() =>
  isNotFound.value
    ? 'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.'
    : props.error.statusMessage ||
      props.error.message ||
      'Please try again later.',
)
const layout = computed(() => ({
  ...site.homeLayout,
  currentPath: route.path,
}))

function navigateHome() {
  void clearError({
    redirect: '/',
  })
}
</script>

<template>
  <DocsNotFound
    :layout="layout"
    :status-code="statusCode"
    :title="title"
    :description="description"
    @action="navigateHome"
  />
</template>
