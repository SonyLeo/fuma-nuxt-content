import { expect, type Locator, type Page } from '@playwright/test'

export function isDesktopTocViewport(page: Page) {
  return (page.viewportSize()?.width ?? 0) >= 1280
}

export async function expectElementClearsLeft(left: Locator, right: Locator) {
  const leftBox = await left.boundingBox()
  const rightBox = await right.boundingBox()

  expect(leftBox).not.toBeNull()
  expect(rightBox).not.toBeNull()

  if (!leftBox || !rightBox) {
    return
  }

  expect(rightBox.x).toBeGreaterThanOrEqual(leftBox.x + leftBox.width - 1)
}

export async function expectElementsDoNotOverlap(
  left: Locator,
  right: Locator,
) {
  const leftBox = await left.boundingBox()
  const rightBox = await right.boundingBox()

  expect(leftBox).not.toBeNull()
  expect(rightBox).not.toBeNull()

  if (!leftBox || !rightBox) {
    return
  }

  expect(leftBox.x + leftBox.width).toBeLessThanOrEqual(rightBox.x + 1)
}
