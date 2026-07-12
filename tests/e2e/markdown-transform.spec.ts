import { expect, test } from '@playwright/test'
import { expectCountAtLeast } from './helpers/assertions'
import { gotoDocsFixture } from './helpers/docs-page'

test.describe('@fast @content markdown transform pipeline', () => {
  test('feeds structured markdown content into local search', async ({
    page,
  }) => {
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
    await expect(
      page.locator('.docs-search-result-title').first(),
    ).toContainText('Code Block')
  })
})
