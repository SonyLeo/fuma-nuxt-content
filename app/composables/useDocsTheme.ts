import type {
  DocsThemeMode,
  DocsThemePreset,
  DocsThemeResolvedMode,
  ResolvedDocsThemeConfig,
} from '~/types/docs-theme'
import { docsThemeDefaults, isDocsThemeMode } from '~/types/docs-theme'
import {
  applyDocsThemeDocumentState,
  getDocsSystemPrefersDark,
  readStoredDocsThemeMode,
  resolveDocsThemeInitialState,
  resolveDocsThemeMode,
  writeStoredDocsThemeMode,
} from '~/utils/docs-theme'

let stopSystemPreferenceListener: (() => void) | undefined

function watchSystemPreference(onChange: () => void) {
  if (!import.meta.client || !window.matchMedia) {
    return
  }

  const media = window.matchMedia('(prefers-color-scheme: dark)')
  const listener = () => onChange()

  media.addEventListener('change', listener)
  stopSystemPreferenceListener = () => {
    media.removeEventListener('change', listener)
    stopSystemPreferenceListener = undefined
  }
}

function stopSystemPreferenceWatcher() {
  stopSystemPreferenceListener?.()
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    stopSystemPreferenceWatcher()
  })
}

export function useDocsTheme(config?: ResolvedDocsThemeConfig) {
  const themeConfig = useState<ResolvedDocsThemeConfig>(
    'docs-theme-config',
    () => config ?? docsThemeDefaults,
  )
  const mode = useState<DocsThemeMode>(
    'docs-theme-mode',
    () => themeConfig.value.defaultMode,
  )
  const resolvedMode = useState<DocsThemeResolvedMode>(
    'docs-theme-resolved-mode',
    () =>
      resolveDocsThemeMode(
        themeConfig.value.defaultMode,
        getDocsSystemPrefersDark(),
      ),
  )
  const mounted = useState('docs-theme-mounted', () => false)

  if (config) {
    configure(config)
  }

  const isDark = computed(() => resolvedMode.value === 'dark')

  function configure(nextConfig: ResolvedDocsThemeConfig) {
    themeConfig.value = nextConfig
    if (!nextConfig.enabled || !isDocsThemeMode(mode.value)) {
      mode.value = nextConfig.defaultMode
    }
    updateResolvedMode()

    if (!nextConfig.enabled) {
      stopSystemPreferenceWatcher()
    }
  }

  function updateResolvedMode() {
    resolvedMode.value = resolveDocsThemeMode(
      mode.value,
      getDocsSystemPrefersDark(),
    )
  }

  function applyDocumentState(disableTransition = true) {
    applyDocsThemeDocumentState({
      mode: mode.value,
      preset: themeConfig.value.preset,
      resolvedMode: resolvedMode.value,
      disableTransitionOnChange:
        disableTransition && themeConfig.value.disableTransitionOnChange,
    })
  }

  function setMode(nextMode: DocsThemeMode) {
    if (!themeConfig.value.enabled || !isDocsThemeMode(nextMode)) {
      return
    }

    mode.value = nextMode
    updateResolvedMode()
    writeStoredDocsThemeMode(themeConfig.value.storageKey, mode.value)
    applyDocumentState()
  }

  function toggleMode() {
    setMode(resolvedMode.value === 'dark' ? 'light' : 'dark')
  }

  function setPreset(nextPreset: DocsThemePreset) {
    themeConfig.value = {
      ...themeConfig.value,
      preset: nextPreset,
    }
    applyDocumentState()
  }

  function initialize() {
    if (!import.meta.client) {
      return
    }

    const initialState = resolveDocsThemeInitialState({
      config: themeConfig.value,
      storedMode: themeConfig.value.enabled
        ? readStoredDocsThemeMode(themeConfig.value.storageKey)
        : null,
      prefersDark: getDocsSystemPrefersDark(),
    })

    mode.value = initialState.mode
    resolvedMode.value = initialState.resolvedMode
    applyDocumentState(false)

    stopSystemPreferenceWatcher()
    if (!themeConfig.value.enabled) {
      return
    }

    watchSystemPreference(() => {
      if (mode.value !== 'system') {
        return
      }

      updateResolvedMode()
      applyDocumentState()
    })
  }

  function markMounted() {
    mounted.value = true
  }

  return {
    config: readonly(themeConfig),
    isDark,
    mode: readonly(mode),
    mounted: readonly(mounted),
    resolvedMode: readonly(resolvedMode),
    applyDocumentState,
    configure,
    dispose: stopSystemPreferenceWatcher,
    initialize,
    markMounted,
    setMode,
    setPreset,
    toggleMode,
  }
}
