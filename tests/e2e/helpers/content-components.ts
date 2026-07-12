import type { Page } from '@playwright/test'
import { gotoDocsFixture } from './docs-page'

export async function gotoComponentsPage(page: Page) {
  await gotoDocsFixture(page, '/guide/components')
}
