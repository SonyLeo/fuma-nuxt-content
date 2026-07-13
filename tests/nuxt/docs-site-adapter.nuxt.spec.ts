import { readFile } from 'node:fs/promises'
import { describe, expect, test } from 'vitest'
import type { DocsSiteConfig } from '~/types/docs-site'
import { resolveDocsThemeConfig } from '~/types/docs-theme'
import {
  createDocsSiteAdapter,
  createDocsSiteHomeLayoutProps,
  createDocsSiteLayoutProps,
  createDocsSitePageActions,
} from '~/utils/docs-site'

function createSiteConfig(
  overrides: Partial<DocsSiteConfig> = {},
): DocsSiteConfig {
  return {
    name: 'Adapter Docs',
    title: 'Adapter Docs',
    description: 'Adapter description',
    brand: {
      label: 'Adapter Brand',
      mark: 'A',
    },
    github: {
      owner: 'owner',
      repo: 'repo',
      branch: 'dev',
      contentDir: 'content/docs',
    },
    nav: {
      title: 'Guide',
      enabled: true,
      tabs: [
        {
          title: 'Guide',
          href: '/guide',
        },
      ],
      links: [
        {
          title: 'Home',
          href: '/',
        },
      ],
    },
    ...overrides,
  }
}

describe('docs site adapter', () => {
  test('derives stable root, docs layout, and home layout props', () => {
    const config = createSiteConfig()
    const adapter = createDocsSiteAdapter(config)

    expect(adapter.root).toEqual({
      dir: 'ltr',
      search: {
        enabled: true,
      },
      language: {
        enabled: false,
        label: 'Language',
      },
    })
    expect(adapter.docsLayout).toEqual(createDocsSiteLayoutProps(config))
    expect(adapter.docsLayout).toEqual({
      title: 'Adapter Docs',
      headline: 'Guide',
      brand: {
        label: 'Adapter Brand',
        mark: 'A',
        href: '/',
      },
      githubUrl: 'https://github.com/owner/repo',
      links: [
        {
          title: 'Home',
          href: '/',
        },
      ],
      nav: {
        title: 'Guide',
        enabled: true,
        tabs: [
          {
            title: 'Guide',
            href: '/guide',
          },
        ],
      },
    })
    expect(adapter.homeLayout).toEqual(createDocsSiteHomeLayoutProps(config))
    expect(adapter.homeLayout).toEqual({
      title: 'Adapter Docs',
      brand: {
        label: 'Adapter Brand',
        mark: 'A',
        href: '/',
      },
      githubUrl: 'https://github.com/owner/repo',
      links: [
        {
          title: 'Home',
          href: '/',
        },
      ],
    })
  })

  test('maps disabled search and language defaults consistently', () => {
    const disabled = createDocsSiteAdapter(
      createSiteConfig({
        search: {
          enabled: false,
          label: 'Find',
        },
      }),
    )
    const language = createDocsSiteAdapter(
      createSiteConfig({
        language: {
          enabled: true,
          label: 'Locale',
        },
      }),
    )

    expect(disabled.root.search.enabled).toBe(false)
    expect(disabled.page.search).toEqual({
      enabled: false,
      label: 'Find',
    })
    expect(disabled.root.language).toEqual({
      enabled: false,
      label: 'Language',
    })
    expect(language.root.language).toEqual({
      enabled: true,
      label: 'Locale',
    })
  })

  test('preserves page integration inputs and exposes resolved theme config', () => {
    const theme = {
      enabled: true,
      defaultMode: 'dark' as const,
      preset: 'purple' as const,
    }
    const adapter = createDocsSiteAdapter(
      createSiteConfig({
        pageActions: {
          source: true,
          edit: true,
          copyMarkdown: true,
          openInAi: true,
        },
        feedback: {
          enabled: true,
          promptLabel: 'Was this useful?',
        },
        seo: {
          siteUrl: 'https://docs.example.com',
          titleTemplate: '%s | Example',
          defaultDescription: 'SEO description',
          defaultOgImage: '/og.png',
        },
        theme,
      }),
    )

    expect(adapter.page.actions).toEqual({
      source: true,
      edit: true,
      copyMarkdown: true,
      openInAi: true,
    })
    expect(adapter.page.feedback).toEqual({
      enabled: true,
      promptLabel: 'Was this useful?',
    })
    expect(adapter.page.seo).toEqual({
      siteTitle: 'Adapter Docs',
      siteUrl: 'https://docs.example.com',
      titleTemplate: '%s | Example',
      defaultDescription: 'SEO description',
      defaultOgImage: '/og.png',
    })
    expect(adapter.theme).toEqual(resolveDocsThemeConfig(theme))
    expect(adapter.theme).not.toBe(theme)

    expect(
      createDocsSitePageActions({
        config: adapter.page.actions,
        github: adapter.page.github,
        sourcePath: 'guide/getting-started',
        canonicalUrl: 'https://docs.example.com/guide/getting-started',
        copyMarkdownState: 'idle',
      }).map((action) => action.id),
    ).toEqual([
      'open-github',
      'edit-page',
      'copy-markdown',
      'open-scira',
      'open-chatgpt',
      'open-claude',
      'open-cursor',
    ])
  })

  test('foundation components do not import global site config access', async () => {
    const componentPaths = [
      '../../app/components/docs/DocsRootProvider.vue',
      '../../app/components/docs/DocsLayoutShell.vue',
      '../../app/components/docs/DocsHomeLayout.vue',
      '../../app/components/docs/DocsNotFound.vue',
      '../../app/components/docs/DocsPage.vue',
      '../../app/components/docs/DocsPageHeader.vue',
      '../../app/components/docs/DocsPageFooter.vue',
    ]

    for (const path of componentPaths) {
      const source = await readFile(new URL(path, import.meta.url), 'utf8')

      expect(source).not.toContain('docsSiteConfig')
      expect(source).not.toContain('useDocsSite')
    }
  })
})
