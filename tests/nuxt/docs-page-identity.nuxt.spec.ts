// @vitest-environment node

import type { ContentNavigationItem } from '@nuxt/content'
import { describe, expect, test } from 'vitest'
import {
  assertUniqueDocsRoutePaths,
  createDocsMetaMap,
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

  test('reports route collisions using stable source identities', () => {
    expect(() =>
      assertUniqueDocsRoutePaths([
        { path: '/guide', stem: 'guide/index' },
        { path: '/guide-overview', stem: 'guide/overview', slug: '/guide' },
      ]),
    ).toThrow(
      'Duplicate docs route paths detected: /guide: /guide/index, /guide/overview',
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
      pageMetaByPath: createDocsMetaMap(pages),
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
