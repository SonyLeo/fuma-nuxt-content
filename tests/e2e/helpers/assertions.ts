import { expect, type Locator, type Page } from '@playwright/test'

export async function expectCountAtLeast(locator: Locator, minimum: number) {
  await expect.poll(() => locator.count()).toBeGreaterThanOrEqual(minimum)
}

export async function expectAttributeOneOf(
  locator: Locator,
  name: string,
  values: string[],
) {
  await expect(locator).toHaveAttribute(
    name,
    new RegExp(`^(${values.join('|')})$`),
  )
}

export async function expectCountExactly(locator: Locator, count: number) {
  await expect.poll(() => locator.count()).toBe(count)
}

export async function expectCssPxNear(
  locator: Locator,
  property: string,
  expected: number,
  tolerance = 1,
) {
  await expect
    .poll(async () => {
      const value = await locator.evaluate(
        (element, name) => getComputedStyle(element).getPropertyValue(name),
        property,
      )

      return Number.parseFloat(value)
    })
    .toBeGreaterThanOrEqual(expected - tolerance)

  await expect
    .poll(async () => {
      const value = await locator.evaluate(
        (element, name) => getComputedStyle(element).getPropertyValue(name),
        property,
      )

      return Number.parseFloat(value)
    })
    .toBeLessThanOrEqual(expected + tolerance)
}

export async function expectDocumentNoHorizontalOverflow(page: Page) {
  await expect
    .poll(async () =>
      page.evaluate(() => ({
        innerWidth: window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
      })),
    )
    .toMatchObject({ scrollWidth: expect.any(Number) })

  const viewport = page.viewportSize()
  const scrollWidth = await page.evaluate(
    () => document.documentElement.scrollWidth,
  )

  expect(scrollWidth).toBeLessThanOrEqual((viewport?.width ?? 0) + 1)
}

export async function expectBoxInside(container: Locator, child: Locator) {
  const containerBox = await container.boundingBox()
  const childBox = await child.boundingBox()

  expect(containerBox).not.toBeNull()
  expect(childBox).not.toBeNull()

  if (!containerBox || !childBox) {
    return
  }

  expect(childBox.x).toBeGreaterThanOrEqual(containerBox.x - 1)
  expect(childBox.x + childBox.width).toBeLessThanOrEqual(
    containerBox.x + containerBox.width + 1,
  )
}

export async function expectVisibleBox(locator: Locator) {
  await expect(locator).toBeVisible()

  const box = await locator.boundingBox()

  expect(box).not.toBeNull()
  expect(box?.width ?? 0).toBeGreaterThan(0)
  expect(box?.height ?? 0).toBeGreaterThan(0)

  return box
}
