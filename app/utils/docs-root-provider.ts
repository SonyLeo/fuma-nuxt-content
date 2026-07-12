import type {
  DocsResolvedRootProviderProps,
  DocsRootProviderProps,
} from '~/types/docs'

export const docsRootProviderDefaults: DocsResolvedRootProviderProps = {
  dir: 'ltr',
  search: {
    enabled: true,
  },
  language: {
    enabled: false,
    label: 'Language',
  },
}

export function resolveDocsRootProviderProps(
  props: DocsRootProviderProps = {},
): DocsResolvedRootProviderProps {
  return {
    dir: props.dir ?? docsRootProviderDefaults.dir,
    search: {
      enabled: props.search?.enabled ?? docsRootProviderDefaults.search.enabled,
    },
    language: {
      enabled:
        props.language?.enabled ?? docsRootProviderDefaults.language.enabled,
      label:
        props.language?.label?.trim() ||
        docsRootProviderDefaults.language.label,
    },
  }
}
