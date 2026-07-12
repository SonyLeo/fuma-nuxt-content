<script setup lang="ts">
import type { DocsPageAction, DocsPageActionState } from '~/types/docs-actions'
import type { DocsContentPage, DocsPageRecord } from '~/types/docs'
import {
  findDocsPageRecordByRoute,
  resolveDocsPageIdentity,
  resolveDocsRecordSourcePath,
  resolveDocsSourcePath,
} from '~/utils/docs-navigation'
import { createDocsSitePageActions } from '~/utils/docs-site'
import { writeDocsClipboardText } from '~/utils/docs-clipboard'
import { readDocsMarkdownSource } from '~/utils/docs-markdown'
import { createDocsCanonicalUrl, createDocsSeoTitle } from '~/utils/docs-seo'
import { createDocsSearchIndex } from '~/utils/docs-search'

const route = useRoute()
const requestUrl = useRequestURL()
const site = useDocsSite()
const copyMarkdownState = shallowRef<DocsPageActionState>('idle')
let copyMarkdownResetTimer: ReturnType<typeof setTimeout> | undefined

const { data: navigation } = await useAsyncData('docs-navigation', () => {
  return queryCollectionNavigation('docs')
})

const { data: docsPages } = await useAsyncData('docs-pages', () => {
  return queryCollection('docs').select('path', 'stem', 'docsMetadata').all()
})

const { data: docsSearchPages } = await useAsyncData(
  'docs-search-pages',
  () => {
    return queryCollection('docs')
      .select('path', 'stem', 'docsMetadata', 'structuredData', 'body')
      .all()
  },
)

const docsPageRecords = computed<DocsPageRecord[]>(() => {
  return (docsPages.value ?? []) as DocsPageRecord[]
})

const currentPageRecord = computed(() => {
  return findDocsPageRecordByRoute(docsPageRecords.value, route.path)
})
const currentPageIdentity = computed(() => {
  return currentPageRecord.value
    ? resolveDocsPageIdentity(currentPageRecord.value)
    : null
})

const pageSourcePath = computed(() => {
  return currentPageRecord.value
    ? resolveDocsRecordSourcePath(currentPageRecord.value)
    : resolveDocsSourcePath(docsPageRecords.value, route.path)
})

provideDocsLinkContext({
  currentSourcePath: pageSourcePath,
  pages: docsPageRecords,
})

const { data: page } = await useAsyncData<DocsContentPage | null>(
  'page-' + route.path,
  async () => {
    const pageRecord = currentPageRecord.value

    if (!pageSourcePath.value || !pageRecord) {
      return null
    }

    return (await queryCollection('docs')
      .path(pageRecord.path)
      .first()) as DocsContentPage | null
  },
)
const { data: docsMeta } = await useAsyncData('docs-meta', () => {
  return queryCollection('docsMeta').select('docsMetadata').all()
})

const { runtime, headline, sidebarItems } = useDocsTree(
  computed(() => navigation.value ?? null),
  computed(() => docsPageRecords.value),
  computed(() => docsMeta.value ?? null),
  computed(() => route.path),
)

if (!page.value) {
  const fallbackPath = runtime.value.getFallbackPath(route.path)

  if (fallbackPath) {
    await navigateTo(fallbackPath, {
      redirectCode: 302,
      replace: true,
    })
  } else {
    throw createError({
      statusCode: 404,
      statusMessage: 'Page not found',
      fatal: true,
    })
  }
}

const { previous, next } = useDocsPager(
  runtime,
  computed(() => route.path),
)
const { breadcrumbOptions, resolveOptions } = useDocsPage(
  computed(() => page.value),
)
const { breadcrumbs } = useDocsBreadcrumbs(
  runtime,
  computed(() => route.path),
  breadcrumbOptions,
)
const { items: toc } = useDocsToc(computed(() => page.value))
const pageOptions = computed(() => {
  return resolveOptions({
    tocItems: toc.value,
    breadcrumbItems: breadcrumbs.value,
    previous: previous.value,
    next: next.value,
  })
})
const pageDescription = computed(() => {
  return (
    pageOptions.value.header.description || site.page.seo.defaultDescription
  )
})
const pageSeoTitle = computed(() => {
  return createDocsSeoTitle(pageOptions.value.header.title, site.page.seo)
})
const canonicalUrl = computed(() => {
  return createDocsCanonicalUrl(
    currentPageIdentity.value?.routePath ?? '/',
    site.page.seo,
    requestUrl.origin,
  )
})
const siteFooterEnabled = computed(() => {
  return pageOptions.value.footer.enabled || site.page.feedback.enabled
})
const pageActions = computed<DocsPageAction[]>(() => {
  return createDocsSitePageActions({
    config: site.page.actions,
    github: site.page.github,
    sourcePath: pageSourcePath.value,
    canonicalUrl: canonicalUrl.value,
    copyMarkdownState: copyMarkdownState.value,
  })
})
const searchIndex = computed(() => {
  return createDocsSearchIndex(docsSearchPages.value ?? [], runtime.value)
})

useSeoMeta({
  title: pageSeoTitle,
  description: pageDescription,
  ogTitle: pageSeoTitle,
  ogDescription: pageDescription,
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

function scheduleCopyMarkdownReset() {
  if (copyMarkdownResetTimer) {
    clearTimeout(copyMarkdownResetTimer)
  }

  copyMarkdownResetTimer = setTimeout(() => {
    copyMarkdownState.value = 'idle'
  }, 1800)
}

async function copyCurrentMarkdown() {
  if (!import.meta.client || !pageSourcePath.value) {
    return
  }

  copyMarkdownState.value = 'loading'

  try {
    const markdown = await readDocsMarkdownSource(pageSourcePath.value)
    await writeDocsClipboardText(markdown)
    copyMarkdownState.value = 'success'
  } catch {
    copyMarkdownState.value = 'failed'
  } finally {
    scheduleCopyMarkdownReset()
  }
}

function runPageAction(action: DocsPageAction) {
  if (action.id === 'copy-markdown') {
    void copyCurrentMarkdown()
  }
}

onBeforeUnmount(() => {
  if (copyMarkdownResetTimer) {
    clearTimeout(copyMarkdownResetTimer)
  }
})
</script>

<template>
  <NuxtLayout
    name="docs"
    :title="site.docsLayout.title"
    :headline="headline"
    :brand="site.docsLayout.brand"
    :navigation="sidebarItems"
    :current-path="route.path"
    :github-url="site.docsLayout.githubUrl"
    :links="site.docsLayout.links"
    :nav="site.docsLayout.nav"
  >
    <template #search-trigger>
      <DocsSearch :config="site.page.search" :index="searchIndex" />
    </template>

    <DocsPage v-bind="pageOptions">
      <template #pageActions>
        <DocsPageActions :actions="pageActions" @run="runPageAction" />
      </template>

      <DocsBody>
        <ContentRenderer v-if="page" :value="page" />
      </DocsBody>

      <template #footer>
        <DocsPageFooter
          :enabled="siteFooterEnabled"
          :previous="pageOptions.footer.previous"
          :next="pageOptions.footer.next"
          :pager-labels="pageOptions.footer.pagerLabels"
        >
          <DocsFeedback
            :config="site.page.feedback"
            :path="route.path"
            :source-path="pageSourcePath"
          />
        </DocsPageFooter>
      </template>
    </DocsPage>
  </NuxtLayout>
</template>
