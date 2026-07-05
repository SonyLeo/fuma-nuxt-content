import { expect, test } from '@playwright/test'
import { expectCountAtLeast } from './helpers/assertions'
import { gotoDocsFixture } from './helpers/docs-page'

test.describe('@fast @content markdown transform pipeline', () => {
  test('applies custom heading ids and structured code meta', async ({ page }) => {
    await gotoDocsFixture(page, '/guide/code-block')

    const customHeading = page.locator('#custom-keep-background')

    await expect(customHeading).toBeVisible()
    await expect(customHeading).toContainText('Keep Background')
    await expect(page.getByText('[#custom-keep-background]')).toHaveCount(0)
    await expect(page.getByText('#custom-keep-background')).toHaveCount(0)

    const transformedBlock = page
      .locator('.fd-doc-code-block')
      .filter({ has: page.locator('figcaption', { hasText: 'keep-background.tsx' }) })

    await expect(transformedBlock).toBeVisible()
    await expect(transformedBlock).toHaveClass(/keep-background/)
    await expect(transformedBlock).toHaveAttribute('data-line-numbers', '')
    await expect(transformedBlock).toHaveAttribute('data-line-numbers-start', '5')
    await expect(transformedBlock.locator('.line').first()).toBeVisible()
  })

  test('feeds structured markdown content into local search', async ({ page }) => {
    await gotoDocsFixture(page, '/guide/code-block')

    await page
      .locator('.docs-search-trigger')
      .filter({ visible: true })
      .first()
      .click()

    const dialog = page.locator('.docs-search-dialog')
    const input = page.locator('.docs-search-input')

    await expect(dialog).toBeVisible()
    await input.fill('runtime syntax highlighting')
    await expectCountAtLeast(page.locator('.docs-search-result-link'), 1)
    await expect(page.locator('.docs-search-result-title').first()).toContainText(
      'Code Block',
    )
  })
})
