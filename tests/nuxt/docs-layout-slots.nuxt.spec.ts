import { mountSuspended } from '@nuxt/test-utils/runtime'
import type { VueWrapper } from '@vue/test-utils'
import { describe, expect, expectTypeOf, test } from 'vitest'
import type { ComponentPublicInstance } from 'vue'
import type { DocsHomeLayoutProps, DocsLayoutPublicSlots } from '~/types/docs'
import DocsNotFound from '~/components/docs/DocsNotFound.vue'
import DocsLayoutSlotsHarness from './helpers/DocsLayoutSlotsHarness.vue'

const layoutSurfaceStub = {
  template: `
    <div data-layout-surface>
      <slot name="search-trigger" />
      <slot name="theme-switch" />
      <slot name="language-select" />
    </div>
  `,
}

const layoutStubs = {
  DocsHeader: layoutSurfaceStub,
  DocsSidebar: layoutSurfaceStub,
  DocsMobileNav: layoutSurfaceStub,
  DocsThemeSwitch: {
    template: '<span data-default-theme-switch />',
  },
}

async function mountLayout(
  options: {
    searchEnabled?: boolean
    languageEnabled?: boolean
    slots?: Record<string, string>
  } = {},
) {
  return (await mountSuspended(DocsLayoutSlotsHarness, {
    props: {
      searchEnabled: options.searchEnabled,
      languageEnabled: options.languageEnabled,
    },
    slots: options.slots,
    global: {
      stubs: layoutStubs,
    },
  })) as VueWrapper<ComponentPublicInstance>
}

describe('docs layout public replacement slots', () => {
  test('publishes only the frozen Nuxt layout slot names', () => {
    expectTypeOf<keyof DocsLayoutPublicSlots>().toEqualTypeOf<
      | 'default'
      | 'banner'
      | 'search-trigger'
      | 'theme-switch'
      | 'language-select'
    >()
  })

  test('renders default theme switches only when no replacement exists', async () => {
    const defaults = await mountLayout()
    const replacement = await mountLayout({
      slots: {
        'theme-switch': '<span data-theme-replacement />',
      },
    })

    try {
      expect(defaults.findAll('[data-default-theme-switch]')).toHaveLength(3)
      expect(replacement.findAll('[data-theme-replacement]')).toHaveLength(3)
      expect(replacement.findAll('[data-default-theme-switch]')).toHaveLength(0)
    } finally {
      defaults.unmount()
      replacement.unmount()
    }
  })

  test('renders search replacement without a competing default', async () => {
    const wrapper = await mountLayout({
      slots: {
        'search-trigger': '<span data-search-replacement />',
      },
    })

    try {
      expect(wrapper.findAll('[data-search-replacement]')).toHaveLength(3)
      expect(wrapper.find('[data-default-search]').exists()).toBe(false)
    } finally {
      wrapper.unmount()
    }
  })

  test('gates language replacement on the root capability', async () => {
    const disabled = await mountLayout({
      slots: {
        'language-select': '<span data-language-replacement />',
      },
    })
    const enabled = await mountLayout({
      languageEnabled: true,
      slots: {
        'language-select': '<span data-language-replacement />',
      },
    })

    try {
      expect(disabled.findAll('[data-language-replacement]')).toHaveLength(0)
      expect(enabled.findAll('[data-language-replacement]')).toHaveLength(3)
    } finally {
      disabled.unmount()
      enabled.unmount()
    }
  })

  test('renders banner replacement once without an empty default surface', async () => {
    const absent = await mountLayout()
    const replacement = await mountLayout({
      slots: {
        banner: '<span data-banner-replacement />',
      },
    })

    try {
      expect(absent.find('[data-banner-replacement]').exists()).toBe(false)
      expect(replacement.findAll('[data-banner-replacement]')).toHaveLength(1)
    } finally {
      absent.unmount()
      replacement.unmount()
    }
  })
})

describe('docs not-found composition', () => {
  test('renders explicit home layout props without changing default content', async () => {
    const layout: DocsHomeLayoutProps = {
      title: 'Error Docs',
      brand: {
        label: 'Error Brand',
        mark: 'E',
        href: '/',
      },
      links: [],
      currentPath: '/missing',
      githubUrl: 'https://github.com/example/docs',
    }
    const wrapper = await mountSuspended(DocsNotFound, {
      props: {
        layout,
      },
      global: {
        stubs: {
          DocsThemeSwitch: {
            template: '<span data-default-theme-switch />',
          },
        },
      },
    })

    try {
      expect(wrapper.get('.docs-home-brand-text').text()).toBe('Error Brand')
      expect(wrapper.get('.docs-not-found-code').text()).toBe('404')
      expect(wrapper.get('.docs-not-found-title').text()).toBe('Page Not Found')
      expect(wrapper.get('.docs-not-found-action').attributes('href')).toBe('/')
    } finally {
      wrapper.unmount()
    }
  })

  test('mounts without layout and preserves the standalone default contract', async () => {
    const wrapper = await mountSuspended(DocsNotFound, {
      global: {
        stubs: {
          DocsThemeSwitch: {
            template: '<span data-default-theme-switch />',
          },
        },
      },
    })

    try {
      expect(wrapper.get('.docs-home-brand-text').text()).toBe('Documentation')
      expect(wrapper.get('.docs-not-found-code').text()).toBe('404')
      expect(wrapper.get('.docs-not-found-title').text()).toBe('Page Not Found')
      expect(wrapper.get('.docs-not-found-description').text()).toBe(
        'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.',
      )

      const action = wrapper.get('.docs-not-found-action')

      expect(action.attributes('href')).toBe('/')
      expect(action.text()).toContain('Back to Home')
      await action.trigger('click')
      expect(wrapper.emitted('action')).toHaveLength(1)
    } finally {
      wrapper.unmount()
    }
  })
})
