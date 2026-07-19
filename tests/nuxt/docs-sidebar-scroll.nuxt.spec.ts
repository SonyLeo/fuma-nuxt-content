import { mountSuspended } from '@nuxt/test-utils/runtime'
import { nextTick } from 'vue'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { afterEach, describe, expect, test, vi } from 'vitest'
import {
  ScrollAreaRoot,
  ScrollAreaScrollbar,
  ScrollAreaViewport,
} from 'reka-ui'
import DocsSidebar from '~/components/docs/DocsSidebar.vue'
import type { DocsNavLink, DocsNode } from '~/types/docs'
import { resolveDocsSidebarScrollTop } from '~/utils/docs-sidebar-scroll'

const pages: DocsNode[] = [
  {
    id: 'first',
    type: 'page',
    title: 'First page',
    path: '/guide/first',
    level: 0,
    children: [],
  },
  {
    id: 'last',
    type: 'page',
    title: 'Last page',
    path: '/guide/last',
    level: 0,
    children: [],
  },
]

const footerLinks: DocsNavLink[] = [
  {
    title: 'Repository',
    href: 'https://example.com/repository',
    external: true,
  },
]

afterEach(() => {
  vi.restoreAllMocks()
})

describe('DocsSidebar scroll ownership', () => {
  test('composes one contained Reka viewport while preserving the nav landmark', async () => {
    const wrapper = await mountSuspended(DocsSidebar, {
      props: {
        allowCollapse: false,
        currentPath: '/guide/first',
        items: pages,
        links: footerLinks,
      },
    })

    try {
      expect(wrapper.findAllComponents(ScrollAreaRoot)).toHaveLength(1)
      expect(wrapper.findAllComponents(ScrollAreaViewport)).toHaveLength(1)
      expect(wrapper.findAllComponents(ScrollAreaScrollbar)).toHaveLength(1)
      const source = await readFile(
        resolve(process.cwd(), 'app/components/docs/DocsSidebar.vue'),
        'utf8',
      )
      expect(source.match(/<UiScrollThumb\b/g)).toHaveLength(1)
      expect(wrapper.get('.docs-sidebar-nav').attributes('aria-label')).toBe(
        'Documentation navigation',
      )

      const viewport = wrapper.get('.docs-sidebar-scroll-viewport').element
      expect(viewport.contains(wrapper.get('.docs-sidebar-nav').element)).toBe(
        true,
      )
      expect(
        viewport.contains(wrapper.get('.docs-sidebar-header').element),
      ).toBe(false)
      expect(
        viewport.contains(wrapper.get('.docs-sidebar-footer').element),
      ).toBe(false)
    } finally {
      wrapper.unmount()
    }
  })

  test('keeps panel-owned mobile navigation free of a nested Reka viewport', async () => {
    const wrapper = await mountSuspended(DocsSidebar, {
      props: {
        allowCollapse: false,
        currentPath: '/guide/first',
        items: pages,
        scrollOwnership: 'panel',
        showHeader: false,
      },
    })

    try {
      expect(wrapper.findAllComponents(ScrollAreaRoot)).toHaveLength(0)
      expect(wrapper.findAllComponents(ScrollAreaViewport)).toHaveLength(0)
      expect(wrapper.findAllComponents(ScrollAreaScrollbar)).toHaveLength(0)
      expect(wrapper.get('nav.docs-sidebar-nav').attributes('aria-label')).toBe(
        'Documentation navigation',
      )
    } finally {
      wrapper.unmount()
    }
  })

  test('calculates nearest bounded scrolling for above, below, visible, and clamped items', () => {
    const base = {
      scrollTop: 100,
      scrollHeight: 600,
      clientHeight: 200,
      viewportTop: 20,
      viewportBottom: 220,
      inset: 12,
    }

    expect(
      resolveDocsSidebarScrollTop({
        ...base,
        itemTop: 10,
        itemBottom: 40,
      }),
    ).toBe(78)
    expect(
      resolveDocsSidebarScrollTop({
        ...base,
        itemTop: 200,
        itemBottom: 240,
      }),
    ).toBe(132)
    expect(
      resolveDocsSidebarScrollTop({
        ...base,
        itemTop: 80,
        itemBottom: 120,
      }),
    ).toBe(100)
    expect(
      resolveDocsSidebarScrollTop({
        ...base,
        scrollTop: 5,
        itemTop: -100,
        itemBottom: -60,
      }),
    ).toBe(0)
    expect(
      resolveDocsSidebarScrollTop({
        ...base,
        scrollTop: 390,
        itemTop: 400,
        itemBottom: 500,
      }),
    ).toBe(400)
  })

  test('checks active visibility after currentPath renders and remains SSR guarded', async () => {
    const callbacks: FrameRequestCallback[] = []
    vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation(
      (callback) => {
        callbacks.push(callback)
        return callbacks.length
      },
    )
    vi.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(() => {})

    const wrapper = await mountSuspended(DocsSidebar, {
      props: {
        allowCollapse: false,
        currentPath: '/guide/first',
        items: pages,
      },
    })

    try {
      callbacks.splice(0).forEach((callback) => callback(0))

      const viewport = wrapper.get('.docs-sidebar-scroll-viewport')
        .element as HTMLElement
      Object.defineProperties(viewport, {
        clientHeight: { configurable: true, value: 100 },
        scrollHeight: { configurable: true, value: 400 },
        scrollTop: { configurable: true, value: 0, writable: true },
      })
      vi.spyOn(viewport, 'getBoundingClientRect').mockReturnValue({
        top: 0,
        bottom: 100,
      } as DOMRect)

      await wrapper.setProps({ currentPath: '/guide/last' })
      await nextTick()

      const active = wrapper.get('.docs-sidebar-link[aria-current="page"]')
        .element as HTMLElement
      vi.spyOn(active, 'getBoundingClientRect').mockReturnValue({
        top: 140,
        bottom: 176,
      } as DOMRect)

      expect(callbacks).toHaveLength(1)
      callbacks.shift()?.(0)
      expect(viewport.scrollTop).toBe(88)

      const source = await readFile(
        resolve(process.cwd(), 'app/components/docs/DocsSidebar.vue'),
        'utf8',
      )
      expect(source).toContain(['if (!import', '.meta.client)'].join(''))
      expect(source).not.toMatch(/\b(window|document)\b/)
    } finally {
      wrapper.unmount()
    }
  })
})
