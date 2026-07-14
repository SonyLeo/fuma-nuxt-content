import { mountSuspended } from '@nuxt/test-utils/runtime'
import type { VueWrapper } from '@vue/test-utils'
import {
  createSSRApp,
  defineComponent,
  h,
  inject,
  nextTick,
  shallowRef,
  type Component,
} from 'vue'
import { renderToString } from 'vue/server-renderer'
import { afterEach, describe, expect, test, vi } from 'vitest'
import UiTabs from '~/components/ui/UiTabs.vue'
import UiTabsContent from '~/components/ui/UiTabsContent.vue'
import UiTabsList from '~/components/ui/UiTabsList.vue'
import UiTabsTrigger from '~/components/ui/UiTabsTrigger.vue'
import { uiTabsKey } from '~/utils/ui-tabs'

const tabValues = ['pnpm', 'npm']
const TabsProbe = defineComponent({
  props: { value: { type: String, required: true } },
  setup(props) {
    const tabs = inject(uiTabsKey)
    if (!tabs) throw new Error('TabsProbe requires UiTabs context.')
    return () =>
      h('button', {
        'data-tabs-probe': '',
        onClick: () => tabs.setValue(props.value),
      })
  },
})

function tabSlots() {
  return {
    default: () =>
      h('div', [
        h(UiTabsList, {}, () =>
          tabValues.map((value) =>
            h(UiTabsTrigger, { key: `trigger-${value}`, value }, () => value),
          ),
        ),
        ...tabValues.map((value) =>
          h(UiTabsContent, { key: `content-${value}`, value }, () => value),
        ),
        h(TabsProbe, { value: 'npm' }),
      ]),
  }
}

function createTabsHarness(options: {
  firstGroup?: string
  secondGroup?: string
  firstPersist?: boolean
  secondPersist?: boolean
  firstDefault?: string
  secondDefault?: string
  firstUpdateAnchor?: boolean
}) {
  return {
    render() {
      return h('div', [
        h(
          UiTabs,
          {
            groupId: options.firstGroup,
            persist: options.firstPersist,
            defaultValue: options.firstDefault ?? 'pnpm',
            updateAnchor: options.firstUpdateAnchor,
          },
          tabSlots(),
        ),
        h(
          UiTabs,
          {
            groupId: options.secondGroup,
            persist: options.secondPersist,
            defaultValue: options.secondDefault ?? 'pnpm',
          },
          tabSlots(),
        ),
      ])
    },
  } satisfies Component
}

async function mountTabs(
  options: Parameters<typeof createTabsHarness>[0] = {},
) {
  return mountSuspended(createTabsHarness(options))
}

async function setTabValue(wrapper: VueWrapper, index = 0) {
  await wrapper.findAll('[data-tabs-probe]')[index]!.trigger('click')
}

afterEach(() => {
  sessionStorage.clear()
  localStorage.clear()
  vi.restoreAllMocks()
})

describe('UiTabs group state protocol', () => {
  test('synchronizes same-group instances and isolates other groups', async () => {
    const wrapper = await mountTabs({
      firstGroup: 'package-manager',
      secondGroup: 'other-group',
    })

    try {
      const tabs = wrapper.findAll('.ui-tabs')
      await setTabValue(wrapper)
      await nextTick()

      expect(tabs[0]!.attributes('data-value')).toBe('npm')
      expect(tabs[1]!.attributes('data-value')).toBe('pnpm')
      expect(
        tabs[0]!
          .findAll('button')
          .find((button) => button.text() === 'npm')!
          .attributes('aria-selected'),
      ).toBe('true')
      expect(
        tabs[0]!.find('[role="tabpanel"][data-state="active"]').text(),
      ).toBe('npm')
      expect(
        tabs[0]!
          .find('[role="tabpanel"][data-state="inactive"]')
          .attributes('hidden'),
      ).toBeDefined()
    } finally {
      wrapper.unmount()
    }

    const grouped = await mountTabs({
      firstGroup: 'package-manager',
      secondGroup: 'package-manager',
    })
    try {
      const tabs = grouped.findAll('.ui-tabs')
      await setTabValue(grouped)
      await nextTick()
      expect(tabs.map((tab) => tab.attributes('data-value'))).toEqual([
        'npm',
        'npm',
      ])
    } finally {
      grouped.unmount()
    }
  })

  test('uses session, then persistent local, then default restore priority', async () => {
    sessionStorage.setItem('restore-group', 'npm')
    localStorage.setItem('restore-group', 'pnpm')
    const session = await mountTabs({
      firstGroup: 'restore-group',
      firstPersist: true,
    })
    expect(session.find('.ui-tabs').attributes('data-value')).toBe('npm')
    session.unmount()

    sessionStorage.removeItem('restore-group')
    const local = await mountTabs({
      firstGroup: 'restore-group',
      firstPersist: true,
    })
    expect(local.find('.ui-tabs').attributes('data-value')).toBe('pnpm')
    local.unmount()
  })

  test('direct selection owns storage, anchor, and broadcast side effects', async () => {
    const sessionSet = vi.spyOn(sessionStorage, 'setItem')
    const localSet = vi.spyOn(localStorage, 'setItem')
    const replaceState = vi.spyOn(window.history, 'replaceState')
    const dispatch = vi.spyOn(window, 'dispatchEvent')
    const wrapper = await mountTabs({
      firstGroup: 'exact-group',
      secondGroup: 'exact-group',
      firstPersist: true,
      firstUpdateAnchor: true,
    })

    try {
      await setTabValue(wrapper)
      await nextTick()

      expect(sessionSet).toHaveBeenCalledTimes(1)
      expect(sessionSet).toHaveBeenCalledWith('exact-group', 'npm')
      expect(localSet).toHaveBeenCalledTimes(1)
      expect(localSet).toHaveBeenCalledWith('exact-group', 'npm')
      expect(dispatch).toHaveBeenCalledTimes(1)
      expect(replaceState).toHaveBeenCalledTimes(1)
      expect(
        wrapper.findAllComponents(UiTabs)[0]!.emitted('update:value'),
      ).toHaveLength(1)
      expect(
        wrapper.findAllComponents(UiTabs)[1]!.emitted('update:value'),
      ).toHaveLength(1)
    } finally {
      wrapper.unmount()
    }
  })

  test('persist false never reads or writes local storage', async () => {
    localStorage.setItem('session-only', 'npm')
    const localGet = vi.spyOn(localStorage, 'getItem')
    const localSet = vi.spyOn(localStorage, 'setItem')
    const wrapper = await mountTabs({
      firstGroup: 'session-only',
      firstPersist: false,
    })

    try {
      expect(wrapper.find('.ui-tabs').attributes('data-value')).toBe('pnpm')
      await setTabValue(wrapper)
      expect(localGet).not.toHaveBeenCalled()
      expect(localSet).not.toHaveBeenCalled()
    } finally {
      wrapper.unmount()
    }
  })

  test('controlled parents remain authoritative while peers still emit once', async () => {
    const rejected = vi.fn()
    const rejectingParent = await mountSuspended(UiTabs, {
      props: {
        value: 'pnpm',
        groupId: 'controlled-reject',
        'onUpdate:value': rejected,
      },
      slots: tabSlots(),
    })

    await setTabValue(rejectingParent)
    await nextTick()
    expect(rejected).toHaveBeenCalledOnce()
    expect(rejectingParent.find('.ui-tabs').attributes('data-value')).toBe(
      'pnpm',
    )
    rejectingParent.unmount()

    const value = shallowRef('pnpm')
    const wrapper = await mountSuspended({
      render: () =>
        h(
          UiTabs,
          {
            value: value.value,
            defaultValue: 'pnpm',
            groupId: 'controlled-group',
            'onUpdate:value': (nextValue: string) => {
              value.value = nextValue
            },
          },
          tabSlots(),
        ),
    })

    try {
      await setTabValue(wrapper)
      await nextTick()
      expect(value.value).toBe('npm')
      expect(wrapper.find('.ui-tabs').attributes('data-value')).toBe('npm')
      expect(
        wrapper.findComponent(UiTabs).emitted('update:value'),
      ).toHaveLength(1)
    } finally {
      wrapper.unmount()
    }
  })

  test('SSR render path does not access browser storage', async () => {
    const sessionGet = vi.spyOn(sessionStorage, 'getItem')
    const localGet = vi.spyOn(localStorage, 'getItem')

    await renderToString(
      createSSRApp({
        render: () =>
          h(
            UiTabs,
            { groupId: 'ssr-group', persist: true, defaultValue: 'pnpm' },
            tabSlots(),
          ),
      }),
    )

    expect(sessionGet).not.toHaveBeenCalled()
    expect(localGet).not.toHaveBeenCalled()
  })

  test('group changes restore the new group and cleanup old listeners', async () => {
    const addListener = vi.spyOn(window, 'addEventListener')
    const removeListener = vi.spyOn(window, 'removeEventListener')
    const wrapper = await mountSuspended(UiTabs, {
      props: { groupId: 'first-group' },
      slots: tabSlots(),
    })

    try {
      sessionStorage.setItem('second-group', 'npm')
      await wrapper.setProps({ groupId: 'second-group' })
      await nextTick()
      await nextTick()
      await nextTick()
      expect(wrapper.find('.ui-tabs').attributes('data-value')).toBe('npm')
      expect(addListener).toHaveBeenCalledWith(
        'docs-tabs-group-change',
        expect.any(Function),
      )
      expect(removeListener).toHaveBeenCalledWith(
        'docs-tabs-group-change',
        expect.any(Function),
      )

      window.dispatchEvent(
        new CustomEvent('docs-tabs-group-change', {
          detail: {
            groupId: 'first-group',
            sourceId: 'external',
            value: 'pnpm',
          },
        }),
      )
      await nextTick()
      expect(wrapper.find('.ui-tabs').attributes('data-value')).toBe('npm')

      wrapper.unmount()
      window.dispatchEvent(
        new CustomEvent('docs-tabs-group-change', {
          detail: {
            groupId: 'second-group',
            sourceId: 'external',
            value: 'pnpm',
          },
        }),
      )
    } finally {
      wrapper.unmount()
    }
  })
})
