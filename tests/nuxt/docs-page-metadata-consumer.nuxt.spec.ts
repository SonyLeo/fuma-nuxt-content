import { shallowRef } from 'vue'
import { describe, expect, test } from 'vitest'
import { useDocsPage } from '~/composables/useDocsPage'
import type { DocsPageMeta } from '~/types/docs'

describe('normalized page metadata consumer', () => {
  test('applies page defaults only when normalized fields are missing', () => {
    const page = shallowRef<DocsPageMeta | null>({
      title: 'Explicit false',
      full: false,
      toc: false,
      tocPopover: false,
      pager: false,
      breadcrumb: false,
      breadcrumbPage: false,
      breadcrumbSeparator: false,
    })
    const { options } = useDocsPage(page)

    expect(options.value).toMatchObject({
      full: false,
      toc: {
        enabled: false,
        popover: false,
      },
      breadcrumb: {
        enabled: false,
        includePage: false,
        includeSeparator: false,
      },
      footer: {
        enabled: false,
      },
    })

    page.value = {
      title: 'Missing options',
    }

    expect(options.value).toMatchObject({
      full: false,
      toc: {
        enabled: true,
        popover: true,
      },
      breadcrumb: {
        enabled: true,
        includeRoot: false,
        includePage: false,
        includeSeparator: false,
      },
      footer: {
        enabled: true,
      },
    })
  })
})
