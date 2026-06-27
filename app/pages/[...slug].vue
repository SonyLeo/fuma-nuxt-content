<script setup lang="ts">
import { docsNavigationFields } from '~/utils/docs-navigation'

const route = useRoute()

const { data: page } = await useAsyncData('page-' + route.path, () => {
  return queryCollection('docs').path(route.path).first()
})

const { data: navigation } = await useAsyncData('docs-navigation', () => {
  return queryCollectionNavigation('docs', [...docsNavigationFields])
})

if (!page.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Page not found',
    fatal: true,
  })
}

const { headline, sidebarItems, siblings } = useDocsNavigation(
  computed(() => navigation.value ?? null),
  computed(() => route.path),
)
const { title, description, sectionLabel, previous, next } = useDocsPage(
  computed(() => page.value),
  siblings,
  computed(() => route.path),
)
const { items: toc } = useDocsToc(computed(() => page.value))
</script>

<template>
  <NuxtLayout
    name="docs"
    :title="title"
    :headline="headline"
    :navigation="sidebarItems"
    :current-path="route.path"
    :toc="toc"
  >
    <DocsPage
      :title="title"
      :description="description"
      :section-label="sectionLabel"
    >
      <ContentRenderer v-if="page" :value="page" />

      <DocsPager :previous="previous" :next="next" />
    </DocsPage>
  </NuxtLayout>
</template>
