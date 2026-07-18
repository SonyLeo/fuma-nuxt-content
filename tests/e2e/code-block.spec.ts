import { expect, test } from '@playwright/test'
import { expectCssPxNear } from './helpers/assertions'
import { gotoDocsFixture } from './helpers/docs-page'

type ClipboardState = {
  mode: 'success' | 'reject' | 'pending'
  calls: string[]
  resolvePending: (() => void) | null
}

async function installClipboardMock(
  page: Parameters<typeof gotoDocsFixture>[0],
) {
  await page.addInitScript(() => {
    const state: ClipboardState = {
      mode: 'success',
      calls: [],
      resolvePending: null,
    }

    Object.defineProperty(window, '__docsClipboardState', {
      configurable: true,
      value: state,
    })
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText(text: string) {
          state.calls.push(text)

          if (state.mode === 'reject') {
            return Promise.reject(new Error('clipboard rejected'))
          }

          if (state.mode === 'pending') {
            return new Promise<void>((resolve) => {
              state.resolvePending = resolve
            })
          }

          return Promise.resolve()
        },
      },
    })
  })
}

async function clipboardState(page: Parameters<typeof gotoDocsFixture>[0]) {
  return page.evaluate(
    () =>
      (window as Window & { __docsClipboardState: ClipboardState })
        .__docsClipboardState,
  )
}

test.describe('@fast @content code block browser-only contracts', () => {
  test('copies canonical direct and rendered code with observable states', async ({
    page,
  }) => {
    await installClipboardMock(page)
    await gotoDocsFixture(page, '/guide/code-block')

    const direct = page.locator('.fd-doc-code-block').filter({
      hasText: 'direct-prop.ts',
    })
    const rendered = page.locator('.fd-doc-code-block').filter({
      hasText: 'renderedCopyOwner',
    })
    const actionsOnly = page.locator('.fd-doc-code-block').filter({
      hasText: 'actions-only.ts',
    })

    await expect(direct.locator('.fd-doc-code-copy')).toHaveAccessibleName(
      'Copy Text',
    )
    await expect(direct.locator('.fd-doc-code-block-header')).toContainText(
      'direct-prop.ts',
    )
    await expect(
      direct.locator('.fd-doc-code-block-header .fd-doc-code-copy'),
    ).toHaveCount(1)
    await expect(
      rendered.locator('.fd-doc-code-block-floating-actions .fd-doc-code-copy'),
    ).toHaveCount(1)
    await expect(rendered.locator('.fd-doc-code-block-header')).toHaveCount(0)
    await expect(actionsOnly.locator('.fd-doc-code-copy')).toHaveCount(0)
    await expect(actionsOnly).toContainText('Custom action')

    const directCopy = direct.locator('.fd-doc-code-copy')
    await page.evaluate(() => {
      ;(
        window as Window & { __docsClipboardState: ClipboardState }
      ).__docsClipboardState.mode = 'pending'
    })
    await directCopy.click()
    await expect(directCopy).toBeDisabled()
    await expect(directCopy).toHaveAttribute('data-loading', 'true')
    await expect(directCopy).toHaveAccessibleName('Copy Text')

    await page.evaluate(() => {
      const state = (
        window as Window & {
          __docsClipboardState: ClipboardState
        }
      ).__docsClipboardState
      state.mode = 'success'
      state.resolvePending?.()
      state.resolvePending = null
    })
    await expect(directCopy).toBeEnabled()
    await expect(directCopy).toHaveAccessibleName('Copied Text')
    await expect
      .poll(async () => (await clipboardState(page)).calls.at(-1))
      .toBe("const directCopyOwner = 'direct-prop-payload'")

    const renderedCopy = rendered.locator('.fd-doc-code-copy')
    await expect(renderedCopy).toHaveAccessibleName('Copy Text')
    await renderedCopy.click()
    await expect(renderedCopy).toHaveAccessibleName('Copied Text')
    await expect
      .poll(async () => (await clipboardState(page)).calls.at(-1))
      .toBe(
        "const renderedCopyOwner = 'rendered-pre-payload'\n" +
          'const renderedLongLine =\n' +
          "  'long-line-' +\n" +
          "  'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'",
      )

    await expect(renderedCopy).toHaveAccessibleName('Copy Text')
    await page.evaluate(() => {
      ;(
        window as Window & { __docsClipboardState: ClipboardState }
      ).__docsClipboardState.mode = 'reject'
    })
    await renderedCopy.click()
    await expect(renderedCopy).toBeEnabled()
    await expect(renderedCopy).toHaveAccessibleName('Copy failed')
    await expect(renderedCopy).not.toHaveAttribute('data-loading', 'true')
    await expect(renderedCopy).toHaveAccessibleName('Copy Text')
  })

  test('@responsive keeps highlighting, viewport, and typography contracts', async ({
    page,
  }) => {
    await installClipboardMock(page)
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
          const copy = root.querySelector<HTMLElement>('.fd-doc-code-copy')
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
            bodyClientWidth: body?.clientWidth ?? 0,
            bodyScrollWidth: body?.scrollWidth ?? 0,
            bodyOverflowX: body ? getComputedStyle(body).overflowX : '',
            bodyWhiteSpace: code ? getComputedStyle(code).whiteSpace : '',
            rootClientWidth: root.clientWidth,
            rootScrollWidth: root.scrollWidth,
            rootOverflow: getComputedStyle(root).overflow,
            copyRect: copy?.getBoundingClientRect().toJSON() ?? null,
            bodyRect: body?.getBoundingClientRect().toJSON() ?? null,
            documentClientWidth: document.documentElement.clientWidth,
            documentScrollWidth: document.documentElement.scrollWidth,
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
    const shikiBlocks = highlightedBlocks.filter(
      (block) =>
        block.className.includes('catppuccin-latte') ||
        block.className.includes('catppuccin-mocha'),
    )

    expect(diagnostics.every((block) => block.bodyRole === 'region')).toBe(true)
    expect(diagnostics.every((block) => block.bodyTabIndex === '0')).toBe(true)
    expect(diagnostics.every((block) => block.rootOverflow === 'hidden')).toBe(
      true,
    )
    expect(diagnostics.every((block) => block.bodyOverflow !== 'visible')).toBe(
      true,
    )
    const longLineBlock = diagnostics.find(
      (block) => block.bodyScrollWidth > block.bodyClientWidth,
    )
    expect(longLineBlock).toBeDefined()
    expect(longLineBlock?.bodyOverflowX).toMatch(/auto|scroll/)
    expect(longLineBlock?.bodyWhiteSpace).toBe('pre')
    expect(longLineBlock?.rootScrollWidth).toBeLessThanOrEqual(
      longLineBlock?.rootClientWidth ?? 0,
    )
    expect(
      diagnostics.every(
        (block) => block.documentScrollWidth <= block.documentClientWidth,
      ),
    ).toBe(true)
    if (longLineBlock?.bodyRect && longLineBlock.copyRect) {
      expect(longLineBlock.copyRect.right).toBeLessThanOrEqual(
        longLineBlock.bodyRect.right + 1,
      )
      expect(longLineBlock.copyRect.left).toBeGreaterThanOrEqual(
        longLineBlock.bodyRect.left - 1,
      )
    }
    const longLine = page
      .locator('.fd-doc-code-block')
      .filter({ hasText: 'renderedLongLine' })
    const endGeometry = await longLine
      .locator('.fd-doc-code-block-body')
      .evaluate((body) => {
        const code = body.querySelector('pre code')
        const copy =
          body.parentElement?.querySelector<HTMLElement>('.fd-doc-code-copy')
        if (!code || !copy) return null

        body.scrollLeft = body.scrollWidth
        const walker = document.createTreeWalker(code, NodeFilter.SHOW_TEXT)
        let lastNode: Text | null = null
        let lastOffset = 0
        let node = walker.nextNode()
        while (node) {
          const text = node.textContent ?? ''
          for (let index = text.length - 1; index >= 0; index -= 1) {
            if (/\S/.test(text[index] ?? '')) {
              lastNode = node as Text
              lastOffset = index + 1
              break
            }
          }
          node = walker.nextNode()
        }

        if (!lastNode) return null
        const range = document.createRange()
        range.setStart(lastNode, lastOffset - 1)
        range.setEnd(lastNode, lastOffset)
        const charRect = range.getBoundingClientRect()
        const copyRect = copy.getBoundingClientRect()
        return {
          charRight: charRect.right,
          copyLeft: copyRect.left,
        }
      })
    expect(endGeometry).not.toBeNull()
    if (endGeometry) {
      expect(endGeometry.charRight).toBeLessThanOrEqual(
        endGeometry.copyLeft - 4,
      )
    }
    const firstViewport = page.locator('.fd-doc-code-block-body').first()
    await firstViewport.focus()
    await expect(firstViewport).toBeFocused()
    await expect(firstViewport).toHaveCSS('outline-style', 'solid')
    await expect(firstViewport).toHaveCSS('outline-width', '2px')
    expect(diagnostics.some((block) => block.highlightedCount > 0)).toBe(true)
    expect(diagnostics.some((block) => block.highlightedWordCount > 0)).toBe(
      true,
    )
    expect(diagnostics.every((block) => !block.markerVisible)).toBe(true)
    expect(shikiBlocks.length).toBeGreaterThan(0)
    expect(
      shikiBlocks.every((block) =>
        block.className.includes('catppuccin-latte'),
      ),
    ).toBe(true)
    expect(
      shikiBlocks.every((block) =>
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
