import { expect, test } from '@playwright/test'
import { expectCssPxNear } from './helpers/assertions'
import { gotoDocsFixture } from './helpers/docs-page'

test.describe('@fast @content code block browser-only contracts', () => {
  test('@responsive keeps highlighting, viewport, and typography contracts', async ({
    page,
  }) => {
    await gotoDocsFixture(page, '/guide/code-block')
    await expect
      .poll(() => page.locator('.highlighted-word').count())
      .toBeGreaterThan(0)

    const diagnostics = await page
      .locator('.fd-doc-code-block')
      .evaluateAll((nodes) =>
        nodes.map((node, index) => {
          const root = node as HTMLElement
          const body = root.querySelector<HTMLElement>(
            '.fd-doc-code-block-body',
          )
          const pre = root.querySelector<HTMLElement>('pre')
          const code = root.querySelector<HTMLElement>(
            'pre code, .fd-doc-code-block-body > code',
          )
          const firstLine = root.querySelector<HTMLElement>('.line')
          const tokenColors = Array.from(
            root.querySelectorAll<HTMLElement>(
              '.line span:not(.highlighted-word)',
            ),
          )
            .map((element) => ({
              color: getComputedStyle(element).color,
              text: element.textContent?.trim() ?? '',
            }))
            .filter((item) => item.text && item.color)
          const distinctTokenColors = [
            ...new Set(tokenColors.map((item) => item.color)),
          ]

          return {
            index,
            bodyOverflow: body ? getComputedStyle(body).overflow : '',
            bodyRole: body?.getAttribute('role') ?? null,
            bodyTabIndex: body?.getAttribute('tabindex') ?? null,
            className: root.className,
            codeFontSize: code ? getComputedStyle(code).fontSize : '',
            firstLineHeight: firstLine
              ? getComputedStyle(firstLine).lineHeight
              : '',
            highlightedCount: root.querySelectorAll(
              '.highlighted, .highlighted-word, .diff',
            ).length,
            highlightedWordCount:
              root.querySelectorAll('.highlighted-word').length,
            lineCount: root.querySelectorAll('.line').length,
            lineNumbers: root.hasAttribute('data-line-numbers'),
            markerVisible: root.textContent?.includes('[!code') ?? false,
            preBackground: pre ? getComputedStyle(pre).backgroundColor : '',
            prePadding: pre ? getComputedStyle(pre).padding : '',
            tokenColorCount: distinctTokenColors.length,
          }
        }),
      )
    const highlightedBlocks = diagnostics.filter((block) => block.lineCount > 0)

    expect(diagnostics.every((block) => block.bodyRole === 'region')).toBe(true)
    expect(diagnostics.every((block) => block.bodyTabIndex === '0')).toBe(true)
    expect(diagnostics.every((block) => block.bodyOverflow !== 'visible')).toBe(
      true,
    )
    expect(diagnostics.some((block) => block.highlightedCount > 0)).toBe(true)
    expect(diagnostics.some((block) => block.highlightedWordCount > 0)).toBe(
      true,
    )
    expect(diagnostics.every((block) => !block.markerVisible)).toBe(true)
    expect(
      highlightedBlocks.every((block) =>
        block.className.includes('catppuccin-latte'),
      ),
    ).toBe(true)
    expect(
      highlightedBlocks.every((block) =>
        block.className.includes('catppuccin-mocha'),
      ),
    ).toBe(true)
    expect(highlightedBlocks.every((block) => block.prePadding === '0px')).toBe(
      true,
    )
    expect(
      highlightedBlocks.every(
        (block) => block.preBackground === 'rgba(0, 0, 0, 0)',
      ),
    ).toBe(true)
    expect(highlightedBlocks.every((block) => block.tokenColorCount >= 2)).toBe(
      true,
    )

    const firstHighlighted = page.locator('.fd-doc-code-block .line').first()
    const firstCode = page.locator('.fd-doc-code-block pre code').first()

    await expectCssPxNear(firstCode, 'font-size', 13, 1)
    await expectCssPxNear(firstHighlighted, 'line-height', 18.57, 1)
  })
})
