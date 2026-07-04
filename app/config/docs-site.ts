import { defineDocsSiteConfig } from '~/types/docs-site'

export const docsSiteConfig = defineDocsSiteConfig({
  name: 'Fumadocs',
  title: 'Fumadocs',
  description:
    'A Nuxt Content docs foundation aligned with Fumadocs protocols.',
  url: 'https://github.com/SonyLeo/fuma-nuxt-content',
  brand: {
    label: 'Fumadocs',
    mark: '',
  },
  github: {
    owner: 'SonyLeo',
    repo: 'fuma-nuxt-content',
    branch: 'dev',
    contentDir: 'content',
  },
  nav: {
    title: 'Documentation',
    enabled: true,
    tabs: [
      {
        title: 'Framework',
        href: '/guide/framework',
        description: 'The docs framework',
        icon: 'framework',
        active: 'none',
      },
      {
        title: 'Fumadocs UI',
        href: '/guide',
        description: 'The default theme',
        icon: 'layout',
        active: 'nested-url',
      },
      {
        title: 'Fumadocs Core',
        href: '/guide/core',
        description: 'The headless library',
        icon: 'cube',
        active: 'none',
      },
      {
        title: 'Fumadocs MDX',
        href: '/guide/mdx',
        description: 'The official content source',
        icon: 'pen',
        active: 'none',
      },
      {
        title: 'Fumadocs CLI',
        href: '/guide/cli',
        description: 'CLI tools for docs & automation',
        icon: 'terminal',
        active: 'none',
      },
    ],
    links: [
      {
        title: 'Guide',
        href: '/guide/components',
        active: 'nested-url',
        on: 'nav',
      },
      {
        title: 'GitHub',
        href: 'https://github.com/SonyLeo/fuma-nuxt-content',
        type: 'icon',
        icon: 'github',
        external: true,
        active: 'none',
        on: 'all',
        ariaLabel: 'GitHub repository',
      },
    ],
  },
  pageActions: {
    source: true,
    edit: true,
    copyMarkdown: true,
    openInAi: true,
  },
  search: {
    enabled: true,
    provider: 'local',
    label: 'Search',
    placeholder: 'Search documentation...',
    emptyLabel: 'No results found.',
  },
  feedback: {
    enabled: true,
    provider: 'local',
    positiveLabel: 'Helpful',
    negativeLabel: 'Not helpful',
    thanksLabel: 'Thanks for the feedback.',
  },
  seo: {
    titleTemplate: '%s | Fuma Nuxt Content',
    defaultDescription:
      'A Nuxt Content docs foundation aligned with Fumadocs protocols.',
  },
  images: {
    remote: 'allow',
    requireAlt: true,
    lazy: true,
    captions: true,
  },
  theme: {
    enabled: true,
    defaultMode: 'system',
    switchMode: 'light-dark-system',
    storageKey: 'fuma-nuxt-theme',
    preset: 'default',
    disableTransitionOnChange: true,
  },
})
