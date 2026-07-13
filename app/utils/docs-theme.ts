import type {
  DocsThemeMode,
  DocsThemePreset,
  DocsThemeResolvedMode,
  ResolvedDocsThemeConfig,
} from '~/types/docs-theme'
import { isDocsThemeMode } from '~/types/docs-theme'

type DocsThemeDocumentState = {
  mode: DocsThemeMode
  preset: DocsThemePreset
  resolvedMode: DocsThemeResolvedMode
  disableTransitionOnChange?: boolean
}

export type DocsThemeInitialState = {
  mode: DocsThemeMode
  preset: DocsThemePreset
  resolvedMode: DocsThemeResolvedMode
}

export type ResolveDocsThemeInitialStateOptions = {
  config: ResolvedDocsThemeConfig
  storedMode?: string | null
  prefersDark: boolean
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

  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  } catch {
    return false
  }
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

export function resolveDocsThemeInitialState({
  config,
  storedMode,
  prefersDark,
}: ResolveDocsThemeInitialStateOptions): DocsThemeInitialState {
  const mode =
    config.enabled && isDocsThemeMode(storedMode)
      ? storedMode
      : config.defaultMode

  return {
    mode,
    preset: config.preset,
    resolvedMode: resolveDocsThemeMode(mode, prefersDark),
  }
}

function withoutThemeTransitions(callback: () => void) {
  if (!import.meta.client || !document.head) {
    callback()
    return
  }

  document.head
    .querySelectorAll(`[${transitionBlockerAttribute}]`)
    .forEach((node) => node.remove())

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

export function createDocsThemeInitScript(config: ResolvedDocsThemeConfig) {
  const payload = JSON.stringify({
    defaultMode: config.defaultMode,
    enabled: config.enabled,
    preset: config.preset,
    storageKey: config.storageKey,
  } satisfies Pick<
    ResolvedDocsThemeConfig,
    'defaultMode' | 'enabled' | 'preset' | 'storageKey'
  >)

  return `(function(){try{var config=${payload};var root=document.documentElement;root.setAttribute('data-docs-theme',config.preset);var mode=config.defaultMode;if(config.enabled!==false){var stored=null;try{stored=window.localStorage.getItem(config.storageKey);}catch(error){}if(stored==='light'||stored==='dark'||stored==='system'){mode=stored;}}var prefersDark=false;try{prefersDark=!!(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches);}catch(error){}var resolved=mode==='system'?(prefersDark?'dark':'light'):mode;root.classList.toggle('dark',resolved==='dark');root.setAttribute('data-docs-theme-mode',mode);root.setAttribute('data-docs-theme-resolved',resolved);root.style.colorScheme=resolved;}catch(error){}})();`
}
