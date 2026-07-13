import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import DocsThemeSwitch from '~/components/docs/DocsThemeSwitch.vue'
import type {
  DocsThemeConfig,
  DocsThemeMode,
  DocsThemePreset,
  DocsThemeSwitchMode,
  ResolvedDocsThemeConfig,
} from '~/types/docs-theme'
import { docsThemeDefaults, resolveDocsThemeConfig } from '~/types/docs-theme'
import {
  createDocsThemeInitScript,
  resolveDocsThemeInitialState,
} from '~/utils/docs-theme'
import { createDocsSiteAdapter } from '~/utils/docs-site'

type FakeInitScriptOptions = {
  storedMode?: string | null
  prefersDark?: boolean
  storageThrows?: boolean
  matchMediaThrows?: boolean
}

type FakeMediaQuery = {
  matches: boolean
  addEventListener: ReturnType<typeof vi.fn>
  removeEventListener: ReturnType<typeof vi.fn>
  setMatches: (matches: boolean) => void
  listenerCount: () => number
}

function resetDocsThemeState() {
  try {
    useDocsTheme().dispose()
  } catch {
    // Nuxt state may not exist before the first composable call in a test.
  }

  const nuxtApp = useNuxtApp()

  delete nuxtApp.payload.state['docs-theme-config']
  delete nuxtApp.payload.state['docs-theme-mode']
  delete nuxtApp.payload.state['docs-theme-resolved-mode']
  delete nuxtApp.payload.state['docs-theme-mounted']

  const root = document.documentElement

  root.classList.remove('dark')
  root.removeAttribute('data-docs-theme')
  root.removeAttribute('data-docs-theme-mode')
  root.removeAttribute('data-docs-theme-resolved')
  root.style.colorScheme = ''
  document.head
    .querySelectorAll('[data-docs-theme-transition-lock]')
    .forEach((node) => node.remove())
  window.localStorage.clear()
}

function installMatchMedia(matches = false): FakeMediaQuery {
  const listeners = new Set<() => void>()
  const media: FakeMediaQuery = {
    matches,
    addEventListener: vi.fn((_event: string, listener: () => void) => {
      listeners.add(listener)
    }),
    removeEventListener: vi.fn((_event: string, listener: () => void) => {
      listeners.delete(listener)
    }),
    setMatches(nextMatches: boolean) {
      media.matches = nextMatches
      for (const listener of listeners) {
        listener()
      }
    },
    listenerCount() {
      return listeners.size
    },
  }

  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: vi.fn(() => media),
  })

  return media
}

function resolvedTheme(
  config: DocsThemeConfig | undefined,
): ResolvedDocsThemeConfig {
  return resolveDocsThemeConfig(config)
}

function runInitScript(
  config: ResolvedDocsThemeConfig,
  options: FakeInitScriptOptions = {},
) {
  const attrs = new Map<string, string>()
  const classNames = new Set<string>()
  const style: Record<string, string> = {}
  const storageGetItem = vi.fn((_key: string) => options.storedMode ?? null)
  const matchMedia = vi.fn(() => {
    if (options.matchMediaThrows) {
      throw new Error('matchMedia unavailable')
    }

    return {
      matches: options.prefersDark ?? false,
    }
  })
  const root = {
    classList: {
      toggle: (name: string, force?: boolean) => {
        if (force) {
          classNames.add(name)
        } else {
          classNames.delete(name)
        }

        return classNames.has(name)
      },
    },
    setAttribute: (name: string, value: string) => {
      attrs.set(name, value)
    },
    style,
  }
  const fakeWindow = {
    localStorage: {
      getItem: (key: string) => {
        if (options.storageThrows) {
          throw new Error(`storage unavailable: ${key}`)
        }

        return storageGetItem(key)
      },
    },
    matchMedia,
  }
  const fakeDocument = {
    documentElement: root,
  }

  new Function('window', 'document', createDocsThemeInitScript(config))(
    fakeWindow,
    fakeDocument,
  )

  return {
    attrs,
    classNames,
    colorScheme: style.colorScheme,
    matchMedia,
    storageGetItem,
  }
}

function expectInitState(
  result: ReturnType<typeof runInitScript>,
  expected: {
    mode: DocsThemeMode
    preset: DocsThemePreset
    resolvedMode: 'light' | 'dark'
  },
) {
  expect(result.attrs.get('data-docs-theme')).toBe(expected.preset)
  expect(result.attrs.get('data-docs-theme-mode')).toBe(expected.mode)
  expect(result.attrs.get('data-docs-theme-resolved')).toBe(
    expected.resolvedMode,
  )
  expect(result.classNames.has('dark')).toBe(expected.resolvedMode === 'dark')
  expect(result.colorScheme).toBe(expected.resolvedMode)
}

describe('docs theme runtime contract', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    installMatchMedia(false)
    resetDocsThemeState()
  })

  test('resolves missing, non-default, disabled, invalid, and whitespace config', () => {
    expect(resolveDocsThemeConfig(undefined)).toEqual(docsThemeDefaults)
    expect(
      resolveDocsThemeConfig({
        defaultMode: 'dark',
        disableTransitionOnChange: false,
        enabled: false,
        preset: 'purple',
        storageKey: 'custom-theme-key',
        switchMode: 'light-dark',
      }),
    ).toEqual({
      defaultMode: 'dark',
      disableTransitionOnChange: false,
      enabled: false,
      preset: 'purple',
      storageKey: 'custom-theme-key',
      switchMode: 'light-dark',
    })
    expect(
      resolveDocsThemeConfig({
        defaultMode: 'sepia' as DocsThemeMode,
        disableTransitionOnChange: 'yes' as unknown as boolean,
        enabled: 'yes' as unknown as boolean,
        preset: 'bogus' as DocsThemePreset,
        storageKey: '   ',
        switchMode: 'dropdown' as DocsThemeSwitchMode,
      }),
    ).toEqual(docsThemeDefaults)
  })

  test('site adapter resolves theme once and returns a stable resolved snapshot', () => {
    const rawTheme: DocsThemeConfig = {
      defaultMode: 'dark',
      preset: 'black',
      storageKey: 'adapter-theme-key',
      switchMode: 'light-dark',
    }
    const adapter = createDocsSiteAdapter({
      brand: {
        label: 'Adapter Brand',
      },
      name: 'Adapter Docs',
      theme: rawTheme,
      title: 'Adapter Docs',
    })

    expect(adapter.theme).toEqual(resolveDocsThemeConfig(rawTheme))
    expect(adapter.theme).not.toBe(rawTheme)

    rawTheme.defaultMode = 'light'
    rawTheme.preset = 'purple'

    expect(adapter.theme).toEqual({
      ...docsThemeDefaults,
      defaultMode: 'dark',
      preset: 'black',
      storageKey: 'adapter-theme-key',
      switchMode: 'light-dark',
    })
  })

  test('init script consumes resolved config and matches runtime initial-state policy', () => {
    const cases: Array<{
      name: string
      config: ResolvedDocsThemeConfig
      storedMode?: string | null
      prefersDark: boolean
    }> = [
      {
        name: 'stored dark',
        config: resolvedTheme({ defaultMode: 'light', preset: 'purple' }),
        storedMode: 'dark',
        prefersDark: false,
      },
      {
        name: 'stored light',
        config: resolvedTheme({ defaultMode: 'dark', preset: 'black' }),
        storedMode: 'light',
        prefersDark: true,
      },
      {
        name: 'stored system prefers dark',
        config: resolvedTheme({ defaultMode: 'light', preset: 'neutral' }),
        storedMode: 'system',
        prefersDark: true,
      },
      {
        name: 'stored system prefers light',
        config: resolvedTheme({ defaultMode: 'dark', preset: 'default' }),
        storedMode: 'system',
        prefersDark: false,
      },
      {
        name: 'invalid stored value',
        config: resolvedTheme({ defaultMode: 'dark', preset: 'purple' }),
        storedMode: 'sepia',
        prefersDark: false,
      },
      {
        name: 'missing stored value uses system default',
        config: resolvedTheme({ defaultMode: 'system', preset: 'black' }),
        storedMode: null,
        prefersDark: true,
      },
      {
        name: 'disabled ignores stored dark',
        config: resolvedTheme({
          defaultMode: 'light',
          enabled: false,
          preset: 'neutral',
        }),
        storedMode: 'dark',
        prefersDark: true,
      },
      {
        name: 'disabled system default still resolves preference',
        config: resolvedTheme({
          defaultMode: 'system',
          enabled: false,
          preset: 'purple',
        }),
        storedMode: 'light',
        prefersDark: true,
      },
    ]

    for (const item of cases) {
      const expected = resolveDocsThemeInitialState({
        config: item.config,
        storedMode: item.storedMode,
        prefersDark: item.prefersDark,
      })
      const scriptResult = runInitScript(item.config, {
        storedMode: item.storedMode,
        prefersDark: item.prefersDark,
      })

      expectInitState(scriptResult, expected)

      if (item.config.enabled) {
        expect(scriptResult.storageGetItem).toHaveBeenCalledWith(
          item.config.storageKey,
        )
      } else {
        expect(scriptResult.storageGetItem).not.toHaveBeenCalled()
      }
    }
  })

  test('init script safely falls back when storage or matchMedia throws', () => {
    const config = resolvedTheme({
      defaultMode: 'system',
      preset: 'purple',
    })

    expectInitState(
      runInitScript(config, {
        prefersDark: true,
        storageThrows: true,
      }),
      {
        mode: 'system',
        preset: 'purple',
        resolvedMode: 'dark',
      },
    )
    expectInitState(
      runInitScript(config, {
        matchMediaThrows: true,
        storedMode: 'system',
      }),
      {
        mode: 'system',
        preset: 'purple',
        resolvedMode: 'light',
      },
    )
  })

  test('disabled theme ignores stored state, keeps switch hidden, and makes mode actions no-op', () => {
    window.localStorage.setItem('disabled-theme-key', 'dark')
    const config = resolvedTheme({
      defaultMode: 'system',
      enabled: false,
      preset: 'purple',
      storageKey: 'disabled-theme-key',
    })
    const theme = useDocsTheme(config)

    theme.initialize()

    expect(theme.mode.value).toBe('system')
    expect(theme.resolvedMode.value).toBe('light')
    expect(document.documentElement.dataset.docsTheme).toBe('purple')
    expect(document.documentElement.dataset.docsThemeMode).toBe('system')
    expect(document.documentElement.dataset.docsThemeResolved).toBe('light')
    expect(document.documentElement.style.colorScheme).toBe('light')

    theme.setMode('dark')
    theme.toggleMode()

    expect(theme.mode.value).toBe('system')
    expect(theme.resolvedMode.value).toBe('light')
    expect(window.localStorage.getItem('disabled-theme-key')).toBe('dark')
    expect(
      document.head.querySelectorAll('[data-docs-theme-transition-lock]'),
    ).toHaveLength(0)

    const wrapper = mount(DocsThemeSwitch)

    expect(wrapper.find('[data-theme-toggle]').exists()).toBe(false)
  })

  test('theme switch consumes resolved light-dark switch mode without changing public DOM contract', () => {
    const theme = useDocsTheme(
      resolvedTheme({
        switchMode: 'light-dark',
      }),
    )

    theme.markMounted()

    const wrapper = mount(DocsThemeSwitch)
    const toggle = wrapper.get('button[data-theme-toggle]')

    expect(wrapper.find('.docs-theme-switch').exists()).toBe(false)
    expect(toggle.attributes('aria-label')).toBe('Switch to dark theme')
    expect(toggle.attributes('aria-pressed')).toBe('false')
    expect(toggle.findAll('.docs-theme-toggle-option')).toHaveLength(2)
    expect(wrapper.findAll('[data-theme-mode]')).toHaveLength(0)
  })

  test('client initialize adopts valid stored modes and ignores invalid stored values', () => {
    const storageKey = 'runtime-theme-key'
    const config = resolvedTheme({
      defaultMode: 'light',
      storageKey,
    })

    window.localStorage.setItem(storageKey, 'dark')

    const darkTheme = useDocsTheme(config)

    darkTheme.initialize()

    expect(darkTheme.mode.value).toBe('dark')
    expect(darkTheme.resolvedMode.value).toBe('dark')
    expect(document.documentElement.dataset.docsThemeMode).toBe('dark')

    resetDocsThemeState()
    installMatchMedia(true)
    window.localStorage.setItem(storageKey, 'system')

    const systemTheme = useDocsTheme(config)

    systemTheme.initialize()

    expect(systemTheme.mode.value).toBe('system')
    expect(systemTheme.resolvedMode.value).toBe('dark')
    expect(document.documentElement.dataset.docsThemeMode).toBe('system')

    resetDocsThemeState()
    window.localStorage.setItem(storageKey, 'sepia')

    const invalidTheme = useDocsTheme(config)

    invalidTheme.initialize()

    expect(invalidTheme.mode.value).toBe('light')
    expect(invalidTheme.resolvedMode.value).toBe('light')
    expect(document.documentElement.dataset.docsThemeMode).toBe('light')
  })

  test('multiple calls share one Nuxt state and initialize without duplicate listeners', () => {
    const media = installMatchMedia(false)
    const config = resolvedTheme({
      defaultMode: 'system',
      storageKey: 'shared-theme-key',
    })
    const theme = useDocsTheme(config)
    const consumer = useDocsTheme()

    theme.initialize()
    theme.initialize()

    expect(media.addEventListener).toHaveBeenCalledTimes(2)
    expect(media.removeEventListener).toHaveBeenCalledTimes(1)
    expect(media.listenerCount()).toBe(1)
    expect(consumer.mode.value).toBe('system')
    expect(consumer.resolvedMode.value).toBe('light')

    media.setMatches(true)

    expect(consumer.resolvedMode.value).toBe('dark')

    theme.setMode('light')
    media.setMatches(false)
    media.setMatches(true)

    expect(consumer.mode.value).toBe('light')
    expect(consumer.resolvedMode.value).toBe('light')
    expect(window.localStorage.getItem('shared-theme-key')).toBe('light')

    theme.dispose()

    expect(media.listenerCount()).toBe(0)
  })

  test('transition blocker is scoped, cleaned, and skipped when disabled', () => {
    const callbacks: FrameRequestCallback[] = []

    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(
      (callback: FrameRequestCallback) => {
        callbacks.push(callback)
        return callbacks.length
      },
    )

    const theme = useDocsTheme(
      resolvedTheme({
        disableTransitionOnChange: true,
      }),
    )

    theme.setMode('dark')

    expect(
      document.head.querySelectorAll('[data-docs-theme-transition-lock]'),
    ).toHaveLength(1)

    theme.setMode('light')

    expect(
      document.head.querySelectorAll('[data-docs-theme-transition-lock]'),
    ).toHaveLength(1)

    while (callbacks.length > 0) {
      callbacks.shift()?.(0)
    }

    expect(
      document.head.querySelectorAll('[data-docs-theme-transition-lock]'),
    ).toHaveLength(0)

    resetDocsThemeState()
    const noTransitionTheme = useDocsTheme(
      resolvedTheme({
        disableTransitionOnChange: false,
      }),
    )

    noTransitionTheme.setMode('dark')

    expect(
      document.head.querySelectorAll('[data-docs-theme-transition-lock]'),
    ).toHaveLength(0)
  })

  test('SSR owner and compatibility alias are closed over adapter output', async () => {
    const appSource = await readFile(
      resolve(process.cwd(), 'app/app.vue'),
      'utf8',
    )
    const configSource = await readFile(
      resolve(process.cwd(), 'app/config/docs-site.ts'),
      'utf8',
    )
    const pluginSource = await readFile(
      resolve(process.cwd(), 'app/plugins/docs-theme.client.ts'),
      'utf8',
    )
    const themeUtilsSource = await readFile(
      resolve(process.cwd(), 'app/utils/docs-theme.ts'),
      'utf8',
    )

    expect(
      appSource.indexOf('useDocsTheme(site.theme)'),
    ).toBeGreaterThanOrEqual(0)
    expect(appSource.indexOf('useDocsTheme(site.theme)')).toBeLessThan(
      appSource.indexOf('createDocsThemeInitScript(site.theme)'),
    )
    expect(configSource).not.toContain('docsSiteConfig')
    expect(pluginSource).toContain('docsSiteAdapter.theme')
    expect(themeUtilsSource).not.toContain('resolveDocsThemeConfig')
  })
})
