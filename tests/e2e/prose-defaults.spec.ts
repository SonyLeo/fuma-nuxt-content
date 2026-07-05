import { expect, test } from '@playwright/test'
import { expectCssPxNear } from './helpers/assertions'
import { gotoDocsFixture } from './helpers/docs-page'

test.describe('@fast @content prose defaults', () => {
  test('keeps links, inline code, table, and image contracts', async ({ page }) => {
    await gotoDocsFixture(page, '/guide/components')

    const section = page.locator('#prose-defaults')
    await expect(section).toBeVisible()

    const internalLink = page.getByRole('link', { name: 'internal docs link' })
    const externalLink = page.getByRole('link', { name: 'external docs link' })

    await expect(internalLink).toHaveAttribute('href', '/guide/getting-started')
    await expect(internalLink).not.toHaveAttribute('target', /.+/)
    await expect(externalLink).toHaveAttribute('href', /^https:\/\/www\.fumadocs\.dev\/?$/)
    await expect(externalLink).toHaveAttribute('target', '_blank')
    await expect(externalLink).toHaveAttribute('rel', /noopener/)
    await expect(internalLink).toHaveCSS('text-decoration-line', 'underline')
    await expect(externalLink).toHaveCSS('text-decoration-line', 'underline')

    const inlineCode = page.locator('.fd-doc-inline-code').filter({
      hasText: /^inline code$/,
    })

    await expect(inlineCode).toBeVisible()
    await expect(inlineCode).toHaveCSS('display', 'inline')
    await expectCssPxNear(inlineCode, 'border-radius', 6, 2)

    const tableWrapper = page.locator('.fd-doc-table').first()
    const table = tableWrapper.locator('table')

    await expect(tableWrapper).toHaveCSS('overflow-x', 'auto')
    await expect(tableWrapper).toHaveCSS('border-top-width', '1px')
    await expect(table).toHaveCSS('display', 'table')
    await expect(table).toHaveCSS('margin-top', '0px')
    await expect(table.locator('th').first()).toHaveCSS('font-weight', '600')
    await expect(table.locator('td').first()).toHaveCSS('min-width', '128px')

    const image = page.getByRole('img', { name: 'TinyRobot docs favicon' })
    const figure = image.locator(
      'xpath=ancestor::figure[contains(concat(" ", normalize-space(@class), " "), " fd-doc-image ")]',
    )

    await expect(figure).toHaveCSS('overflow-x', 'auto')
    await expect(image).toHaveAttribute('src', '/favicon.ico')
    await expect(image).toHaveAttribute('loading', 'lazy')
    await expect(image).toHaveAttribute('decoding', 'async')
    await expect(image).toHaveCSS('margin-top', '0px')
    await expect(figure.locator('figcaption')).toHaveText('TinyRobot docs favicon')
  })
})
