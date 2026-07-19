import { mountSuspended } from '@nuxt/test-utils/runtime'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { computed, defineComponent, h, nextTick } from 'vue'
import { afterEach, describe, expect, test, vi } from 'vitest'
import DocsSidebar from '~/components/docs/DocsSidebar.vue'
import UiTooltipProvider from '~/components/ui/UiTooltipProvider.vue'
import { provideDocsSidebarState } from '~/composables/useDocsSidebarState'
import type { DocsNode } from '~/types/docs'

const pages: DocsNode[] = [
  {
    id: 'overview',
    type: 'page',
    title: 'Overview',
    path: '/guide/overview',
    level: 0,
    children: [],
  },
]

const SidebarHarness = defineComponent({
  props: {
    currentPath: {
      type: String,
      default: '/guide/overview',
    },
  },
  setup(props, { expose }) {
    const state = provideDocsSidebarState({
      currentPath: computed(() => props.currentPath),
    })

    expose({ state })

    return () =>
      h(UiTooltipProvider, null, {
        default: () =>
          h(DocsSidebar, {
            currentPath: props.currentPath,
            items: pages,
          }),
      })
  },
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('DocsSidebar collapsed state', () => {
  test('maps collapsed preview state to inert, ARIA, and stable focus targets', async () => {
    const wrapper = await mountSuspended(SidebarHarness, {
      attachTo: document.body,
    })

    try {
      const inner = wrapper.get('.docs-sidebar-inner')

      await wrapper.get('.docs-sidebar-collapse').trigger('click')

      expect(wrapper.get('.docs-sidebar').attributes()).toMatchObject({
        'data-collapsed': 'true',
        'data-preview-open': 'false',
      })
      expect(inner.attributes('inert')).toBeDefined()
      expect(inner.attributes('aria-hidden')).toBe('true')
      expect(wrapper.get('.docs-sidebar-floating-button').element).toBe(
        document.activeElement,
      )

      await wrapper.get('.docs-sidebar-hover-zone').trigger('pointerenter', {
        pointerType: 'mouse',
      })

      expect(wrapper.get('.docs-sidebar').attributes('data-preview-open')).toBe(
        'true',
      )
      expect(inner.attributes('inert')).toBeUndefined()
      expect(inner.attributes('aria-hidden')).toBeUndefined()
      expect(wrapper.get('.docs-sidebar-floating').attributes('inert')).toBe('')
      expect(
        wrapper.get('.docs-sidebar-floating').attributes('aria-hidden'),
      ).toBe('true')
    } finally {
      wrapper.unmount()
    }
  })

  test('owns pointer delay, re-entry cancellation, touch ignore, and focus composition', async () => {
    vi.useFakeTimers()
    const wrapper = await mountSuspended(SidebarHarness)

    try {
      await wrapper.get('.docs-sidebar-collapse').trigger('click')
      const hoverZone = wrapper.get('.docs-sidebar-hover-zone')
      const inner = wrapper.get('.docs-sidebar-inner')

      await hoverZone.trigger('pointerenter', { pointerType: 'touch' })
      expect(wrapper.get('.docs-sidebar').attributes('data-preview-open')).toBe(
        'false',
      )

      await hoverZone.trigger('pointerenter', { pointerType: 'mouse' })
      const timerBaseline = vi.getTimerCount()
      await hoverZone.trigger('pointerleave', {
        clientX: 1,
        pointerType: 'mouse',
      })
      expect(vi.getTimerCount()).toBe(timerBaseline + 1)

      await inner.trigger('pointerenter', { pointerType: 'mouse' })
      expect(vi.getTimerCount()).toBe(timerBaseline)
      vi.advanceTimersByTime(500)
      expect(wrapper.get('.docs-sidebar').attributes('data-preview-open')).toBe(
        'true',
      )

      const focusSequenceTimerBaseline = vi.getTimerCount()
      await inner.trigger('pointerleave', {
        clientX: 1,
        pointerType: 'mouse',
      })
      expect(vi.getTimerCount()).toBe(focusSequenceTimerBaseline + 1)

      await inner.trigger('focusin')
      expect(vi.getTimerCount()).toBe(focusSequenceTimerBaseline + 1)
      vi.advanceTimersByTime(500)
      await nextTick()
      expect(wrapper.get('.docs-sidebar').attributes('data-preview-open')).toBe(
        'true',
      )
      expect(wrapper.get('.docs-sidebar').attributes('data-hovered')).toBe(
        'false',
      )
      const stateSource = await readFile(
        resolve(process.cwd(), 'app/composables/useDocsSidebarState.ts'),
        'utf8',
      )
      expect(stateSource).toContain('hovered: pointerPreviewOpen')

      const outside = document.createElement('button')
      await inner.trigger('focusout', { relatedTarget: outside })
      expect(wrapper.get('.docs-sidebar').attributes('data-preview-open')).toBe(
        'false',
      )
    } finally {
      wrapper.unmount()
    }
  })

  test('clears preview and timers on collapse changes, navigation, and unmount', async () => {
    vi.useFakeTimers()
    const wrapper = await mountSuspended(SidebarHarness)

    await wrapper.get('.docs-sidebar-collapse').trigger('click')
    await wrapper
      .get('.docs-sidebar-hover-zone')
      .trigger('pointerenter', { pointerType: 'mouse' })
    const timerBaseline = vi.getTimerCount()
    await wrapper.get('.docs-sidebar-inner').trigger('pointerleave', {
      clientX: 1,
      pointerType: 'mouse',
    })
    expect(vi.getTimerCount()).toBe(timerBaseline + 1)

    await wrapper.setProps({ currentPath: '/guide/next' })
    expect(wrapper.get('.docs-sidebar').attributes('data-preview-open')).toBe(
      'false',
    )
    expect(vi.getTimerCount()).toBe(timerBaseline)

    await wrapper
      .get('.docs-sidebar-hover-zone')
      .trigger('pointerenter', { pointerType: 'mouse' })
    await wrapper.get('.docs-sidebar-inner').trigger('pointerleave', {
      clientX: 1,
      pointerType: 'mouse',
    })
    expect(vi.getTimerCount()).toBe(timerBaseline + 1)

    await wrapper.get('.docs-sidebar-floating-button').trigger('click')
    expect(wrapper.get('.docs-sidebar').attributes('data-preview-open')).toBe(
      'false',
    )
    expect(vi.getTimerCount()).toBe(timerBaseline)

    await wrapper.get('.docs-sidebar-collapse').trigger('click')
    await wrapper
      .get('.docs-sidebar-hover-zone')
      .trigger('pointerenter', { pointerType: 'mouse' })
    await wrapper.get('.docs-sidebar-inner').trigger('pointerleave', {
      clientX: 1,
      pointerType: 'mouse',
    })
    expect(vi.getTimerCount()).toBe(timerBaseline + 1)

    wrapper.unmount()
    expect(vi.getTimerCount()).toBeLessThanOrEqual(timerBaseline)
  })

  test('closes preview with Escape and restores collapse focus after pinning', async () => {
    const wrapper = await mountSuspended(SidebarHarness, {
      attachTo: document.body,
    })

    try {
      await wrapper.get('.docs-sidebar-collapse').trigger('click')
      await wrapper
        .get('.docs-sidebar-hover-zone')
        .trigger('pointerenter', { pointerType: 'mouse' })
      await wrapper.get('.docs-sidebar-brand').trigger('focusin')
      await wrapper.get('.docs-sidebar-brand').trigger('keydown', {
        key: 'Escape',
      })

      expect(wrapper.get('.docs-sidebar').attributes('data-collapsed')).toBe(
        'true',
      )
      expect(wrapper.get('.docs-sidebar').attributes('data-preview-open')).toBe(
        'false',
      )
      expect(wrapper.get('.docs-sidebar-floating-button').element).toBe(
        document.activeElement,
      )

      await wrapper.get('.docs-sidebar-floating-button').trigger('click')

      expect(wrapper.get('.docs-sidebar').attributes('data-collapsed')).toBe(
        'false',
      )
      expect(wrapper.find('.docs-sidebar-floating').exists()).toBe(false)
      expect(wrapper.get('.docs-sidebar-collapse').element).toBe(
        document.activeElement,
      )

      await wrapper.get('.docs-sidebar-collapse').trigger('click')
      await wrapper
        .get('.docs-sidebar-hover-zone')
        .trigger('pointerenter', { pointerType: 'mouse' })

      const previewPin = wrapper.get(
        '.docs-sidebar-collapse[aria-label="Pin sidebar"]',
      )
      await previewPin.trigger('click')

      expect(wrapper.get('.docs-sidebar').attributes('data-collapsed')).toBe(
        'false',
      )
      expect(
        wrapper.get('.docs-sidebar-collapse').attributes('aria-label'),
      ).toBe('Collapse sidebar')
      expect(wrapper.get('.docs-sidebar-collapse').element).toBe(
        document.activeElement,
      )
    } finally {
      wrapper.unmount()
    }
  })
})
