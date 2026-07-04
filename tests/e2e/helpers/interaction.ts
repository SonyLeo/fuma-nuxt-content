import { expect, type Locator, type Page } from '@playwright/test'

export async function firstVisible(page: Page, selector: string): Promise<Locator> {
  const locator = page.locator(selector)
  const count = await locator.count()

  for (let index = 0; index < count; index += 1) {
    const item = locator.nth(index)

    if (await item.isVisible()) {
      return item
    }
  }

  throw new Error(`No visible element found for selector: ${selector}`)
}

export async function clickFirstVisible(page: Page, selector: string) {
  const locator = await firstVisible(page, selector)

  await locator.click()

  return locator
}

export async function clickAndExpectExpanded(trigger: Locator) {
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await trigger.click()
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
}
