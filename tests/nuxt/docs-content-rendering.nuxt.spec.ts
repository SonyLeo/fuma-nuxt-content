import { describe, expect, test } from 'vitest'
import { mountDocsContent } from './helpers/mount-docs-content'

function findLinkByText(
  links: Array<{
    text: () => string
    attributes: (name?: string) => Record<string, string> | string | undefined
  }>,
  text: string,
) {
  return links.find((link) => link.text().trim() === text)
}

describe('docs content runtime rendering', () => {
  test('renders prose defaults structure without browser-only assertions', async () => {
    const wrapper = await mountDocsContent('/guide/components')

    try {
      expect(wrapper.find('#prose-defaults').exists()).toBe(true)

      const links = wrapper.findAll('a')
      const internalLink = findLinkByText(links, 'internal docs link')
      const externalLink = findLinkByText(links, 'external docs link')

      expect(internalLink).toBeDefined()
      expect(internalLink?.attributes('href')).toBe('/guide/getting-started')
      expect(internalLink?.attributes('target')).toBeUndefined()
      expect(externalLink).toBeDefined()
      expect(externalLink?.attributes('href')).toMatch(
        /^https:\/\/www\.fumadocs\.dev\/?$/,
      )
      expect(externalLink?.attributes('target')).toBe('_blank')
      expect(externalLink?.attributes('rel') ?? '').toContain('noopener')

      const inlineCode = wrapper
        .findAll('.fd-doc-inline-code')
        .find((node) => node.text().trim() === 'inline code')

      expect(inlineCode?.exists()).toBe(true)

      const tableWrapper = wrapper.get('.fd-doc-table')
      const table = tableWrapper.find('table')

      expect(table.exists()).toBe(true)
      expect(
        table
          .findAll('th')
          .map((node) => node.text().trim())
          .slice(0, 3),
      ).toEqual(['Name', 'Type', 'Notes'])
      expect(
        table
          .findAll('td')
          .map((node) => node.text().trim())
          .slice(0, 3),
      ).toEqual([
        'title',
        'string',
        'Used by headings and page metadata.',
      ])

      const image = wrapper.get('img[alt="TinyRobot docs favicon"]')

      expect(image.attributes('src')).toContain('/favicon.ico')
      expect(image.attributes('loading')).toBe('lazy')
      expect(image.attributes('decoding')).toBe('async')

      const figure = image.element.closest('figure')

      expect(figure).not.toBeNull()
      expect(figure?.className ?? '').toContain('fd-doc-image')
      expect(figure?.querySelector('figcaption')?.textContent?.trim()).toBe(
        'TinyRobot docs favicon',
      )
    } finally {
      wrapper.unmount()
    }
  })

  test('applies markdown transform ids and code metadata in runtime render', async () => {
    const wrapper = await mountDocsContent('/guide/code-block')

    try {
      const customHeading = wrapper.get('#custom-keep-background')

      expect(customHeading.text()).toContain('Keep Background')
      expect(wrapper.text()).not.toContain('[#custom-keep-background]')

      const transformedBlock = wrapper
        .findAll('.fd-doc-code-block')
        .find(
          (node) => node.find('figcaption').exists() && node.find('figcaption').text() === 'keep-background.tsx',
        )

      expect(transformedBlock).toBeDefined()
      expect(transformedBlock?.classes()).toContain('keep-background')
      expect(transformedBlock?.attributes('data-line-numbers')).toBeDefined()
      expect(transformedBlock?.attributes('data-line-numbers-start')).toBe('5')
      expect(transformedBlock?.findAll('.line').length ?? 0).toBeGreaterThan(0)
    } finally {
      wrapper.unmount()
    }
  })

  test('renders code block shell, preview, and install card in Nuxt runtime', async () => {
    const wrapper = await mountDocsContent('/guide/code-block')

    try {
      const blocks = wrapper.findAll('.fd-doc-code-block')

      expect(blocks.length).toBeGreaterThanOrEqual(3)

      const first = blocks[0]

      expect(first?.element.tagName).toBe('FIGURE')
      expect(first?.attributes('dir')).toBe('ltr')
      expect(first?.attributes('tabindex')).toBe('-1')
      expect(first?.classes()).toContain('shiki')
      expect(first?.classes()).toContain('not-prose')

      expect(wrapper.find('.fd-doc-preview').exists()).toBe(true)
      expect(wrapper.get('.fd-doc-install-card').text()).toContain(
        '@fumadocs/cli',
      )

      const headingTexts = wrapper
        .findAll('.docs-page-body h2[id], .docs-page-body h3[id]')
        .map((node) => node.text().trim())

      expect(headingTexts).toEqual(
        expect.arrayContaining(['Usage', 'Keep Background', 'Icons']),
      )

      const titled = blocks.find((node) => node.find('figcaption').exists())
      const untitled = blocks.find((node) =>
        node.find('.fd-doc-code-block-floating-actions').exists(),
      )

      expect(titled).toBeDefined()
      expect(titled?.find('.fd-doc-code-block-header').exists()).toBe(true)
      expect(titled?.find('figcaption').text()).toBe('config.js')
      expect(titled?.find('.fd-doc-code-block-icon').exists()).toBe(true)
      expect(titled?.find('.fd-doc-code-copy').exists()).toBe(true)
      expect(untitled).toBeDefined()
      expect(untitled?.find('.fd-doc-code-block-floating-actions').exists()).toBe(
        true,
      )
      expect(untitled?.find('.fd-doc-code-copy').exists()).toBe(true)
    } finally {
      wrapper.unmount()
    }
  })
})
