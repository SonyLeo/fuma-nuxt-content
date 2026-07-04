import type {
  DocsThemeConfig,
  DocsThemeMode,
  DocsThemePreset,
  DocsThemeResolvedMode,
  ResolvedDocsThemeConfig,
} from '~/types/docs-theme'
import { isDocsThemeMode, resolveDocsThemeConfig } from '~/types/docs-theme'
import {
  applyDocsThemeDocumentState,
  getDocsSystemPrefersDark,
  readStoredDocsThemeMode,
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

export function useDocsTheme(config?: DocsThemeConfig) {
  const themeConfig = useState<ResolvedDocsThemeConfig>(
    'docs-theme-config',
    () => resolveDocsThemeConfig(config),
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

  function configure(nextConfig: DocsThemeConfig) {
    const resolvedConfig = resolveDocsThemeConfig(nextConfig)

    themeConfig.value = resolvedConfig
    if (!isDocsThemeMode(mode.value)) {
      mode.value = resolvedConfig.defaultMode
    }
    updateResolvedMode()
    applyDocumentState(false)
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

    const storedMode = readStoredDocsThemeMode(themeConfig.value.storageKey)

    mode.value = storedMode ?? themeConfig.value.defaultMode
    updateResolvedMode()
    applyDocumentState(false)

    stopSystemPreferenceListener?.()
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
    initialize,
    markMounted,
    setMode,
    setPreset,
    toggleMode,
  }
}
