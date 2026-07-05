import { expect, test, type Page } from '@playwright/test'
import { expectCountAtLeast, expectCssPxNear } from './helpers/assertions'
import { gotoDocsFixture } from './helpers/docs-page'

async function gotoComponentsPage(page: Page) {
  await gotoDocsFixture(page, '/guide/components')
}

test.describe('@content-components docs content primitives', () => {
  test('renders card grid protocol and responsive columns', async ({ page }) => {
    await gotoComponentsPage(page)

    const grid = page.locator('.fd-card-grid').first()
    const cards = grid.locator(':scope > [data-card]')

    await expect(grid).toBeVisible()
    await expect(grid).toHaveCSS('display', 'grid')
    await expect(grid).toHaveCSS('container-type', 'inline-size')
    await expect(grid).toHaveCSS('gap', '12px')
    await expectCountAtLeast(cards, 4)
    await expectCountAtLeast(cards.locator('.fd-doc-card-icon'), 4)
    await expect(cards.filter({ has: page.locator('.fd-doc-card-badge') })).not.toHaveCount(0)

    const external = cards.filter({ hasText: 'External Reference' })

    await expect(external).toHaveAttribute('target', '_blank')
    await expect(external).toHaveAttribute('rel', /noopener/)

    const firstTitle = cards.first().locator('.fd-doc-card-header h3')

    await expect(cards.first()).toHaveCSS('border-radius', '12px')
    await expect(cards.first()).toHaveCSS('padding', '16px')
    await expect(firstTitle).toHaveCSS('font-size', '14px')
    await expect(firstTitle).toHaveCSS('line-height', '20px')
    await expect(firstTitle).toHaveCSS('font-weight', '500')
    await expect(firstTitle).toHaveCSS('overflow-wrap', 'anywhere')

    const layout = await grid.evaluate((root) => {
      const gridRect = root.getBoundingClientRect()
      const columns = getComputedStyle(root).gridTemplateColumns
        .split(' ')
        .filter(Boolean).length
      const widths = Array.from(root.querySelectorAll<HTMLElement>(':scope > [data-card]')).map(
        (card) => {
          const rect = card.getBoundingClientRect()

          return {
            left: Math.round(rect.left),
            width: Math.round(rect.width),
          }
        },
      )

      return {
        columns,
        gridLeft: Math.round(gridRect.left),
        gridWidth: Math.round(gridRect.width),
        widths,
      }
    })
    const isSingleColumn = layout.widths.every(
      (item) =>
        Math.abs(item.left - layout.gridLeft) <= 2 &&
        Math.abs(item.width - layout.gridWidth) <= 3,
    )

    if ((page.viewportSize()?.width ?? 0) <= 640) {
      expect(isSingleColumn).toBe(true)
    } else {
      expect(layout.columns).toBeGreaterThanOrEqual(2)
      expect(isSingleColumn).toBe(false)
    }
  })

  test('keeps callout type, layout, and split container contracts', async ({
    page,
  }) => {
    await gotoComponentsPage(page)

    const callouts = page.locator('.fd-callout')

    await expectCountAtLeast(callouts, 9)

    const diagnostics = await callouts.evaluateAll((nodes) =>
      nodes.map((node) => {
        const root = node as HTMLElement
        const bar = root.querySelector<HTMLElement>('.fd-callout-bar')
        const icon = root.querySelector<HTMLElement>('.fd-callout-icon')
        const content = root.querySelector<HTMLElement>('.fd-callout-content')
        const title = root.querySelector<HTMLElement>('.fd-callout-title')
        const body = root.querySelector<HTMLElement>('.fd-callout-body')
        const rootStyle = getComputedStyle(root)
        const barStyle = bar ? getComputedStyle(bar) : null
        const iconStyle = icon ? getComputedStyle(icon) : null
        const titleStyle = title ? getComputedStyle(title) : null

        return {
          bodyText: body?.textContent?.trim() ?? '',
          hasBody: Boolean(body),
          hasTitle: Boolean(title),
          iconHeight: iconStyle?.height ?? '',
          iconTopDelta:
            icon && content
              ? Math.round(icon.getBoundingClientRect().top - content.getBoundingClientRect().top)
              : 999,
          iconWidth: iconStyle?.width ?? '',
          rootAlign: rootStyle.alignItems,
          rootDisplay: rootStyle.display,
          rootFontSize: rootStyle.fontSize,
          rootGap: rootStyle.gap,
          rootLineHeight: rootStyle.lineHeight,
          railAlign: barStyle?.alignSelf ?? '',
          railHeight: bar?.getBoundingClientRect().height ?? 0,
          railWidth: bar?.getBoundingClientRect().width ?? 0,
          contentHeight: content?.getBoundingClientRect().height ?? 0,
          titleMargin: titleStyle?.margin ?? '',
          titleText: title?.textContent?.trim() ?? '',
          titleWeight: titleStyle?.fontWeight ?? '',
          type: root.getAttribute('data-callout-type'),
        }
      }),
    )
    const expectedTypes = [
      'info',
      'warning',
      'warning',
      'info',
      'success',
      'error',
      'idea',
      'info',
      'success',
    ]

    expect(diagnostics.slice(0, expectedTypes.length).map((item) => item.type)).toEqual(
      expectedTypes,
    )
    expect(
      diagnostics.every(
        (item) =>
          item.rootDisplay === 'flex' &&
          item.rootAlign === 'stretch' &&
          item.rootFontSize === '14px' &&
          item.rootGap === '8px' &&
          Number.parseFloat(item.rootLineHeight) >= 19,
      ),
    ).toBe(true)
    expect(
      diagnostics.every(
        (item) =>
          item.railWidth <= 3 &&
          item.railAlign === 'stretch' &&
          Math.abs(item.railHeight - item.contentHeight) <= 1,
      ),
    ).toBe(true)
    expect(
      diagnostics.every(
        (item) =>
          !item.hasTitle || (item.titleMargin === '0px' && item.titleWeight !== '700'),
      ),
    ).toBe(true)
    expect(
      diagnostics.some(
        (item) =>
          !item.hasTitle &&
          item.hasBody &&
          item.bodyText.includes('intentionally has no title'),
      ),
    ).toBe(true)
    expect(
      diagnostics.every(
        (item) =>
          item.iconWidth === '20px' &&
          item.iconHeight === '20px' &&
          Math.abs(item.iconTopDelta) <= 1,
      ),
    ).toBe(true)
    const containerCallout = callouts.filter({ hasText: 'Container API' }).first()

    await expect(containerCallout).toHaveAttribute('data-callout-type', 'success')
    await expect(containerCallout.locator('.fd-callout-title')).toContainText(
      'Container API',
    )
  })

  test('switches tabs and preserves code-tabs shell', async ({ page }) => {
    await gotoComponentsPage(page)

    const firstTabs = page.locator('.fd-doc-tabs:not(.fd-doc-code-tabs)').first()
    const simpleTabs = page.locator('.fd-doc-tabs:not(.fd-doc-code-tabs)').nth(1)
    const codeTabs = page.locator('.fd-doc-code-tabs').first()

    await expect(firstTabs).toBeVisible()
    await expect(firstTabs).toHaveCSS('display', 'flex')
    await expect(firstTabs.locator(':scope > .fd-doc-tabs-list')).toHaveCSS(
      'flex-wrap',
      'nowrap',
    )
    await expect(firstTabs.locator('.fd-doc-tab-trigger[data-state="active"]')).toHaveCSS(
      'border-bottom-width',
      /.+/,
    )

    await firstTabs.locator('.fd-doc-tab-trigger').filter({ hasText: 'Code' }).click()
    await expect(
      firstTabs.locator('.fd-doc-tab-trigger').filter({ hasText: 'Code' }),
    ).toHaveAttribute('data-state', 'active')
    await expect(
      firstTabs.locator('.fd-doc-tab-trigger').filter({ hasText: 'Code' }),
    ).toHaveAttribute('aria-selected', 'true')
    await expect(
      firstTabs.locator('.fd-doc-tab-panel[data-state="inactive"][hidden]'),
    ).not.toHaveCount(0)

    await expect(simpleTabs.locator('.fd-doc-tabs-label')).toHaveText('Mode')
    await expect(simpleTabs.locator('.fd-doc-tab-trigger')).toHaveCount(3)
    await expect(simpleTabs.locator('.fd-doc-tab-trigger[data-state="active"]')).toHaveText(
      'Code Example',
    )

    await expect(codeTabs).toBeVisible()
    await expect(codeTabs).toHaveCSS('display', 'flex')
    await expect(codeTabs.locator('.fd-doc-tab-trigger')).toHaveCount(2)
    await expect(codeTabs.locator('.fd-doc-tab-trigger[data-state="active"]')).toHaveText(
      'pnpm',
    )
    await expect(codeTabs.locator('.fd-doc-tab-panel[data-state="active"] .fd-doc-code-block')).toHaveCount(1)
  })

  test('opens accordion item and keeps hidden-until-found protocol', async ({
    page,
  }) => {
    await gotoComponentsPage(page)

    const accordion = page.locator('.fd-doc-accordions').first()

    await expect(accordion).toHaveAttribute('data-type', 'single')
    await expectCountAtLeast(accordion.locator('.fd-doc-accordion-item'), 3)
    await expect(
      accordion.locator('.fd-doc-accordion-item[data-state="closed"] .fd-doc-accordion-panel').first(),
    ).toHaveAttribute('hidden', 'until-found')
    await expectCountAtLeast(accordion.locator('.fd-doc-accordion-copy'), 1)

    const trigger = accordion.locator('.fd-doc-accordion-trigger').nth(1)

    await trigger.click()

    const opened = accordion.locator(
      '.fd-doc-accordion-item[data-accordion-value="why-not-vitepress"]',
    )

    await expect(opened).toHaveAttribute('data-state', 'open')
    await expect(opened.locator('.fd-doc-accordion-trigger')).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    await expect(opened.locator('.fd-doc-accordion-panel')).toHaveAttribute(
      'role',
      'region',
    )
  })

  test('renders files tree states, indentation, and truncation', async ({ page }) => {
    await gotoComponentsPage(page)

    const trees = page.locator('.fd-doc-files')

    await expectCountAtLeast(trees, 2)
    await expectCountAtLeast(page.locator('.fd-doc-file,.fd-doc-folder-trigger'), 8)
    await expect(page.locator('.fd-doc-folder-trigger').filter({ hasText: 'app' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    await expect(
      page.locator('.fd-doc-folder-trigger').filter({ hasText: 'components' }),
    ).toHaveAttribute('aria-expanded', 'true')

    const server = page.locator('.fd-doc-folder-trigger').filter({ hasText: 'server' })

    await expect(server).toHaveAttribute('aria-expanded', 'false')
    await server.click()
    await expect(server).toHaveAttribute('aria-expanded', 'true')

    const disabled = page.locator('.fd-doc-folder-trigger').filter({
      hasText: 'node_modules',
    })

    await expect(disabled).toBeDisabled()
    await expect(disabled).toHaveAttribute('aria-expanded', 'false')
    await expect(
      page.locator('.fd-doc-folder-content').filter({ hasText: 'DocCodeBlock.vue' }).first(),
    ).toHaveCSS('border-left-width', '1px')

    const longName = page.locator('.fd-doc-file-name').filter({
      hasText: 'ExceedinglyLongFileName',
    })

    await expect(longName).toHaveCSS('overflow', 'hidden')
    await expect(longName).toHaveCSS('text-overflow', 'ellipsis')
    await expect(longName).toHaveCSS('white-space', 'nowrap')
    await expect(longName).toHaveAttribute('title', await longName.textContent())
  })

  test('renders inline toc expanded and collapsed interactions', async ({ page }) => {
    await gotoComponentsPage(page)

    const inlineTocs = page.locator('.fd-doc-inline-toc')
    const first = inlineTocs.first()
    const second = inlineTocs.nth(1)

    await expectCountAtLeast(inlineTocs, 2)
    await expect(first.locator('.fd-doc-inline-toc-trigger')).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    await expectCountAtLeast(first.locator('.fd-doc-inline-toc-link'), 3)
    await expect(first.locator('.fd-doc-inline-toc-link.is-active')).not.toHaveCount(0)
    await expect(first.locator('.fd-doc-inline-toc-link').first()).toHaveCSS(
      'border-left-width',
      '1px',
    )

    const nestedPadding = await first
      .locator('.fd-doc-inline-toc-link')
      .evaluateAll((links) =>
        links.map((link) => getComputedStyle(link).paddingInlineStart),
      )

    expect(nestedPadding.some((value) => value !== '0px')).toBe(true)
    await expect(second.locator('.fd-doc-inline-toc-trigger')).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    await expect(second.locator('.fd-doc-inline-toc-content')).toHaveCSS(
      'display',
      'none',
    )
    await second.locator('.fd-doc-inline-toc-trigger').click()
    await expect(second.locator('.fd-doc-inline-toc-trigger')).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    await expect(second.locator('.fd-doc-inline-toc-content')).not.toHaveCSS(
      'display',
      'none',
    )
  })

  test('renders type table rows, details, and hash interaction', async ({ page }) => {
    await gotoComponentsPage(page)

    const table = page.locator('.fd-doc-type-table').first()

    await expect(table).toBeVisible()
    await expect(table).toHaveCSS('display', 'flex')
    await expect(table.locator('.fd-doc-type-table-head')).toHaveCSS('display', 'flex')
    await expectCountAtLeast(table.locator('.fd-doc-type-row'), 4)
    await expect(table.locator('.fd-doc-type-row').filter({ hasText: 'title' })).toContainText(
      'required',
    )
    await expect(table.locator('.fd-doc-type-row').filter({ hasText: 'legacy' })).toContainText(
      'deprecated',
    )
    await expect(
      table.locator('.fd-doc-type-row').filter({ hasText: 'onChange' }).locator('.fd-doc-type-value a'),
    ).toHaveAttribute('href', '/guide/components')

    const onChange = table.locator('.fd-doc-type-row').filter({ hasText: 'onChange' })

    await onChange.locator('.fd-doc-type-trigger').click()
    await expect(onChange).toHaveAttribute('data-open', 'true')
    await expect(onChange.locator('.fd-doc-type-trigger')).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    await expect(onChange.locator('.fd-doc-type-details')).toHaveCSS('display', 'grid')
    await expect(onChange.locator('.fd-doc-type-meta')).toContainText('Parameters')
    await expect(onChange.locator('.fd-doc-type-param')).toContainText(['value', 'event'])
    await expect.poll(() => page.evaluate(() => window.location.hash)).toBe('#page-on-change')
  })

  test('keeps steps marker, rail, and prose reset contracts', async ({ page }) => {
    await gotoComponentsPage(page)

    const diagnostics = await page.locator('.fd-steps').evaluateAll((roots) =>
      roots.map((root) => {
        const listItems = Array.from(root.querySelectorAll<HTMLElement>(':scope li'))
        const explicitSteps = Array.from(root.querySelectorAll<HTMLElement>(':scope > .fd-step'))
        const items = [...listItems, ...explicitSteps]

        return {
          explicitCount: explicitSteps.length,
          itemDiagnostics: items.map((item) => {
            const style = getComputedStyle(item)
            const before = getComputedStyle(item, '::before')
            const after = getComputedStyle(item, '::after')
            const first = item.firstElementChild

            return {
              afterContent: after.content,
              afterWidth: after.width,
              beforeBorderRadius: before.borderRadius,
              beforeContent: before.content,
              beforeHeight: before.height,
              beforeWidth: before.width,
              firstMarginTop: first ? getComputedStyle(first).marginTop : '',
              height: Math.round(item.getBoundingClientRect().height),
              paddingLeft: style.paddingLeft,
              position: style.position,
              tag: item.tagName.toLowerCase(),
              text: item.textContent?.trim() ?? '',
              width: Math.round(item.getBoundingClientRect().width),
            }
          }),
          listCount: listItems.length,
        }
      }),
    )
    const listRoot = diagnostics.find((item) => item.listCount >= 3)
    const explicitRoot = diagnostics.find((item) => item.explicitCount >= 3)
    const allItems = diagnostics.flatMap((item) => item.itemDiagnostics)

    expect(diagnostics.length).toBeGreaterThanOrEqual(2)
    expect(listRoot?.listCount).toBe(3)
    expect(explicitRoot?.explicitCount).toBe(3)
    expect(
      allItems.every(
        (item) =>
          item.position === 'relative' &&
          item.paddingLeft === '48px' &&
          item.beforeContent !== 'none' &&
          item.beforeWidth === '32px' &&
          item.beforeHeight === '32px' &&
          Number.parseFloat(item.beforeBorderRadius) >= 999,
      ),
    ).toBe(true)
    expect(
      allItems.filter((item) => item.afterContent !== 'none').every(
        (item) => item.afterWidth === '1px',
      ),
    ).toBe(true)
    expect(
      allItems
        .filter((item) => item.tag !== 'li')
        .every((item) => item.firstMarginTop === '0px'),
    ).toBe(true)
    expect(allItems.some((item) => item.text.includes('components page'))).toBe(true)
    expect(allItems.some((item) => item.text.includes('pnpm install'))).toBe(true)

    if ((page.viewportSize()?.width ?? 0) <= 640) {
      expect(allItems.some((item) => item.height >= 80)).toBe(true)
    }
  })

  test('keeps heading anchors and copy interaction', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window.navigator, 'clipboard', {
        configurable: true,
        value: {
          writeText: async (value: string) => {
            ;(window as Window & { __docsCopiedText?: string }).__docsCopiedText =
              value
          },
        },
      })
    })
    await gotoComponentsPage(page)

    const headings = page.locator('.docs-heading')

    await expectCountAtLeast(headings, 8)
    await expect(headings.first()).toHaveCSS('display', 'flex')
    await expect(headings.first()).toHaveCSS('align-items', 'center')
    await expect(headings.first()).toHaveCSS('flex-wrap', 'wrap')
    await expect(headings.first()).toHaveCSS('gap', '4px')
    await expect(headings.first()).toHaveCSS('scroll-margin-top', '112px')
    await expectCssPxNear(page.locator('.docs-heading').filter({ hasText: '下一步' }), 'font-size', 24, 1)

    const invalidHeadings = await headings.evaluateAll((nodes) =>
      nodes.filter((node) => {
        const root = node as HTMLElement
        const anchor = root.querySelector<HTMLAnchorElement>('.docs-heading-anchor')
        const copy = root.querySelector<HTMLElement>('.docs-heading-copy')

        return (
          !root.id ||
          anchor?.getAttribute('href') !== `#${root.id}` ||
          !anchor?.hasAttribute('data-card') ||
          copy?.getAttribute('data-size') !== 'icon-xs' ||
          copy?.getAttribute('data-variant') !== 'ghost' ||
          !copy?.querySelector('svg')
        )
      }).length,
    )

    expect(invalidHeadings).toBe(0)

    const target = headings.filter({ hasText: 'Callout' }).first()
    const targetId = await target.getAttribute('id')
    const copy = target.locator('.docs-heading-copy')

    await expect(copy).toHaveAttribute('aria-label', 'Copy Anchor Link')
    await copy.click()
    await expect(copy).toHaveAttribute('aria-label', 'Copied Anchor Link')

    const copiedHash = await page.evaluate(() => {
      const copied = (window as Window & { __docsCopiedText?: string }).__docsCopiedText

      return copied ? decodeURIComponent(new URL(copied).hash.slice(1)) : null
    })

    expect(copiedHash).toBe(targetId)
  })

  test('keeps preview and install-card shell contracts', async ({ page }) => {
    await gotoComponentsPage(page)

    const preview = page.locator('.fd-doc-preview').last()
    const install = page.locator('.fd-doc-install-card').last()

    await expect(preview).toHaveClass(/is-frame/)
    await expect(preview).toHaveCSS('overflow', 'hidden')
    await expect(preview).toHaveCSS('border-radius', '12px')
    await expect(preview).toHaveCSS('border-top-width', '1px')
    await expect(preview.locator('.fd-doc-preview-canvas')).toHaveCSS('display', 'grid')
    await expect(preview.locator('.fd-doc-preview-canvas')).toHaveAttribute(
      'role',
      'region',
    )
    await expect(preview.locator('.fd-doc-preview-canvas')).toHaveAttribute(
      'aria-label',
      'Preview',
    )
    await expect(preview.locator('.preview-counter')).toContainText('Preview Counter')
    await expect(preview.locator('.fd-doc-preview-description')).toContainText(
      '交互组件',
    )
    await expect(preview.locator('.fd-doc-preview-source')).toHaveCSS(
      'border-top-width',
      '1px',
    )
    await expect(preview.locator('.fd-doc-preview-source .fd-doc-code-block')).toHaveCSS(
      'margin',
      '0px',
    )
    const previewCodeBlock = preview.locator(
      '.fd-doc-preview-source .fd-doc-code-block',
    )
    const previewCodeDiagnostics = await previewCodeBlock.evaluate((root) => {
      const body = root.querySelector<HTMLElement>('.fd-doc-code-block-body')
      const line = root.querySelector<HTMLElement>('.line')
      const firstToken = root.querySelector<HTMLElement>('.fd-doc-code-token')

      return {
        lineCount: root.querySelectorAll('.line').length,
        lineText: line?.textContent ?? '',
        paddedLeft:
          firstToken && body
            ? Math.round(
                firstToken.getBoundingClientRect().left -
                  body.getBoundingClientRect().left,
              )
            : 0,
        styledTokenCount: root.querySelectorAll<HTMLElement>(
          '.fd-doc-code-token[style*="--shiki-light"]',
        ).length,
      }
    })

    expect(previewCodeDiagnostics.lineCount).toBeGreaterThanOrEqual(1)
    expect(previewCodeDiagnostics.lineText).toContain('<PreviewCounter />')
    expect(previewCodeDiagnostics.paddedLeft).toBeGreaterThanOrEqual(12)
    expect(previewCodeDiagnostics.styledTokenCount).toBeGreaterThanOrEqual(2)

    await expect(install).toHaveCSS('border-radius', '12px')
    await expect(install).toHaveCSS('border-top-width', '1px')
    await expect(install).toHaveCSS('padding', '12px')
    await expect(install.locator('.fd-doc-install-title')).toHaveText('Install Preview')
    await expect(install.locator('.fd-doc-install-title')).toHaveCSS('font-weight', '500')
    await expect(install.locator('.fd-doc-install-description')).toContainText(
      'local docs workspace',
    )
    await expect(install.locator('.fd-doc-code-block')).toContainText(
      'pnpm dlx fuma-nuxt-content add preview',
    )
    await expect(install.locator('.fd-doc-code-block')).toHaveCSS('margin', '0px')
    const installCodeDiagnostics = await install
      .locator('.fd-doc-code-block')
      .evaluate((root) => ({
        lineCount: root.querySelectorAll('.line').length,
        lineText: root.querySelector('.line')?.textContent ?? '',
        styledTokenCount: root.querySelectorAll<HTMLElement>(
          '.fd-doc-code-token[style*="--shiki-light"]',
        ).length,
      }))

    expect(installCodeDiagnostics.lineCount).toBeGreaterThanOrEqual(1)
    expect(installCodeDiagnostics.lineText).toContain(
      'pnpm dlx fuma-nuxt-content add preview',
    )
    expect(installCodeDiagnostics.styledTokenCount).toBeGreaterThanOrEqual(1)
    await expect(install.locator('.fd-doc-code-copy')).toBeVisible()
  })
})
