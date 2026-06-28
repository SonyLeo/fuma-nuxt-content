import type {
  DocsBreadcrumbItem,
  DocsPageBreadcrumbProps,
  DocsPageHeaderOptions,
  DocsPageLike,
  DocsResolvedPageOptions,
} from '~/types/docs'

const DEFAULT_BREADCRUMB_OPTIONS: DocsPageBreadcrumbProps = {
  enabled: true,
  includeRoot: false,
  includePage: false,
  includeSeparator: false,
}

export function useDocsPage(page: Ref<DocsPageLike | null | undefined>) {
  const title = computed(() => {
    return page.value?.title ?? 'Untitled'
  })

  const description = computed(() => {
    return page.value?.description ?? ''
  })

  const sectionLabel = computed(() => {
    return page.value?.sectionLabel ?? 'Guide'
  })

  const full = computed(() => {
    return page.value?.full ?? false
  })

  const toc = computed(() => {
    const enabled = page.value?.toc ?? !full.value
    const popover = page.value?.tocPopover ?? enabled

    return {
      items: [],
      enabled,
      popover,
      label: 'On this page',
      activeLabel: title.value,
    }
  })

  const breadcrumb = computed(() => {
    return {
      items: [],
      enabled:
        page.value?.breadcrumb ?? DEFAULT_BREADCRUMB_OPTIONS.enabled ?? true,
      includeRoot:
        page.value?.breadcrumbRoot ??
        DEFAULT_BREADCRUMB_OPTIONS.includeRoot ??
        false,
      includePage:
        page.value?.breadcrumbPage ??
        DEFAULT_BREADCRUMB_OPTIONS.includePage ??
        false,
      includeSeparator:
        page.value?.breadcrumbSeparator ??
        DEFAULT_BREADCRUMB_OPTIONS.includeSeparator ??
        false,
    }
  })

  const footer = computed(() => {
    return {
      enabled: page.value?.pager ?? true,
    }
  })

  function createHeader(
    breadcrumbs: DocsBreadcrumbItem[],
    enabled = true,
  ): DocsPageHeaderOptions {
    return {
      enabled,
      title: title.value,
      description: description.value || undefined,
      sectionLabel: sectionLabel.value,
      breadcrumbs,
    }
  }

  const options = computed<DocsResolvedPageOptions>(() => {
    return {
      full: full.value,
      toc: toc.value,
      breadcrumb: breadcrumb.value,
      footer: footer.value,
    }
  })

  return {
    title,
    description,
    sectionLabel,
    full,
    toc,
    breadcrumb,
    footer,
    createHeader,
    options,
  }
}
