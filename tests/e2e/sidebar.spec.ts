import { expect, test } from '@playwright/test'
import { expectCountAtLeast } from './helpers/assertions'
import {
  activeSidebarScope,
  gotoDocsFixture,
  isNarrowViewport,
  openMobileNav,
} from './helpers/docs-page'
import { clickAndExpectExpanded } from './helpers/interaction'

test.describe('@fast @shell sidebar', () => {
  test('exposes tab, separators, and current item contract', async ({ page }) => {
    await gotoDocsFixture(page, '/guide/component-detail')

    const scope = await activeSidebarScope(page)

    await expect(scope.locator('.docs-sidebar-tab-trigger')).toContainText(
      'Fumadocs UI',
    )
    await expect(scope.locator('.docs-sidebar-tab-trigger')).toHaveAttribute(
      'aria-expanded',
      'false',
    )

    const separators = scope.locator('.docs-sidebar-separator')

    for (const label of ['Introduction', 'References', 'Components', 'Layouts']) {
      await expect(separators.filter({ hasText: label })).toHaveCount(1)
    }

    await expect(
      scope.locator('.docs-sidebar-link[aria-current="page"] .docs-sidebar-link-label'),
    ).toHaveText('Accordion')
    await expectCountAtLeast(scope.locator('.docs-sidebar-link'), 1)
  })

  test('opens tabs menu without shifting sidebar nav flow', async ({ page }) => {
    await gotoDocsFixture(page, '/guide/component-detail')

    const scope = await activeSidebarScope(page)
    const navTop = await scope.locator('.docs-sidebar-nav').boundingBox()
    const trigger = scope.locator('.docs-sidebar-tab-trigger')

    await clickAndExpectExpanded(trigger)
    await expect(scope.locator('.docs-sidebar-tab-panel')).toBeVisible()
    await expect(scope.locator('.docs-sidebar-tab-panel')).toHaveAttribute('role', 'menu')
    await expect(
      scope.locator('.docs-sidebar-tab-option[aria-current="page"]'),
    ).toContainText('Fumadocs UI')

    const navTopAfter = await scope.locator('.docs-sidebar-nav').boundingBox()

    expect(Math.round(navTopAfter?.y ?? 0)).toBe(Math.round(navTop?.y ?? 0))
  })

  test('exposes folder trigger, link, and content semantics when folders are visible', async ({
    page,
  }) => {
    test.skip(isNarrowViewport(page), 'Folder protocol is covered in persistent sidebar.')

    await gotoDocsFixture(page, '/guide/component-detail')

    const scope = await activeSidebarScope(page)
    const folders = scope.locator('.docs-sidebar-folder')
    const folderCount = await folders.count()

    test.skip(
      folderCount === 0,
      'The current public sidebar fixture has no visible folder nodes yet.',
    )

    const folder = folders.first()
    const control = folder
      .locator('.docs-sidebar-folder-trigger, .docs-sidebar-folder-link')
      .first()
    const contentId = await control.getAttribute('aria-controls')

    await expect(folder).toHaveAttribute('data-state', /^(open|closed)$/)
    await expect(control).toHaveAttribute('aria-expanded', /^(true|false)$/)
    expect(contentId).toBeTruthy()

    const content = scope.locator(`#${contentId}`)

    await expect(content).toHaveCount(1)
    await expect(content).toHaveAttribute('data-state', /^(open|closed)$/)

    if ((await folder.locator('.docs-sidebar-folder-trigger').count()) > 0) {
      const trigger = folder.locator('.docs-sidebar-folder-trigger').first()
      const previousState = await trigger.getAttribute('aria-expanded')

      await trigger.click()
      await expect(trigger).not.toHaveAttribute(
        'aria-expanded',
        previousState ?? '',
      )
    }
  })

  test('supports collapse, hover preview, and floating pin on desktop', async ({
    page,
  }) => {
    test.skip(isNarrowViewport(page), 'Mobile sidebar uses the drawer contract.')

    await gotoDocsFixture(page, '/guide/component-detail')

    const layout = page.locator('#nd-docs-layout')
    const sidebar = page.locator('#nd-sidebar')
    const inner = sidebar.locator('.docs-sidebar-inner')

    await sidebar.locator('.docs-sidebar-collapse').click()
    await expect(layout).toHaveAttribute('data-sidebar-collapsed', 'true')
    await expect(sidebar).toHaveAttribute('data-collapsed', 'true')
    await expect(page.locator('.docs-sidebar-floating')).toBeVisible()
    await expect(inner).toHaveCSS('opacity', '0')

    await sidebar.locator('.docs-sidebar-hover-zone').dispatchEvent('pointerenter', {
      clientX: 1,
      pointerType: 'mouse',
    })
    await expect(sidebar).toHaveAttribute('data-hovered', 'true')
    await expect(inner).toHaveCSS('opacity', '1')
    await expect(page.locator('.docs-sidebar-floating')).toHaveClass(/is-hidden/)

    await page.mouse.move(400, 20)
    await expect(page.locator('.docs-sidebar-floating')).not.toHaveClass(/is-hidden/)
    await page.locator('.docs-sidebar-floating-button').click()
    await expect(layout).toHaveAttribute('data-sidebar-collapsed', 'false')
    await expect(sidebar).toHaveAttribute('data-collapsed', 'false')
    await expect(page.locator('.docs-sidebar-floating')).toHaveCount(0)
  })

  test('uses mobile nav drawer instead of desktop sidebar on narrow screens', async ({
    page,
  }) => {
    test.skip(!isNarrowViewport(page), 'Desktop uses the persistent sidebar.')

    await gotoDocsFixture(page, '/guide/component-detail')

    await expect(page.locator('#nd-sidebar')).toBeHidden()

    const panel = await openMobileNav(page)
    const panelBox = await panel.boundingBox()
    const viewportWidth = await page.evaluate(() => window.innerWidth)
    const viewportHeight = await page.evaluate(() => window.innerHeight)
    const bodyOverflow = await page.evaluate(() => document.body.style.overflow)

    await expect(panel).toHaveCSS('position', 'fixed')
    await expect(page.locator('.docs-mobile-nav-overlay')).toHaveAttribute(
      'data-state',
      'open',
    )
    expect(bodyOverflow).toBe('hidden')
    expect(panelBox?.height).toBe(viewportHeight)
    expect(Math.round((panelBox?.x ?? 0) + (panelBox?.width ?? 0))).toBe(
      viewportWidth,
    )
    expect(panelBox?.width ?? 0).toBeGreaterThan(viewportWidth * 0.8)
    await expect(panel.locator('.docs-sidebar')).toBeVisible()
    await expect(panel.locator('.docs-sidebar-link[aria-current="page"]')).toContainText(
      'Accordion',
    )

    await page.keyboard.press('Escape')
    await expect(panel).toHaveAttribute('data-state', 'closed')
    await expect(page.locator('#docs-header-sidebar-trigger')).toBeFocused()
    await expect(page.locator('#nd-docs-layout')).toHaveAttribute(
      'data-sidebar-mobile-open',
      'false',
    )
  })

  test('closes the mobile drawer from the overlay', async ({ page }) => {
    test.skip(!isNarrowViewport(page), 'Desktop uses the persistent sidebar.')

    await gotoDocsFixture(page, '/guide/component-detail')

    const panel = await openMobileNav(page)
    const overlay = page.locator('.docs-mobile-nav-overlay')

    await overlay.click({
      position: {
        x: 8,
        y: 8,
      },
    })

    await expect(panel).toHaveAttribute('data-state', 'closed')
    await expect(page.locator('#nd-docs-layout')).toHaveAttribute(
      'data-sidebar-mobile-open',
      'false',
    )
  })
})
