import type {
  DocsThemeConfig,
  DocsThemeMode,
  DocsThemePreset,
  DocsThemeResolvedMode,
  ResolvedDocsThemeConfig,
} from '~/types/docs-theme'
import {
  isDocsThemeMode,
  resolveDocsThemeConfig,
} from '~/types/docs-theme'

type DocsThemeDocumentState = {
  mode: DocsThemeMode
  preset: DocsThemePreset
  resolvedMode: DocsThemeResolvedMode
  disableTransitionOnChange?: boolean
}

const transitionBlockerAttribute = 'data-docs-theme-transition-lock'

export function resolveDocsThemeMode(
  mode: DocsThemeMode,
  prefersDark: boolean,
): DocsThemeResolvedMode {
  if (mode === 'system') {
    return prefersDark ? 'dark' : 'light'
  }

  return mode
}

export function getDocsSystemPrefersDark() {
  if (!import.meta.client || !window.matchMedia) {
    return false
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function readStoredDocsThemeMode(storageKey: string) {
  if (!import.meta.client) {
    return null
  }

  try {
    const value = window.localStorage.getItem(storageKey)
    return isDocsThemeMode(value) ? value : null
  } catch {
    return null
  }
}

export function writeStoredDocsThemeMode(
  storageKey: string,
  mode: DocsThemeMode,
) {
  if (!import.meta.client) {
    return
  }

  try {
    window.localStorage.setItem(storageKey, mode)
  } catch {
    // localStorage can be unavailable in hardened browser contexts.
  }
}

function withoutThemeTransitions(callback: () => void) {
  if (!import.meta.client || !document.head) {
    callback()
    return
  }

  const style = document.createElement('style')
  style.setAttribute(transitionBlockerAttribute, '')
  style.textContent =
    '*,*::before,*::after{transition:none!important;animation-duration:0s!important;}'
  document.head.appendChild(style)

  callback()

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      style.remove()
    })
  })
}

export function applyDocsThemeDocumentState(state: DocsThemeDocumentState) {
  if (!import.meta.client) {
    return
  }

  const apply = () => {
    const root = document.documentElement

    root.classList.toggle('dark', state.resolvedMode === 'dark')
    root.dataset.docsTheme = state.preset
    root.dataset.docsThemeMode = state.mode
    root.dataset.docsThemeResolved = state.resolvedMode
    root.style.colorScheme = state.resolvedMode
  }

  if (state.disableTransitionOnChange) {
    withoutThemeTransitions(apply)
    return
  }

  apply()
}

export function createDocsThemeInitScript(config?: DocsThemeConfig) {
  const resolvedConfig = resolveDocsThemeConfig(config)
  const payload = JSON.stringify({
    defaultMode: resolvedConfig.defaultMode,
    enabled: resolvedConfig.enabled,
    preset: resolvedConfig.preset,
    storageKey: resolvedConfig.storageKey,
  } satisfies Pick<
    ResolvedDocsThemeConfig,
    'defaultMode' | 'enabled' | 'preset' | 'storageKey'
  >)

  return `(function(){try{var config=${payload};var root=document.documentElement;root.setAttribute('data-docs-theme',config.preset);if(config.enabled===false){return;}var stored=null;try{stored=window.localStorage.getItem(config.storageKey);}catch(error){}var mode=stored==='light'||stored==='dark'||stored==='system'?stored:config.defaultMode;var prefersDark=!!(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches);var resolved=mode==='system'?(prefersDark?'dark':'light'):mode;root.classList.toggle('dark',resolved==='dark');root.setAttribute('data-docs-theme-mode',mode);root.setAttribute('data-docs-theme-resolved',resolved);root.style.colorScheme=resolved;}catch(error){}})();`
}
