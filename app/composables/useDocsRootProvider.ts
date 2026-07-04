import type { InjectionKey, Ref } from 'vue'
import type {
  DocsDirection,
  DocsRootLanguageOptions,
  DocsRootSearchOptions,
} from '~/types/docs'

type DocsRootProviderOptions = {
  dir?: DocsDirection
  search?: DocsRootSearchOptions
  language?: DocsRootLanguageOptions
}

type DocsRootProviderContext = {
  dir: Ref<DocsDirection>
  searchEnabled: Ref<boolean>
  languageEnabled: Ref<boolean>
  languageLabel: Ref<string>
}

const docsRootProviderKey: InjectionKey<DocsRootProviderContext> = Symbol(
  'docs-root-provider',
)

const fallbackDir = computed<DocsDirection>(() => 'ltr')
const fallbackSearchEnabled = computed(() => true)
const fallbackLanguageEnabled = computed(() => false)
const fallbackLanguageLabel = computed(() => 'Language')

export function provideDocsRootProvider(options: DocsRootProviderOptions = {}) {
  const dir = computed<DocsDirection>(() => options.dir ?? 'ltr')
  const searchEnabled = computed(() => options.search?.enabled !== false)
  const languageEnabled = computed(() => options.language?.enabled === true)
  const languageLabel = computed(() => options.language?.label ?? 'Language')

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
  return inject(docsRootProviderKey, null) ?? {
    dir: fallbackDir,
    searchEnabled: fallbackSearchEnabled,
    languageEnabled: fallbackLanguageEnabled,
    languageLabel: fallbackLanguageLabel,
  }
}
