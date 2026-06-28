<script setup lang="ts">
import type { DocsNode, DocsPageRecord } from '~/types/docs'
import { docsNavigationFields } from '~/utils/docs-navigation'

const { data: page } = await useAsyncData('page-home', () => {
  return queryCollection('docs').path('/').first()
})

const { data: navigation } = await useAsyncData('home-docs-navigation', () => {
  return queryCollectionNavigation('docs', [...docsNavigationFields])
})

const { data: docsPages } = await useAsyncData('home-docs-pages', () => {
  return queryCollection('docs')
    .select(
      'path',
      'title',
      'description',
      'sectionLabel',
      'slug',
      'order',
      'hidden',
      'badge',
      'icon',
      'status',
      'defaultOpen',
      'collapsible',
      'full',
      'toc',
      'tocPopover',
      'pager',
      'breadcrumb',
      'breadcrumbRoot',
      'breadcrumbPage',
      'breadcrumbSeparator',
    )
    .all()
})

const { data: docsMeta } = await useAsyncData('home-docs-meta', () => {
  return queryCollection('docsMeta')
    .select(
      'stem',
      'title',
      'description',
      'order',
      'pages',
      'pagesIndex',
      'root',
      'hidden',
      'defaultOpen',
      'collapsible',
      'badge',
      'icon',
    )
    .all()
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
  currentSourcePath: computed(() => page.value?.path ?? '/'),
  pages: docsPageRecords,
})

const { items } = useDocsTree(
  computed(() => navigation.value ?? null),
  computed(() => docsPageRecords.value),
  computed(() => docsMeta.value ?? null),
  computed(() => '/'),
)

function resolveNodePath(item: DocsNode) {
  return item.path ?? item.index?.path ?? item.href
}

const sectionEntries = computed(() => {
  return items.value
    .filter((item) => item.type === 'group' || item.type === 'page')
    .filter((item) => resolveNodePath(item))
    .slice(0, 4)
})

const foundationEntries = computed(() => {
  return items.value
    .flatMap((item) => (item.children.length > 0 ? item.children : [item]))
    .filter((item) => item.type === 'group' || item.type === 'page')
    .filter((item) => resolveNodePath(item))
    .slice(0, 6)
})
</script>

<template>
  <main class="docs-home">
    <section class="docs-home-hero">
      <p class="docs-home-kicker">Fuma Nuxt Content</p>
      <h1 class="docs-home-title">Vue docs foundation</h1>
      <p class="docs-home-description">
        一个面向 Nuxt Content 的 docs
        基础层实验，优先收稳页面协议、目录树协议和内容组件协议。
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
          :href="resolveNodePath(entry)!"
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
          :href="resolveNodePath(entry)!"
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
  </main>
</template>
