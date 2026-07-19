import { devices, expect, test } from '@playwright/test'
import { expectCountAtLeast } from './helpers/assertions'
import {
  activeSidebarScope,
  gotoDocsFixture,
  isNarrowViewport,
  openMobileNav,
} from './helpers/docs-page'
import { clickAndExpectExpanded } from './helpers/interaction'

test.describe('@fast @shell sidebar', () => {
  test('@responsive exposes tab, separators, and current item contract', async ({
    page,
  }) => {
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

    for (const label of ['Introduction', 'References']) {
      await expect(separators.filter({ hasText: label })).toHaveCount(1)
    }

    await expect(
      scope.locator('.docs-sidebar-folder-link', { hasText: 'Components' }),
    ).toBeVisible()
    await expect(
      scope.locator('.docs-sidebar-folder-trigger', { hasText: 'Layouts' }),
    ).toBeVisible()

    await expect(
      scope.locator(
        '.docs-sidebar-link[aria-current="page"] .docs-sidebar-link-label',
      ),
    ).toHaveText('Accordion')
    await expectCountAtLeast(scope.locator('.docs-sidebar-link'), 1)
  })

  test('@responsive opens tabs menu without shifting sidebar nav flow', async ({
    page,
  }) => {
    await gotoDocsFixture(page, '/guide/component-detail')

    const scope = await activeSidebarScope(page)
    const navTop = await scope.locator('.docs-sidebar-nav').boundingBox()
    const trigger = scope.locator('.docs-sidebar-tab-trigger')

    await clickAndExpectExpanded(trigger)
    await expect(scope.locator('.docs-sidebar-tab-panel')).toBeVisible()
    await expect(scope.locator('.docs-sidebar-tab-panel')).toHaveAttribute(
      'role',
      'menu',
    )
    await expect(
      scope.locator('.docs-sidebar-tab-option[aria-current="page"]'),
    ).toContainText('Fumadocs UI')

    const navTopAfter = await scope.locator('.docs-sidebar-nav').boundingBox()

    expect(Math.round(navTopAfter?.y ?? 0)).toBe(Math.round(navTop?.y ?? 0))
  })

  test('renders separators as static labels without disclosure affordance', async ({
    page,
  }) => {
    await gotoDocsFixture(page, '/guide/component-detail')

    const scope = await activeSidebarScope(page)

    await expect(scope.locator('.docs-sidebar-section-trigger')).toHaveCount(0)
    await expect(scope.locator('button.docs-sidebar-separator')).toHaveCount(0)

    for (const label of ['Introduction', 'References']) {
      const separator = scope
        .locator('.docs-sidebar-separator', {
          hasText: label,
        })
        .first()

      await expect(separator).toBeVisible()
      await expect(separator).not.toHaveAttribute('aria-expanded', /.+/)
    }

    await expect(
      scope.locator('.docs-sidebar-separator', {
        hasText: 'Components',
      }),
    ).toHaveCount(0)
    await expect(
      scope.locator('.docs-sidebar-separator', {
        hasText: 'Layouts',
      }),
    ).toHaveCount(0)
    await expect(
      scope.locator('.docs-sidebar-link', {
        hasText: 'Overview',
      }),
    ).toBeVisible()
  })

  test('@tablet keeps top-level folder link navigation separate from disclosure', async ({
    page,
  }) => {
    test.skip(
      isNarrowViewport(page),
      'Folder protocol is covered in persistent sidebar.',
    )

    await gotoDocsFixture(page, '/guide/component-detail')

    const scope = await activeSidebarScope(page)
    const folderLink = scope
      .locator('.docs-sidebar-folder-link', {
        hasText: 'Components',
      })
      .first()
    const folder = folderLink.locator(
      'xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " docs-sidebar-folder ")][1]',
    )
    const folderIcon = folderLink.locator('[data-sidebar-folder-icon]').first()
    const contentId = await folderLink.getAttribute('aria-controls')

    await expect(folder).toBeVisible()
    await expect(folder).toHaveAttribute('data-state', /^(open|closed)$/)
    await expect(folderLink).toHaveAttribute('href', /\/guide\/components$/)
    await expect(folderLink).toHaveAttribute('aria-expanded', /^(true|false)$/)
    expect(contentId).toBeTruthy()

    const content = scope.locator(`#${contentId}`)

    await expect(content).toHaveCount(1)
    await expect(content).toHaveAttribute('data-state', /^(open|closed)$/)

    const urlBeforeToggle = page.url()
    const previousState = await folderLink.getAttribute('aria-expanded')

    await folderIcon.click()
    await expect(folderLink).not.toHaveAttribute(
      'aria-expanded',
      previousState ?? '',
    )
    expect(page.url()).toBe(urlBeforeToggle)

    await folderIcon.click()
    await expect(folderLink).toHaveAttribute(
      'aria-expanded',
      previousState ?? '',
    )

    await folderLink.click({ position: { x: 16, y: 18 } })
    await expect(page).toHaveURL(/\/guide\/components$/)

    const nextScope = await activeSidebarScope(page)
    const nextFolderLink = nextScope
      .locator('.docs-sidebar-folder-link', {
        hasText: 'Components',
      })
      .first()
    const nextFolder = nextFolderLink.locator(
      'xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " docs-sidebar-folder ")][1]',
    )

    await expect(nextFolder).toHaveAttribute('data-state', 'open')
    await expect(nextFolderLink).toHaveAttribute('aria-current', 'page')
  })

  test('supports collapse, hover preview, and floating pin on desktop', async ({
    page,
  }) => {
    test.skip(
      isNarrowViewport(page),
      'Mobile sidebar uses the drawer contract.',
    )

    await gotoDocsFixture(page, '/guide/component-detail')

    const layout = page.locator('#nd-docs-layout')
    const sidebar = page.locator('#nd-sidebar')
    const inner = sidebar.locator('.docs-sidebar-inner')
    const content = page.locator('.docs-shell-content')
    const contentBoxBefore = await content.boundingBox()

    await sidebar.locator('.docs-sidebar-collapse').click()
    await expect(layout).toHaveAttribute('data-sidebar-collapsed', 'true')
    await expect(sidebar).toHaveAttribute('data-collapsed', 'true')
    await expect(page.locator('.docs-sidebar-floating')).toBeVisible()
    await expect(inner).toHaveCSS('opacity', '0')
    const contentBoxAfter = await content.boundingBox()

    expect(
      Math.abs((contentBoxAfter?.x ?? 0) - (contentBoxBefore?.x ?? 0)),
    ).toBeLessThanOrEqual(1)
    expect(
      Math.abs((contentBoxAfter?.width ?? 0) - (contentBoxBefore?.width ?? 0)),
    ).toBeLessThanOrEqual(1)

    await sidebar
      .locator('.docs-sidebar-hover-zone')
      .dispatchEvent('pointerenter', {
        clientX: 1,
        pointerType: 'mouse',
      })
    await expect(sidebar).toHaveAttribute('data-hovered', 'true')
    await expect(inner).toHaveCSS('opacity', '1')
    await expect(page.locator('.docs-sidebar-floating')).toHaveClass(
      /is-hidden/,
    )

    await page.mouse.move(400, 20)
    await expect(page.locator('.docs-sidebar-floating')).not.toHaveClass(
      /is-hidden/,
    )
    await page.locator('.docs-sidebar-floating-button').click()
    await expect(layout).toHaveAttribute('data-sidebar-collapsed', 'false')
    await expect(sidebar).toHaveAttribute('data-collapsed', 'false')
    await expect(page.locator('.docs-sidebar-floating')).toHaveCount(0)
  })

  test('exposes collapse and pin tooltips without replacing button semantics', async ({
    page,
  }) => {
    test.skip(
      isNarrowViewport(page),
      'Mobile sidebar uses the drawer contract.',
    )

    await gotoDocsFixture(page, '/guide/component-detail')

    const layout = page.locator('#nd-docs-layout')
    const collapse = page.locator('.docs-sidebar-collapse')
    const collapseTooltip = page.locator(
      '.ui-tooltip-content[data-sidebar-tooltip="collapse"]',
    )

    await expect(collapse).toHaveAttribute('aria-label', 'Collapse sidebar')
    await collapse.hover()
    await expect(collapseTooltip).toBeVisible()
    await expect(collapseTooltip).toContainText('Collapse sidebar')
    await expect(page.locator('.ui-tooltip-content')).toHaveCount(1)

    await page.mouse.move(600, 300)
    await expect(collapseTooltip).toBeHidden()

    await page.locator('.docs-sidebar-brand').focus()
    await page.keyboard.press('Tab')
    await expect(collapse).toBeFocused()
    await expect(collapseTooltip).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(collapseTooltip).toBeHidden()
    await expect(collapse).toBeFocused()

    await collapse.click()
    await expect(layout).toHaveAttribute('data-sidebar-collapsed', 'true')

    const pin = page.locator(
      '.docs-sidebar-floating-button[aria-label="Pin sidebar"]',
    )
    const pinTooltip = page.locator(
      '.ui-tooltip-content[data-sidebar-tooltip="pin"]',
    )

    await pin.hover()
    await expect(pinTooltip).toBeVisible()
    await expect(pinTooltip).toContainText('Pin sidebar')
    await expect(page.locator('.ui-tooltip-content')).toHaveCount(1)

    await pin.click()
    await expect(layout).toHaveAttribute('data-sidebar-collapsed', 'false')
  })

  test('touch tapping sidebar controls does not leave a sticky tooltip', async ({
    baseURL,
    browser,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'chromium-desktop',
      'Touch emulation is covered once from the desktop browser project.',
    )

    const context = await browser.newContext({
      baseURL,
      hasTouch: true,
      viewport: {
        width: 1280,
        height: 800,
      },
    })
    const page = await context.newPage()

    try {
      await gotoDocsFixture(page, '/guide/component-detail')

      const layout = page.locator('#nd-docs-layout')
      await page.locator('.docs-sidebar-collapse').tap()
      await expect(layout).toHaveAttribute('data-sidebar-collapsed', 'true')
      await expect(page.locator('.ui-tooltip-content')).toHaveCount(0)

      await page
        .locator('.docs-sidebar-floating-button[aria-label="Pin sidebar"]')
        .tap()
      await expect(layout).toHaveAttribute('data-sidebar-collapsed', 'false')
      await expect(page.locator('.ui-tooltip-content')).toHaveCount(0)
    } finally {
      await context.close()
    }
  })

  test('@mobile uses mobile nav drawer instead of desktop sidebar on narrow screens', async ({
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
    await expect(
      panel.locator('.docs-sidebar-link[aria-current="page"]'),
    ).toContainText('Accordion')

    await page.keyboard.press('Escape')
    await expect(panel).toHaveAttribute('data-state', 'closed')
    await expect(page.locator('#docs-header-sidebar-trigger')).toBeFocused()
    await expect(page.locator('#nd-docs-layout')).toHaveAttribute(
      'data-sidebar-mobile-open',
      'false',
    )
  })

  test('opens mobile drawer from touch tap on emulated iPhone', async ({
    baseURL,
    browser,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'chromium-desktop',
      'Touch emulation is covered once from the desktop browser project.',
    )

    const context = await browser.newContext({
      ...devices['iPhone 12 Pro'],
      baseURL,
      viewport: {
        height: 844,
        width: 390,
      },
    })
    const page = await context.newPage()

    try {
      await gotoDocsFixture(page, '/guide/components')
      await page.locator('#docs-header-sidebar-trigger').tap()

      const panel = page.locator('#nd-sidebar-mobile')

      await expect(page.locator('#nd-docs-layout')).toHaveAttribute(
        'data-sidebar-mobile-open',
        'true',
      )
      await expect(
        page.locator('#docs-header-sidebar-trigger'),
      ).toHaveAttribute('aria-expanded', 'true')
      await expect(panel).toHaveAttribute('data-state', 'open')
      await expect(panel).toBeVisible()
    } finally {
      await context.close()
    }
  })

  test('@mobile closes the mobile drawer from the overlay', async ({
    page,
  }) => {
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

  test('@mobile keeps mobile drawer open for folder disclosure and closes on folder link navigation', async ({
    page,
  }) => {
    test.skip(!isNarrowViewport(page), 'Desktop uses the persistent sidebar.')

    await gotoDocsFixture(page, '/guide/component-detail')

    const panel = await openMobileNav(page)
    const folderLink = panel
      .locator('.docs-sidebar-folder-link', {
        hasText: 'Protocol Playground',
      })
      .first()
    const folder = folderLink.locator(
      'xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " docs-sidebar-folder ")][1]',
    )
    const folderIcon = folderLink.locator('[data-sidebar-folder-icon]').first()
    const urlBeforeToggle = page.url()

    await expect(folder).toBeVisible()
    const previousState = await folderLink.getAttribute('aria-expanded')

    await folderIcon.click()
    await expect(panel).toHaveAttribute('data-state', 'open')
    await expect(page.locator('#nd-docs-layout')).toHaveAttribute(
      'data-sidebar-mobile-open',
      'true',
    )
    await expect(folderLink).not.toHaveAttribute(
      'aria-expanded',
      previousState ?? '',
    )
    expect(page.url()).toBe(urlBeforeToggle)

    if ((await folderLink.getAttribute('aria-expanded')) !== 'true') {
      await folderIcon.click()
      await expect(folderLink).toHaveAttribute('aria-expanded', 'true')
    }

    await folderLink.click({ position: { x: 16, y: 18 } })
    await expect(page).toHaveURL(
      /\/guide\/protocol-playground\/entry-contract$/,
    )
    await expect(panel).toHaveAttribute('data-state', 'closed')
    await expect(page.locator('#nd-docs-layout')).toHaveAttribute(
      'data-sidebar-mobile-open',
      'false',
    )
  })
})
