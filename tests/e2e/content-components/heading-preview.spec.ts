import { expect, test } from '@playwright/test'
import { expectCountAtLeast, expectCssPxNear } from '../helpers/assertions'
import { gotoComponentsPage } from '../helpers/content-components'

test.describe('@content-components heading preview', () => {
  test('@heading keeps heading anchors and copy interaction', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window.navigator, 'clipboard', {
        configurable: true,
        value: {
          writeText: async (value: string) => {
            ;(
              window as Window & { __docsCopiedText?: string }
            ).__docsCopiedText = value
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
    await expectCssPxNear(
      page.locator('.docs-heading').filter({ hasText: '下一步' }),
      'font-size',
      24,
      1,
    )

    const invalidHeadings = await headings.evaluateAll(
      (nodes) =>
        nodes.filter((node) => {
          const root = node as HTMLElement
          const anchor = root.querySelector<HTMLAnchorElement>(
            '.docs-heading-anchor',
          )
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
      const copied = (window as Window & { __docsCopiedText?: string })
        .__docsCopiedText

      return copied ? decodeURIComponent(new URL(copied).hash.slice(1)) : null
    })

    expect(copiedHash).toBe(targetId)
  })

  test('@responsive @preview keeps preview and install-card shell contracts', async ({
    page,
  }) => {
    await gotoComponentsPage(page)

    const preview = page.locator('.fd-doc-preview').last()
    const install = page.locator('.fd-doc-install-card').last()

    await expect(preview).toHaveClass(/is-frame/)
    await expect(preview).toHaveCSS('overflow', 'hidden')
    await expect(preview).toHaveCSS('border-radius', '12px')
    await expect(preview).toHaveCSS('border-top-width', '1px')
    await expect(preview.locator('.fd-doc-preview-canvas')).toHaveCSS(
      'display',
      'grid',
    )
    await expect(preview.locator('.fd-doc-preview-canvas')).toHaveAttribute(
      'role',
      'region',
    )
    await expect(preview.locator('.fd-doc-preview-canvas')).toHaveAttribute(
      'aria-label',
      'Preview',
    )
    await expect(preview.locator('.preview-counter')).toContainText(
      'Preview Counter',
    )
    await expect(preview.locator('.fd-doc-preview-description')).toContainText(
      '交互组件',
    )
    await expect(preview.locator('.fd-doc-preview-source')).toHaveCSS(
      'border-top-width',
      '1px',
    )
    await expect(
      preview.locator('.fd-doc-preview-source .fd-doc-code-block'),
    ).toHaveCSS('margin', '0px')
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
    await expect(install.locator('.fd-doc-install-title')).toHaveText(
      'Install Preview',
    )
    await expect(install.locator('.fd-doc-install-title')).toHaveCSS(
      'font-weight',
      '500',
    )
    await expect(install.locator('.fd-doc-install-description')).toContainText(
      'local docs workspace',
    )
    await expect(install.locator('.fd-doc-code-block')).toContainText(
      'pnpm dlx fuma-nuxt-content add preview',
    )
    await expect(install.locator('.fd-doc-code-block')).toHaveCSS(
      'margin',
      '0px',
    )
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
