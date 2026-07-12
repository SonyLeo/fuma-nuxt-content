<script setup lang="ts">
import type { DocsPageRecord } from '~/types/docs'
import { normalizeDocsSourcePath } from '~/utils/docs-navigation'
import { createDocsCanonicalUrl, createDocsSeoTitle } from '~/utils/docs-seo'

const route = useRoute()
const requestUrl = useRequestURL()
const site = useDocsSite()

const { data: page } = await useAsyncData('page-home', () => {
  return queryCollection('docs').path('/').first()
})

const { data: navigation } = await useAsyncData('home-docs-navigation', () => {
  return queryCollectionNavigation('docs')
})

const { data: docsPages } = await useAsyncData('home-docs-pages', () => {
  return queryCollection('docs').select('path', 'stem', 'docsMetadata').all()
})

const { data: docsMeta } = await useAsyncData('home-docs-meta', () => {
  return queryCollection('docsMeta').select('docsMetadata').all()
})

if (!page.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Page not found',
    fatal: true,
  })
}

const docsPageRecords = computed<DocsPageRecord[]>(() => {
  return (docsPages.value ?? []) as DocsPageRecord[]
})

provideDocsLinkContext({
  currentSourcePath: computed(() =>
    normalizeDocsSourcePath(page.value?.stem ?? page.value?.path ?? '/'),
  ),
  pages: docsPageRecords,
})

const { homepageNavigation } = useDocsTree(
  computed(() => navigation.value ?? null),
  computed(() => docsPageRecords.value),
  computed(() => docsMeta.value ?? null),
  computed(() => '/'),
)

const sectionEntries = computed(() => {
  return homepageNavigation.value.sections
})

const foundationEntries = computed(() => {
  return homepageNavigation.value.featured
})

const homeDescription = computed(() => site.page.seo.defaultDescription)
const homeTitle = computed(() =>
  createDocsSeoTitle(site.content.title, site.page.seo),
)
const canonicalUrl = computed(() => {
  return createDocsCanonicalUrl(route.path, site.page.seo, requestUrl.origin)
})

useSeoMeta({
  title: homeTitle,
  description: homeDescription,
  ogTitle: homeTitle,
  ogDescription: homeDescription,
  ogImage: computed(() => site.page.seo.defaultOgImage),
})

useHead({
  link: [
    {
      rel: 'canonical',
      href: canonicalUrl,
    },
  ],
})
</script>

<template>
  <DocsHomeLayout v-bind="site.homeLayout" :current-path="route.path">
    <section class="docs-home-hero">
      <p class="docs-home-kicker">{{ site.content.name }}</p>
      <h1 class="docs-home-title">{{ site.content.title }}</h1>
      <p class="docs-home-description">
        {{ site.content.description }}
      </p>
    </section>

    <section v-if="sectionEntries.length > 0" class="docs-home-section">
      <div class="docs-home-section-header">
        <p class="docs-home-section-label">Sections</p>
        <h2 class="docs-home-section-title">Docs entry</h2>
      </div>

      <div class="docs-home-card-grid">
        <DocsLink
          v-for="entry in sectionEntries"
          :key="entry.id"
          class="docs-home-card"
          :href="entry.path"
        >
          <span class="docs-home-card-title">{{ entry.title }}</span>
          <span v-if="entry.description" class="docs-home-card-description">
            {{ entry.description }}
          </span>
        </DocsLink>
      </div>
    </section>

    <section v-if="foundationEntries.length > 0" class="docs-home-section">
      <div class="docs-home-section-header">
        <p class="docs-home-section-label">Foundation</p>
        <h2 class="docs-home-section-title">Current protocol checks</h2>
      </div>

      <div class="docs-home-link-list">
        <DocsLink
          v-for="entry in foundationEntries"
          :key="entry.id"
          class="docs-home-link"
          :href="entry.path"
        >
          <span>{{ entry.title }}</span>
          <span v-if="entry.badge" class="docs-home-link-badge">
            {{ entry.badge }}
          </span>
        </DocsLink>
      </div>
    </section>

    <section class="docs-home-content">
      <ContentRenderer v-if="page" :value="page" />
    </section>
  </DocsHomeLayout>
</template>
