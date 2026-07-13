export const docsThemeModes = ['light', 'dark', 'system'] as const
export type DocsThemeMode = (typeof docsThemeModes)[number]

export const docsThemeResolvedModes = ['light', 'dark'] as const
export type DocsThemeResolvedMode = (typeof docsThemeResolvedModes)[number]

export const docsThemeSwitchModes = ['light-dark', 'light-dark-system'] as const
export type DocsThemeSwitchMode = (typeof docsThemeSwitchModes)[number]

export const docsThemePresets = [
  'default',
  'neutral',
  'black',
  'purple',
] as const
export type DocsThemePreset = (typeof docsThemePresets)[number]

export type DocsThemeConfig = {
  enabled?: boolean
  defaultMode?: DocsThemeMode
  switchMode?: DocsThemeSwitchMode
  storageKey?: string
  preset?: DocsThemePreset
  disableTransitionOnChange?: boolean
}

export type ResolvedDocsThemeConfig = Required<DocsThemeConfig>

export const docsThemeDefaults: ResolvedDocsThemeConfig = {
  enabled: true,
  defaultMode: 'system',
  switchMode: 'light-dark-system',
  storageKey: 'fuma-nuxt-theme',
  preset: 'default',
  disableTransitionOnChange: true,
}

export function isDocsThemeMode(
  value: string | null | undefined,
): value is DocsThemeMode {
  return docsThemeModes.includes(value as DocsThemeMode)
}

export function isDocsThemeResolvedMode(
  value: string | null | undefined,
): value is DocsThemeResolvedMode {
  return docsThemeResolvedModes.includes(value as DocsThemeResolvedMode)
}

export function isDocsThemeSwitchMode(
  value: string | null | undefined,
): value is DocsThemeSwitchMode {
  return docsThemeSwitchModes.includes(value as DocsThemeSwitchMode)
}

export function isDocsThemePreset(
  value: string | null | undefined,
): value is DocsThemePreset {
  return docsThemePresets.includes(value as DocsThemePreset)
}

export function resolveDocsThemeConfig(
  config: DocsThemeConfig | undefined,
): ResolvedDocsThemeConfig {
  return {
    ...docsThemeDefaults,
    enabled:
      typeof config?.enabled === 'boolean'
        ? config.enabled
        : docsThemeDefaults.enabled,
    defaultMode: isDocsThemeMode(config?.defaultMode)
      ? config.defaultMode
      : docsThemeDefaults.defaultMode,
    switchMode: isDocsThemeSwitchMode(config?.switchMode)
      ? config.switchMode
      : docsThemeDefaults.switchMode,
    preset: isDocsThemePreset(config?.preset)
      ? config.preset
      : docsThemeDefaults.preset,
    storageKey: config?.storageKey?.trim() || docsThemeDefaults.storageKey,
    disableTransitionOnChange:
      typeof config?.disableTransitionOnChange === 'boolean'
        ? config.disableTransitionOnChange
        : docsThemeDefaults.disableTransitionOnChange,
  }
}
