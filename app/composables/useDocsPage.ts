import type {
  DocsBreadcrumbItem,
  DocsBreadcrumbOptions,
  DocsContentPage,
  DocsPageMeta,
  DocsPagerItem,
  DocsResolvedPageOptions,
  DocsResolvedPagePolicy,
  DocsTocItem,
} from '~/types/docs'

const DEFAULT_TOC_LABEL = 'On this page'
const DEFAULT_SECTION_LABEL = 'Guide'
const DEFAULT_PAGER_LABELS = {
  previous: 'Previous',
  next: 'Next',
  previousDescription: 'Previous page',
  nextDescription: 'Next page',
}

export type DocsPageDerivedOptions = {
  tocItems: DocsTocItem[]
  breadcrumbItems: DocsBreadcrumbItem[]
  previous: DocsPagerItem | null
  next: DocsPagerItem | null
}

export function resolveDocsPagePolicy(
  metadata: DocsPageMeta | null | undefined,
): DocsResolvedPagePolicy {
  const full = metadata?.full ?? false
  const tocEnabled = metadata?.toc ?? !full

  return {
    full,
    header: {
      enabled: true,
      title: metadata?.title ?? '',
      description: metadata?.description,
      sectionLabel: metadata?.sectionLabel ?? DEFAULT_SECTION_LABEL,
    },
    toc: {
      enabled: tocEnabled,
      popover: metadata?.tocPopover ?? tocEnabled,
      label: DEFAULT_TOC_LABEL,
      activeLabel: metadata?.title ?? DEFAULT_TOC_LABEL,
    },
    breadcrumb: {
      enabled: metadata?.breadcrumb ?? true,
      includeRoot: metadata?.breadcrumbRoot ?? false,
      includePage: metadata?.breadcrumbPage ?? false,
      includeSeparator: metadata?.breadcrumbSeparator ?? false,
    },
    footer: {
      enabled: metadata?.pager ?? true,
      pagerLabels: { ...DEFAULT_PAGER_LABELS },
    },
  }
}

export function resolveDocsPageOptions(
  policy: DocsResolvedPagePolicy,
  derived: DocsPageDerivedOptions,
): DocsResolvedPageOptions {
  return {
    full: policy.full,
    header: {
      ...policy.header,
      // The standalone breadcrumb is the only visible breadcrumb owner.
      breadcrumbs: [],
    },
    toc: {
      ...policy.toc,
      items: derived.tocItems,
    },
    breadcrumb: {
      ...policy.breadcrumb,
      items: derived.breadcrumbItems,
    },
    footer: {
      ...policy.footer,
      previous: derived.previous,
      next: derived.next,
    },
  }
}

export function useDocsPage(
  page: Ref<Pick<DocsContentPage, 'docsMetadata'> | null | undefined>,
) {
  const policy = computed(() => {
    return resolveDocsPagePolicy(page.value?.docsMetadata)
  })

  const breadcrumbOptions = computed<DocsBreadcrumbOptions>(() => {
    if (!policy.value.breadcrumb.enabled) {
      return {
        includeRoot: false,
        includePage: false,
        includeSeparator: false,
      }
    }

    return {
      includeRoot: policy.value.breadcrumb.includeRoot,
      includePage: policy.value.breadcrumb.includePage,
      includeSeparator: policy.value.breadcrumb.includeSeparator,
    }
  })

  function resolveOptions(derived: DocsPageDerivedOptions) {
    return resolveDocsPageOptions(policy.value, derived)
  }

  return {
    policy,
    breadcrumbOptions,
    resolveOptions,
  }
}
