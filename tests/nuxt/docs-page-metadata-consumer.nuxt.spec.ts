import { shallowRef } from 'vue'
import { describe, expect, test } from 'vitest'
import {
  resolveDocsPageOptions,
  resolveDocsPagePolicy,
  useDocsPage,
} from '~/composables/useDocsPage'
import type { DocsContentPage, DocsPageMeta, DocsPagerItem } from '~/types/docs'

const emptyDerived = {
  tocItems: [],
  breadcrumbItems: [],
  previous: null,
  next: null,
}

function resolveOptions(metadata: DocsPageMeta) {
  return resolveDocsPageOptions(resolveDocsPagePolicy(metadata), emptyDerived)
}

describe('normalized page metadata consumer', () => {
  test('resolves the complete default page contract when fields are missing', () => {
    expect(resolveOptions({ title: 'Missing options' })).toEqual({
      full: false,
      header: {
        enabled: true,
        title: 'Missing options',
        description: undefined,
        sectionLabel: 'Guide',
        breadcrumbs: [],
      },
      toc: {
        items: [],
        enabled: true,
        popover: true,
        label: 'On this page',
        activeLabel: 'Missing options',
      },
      breadcrumb: {
        items: [],
        enabled: true,
        includeRoot: false,
        includePage: false,
        includeSeparator: false,
      },
      footer: {
        enabled: true,
        previous: null,
        next: null,
        pagerLabels: {
          previous: 'Previous',
          next: 'Next',
          previousDescription: 'Previous page',
          nextDescription: 'Next page',
        },
      },
    })
  })

  test('preserves every explicit false instead of applying defaults', () => {
    expect(
      resolveOptions({
        title: 'Explicit false',
        full: false,
        toc: false,
        tocPopover: false,
        pager: false,
        breadcrumb: false,
        breadcrumbRoot: false,
        breadcrumbPage: false,
        breadcrumbSeparator: false,
      }),
    ).toMatchObject({
      full: false,
      toc: {
        enabled: false,
        popover: false,
      },
      breadcrumb: {
        enabled: false,
        includeRoot: false,
        includePage: false,
        includeSeparator: false,
      },
      footer: {
        enabled: false,
      },
    })
  })

  test('lets explicit TOC policy override the full-page default', () => {
    expect(resolveOptions({ title: 'Full page', full: true })).toMatchObject({
      full: true,
      toc: {
        enabled: false,
        popover: false,
      },
    })

    expect(
      resolveOptions({
        title: 'Full page with TOC',
        full: true,
        toc: true,
        tocPopover: false,
      }),
    ).toMatchObject({
      full: true,
      toc: {
        enabled: true,
        popover: false,
      },
    })
  })

  test('assembles tree and content derived data into final page options', () => {
    const previous: DocsPagerItem = {
      id: 'previous',
      title: 'Previous page',
      path: '/previous',
    }
    const next: DocsPagerItem = {
      id: 'next',
      title: 'Next page',
      path: '/next',
    }
    const policy = resolveDocsPagePolicy({
      title: 'Resolved page',
      description: 'Resolved description',
      sectionLabel: 'Protocol',
      breadcrumbRoot: { title: 'Root', path: '/root' },
      breadcrumbPage: true,
      breadcrumbSeparator: true,
    })
    const options = resolveDocsPageOptions(policy, {
      tocItems: [{ id: 'usage', text: 'Usage', depth: 2 }],
      breadcrumbItems: [
        { id: 'root', type: 'group', title: 'Root', path: '/root' },
        { id: 'page', type: 'page', title: 'Resolved page' },
      ],
      previous,
      next,
    })

    expect(options.header).toEqual({
      enabled: true,
      title: 'Resolved page',
      description: 'Resolved description',
      sectionLabel: 'Protocol',
      breadcrumbs: [],
    })
    expect(options.toc.items).toEqual([
      { id: 'usage', text: 'Usage', depth: 2 },
    ])
    expect(options.breadcrumb).toMatchObject({
      items: [
        { id: 'root', type: 'group', title: 'Root', path: '/root' },
        { id: 'page', type: 'page', title: 'Resolved page' },
      ],
      includeRoot: { title: 'Root', path: '/root' },
      includePage: true,
      includeSeparator: true,
    })
    expect(options.footer).toMatchObject({ previous, next })
  })

  test('reads only docsMetadata and keeps site feedback outside page policy', () => {
    const page = shallowRef({
      title: 'Raw title must be ignored',
      full: true,
      toc: false,
      docsMetadata: {
        title: 'Normalized title',
        pager: false,
        breadcrumb: false,
        breadcrumbRoot: { title: 'Root', path: '/root' },
        breadcrumbPage: true,
        breadcrumbSeparator: true,
      },
    } as DocsContentPage & { full: boolean; toc: boolean })
    const { breadcrumbOptions, resolveOptions: resolveCurrentOptions } =
      useDocsPage(page)
    const options = resolveCurrentOptions(emptyDerived)
    const siteFeedbackEnabled = true
    const siteFooterEnabled = options.footer.enabled || siteFeedbackEnabled

    expect(options).toMatchObject({
      full: false,
      header: { title: 'Normalized title' },
      toc: { enabled: true },
      breadcrumb: {
        enabled: false,
        includeRoot: { title: 'Root', path: '/root' },
        includePage: true,
        includeSeparator: true,
      },
      footer: { enabled: false },
    })
    expect(breadcrumbOptions.value).toEqual({
      includeRoot: false,
      includePage: false,
      includeSeparator: false,
    })
    expect(siteFooterEnabled).toBe(true)
    expect(options.footer.enabled).toBe(false)
  })
})
