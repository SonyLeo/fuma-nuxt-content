// @vitest-environment node

import type { ContentNavigationItem } from '@nuxt/content'
import { describe, expect, test } from 'vitest'
import {
  assertUniqueDocsRoutePaths,
  createDocsIdentityIndex,
  createDocsPageTreePageMap,
  findDocsPageRecordByRoute,
  normalizeDocsSourcePath,
  resolveDocsPageIdentity,
  resolveDocsRoutePath,
} from '~/utils/docs-navigation'
import { createDocsPageTreeRuntime } from '~/utils/docs-page-tree-runtime'

describe('docs page identity', () => {
  test('keeps source identity separate from route identity', () => {
    expect(normalizeDocsSourcePath('index')).toBe('/index')
    expect(normalizeDocsSourcePath('guide/index')).toBe('/guide/index')
    expect(resolveDocsRoutePath('/index')).toBe('/')
    expect(resolveDocsRoutePath('/guide/index')).toBe('/guide')

    expect(
      resolveDocsPageIdentity({
        path: '/guide',
        stem: 'guide/index',
      }),
    ).toEqual({
      contentPath: '/guide',
      sourcePath: '/guide/index',
      routePath: '/guide',
      stem: 'guide/index',
      slug: undefined,
    })
  })

  test('normalizes relative and absolute custom slugs', () => {
    expect(resolveDocsRoutePath('/guide/index', { slug: '真实 路径' })).toBe(
      '/guide/%E7%9C%9F%E5%AE%9E%20%E8%B7%AF%E5%BE%84',
    )
    expect(resolveDocsRoutePath('/guide/index', { slug: '/入口 页面' })).toBe(
      '/%E5%85%A5%E5%8F%A3%20%E9%A1%B5%E9%9D%A2',
    )
  })

  test('normalizes encoded and Unicode-equivalent routes to one identity', () => {
    expect(resolveDocsRoutePath('/guide/%E8%B7%AF%E5%BE%84')).toBe(
      '/guide/%E8%B7%AF%E5%BE%84',
    )
    expect(resolveDocsRoutePath('/guide/caf%C3%A9')).toBe('/guide/caf%C3%A9')
    expect(resolveDocsRoutePath('/guide/cafe\u0301')).toBe('/guide/caf%C3%A9')
  })

  test.each([
    ['../secret'],
    ['/guide/../secret'],
    ['/guide/%2e%2e/secret'],
    ['/guide/%E0%A4%A'],
  ])('rejects invalid identity input %s', (value) => {
    expect(() => normalizeDocsSourcePath(value)).toThrow()
  })

  test('indexes public routes and sources without conflating them', () => {
    const index = createDocsIdentityIndex([
      {
        path: '/guide/routing',
        stem: 'guide/routing',
        docsMetadata: { title: 'Routing', slug: 'route-contract' },
      },
    ])
    expect(
      index.getByRoutePath('/guide/route-contract')?.identity.sourcePath,
    ).toBe('/guide/routing')
    expect(index.getByRoutePath('/guide/routing')).toBeNull()
    expect(index.getBySourcePath('/guide/routing')?.identity.routePath).toBe(
      '/guide/route-contract',
    )
  })

  test('uses normalized metadata instead of a raw top-level slug', () => {
    const identity = resolveDocsPageIdentity({
      path: '/guide/source',
      stem: 'guide/source',
      slug: 'raw-route',
      docsMetadata: { title: 'Source', slug: 'normalized-route' },
    })
    expect(identity.routePath).toBe('/guide/normalized-route')

    const rawOnly = resolveDocsPageIdentity({
      path: '/guide/source',
      stem: 'guide/source',
      slug: 'raw-route',
    })
    expect(rawOnly.routePath).toBe('/guide/source')
    expect(rawOnly.slug).toBeUndefined()
  })

  test('returns a matching record or null for public route lookup', () => {
    const record = {
      path: '/guide/routing',
      stem: 'guide/routing',
      docsMetadata: { title: 'Routing', slug: 'route-contract' },
    }
    const records = [record]

    expect(findDocsPageRecordByRoute(records, '/guide/route-contract')).toBe(
      record,
    )
    expect(findDocsPageRecordByRoute(records, '/guide/routing')).toBeNull()
    expect(findDocsPageRecordByRoute(records, '/guide/%E0%A4%A')).toBeNull()
    expect(findDocsPageRecordByRoute(records, '/missing')).toBeNull()
  })

  test('reports route collisions using stable source identities', () => {
    expect(() =>
      assertUniqueDocsRoutePaths([
        { path: '/guide', stem: 'guide/index' },
        {
          path: '/guide-overview',
          stem: 'guide/overview',
          docsMetadata: { title: 'Guide overview', slug: '/guide' },
        },
      ]),
    ).toThrow(
      'Duplicate docs route paths detected: /guide: /guide/index, /guide/overview',
    )
  })

  test.each([
    [
      [
        { path: '/guide/index', stem: 'guide/index' },
        {
          path: '/guide',
          stem: 'guide',
          docsMetadata: { slug: '/guide' },
        },
      ],
    ],
    [
      [
        { path: '/one', stem: 'one', docsMetadata: { slug: '/café' } },
        { path: '/two', stem: 'two', docsMetadata: { slug: '/cafe\u0301' } },
      ],
    ],
    [
      [
        {
          path: '/one',
          stem: 'one',
          docsMetadata: { slug: '/dir/shared' },
        },
        {
          path: '/dir/two',
          stem: 'dir/two',
          docsMetadata: { slug: 'shared' },
        },
      ],
    ],
  ])('rejects normalized public route collisions', (records) => {
    expect(() => createDocsIdentityIndex(records)).toThrow(
      'Duplicate docs route paths detected',
    )
  })
})

describe('docs page tree identity', () => {
  test('retains excluded page identity in the context tree', () => {
    const navigation = [
      {
        title: 'Guide',
        path: '/guide',
        stem: 'guide',
        page: false,
        children: [
          {
            title: 'Guide Index',
            path: '/guide',
            stem: 'guide/index',
          },
          {
            title: 'Hidden Page',
            path: '/guide/hidden',
            stem: 'guide/hidden',
          },
        ],
      },
    ] as ContentNavigationItem[]
    const pages = [
      {
        path: '/guide',
        stem: 'guide/index',
        docsMetadata: { title: 'Guide Index' },
      },
      {
        path: '/guide/hidden',
        stem: 'guide/hidden',
        docsMetadata: { title: 'Hidden Page', hidden: true },
      },
    ]
    const runtime = createDocsPageTreeRuntime({
      navigation,
      pageBySourcePath: createDocsPageTreePageMap(pages),
    })

    expect(runtime.getVisibleCurrent('/guide/hidden')).toBeNull()
    expect(runtime.getCurrent('/guide/hidden')?.sourcePath).toBe(
      '/guide/hidden',
    )
    expect(runtime.getNodeBySourcePath('guide/hidden')?.path).toBe(
      '/guide/hidden',
    )
    expect(runtime.getNodeBySourcePath('/guide/index')?.path).toBe('/guide')
  })
})
