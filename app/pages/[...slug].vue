<script setup lang="ts">
import type { DocsContentPage, DocsPageRecord } from '~/types/docs'
import {
  docsNavigationFields,
  resolveDocsSourcePath,
} from '~/utils/docs-navigation'

const route = useRoute()

const { data: navigation } = await useAsyncData('docs-navigation', () => {
  return queryCollectionNavigation('docs', [...docsNavigationFields])
})

const { data: docsPages } = await useAsyncData('docs-pages', () => {
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

const docsPageRecords = computed<DocsPageRecord[]>(() => {
  return (docsPages.value ?? []) as DocsPageRecord[]
})

const pageSourcePath = computed(() => {
  return resolveDocsSourcePath(docsPageRecords.value, route.path)
})

provideDocsLinkContext({
  currentSourcePath: pageSourcePath,
  pages: docsPageRecords,
})

const { data: page } = await useAsyncData<DocsContentPage | null>(
  'page-' + route.path,
  async () => {
    if (!pageSourcePath.value) {
      return null
    }

    return (await queryCollection('docs')
      .path(pageSourcePath.value)
      .first()) as DocsContentPage | null
  },
)

const { data: docsMeta } = await useAsyncData('docs-meta', () => {
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

const { items, contextualItems, headline, sidebarItems } = useDocsTree(
  computed(() => navigation.value ?? null),
  computed(() => docsPageRecords.value),
  computed(() => docsMeta.value ?? null),
  computed(() => route.path),
)
const { previous, next } = useDocsPager(
  items,
  computed(() => route.path),
)
const {
  title,
  createHeader,
  options: pageOptions,
} = useDocsPage(computed(() => page.value))
const breadcrumbOptions = computed(() => {
  if (!pageOptions.value.breadcrumb.enabled) {
    return {
      includeRoot: false,
      includePage: false,
      includeSeparator: false,
    }
  }

  return {
    includeRoot: pageOptions.value.breadcrumb.includeRoot,
    includePage: pageOptions.value.breadcrumb.includePage,
    includeSeparator: pageOptions.value.breadcrumb.includeSeparator,
  }
})
const { breadcrumbs } = useDocsBreadcrumbs(
  contextualItems,
  computed(() => route.path),
  breadcrumbOptions,
)
const { items: toc } = useDocsToc(computed(() => page.value))
const pageHeader = computed(() => {
  return createHeader([])
})
const pageToc = computed(() => {
  return {
    ...pageOptions.value.toc,
    items: toc.value,
  }
})
const pageBreadcrumb = computed(() => {
  return {
    ...pageOptions.value.breadcrumb,
    items: breadcrumbs.value,
  }
})
const pageFooter = computed(() => {
  return {
    ...pageOptions.value.footer,
    previous: previous.value,
    next: next.value,
  }
})
</script>

<template>
  <NuxtLayout
    name="docs"
    :title="title"
    :headline="headline"
    :navigation="sidebarItems"
    :current-path="route.path"
  >
    <DocsPage
      :full="pageOptions.full"
      :header="pageHeader"
      :toc="pageToc"
      :breadcrumb="pageBreadcrumb"
      :footer="pageFooter"
    >
      <DocsBody>
        <ContentRenderer v-if="page" :value="page" />
      </DocsBody>
    </DocsPage>
  </NuxtLayout>
</template>
