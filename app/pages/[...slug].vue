<script setup lang="ts">
import type { DocsPageAction, DocsPageActionState } from '~/types/docs-actions'
import type { DocsContentPage, DocsPageRecord } from '~/types/docs'
import {
  docsNavigationFields,
  findDocsPageRecordByRoute,
  resolveDocsRecordSourcePath,
  resolveDocsSourcePath,
} from '~/utils/docs-navigation'
import { getDocsGithubEditUrl, getDocsGithubSourceUrl } from '~/utils/docs-site'
import { writeDocsClipboardText } from '~/utils/docs-clipboard'
import {
  readDocsFrontmatterBoolean,
  readDocsMarkdownSource,
} from '~/utils/docs-markdown'
import { createDocsCanonicalUrl, createDocsSeoTitle } from '~/utils/docs-seo'
import { createDocsSearchIndex } from '~/utils/docs-search'

const route = useRoute()
const requestUrl = useRequestURL()
const { site, layout: siteLayout } = useDocsSite()
const copyMarkdownState = shallowRef<DocsPageActionState>('idle')
let copyMarkdownResetTimer: ReturnType<typeof setTimeout> | undefined

const { data: navigation } = await useAsyncData('docs-navigation', () => {
  return queryCollectionNavigation('docs', [...docsNavigationFields])
})

const { data: docsPages } = await useAsyncData('docs-pages', () => {
  return queryCollection('docs')
    .select(
      'path',
      'stem',
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

const { data: docsSearchPages } = await useAsyncData(
  'docs-search-pages',
  () => {
    return queryCollection('docs')
      .select(
        'path',
        'stem',
        'title',
        'description',
        'sectionLabel',
        'hidden',
        'slug',
        'structuredData',
        'body',
      )
      .all()
  },
)

const docsPageRecords = computed<DocsPageRecord[]>(() => {
  return (docsPages.value ?? []) as DocsPageRecord[]
})

const currentPageRecord = computed(() => {
  return findDocsPageRecordByRoute(docsPageRecords.value, route.path)
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
const { data: pageFrontmatter } = await useAsyncData(
  'page-frontmatter-' + route.path,
  async () => {
    if (!pageSourcePath.value) {
      return {}
    }

    const markdown = await readDocsMarkdownSource(pageSourcePath.value)

    return {
      full: readDocsFrontmatterBoolean(markdown, 'full'),
      toc: readDocsFrontmatterBoolean(markdown, 'toc'),
      tocPopover: readDocsFrontmatterBoolean(markdown, 'tocPopover'),
      pager: readDocsFrontmatterBoolean(markdown, 'pager'),
      breadcrumb: readDocsFrontmatterBoolean(markdown, 'breadcrumb'),
      breadcrumbPage: readDocsFrontmatterBoolean(markdown, 'breadcrumbPage'),
      breadcrumbSeparator: readDocsFrontmatterBoolean(
        markdown,
        'breadcrumbSeparator',
      ),
    }
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
const pageForOptions = computed<DocsContentPage | null>(() => {
  if (!page.value) {
    return null
  }

  return {
    ...page.value,
    full: pageFrontmatter.value?.full,
    toc: pageFrontmatter.value?.toc,
    tocPopover: pageFrontmatter.value?.tocPopover,
    pager: pageFrontmatter.value?.pager,
    breadcrumb: pageFrontmatter.value?.breadcrumb,
    breadcrumbPage: pageFrontmatter.value?.breadcrumbPage,
    breadcrumbSeparator: pageFrontmatter.value?.breadcrumbSeparator,
  }
})
const {
  title,
  createHeader,
  options: pageOptions,
} = useDocsPage(pageForOptions)
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
  runtime,
  computed(() => route.path),
  breadcrumbOptions,
)
const { items: toc } = useDocsToc(computed(() => page.value))
const pageHeader = computed(() => {
  return createHeader([])
})
const pageDescription = computed(() => {
  return (
    page.value?.description || site.seo?.defaultDescription || site.description
  )
})
const pageSeoTitle = computed(() => createDocsSeoTitle(title.value, site))
const canonicalUrl = computed(() => {
  return createDocsCanonicalUrl(route.path, site, requestUrl.origin)
})
const pageToc = computed(() => {
  const tocOptions = pageOptions.value.toc
  const popover =
    pageFrontmatter.value?.tocPopover === undefined
      ? tocOptions.enabled
      : pageFrontmatter.value.tocPopover

  return {
    ...tocOptions,
    items: toc.value,
    popover,
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
const pageActions = computed<DocsPageAction[]>(() => {
  const actions: DocsPageAction[] = []
  const sourceUrl = getDocsGithubSourceUrl(site.github, pageSourcePath.value)
  const editUrl = getDocsGithubEditUrl(site.github, pageSourcePath.value)

  if (site.pageActions?.source !== false && sourceUrl) {
    actions.push({
      id: 'open-github',
      type: 'link',
      label: 'Open in GitHub',
      href: sourceUrl,
      external: true,
      icon: 'github',
      ariaLabel: 'Open source on GitHub',
    })
  }

  if (site.pageActions?.edit && editUrl) {
    actions.push({
      id: 'edit-page',
      type: 'link',
      label: 'Edit page',
      href: editUrl,
      external: true,
      icon: 'edit',
      ariaLabel: 'Edit this page on GitHub',
    })
  }

  if (site.pageActions?.copyMarkdown && pageSourcePath.value) {
    actions.push({
      id: 'copy-markdown',
      type: 'button',
      label: 'Copy Markdown',
      icon: 'copy',
      ariaLabel: 'Copy Markdown source',
      state: copyMarkdownState.value,
      disabled: copyMarkdownState.value === 'loading',
    })
  }

  if (site.pageActions?.openInAi === true) {
    const prompt = createPageActionPrompt(canonicalUrl.value)

    actions.push(
      {
        id: 'open-scira',
        type: 'link',
        label: 'Open in Scira AI',
        href: withSearchParams('https://scira.ai/', {
          q: prompt,
        }),
        external: true,
        ariaLabel: 'Open this page in Scira AI',
      },
      {
        id: 'open-chatgpt',
        type: 'link',
        label: 'Open in ChatGPT',
        href: withSearchParams('https://chatgpt.com/', {
          prompt,
          hints: 'search',
        }),
        external: true,
        ariaLabel: 'Open this page in ChatGPT',
      },
      {
        id: 'open-claude',
        type: 'link',
        label: 'Open in Claude',
        href: withSearchParams('https://claude.ai/new', {
          q: prompt,
        }),
        external: true,
        ariaLabel: 'Open this page in Claude',
      },
      {
        id: 'open-cursor',
        type: 'link',
        label: 'Open in Cursor',
        href: withSearchParams('https://cursor.com/link/prompt', {
          text: prompt,
        }),
        external: true,
        ariaLabel: 'Open this page in Cursor',
      },
    )
  }

  return actions
})
const searchIndex = computed(() => {
  return createDocsSearchIndex(
    (docsSearchPages.value ?? []) as DocsContentPage[],
    runtime.value,
  )
})

useSeoMeta({
  title: pageSeoTitle,
  description: pageDescription,
  ogTitle: pageSeoTitle,
  ogDescription: pageDescription,
  ogImage: computed(() => site.seo?.defaultOgImage),
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

function createPageActionPrompt(url: string) {
  return `Read ${url}, I want to ask questions about it.`
}

function withSearchParams(url: string, params: Record<string, string>) {
  return `${url}?${new URLSearchParams(params)}`
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
    :title="siteLayout.title"
    :headline="headline"
    :brand="siteLayout.brand"
    :navigation="sidebarItems"
    :current-path="route.path"
    :github-url="siteLayout.githubUrl"
    :links="siteLayout.links"
    :nav="siteLayout.nav"
  >
    <template #search-trigger>
      <DocsSearch :config="site.search" :index="searchIndex" />
    </template>

    <DocsPage
      :full="pageOptions.full"
      :header="pageHeader"
      :toc="pageToc"
      :breadcrumb="pageBreadcrumb"
      :footer="pageFooter"
    >
      <template #pageActions>
        <DocsPageActions :actions="pageActions" @run="runPageAction" />
      </template>

      <DocsBody>
        <ContentRenderer v-if="page" :value="page" />
      </DocsBody>

      <template #footer="{ footer }">
        <DocsPageFooter
          :enabled="
            (footer?.enabled ?? true) || site.feedback?.enabled === true
          "
          :previous="footer?.previous"
          :next="footer?.next"
          :pager-labels="footer?.pagerLabels"
        >
          <DocsFeedback
            :config="site.feedback"
            :path="route.path"
            :source-path="pageSourcePath"
          />
        </DocsPageFooter>
      </template>
    </DocsPage>
  </NuxtLayout>
</template>
