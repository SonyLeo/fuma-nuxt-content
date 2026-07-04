import type { Slots } from 'vue'

export function useDocsLayoutSlots(slots: Slots) {
  const root = useDocsRootProvider()
  const theme = useDocsTheme()

  const hasSearchTrigger = computed(() => {
    return root.searchEnabled.value && Boolean(slots['search-trigger'])
  })
  const hasThemeSwitchReplacement = computed(() => {
    return Boolean(slots['theme-switch'])
  })
  const hasThemeSwitch = computed(() => {
    return hasThemeSwitchReplacement.value || theme.config.value.enabled
  })
  const hasLanguageSelect = computed(() => {
    return root.languageEnabled.value && Boolean(slots['language-select'])
  })
  const showDefaultThemeSwitch = computed(() => {
    return theme.config.value.enabled && !hasThemeSwitchReplacement.value
  })

  return {
    hasLanguageSelect,
    hasSearchTrigger,
    hasThemeSwitch,
    hasThemeSwitchReplacement,
    showDefaultThemeSwitch,
  }
}
