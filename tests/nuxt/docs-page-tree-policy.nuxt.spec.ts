// @vitest-environment node

import type { ContentNavigationItem } from '@nuxt/content'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, test } from 'vitest'
import type {
  DocsContentPage,
  DocsDirectoryMeta,
  DocsNode,
  DocsPageRecord,
} from '~/types/docs'
import {
  createDirectoryMetaMap,
  createDocsPageTreePageMap,
} from '~/utils/docs-navigation'
import { resolveDocsDirectoryTarget } from '~/utils/docs-page-tree-policy'
import { createDocsPageTreeRuntime } from '~/utils/docs-page-tree-runtime'
import { createDocsSearchIndex } from '~/utils/docs-search'

function createRuntime(
  navigation: ContentNavigationItem[],
  pages: DocsPageRecord[],
  directoryMeta: DocsDirectoryMeta[] = [],
) {
  return createDocsPageTreeRuntime({
    navigation,
    pageBySourcePath: createDocsPageTreePageMap(pages),
    directoryMetaByStem: createDirectoryMetaMap(directoryMeta),
  })
}

function createSearchPage(
  page: DocsPageRecord,
  raw: Partial<DocsContentPage> = {},
): DocsContentPage {
  return {
    ...page.docsMetadata,
    ...raw,
    path: page.path,
    stem: page.stem,
    docsMetadata: page.docsMetadata,
    structuredData: {
      headings: [
        { id: 'contract', content: `${page.docsMetadata.title} heading` },
      ],
      contents: [{ content: `${page.docsMetadata.title} body` }],
    },
  }
}

function createNode(
  patch: Partial<DocsNode> & Pick<DocsNode, 'id' | 'type' | 'title'>,
): DocsNode {
  return {
    level: 0,
    children: [],
    ...patch,
  }
}

describe('docs page tree input and policy', () => {
  test('uses only normalized metadata and resolved public identity', () => {
    const navigation = [
      {
        title: 'Raw navigation title',
        path: '/guide/source-name',
        stem: 'guide/source-name',
        docsMetadata: {
          title: 'Raw navigation metadata',
          slug: 'raw-route',
        },
      },
    ] as ContentNavigationItem[]
    const pages: DocsPageRecord[] = [
      {
        path: '/guide/source-name',
        stem: 'guide/source-name',
        docsMetadata: {
          title: 'Normalized title',
          slug: '真实 路径',
        },
      },
    ]
    const runtime = createRuntime(navigation, pages)
    const node = runtime.visibleFlat[0]

    expect(node?.title).toBe('Normalized title')
    expect(node?.path).toBe('/guide/%E7%9C%9F%E5%AE%9E%20%E8%B7%AF%E5%BE%84')
    expect(runtime.getVisibleCurrent('/guide/source-name')).toBeNull()
    expect(() =>
      createDocsPageTreeRuntime({
        navigation,
        pageBySourcePath: new Map(),
      }),
    ).toThrow(
      'Missing normalized docs page input for navigation source "/guide/source-name"',
    )
  })

  test('splits a page-backed Nuxt navigation container from its directory group', () => {
    const navigation = [
      {
        title: 'Path Policy',
        path: '/guide/protocol-playground',
        stem: 'guide/protocol-playground/路径设计',
        children: [
          {
            title: 'Child',
            path: '/guide/protocol-playground/child',
            stem: 'guide/protocol-playground/child',
          },
        ],
      },
    ] as ContentNavigationItem[]
    const pages: DocsPageRecord[] = [
      {
        path: '/guide/protocol-playground',
        stem: 'guide/protocol-playground/路径设计',
        docsMetadata: { title: 'Path Policy', slug: '真实 路径' },
      },
      {
        path: '/guide/protocol-playground/child',
        stem: 'guide/protocol-playground/child',
        docsMetadata: { title: 'Child' },
      },
    ]
    const runtime = createRuntime(navigation, pages, [
      {
        stem: 'guide/protocol-playground',
        title: 'Protocol Playground',
        pages: ['路径设计', 'child'],
      },
    ])
    const group = runtime.visibleTree[0]
    const page = runtime.getNodeBySourcePath(
      '/guide/protocol-playground/路径设计',
    )

    expect(group).toMatchObject({
      type: 'group',
      title: 'Protocol Playground',
      sourcePath: '/guide/protocol-playground',
      path: '/guide/protocol-playground',
    })
    expect(page).toMatchObject({
      type: 'page',
      title: 'Path Policy',
      path: '/guide/protocol-playground/%E7%9C%9F%E5%AE%9E%20%E8%B7%AF%E5%BE%84',
      sourcePath: '/guide/protocol-playground/路径设计',
    })
    expect(
      runtime.getPagePolicy('/guide/protocol-playground/路径设计'),
    ).toMatchObject({
      visible: true,
      contextual: true,
      searchable: true,
    })
  })

  test('keeps navigation exclusion independent from contextual search membership', () => {
    const navigation = [
      {
        title: 'Guide',
        path: '/guide',
        stem: 'guide',
        page: false,
        children: [
          {
            title: 'Raw visible',
            path: '/guide/visible',
            stem: 'guide/visible',
          },
          {
            title: 'Raw excluded',
            path: '/guide/excluded',
            stem: 'guide/excluded',
          },
          {
            title: 'Raw hidden',
            path: '/guide/hidden',
            stem: 'guide/hidden',
          },
        ],
      },
    ] as ContentNavigationItem[]
    const pages: DocsPageRecord[] = [
      {
        path: '/guide/visible',
        stem: 'guide/visible',
        docsMetadata: { title: 'Visible Page', slug: '可见 页面' },
      },
      {
        path: '/guide/excluded',
        stem: 'guide/excluded',
        docsMetadata: { title: 'Excluded Page', slug: '/context-entry' },
      },
      {
        path: '/guide/hidden',
        stem: 'guide/hidden',
        docsMetadata: { title: 'Hidden Page', hidden: true },
      },
    ]
    const directoryMeta: DocsDirectoryMeta[] = [
      {
        stem: 'guide',
        title: 'Guide',
        pages: [
          'visible',
          '!excluded',
          'hidden',
          { type: 'separator', title: 'Static' },
          {
            type: 'link',
            title: 'External',
            href: 'https://example.com',
            external: true,
          },
        ],
      },
    ]
    const runtime = createRuntime(navigation, pages, directoryMeta)
    const visiblePolicy = runtime.getPagePolicy('/guide/visible')
    const excludedPolicy = runtime.getPagePolicy('/guide/excluded')
    const hiddenPolicy = runtime.getPagePolicy('/guide/hidden')

    expect(visiblePolicy).toMatchObject({
      visible: true,
      contextual: true,
      searchable: true,
      publishable: true,
      pager: true,
      homepage: true,
    })
    expect(excludedPolicy).toMatchObject({
      visible: false,
      contextual: true,
      searchable: true,
      publishable: true,
      pager: false,
      homepage: false,
    })
    expect(hiddenPolicy).toMatchObject({
      visible: false,
      contextual: true,
      searchable: false,
      publishable: true,
      pager: false,
      homepage: false,
    })
    expect(runtime.getVisibleCurrent('/context-entry')).toBeNull()
    expect(runtime.getCurrent('/context-entry')?.title).toBe('Excluded Page')
    expect(
      runtime
        .getBreadcrumbs('/context-entry', { includePage: true })
        .map((item) => item.title),
    ).toEqual(['Guide', 'Excluded Page'])
    expect(
      runtime.homepageNavigation.featured.map((item) => item.title),
    ).toEqual(['Visible Page'])

    const searchIndex = createDocsSearchIndex(
      [
        createSearchPage(pages[0]!, {
          title: 'Raw visible title',
          hidden: true,
          slug: 'raw-visible-route',
        }),
        createSearchPage(pages[1]!),
        createSearchPage(pages[2]!, { hidden: false }),
      ],
      runtime,
    )

    expect(searchIndex.map((entry) => entry.title)).toEqual([
      'Visible Page',
      'Excluded Page',
    ])
    expect(searchIndex.map((entry) => entry.path)).toEqual([
      '/guide/%E5%8F%AF%E8%A7%81%20%E9%A1%B5%E9%9D%A2',
      '/context-entry',
    ])
    expect(runtime.getPager('/context-entry')).toEqual({
      previous: null,
      next: null,
    })
    expect(runtime.visibleTree[0]?.children.map((node) => node.type)).toEqual([
      'page',
      'separator',
      'link',
    ])
  })

  test('represents physical folders, virtual groups, and index kinds explicitly', () => {
    const navigation = [
      {
        title: 'Guide',
        path: '/guide',
        stem: 'guide',
        page: false,
        children: [
          { title: 'Index', path: '/guide', stem: 'guide/index' },
          {
            title: 'Overview',
            path: '/guide/overview',
            stem: 'guide/overview',
          },
          {
            title: 'Child',
            path: '/guide/child',
            stem: 'guide/child',
          },
        ],
      },
    ] as ContentNavigationItem[]
    const pages: DocsPageRecord[] = [
      {
        path: '/guide',
        stem: 'guide/index',
        docsMetadata: { title: 'Guide Index' },
      },
      {
        path: '/guide/overview',
        stem: 'guide/overview',
        docsMetadata: { title: 'Overview' },
      },
      {
        path: '/guide/child',
        stem: 'guide/child',
        docsMetadata: { title: 'Child' },
      },
    ]
    const directoryMeta: DocsDirectoryMeta[] = [
      {
        stem: 'guide',
        title: 'Guide',
        pages: [
          {
            type: 'group',
            name: 'virtual',
            title: 'Virtual',
            pagesIndex: 'overview',
            pages: ['child'],
          },
          {
            type: 'group',
            name: 'internal-index',
            title: 'Internal Index',
            pagesIndex: '[Internal](/guide/child)',
          },
          {
            type: 'group',
            name: 'external-index',
            title: 'External Index',
            pagesIndex: 'external:[External](https://example.com)',
          },
        ],
      },
    ]
    const runtime = createRuntime(navigation, pages, directoryMeta)
    const physical = runtime.visibleTree[0]!
    const [virtual, internalIndex, externalIndex] = physical.children

    expect(physical).toMatchObject({
      type: 'group',
      sourcePath: '/guide',
      path: '/guide',
    })
    expect(physical.index).toMatchObject({
      type: 'page',
      sourcePath: '/guide/index',
      path: '/guide',
    })
    expect(virtual).toMatchObject({
      type: 'group',
      title: 'Virtual',
      sourcePath: undefined,
      path: '/guide/overview',
    })
    expect(virtual?.index).toMatchObject({
      type: 'page',
      sourcePath: '/guide/overview',
    })
    expect(internalIndex?.index).toMatchObject({
      type: 'link',
      href: '/guide/child',
      external: false,
    })
    expect(externalIndex?.index).toMatchObject({
      type: 'link',
      href: 'https://example.com',
      external: true,
    })
  })

  test('resolves directory targets in one ordered policy', () => {
    const pageIndex = createNode({
      id: 'page-index',
      type: 'page',
      title: 'Page Index',
      path: '/page-index',
      sourcePath: '/page-index',
    })
    const internalIndex = createNode({
      id: 'internal-index',
      type: 'link',
      title: 'Internal Index',
      href: '/internal-index',
      external: false,
    })
    const externalIndex = createNode({
      id: 'external-index',
      type: 'link',
      title: 'External Index',
      href: 'https://example.com',
      external: true,
    })
    const visibleChild = createNode({
      id: 'visible-child',
      type: 'page',
      title: 'Visible Child',
      path: '/visible-child',
      sourcePath: '/visible-child',
    })
    const hiddenChild = createNode({
      id: 'hidden-child',
      type: 'page',
      title: 'Hidden Child',
      path: '/hidden-child',
      sourcePath: '/hidden-child',
      hidden: true,
    })

    expect(
      resolveDocsDirectoryTarget(
        createNode({
          id: 'page-index-group',
          type: 'group',
          title: 'Page Index Group',
          index: pageIndex,
          children: [visibleChild],
        }),
      ),
    ).toBe('/page-index')
    expect(
      resolveDocsDirectoryTarget(
        createNode({
          id: 'internal-index-group',
          type: 'group',
          title: 'Internal Index Group',
          index: internalIndex,
          children: [visibleChild],
        }),
      ),
    ).toBe('/internal-index')
    expect(
      resolveDocsDirectoryTarget(
        createNode({
          id: 'external-index-group',
          type: 'group',
          title: 'External Index Group',
          index: externalIndex,
          children: [visibleChild],
        }),
      ),
    ).toBe('/visible-child')
    expect(
      resolveDocsDirectoryTarget(
        createNode({
          id: 'hidden-only-group',
          type: 'group',
          title: 'Hidden Only Group',
          children: [hiddenChild],
        }),
      ),
    ).toBeNull()
    expect(
      resolveDocsDirectoryTarget(
        createNode({
          id: 'empty-group',
          type: 'group',
          title: 'Empty Group',
        }),
      ),
    ).toBeNull()
  })

  test('keeps feature consumers on runtime or derived inputs', () => {
    const readSource = (path: string) =>
      readFileSync(resolve(process.cwd(), path), 'utf8')
    const breadcrumbs = readSource('app/composables/useDocsBreadcrumbs.ts')
    const pager = readSource('app/composables/useDocsPager.ts')
    const search = readSource('app/utils/docs-search.ts')
    const homepage = readSource('app/pages/index.vue')

    expect(breadcrumbs).not.toContain('DocsNode[]')
    expect(breadcrumbs).not.toContain('createDocsBreadcrumbItems')
    expect(pager).not.toContain('DocsNode[]')
    expect(pager).not.toContain('flattenDocsNodes')
    expect(search).not.toContain('DocsNode[]')
    expect(search).not.toContain('resolveDocsRoutePath')
    expect(homepage).not.toContain('resolveNodePath')
    expect(homepage).toContain('homepageNavigation.value')
  })
})
