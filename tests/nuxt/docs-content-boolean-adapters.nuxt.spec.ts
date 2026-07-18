import { mountSuspended } from '@nuxt/test-utils/runtime'
import { defineComponent, h, inject, nextTick, type Component } from 'vue'
import { afterEach, describe, expect, test, vi } from 'vitest'
import DocImageZoom from '~/components/content/DocImageZoom.vue'
import DocTab from '~/components/content/DocTab.vue'
import DocTabs from '~/components/content/DocTabs.vue'
import ProseImg from '~/components/content/ProseImg.vue'
import { uiTabsKey } from '~/utils/ui-tabs'

const AuthoredDocTabs = DocTabs as Component
const AuthoredDocImageZoom = DocImageZoom as Component
const AuthoredProseImg = ProseImg as Component
const TabsProbe = defineComponent({
  setup() {
    const tabs = inject(uiTabsKey)
    if (!tabs) throw new Error('TabsProbe requires UiTabs context.')

    return () =>
      h('button', {
        'data-tabs-probe': '',
        onClick: () => tabs.setValue('npm'),
      })
  },
})

function tabPanels() {
  return {
    default: () => [
      h(DocTab, { value: 'pnpm' }, () => 'pnpm panel'),
      h(DocTab, { value: 'npm' }, () => 'npm panel'),
      h(TabsProbe),
    ],
  }
}

function booleanAdapterWarnings(warn: ReturnType<typeof vi.spyOn>) {
  return warn.mock.calls
    .map((args: unknown[]) => args.map(String).join(' '))
    .filter((message: string) =>
      /Invalid prop.*(?:persist|updateAnchor|zoom)/s.test(message),
    )
}

afterEach(() => {
  sessionStorage.clear()
  localStorage.clear()
  vi.restoreAllMocks()
})

describe('MDC boolean-like content adapters', () => {
  test('normalizes authored tabs persistence and anchor props', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const localSet = vi.spyOn(localStorage, 'setItem')
    const replaceState = vi.spyOn(window.history, 'replaceState')
    const wrapper = await mountSuspended(
      defineComponent({
        render: () =>
          h('div', [
            h(
              AuthoredDocTabs,
              {
                defaultValue: 'pnpm',
                groupId: 'authored-false',
                items: ['pnpm', 'npm'],
                persist: 'false',
                updateAnchor: 'false',
              },
              tabPanels(),
            ),
            h(
              AuthoredDocTabs,
              {
                defaultValue: 'pnpm',
                groupId: 'authored-true',
                items: ['pnpm', 'npm'],
                persist: 'true',
                updateAnchor: 'true',
              },
              tabPanels(),
            ),
          ]),
      }),
    )

    try {
      const probes = wrapper.findAll('[data-tabs-probe]')

      await probes[0]!.trigger('click')
      await nextTick()

      expect(localSet).not.toHaveBeenCalled()
      expect(replaceState).not.toHaveBeenCalled()

      await probes[1]!.trigger('click')
      await nextTick()

      expect(localSet).toHaveBeenCalledOnce()
      expect(localSet).toHaveBeenCalledWith('authored-true', 'npm')
      expect(replaceState).toHaveBeenCalledOnce()
      expect(booleanAdapterWarnings(warn)).toEqual([])
    } finally {
      wrapper.unmount()
    }
  })

  test('normalizes authored image zoom props at both content boundaries', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const wrapper = await mountSuspended(
      defineComponent({
        render: () =>
          h('div', [
            h(AuthoredProseImg, {
              alt: 'Prose image without zoom',
              src: '/favicon.ico',
              zoom: 'false',
            }),
            h(AuthoredDocImageZoom, {
              alt: 'Direct image without zoom',
              src: '/favicon.ico',
              zoom: 'false',
            }),
            h(AuthoredProseImg, {
              alt: 'Prose image with zoom',
              src: '/favicon.ico',
              zoom: 'true',
            }),
          ]),
      }),
    )

    try {
      const proseStatic = wrapper.get('img[alt="Prose image without zoom"]')
      const directStatic = wrapper.get('img[alt="Direct image without zoom"]')

      expect(proseStatic.element.closest('button')).toBeNull()
      expect(directStatic.element.closest('button')).toBeNull()

      const trigger = wrapper.get(
        'button[aria-label="Zoom image: Prose image with zoom"]',
      )
      await trigger.trigger('click')
      await nextTick()

      expect(
        document.body.querySelector(
          '[role="dialog"][aria-label="Zoomed image: Prose image with zoom"]',
        ),
      ).not.toBeNull()
      expect(booleanAdapterWarnings(warn)).toEqual([])
    } finally {
      wrapper.unmount()
    }
  })
})
