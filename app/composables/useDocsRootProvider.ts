import type { InjectionKey, Ref } from 'vue'
import type { DocsDirection, DocsRootProviderProps } from '~/types/docs'
import {
  docsRootProviderDefaults,
  resolveDocsRootProviderProps,
} from '~/utils/docs-root-provider'

export type DocsRootProviderContext = {
  dir: Ref<DocsDirection>
  searchEnabled: Ref<boolean>
  languageEnabled: Ref<boolean>
  languageLabel: Ref<string>
}

const docsRootProviderKey: InjectionKey<DocsRootProviderContext> =
  Symbol('docs-root-provider')

const fallbackDir = computed<DocsDirection>(() => docsRootProviderDefaults.dir)
const fallbackSearchEnabled = computed(
  () => docsRootProviderDefaults.search.enabled,
)
const fallbackLanguageEnabled = computed(
  () => docsRootProviderDefaults.language.enabled,
)
const fallbackLanguageLabel = computed(
  () => docsRootProviderDefaults.language.label,
)

export function provideDocsRootProvider(options: DocsRootProviderProps = {}) {
  const resolved = computed(() => resolveDocsRootProviderProps(options))
  const dir = computed<DocsDirection>(() => resolved.value.dir)
  const searchEnabled = computed(() => resolved.value.search.enabled)
  const languageEnabled = computed(() => resolved.value.language.enabled)
  const languageLabel = computed(() => resolved.value.language.label)

  const context: DocsRootProviderContext = {
    dir,
    searchEnabled,
    languageEnabled,
    languageLabel,
  }

  provide(docsRootProviderKey, context)

  return context
}

export function useDocsRootProvider() {
  return (
    inject(docsRootProviderKey, null) ?? {
      dir: fallbackDir,
      searchEnabled: fallbackSearchEnabled,
      languageEnabled: fallbackLanguageEnabled,
      languageLabel: fallbackLanguageLabel,
    }
  )
}
