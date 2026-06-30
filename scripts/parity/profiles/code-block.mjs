export const codeBlockProfile = {
  fixture: 'http://127.0.0.1:8888/guide/code-block',
  name: 'code-block',
  references: [
    'D:\\Projects\\Learning\\gh\\fumadocs\\packages\\base-ui\\src\\components\\codeblock.tsx',
    'D:\\Projects\\Learning\\gh\\fumadocs\\packages\\base-ui\\src\\mdx.tsx',
  ],
  selector: '.fd-doc-code-block',

  collect() {
    return `(async () => {
      const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      const text = (element) =>
        element?.textContent?.trim().replace(/\\s+/g, ' ') || '';
      const pick = (element) => {
        if (!element) return null;

        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();

        return {
          tag: element.tagName.toLowerCase(),
          id: element.id || null,
          className: typeof element.className === 'string' ? element.className : '',
          text: text(element).slice(0, 120),
          rect: {
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            width: Math.round(rect.width),
            top: Math.round(rect.top),
            height: Math.round(rect.height),
          },
          style: {
            backgroundColor: style.backgroundColor,
            borderColor: style.borderColor,
            borderRadius: style.borderRadius,
            borderTopWidth: style.borderTopWidth,
            color: style.color,
            display: style.display,
            fontSize: style.fontSize,
            fontWeight: style.fontWeight,
            height: style.height,
            lineHeight: style.lineHeight,
            margin: style.margin,
            maxHeight: style.maxHeight,
            overflow: style.overflow,
            overflowX: style.overflowX,
            overflowY: style.overflowY,
            padding: style.padding,
            position: style.position,
            width: style.width,
          },
        };
      };

      const codeBlocks = () =>
        [...document.querySelectorAll('.fd-doc-code-block')].map((root, index) => {
          const header = root.querySelector('.fd-doc-code-block-header');
          const caption = root.querySelector('figcaption');
          const floating = root.querySelector('.fd-doc-code-block-floating-actions');
          const actions = root.querySelector('.fd-doc-code-block-actions');
          const copy = root.querySelector('.fd-doc-code-copy');
          const body = root.querySelector('.fd-doc-code-block-body');
          const pre = root.querySelector('pre');
          const code = root.querySelector('pre code, .fd-doc-code-block-body > code');
          const icon = root.querySelector('.fd-doc-code-block-icon');
          const highlighted = root.querySelectorAll('.highlighted, .highlighted-word, .diff');
          const highlightedWords = root.querySelectorAll('.highlighted-word');
          const lines = root.querySelectorAll('.line');
          const firstLine = root.querySelector('.line');
          const tokenColors = [
            ...root.querySelectorAll('.line span:not(.highlighted-word)'),
          ]
            .map((element) => ({
              text: text(element),
              color: getComputedStyle(element).color,
            }))
            .filter((item) => item.text && item.color);
          const distinctTokenColors = new Set(
            tokenColors.map((item) => item.color),
          );

          return {
            index,
            root: pick(root),
            header: pick(header),
            caption: pick(caption),
            floating: pick(floating),
            actions: pick(actions),
            copy: pick(copy),
            body: pick(body),
            pre: pick(pre),
            code: pick(code),
            icon: pick(icon),
            firstLine: pick(firstLine),
            dir: root.getAttribute('dir'),
            tabIndex: root.getAttribute('tabindex'),
            bodyRole: body?.getAttribute('role') || null,
            bodyTabIndex: body?.getAttribute('tabindex'),
            copyAria: copy?.getAttribute('aria-label') || null,
            lineNumbers: root.hasAttribute('data-line-numbers'),
            highlightedCount: highlighted.length,
            highlightedWordCount: highlightedWords.length,
            lineCount: lines.length,
            markerVisible: root.textContent.includes('[!code'),
            distinctTokenColorCount: distinctTokenColors.size,
            tokenColorSample: Array.from(distinctTokenColors).slice(0, 6),
            scroll: body
              ? {
                  clientWidth: Math.round(body.clientWidth),
                  scrollWidth: Math.round(body.scrollWidth),
                  clientHeight: Math.round(body.clientHeight),
                  scrollHeight: Math.round(body.scrollHeight),
                }
              : null,
          };
        });

      const tabs = () =>
        [...document.querySelectorAll('.fd-doc-code-tabs')].map((root, index) => {
          const triggers = [...root.querySelectorAll('.fd-doc-tab-trigger')].map(
            (element) => ({
              text: text(element),
              state: element.getAttribute('data-state'),
              selected: element.getAttribute('aria-selected'),
            }),
          );
          const panels = [...root.querySelectorAll('.fd-doc-tab-panel')].map(
            (element) => ({
              state: element.getAttribute('data-state'),
              hidden: element.hasAttribute('hidden'),
            }),
          );

          return {
            index,
            root: pick(root),
            list: pick(root.querySelector('.fd-doc-tabs-list')),
            triggers,
            panels,
          };
        });

      const collect = (phase) => ({
        phase,
        url: location.href,
        title: document.title,
        root: pick(document.querySelector('.fd-doc-code-block')),
        headings: [
          ...document.querySelectorAll('.docs-page-body h2[id], .docs-page-body h3[id]'),
        ].map((element) => ({
          id: element.id,
          text: text(element),
        })),
        preview: pick(document.querySelector('.fd-doc-preview')),
        install: pick(document.querySelector('.fd-doc-install-card')),
        codeBlocks: codeBlocks(),
        tabs: tabs(),
      });

      const top = collect('top');
      const secondTab = document
        .querySelectorAll('.fd-doc-code-tabs .fd-doc-tab-trigger')
        .item(1);

      if (secondTab) {
        secondTab.scrollIntoView({ block: 'center', inline: 'center' });
        await wait(120);
        secondTab.dispatchEvent(
          new PointerEvent('pointerdown', {
            bubbles: true,
            pointerType: 'mouse',
          }),
        );
        secondTab.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        secondTab.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
        secondTab.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      }

      await wait(320);
      const switched = collect('tab-switched');

      return { top, switched };
    })()`
  },

  summarize(report, helpers) {
    const { addCheck, cssPxNear } = helpers

    for (const capture of report.captures) {
      const { data, viewport } = capture
      const width = viewport.width
      const blocks = data.top.codeBlocks
      const titled = blocks.find((block) => block.header && block.caption)
      const untitled = blocks.find((block) => !block.header && block.floating)
      const highlighted = blocks.find((block) => block.highlightedCount > 0)
      const highlightedWord = blocks.find(
        (block) => block.highlightedWordCount > 0,
      )
      const markerLeaks = blocks.filter((block) => block.markerVisible)
      const missingPreBlocks = blocks.filter(
        (block) => block.lineCount > 0 && !block.pre,
      )
      const collapsedTokenBlocks = blocks.filter(
        (block) => block.lineCount > 0 && block.distinctTokenColorCount < 2,
      )
      const brokenLineNumberedBlocks = blocks.filter(
        (block) => block.lineNumbers && block.lineCount === 0,
      )
      const highlightedBlocks = blocks.filter((block) => block.lineCount > 0)
      const wrongThemeBlocks = highlightedBlocks.filter(
        (block) =>
          !block.root?.className.includes('catppuccin-latte') ||
          !block.root?.className.includes('catppuccin-mocha'),
      )
      const paddedPreBlocks = highlightedBlocks.filter(
        (block) =>
          block.pre?.style.padding !== '0px' ||
          block.pre?.style.backgroundColor !== 'rgba(0, 0, 0, 0)',
      )
      const wrongCodeScaleBlocks = highlightedBlocks.filter(
        (block) =>
          !cssPxNear(block.code?.style.fontSize, 13) ||
          !cssPxNear(block.firstLine?.style.lineHeight, 18.57),
      )
      const heavyHeaderCopyBlocks = blocks.filter(
        (block) =>
          block.header &&
          block.copy &&
          (block.copy.rect.height > 26 ||
            block.copy.style.borderTopWidth !== '0px' ||
            block.copy.style.backgroundColor !== 'rgba(0, 0, 0, 0)'),
      )
      const first = blocks[0]
      const headingTexts = data.top.headings.map((item) => item.text)

      addCheck(report, {
        label: `${width}px code blocks present`,
        pass: blocks.length >= 3,
        message: `blocks=${blocks.length}`,
      })

      addCheck(report, {
        label: `${width}px code root contract`,
        pass:
          first?.root?.tag === 'figure' &&
          first.dir === 'ltr' &&
          first.tabIndex === '-1' &&
          first.root.className.includes('shiki') &&
          first.root.className.includes('not-prose'),
        message: first
          ? `tag=${first.root?.tag}, dir=${first.dir}, tabindex=${first.tabIndex}, class=${first.root?.className}`
          : 'missing',
      })

      addCheck(report, {
        label: `${width}px code theme contract`,
        pass: wrongThemeBlocks.length === 0,
        message:
          wrongThemeBlocks.length === 0
            ? 'highlighted blocks use catppuccin-latte/mocha'
            : `wrong theme blocks=${wrongThemeBlocks
                .map((block) => `${block.index}:${block.root?.className}`)
                .join('; ')}`,
      })

      addCheck(report, {
        label: `${width}px code viewport accessible`,
        pass:
          blocks.every((block) => block.bodyRole === 'region') &&
          blocks.every((block) => block.bodyTabIndex === '0') &&
          blocks.every((block) => block.body?.style.overflow !== 'visible'),
        message: blocks
          .map(
            (block) =>
              `${block.index}:role=${block.bodyRole},tab=${block.bodyTabIndex},overflow=${block.body?.style.overflow ?? 'missing'}`,
          )
          .join('; '),
      })

      addCheck(report, {
        label: `${width}px preview wrapper present`,
        pass:
          Boolean(data.top.preview) &&
          data.top.preview.style.display !== 'none' &&
          data.top.preview.rect.width > 0,
        message: data.top.preview
          ? `display=${data.top.preview.style.display}, width=${data.top.preview.rect.width}`
          : 'missing',
      })

      addCheck(report, {
        label: `${width}px install card present`,
        pass:
          Boolean(data.top.install) &&
          data.top.install.style.display !== 'none' &&
          data.top.install.text.includes('@fumadocs/cli'),
        message: data.top.install
          ? `display=${data.top.install.style.display}, text=${data.top.install.text}`
          : 'missing',
      })

      addCheck(report, {
        label: `${width}px component page headings`,
        pass:
          headingTexts.includes('Usage') &&
          headingTexts.includes('Keep Background') &&
          headingTexts.includes('Icons'),
        message: headingTexts.join(', '),
      })

      addCheck(report, {
        label: `${width}px titled code header`,
        pass:
          Boolean(titled?.header && titled.caption && titled.copy) &&
          titled.caption.text === 'config.js' &&
          titled.header.text === titled.caption.text &&
          titled.caption.style.margin === '0px' &&
          titled.caption.style.fontWeight === '400',
        message: titled
          ? `header=${titled.header?.text || 'none'}, caption=${titled.caption?.text || 'none'}, margin=${titled.caption?.style.margin}, weight=${titled.caption?.style.fontWeight}, copy=${Boolean(titled.copy)}`
          : 'missing',
      })

      addCheck(report, {
        label: `${width}px code typography density`,
        pass: wrongCodeScaleBlocks.length === 0,
        message:
          wrongCodeScaleBlocks.length === 0
            ? 'code font-size and line-height match compact profile'
            : `wrong scale blocks=${wrongCodeScaleBlocks
                .map(
                  (block) =>
                    `${block.index}:font=${block.code?.style.fontSize},line=${block.firstLine?.style.lineHeight}`,
                )
                .join('; ')}`,
      })

      addCheck(report, {
        label: `${width}px pre wrapper is neutral`,
        pass: paddedPreBlocks.length === 0,
        message:
          paddedPreBlocks.length === 0
            ? 'pre wrappers have no padding/background'
            : `padded pre blocks=${paddedPreBlocks
                .map(
                  (block) =>
                    `${block.index}:padding=${block.pre?.style.padding},bg=${block.pre?.style.backgroundColor}`,
                )
                .join('; ')}`,
      })

      addCheck(report, {
        label: `${width}px titled code icon`,
        pass: Boolean(titled?.icon?.tag === 'svg' && titled.icon.rect.width > 0),
        message: titled?.icon
          ? `tag=${titled.icon.tag}, width=${titled.icon.rect.width}`
          : 'missing',
      })

      addCheck(report, {
        label: `${width}px untitled floating copy`,
        pass: Boolean(untitled?.floating && untitled.copy),
        message: untitled
          ? `floating=${Boolean(untitled.floating)}, copy=${Boolean(untitled.copy)}`
          : 'missing',
      })

      addCheck(report, {
        label: `${width}px header copy button weight`,
        pass: heavyHeaderCopyBlocks.length === 0,
        message:
          heavyHeaderCopyBlocks.length === 0
            ? 'header copy buttons are compact and transparent'
            : `heavy copy blocks=${heavyHeaderCopyBlocks
                .map(
                  (block) =>
                    `${block.index}:h=${block.copy.rect.height},border=${block.copy.style.borderTopWidth},bg=${block.copy.style.backgroundColor}`,
                )
                .join('; ')}`,
      })

      addCheck(report, {
        label: `${width}px highlighted code markers`,
        pass: Boolean(highlighted),
        message: highlighted
          ? `block=${highlighted.index}, markers=${highlighted.highlightedCount}`
          : 'missing highlighted markers',
      })

      addCheck(report, {
        label: `${width}px highlighted word marker`,
        pass: Boolean(highlightedWord),
        message: highlightedWord
          ? `block=${highlightedWord.index}, words=${highlightedWord.highlightedWordCount}`
          : 'missing highlighted word',
      })

      addCheck(report, {
        label: `${width}px notation markers removed`,
        pass: markerLeaks.length === 0,
        message:
          markerLeaks.length === 0
            ? 'no notation text leaked'
            : `leaked blocks=${markerLeaks.map((block) => block.index).join(',')}`,
      })

      addCheck(report, {
        label: `${width}px highlighted code uses pre wrapper`,
        pass: missingPreBlocks.length === 0,
        message:
          missingPreBlocks.length === 0
            ? 'all highlighted blocks have pre'
            : `missing pre blocks=${missingPreBlocks
                .map((block) => block.index)
                .join(',')}`,
      })

      addCheck(report, {
        label: `${width}px token colors applied`,
        pass: collapsedTokenBlocks.length === 0,
        message:
          collapsedTokenBlocks.length === 0
            ? blocks
                .filter((block) => block.lineCount > 0)
                .map(
                  (block) => `${block.index}:${block.distinctTokenColorCount} colors`,
                )
                .join('; ')
            : `collapsed blocks=${collapsedTokenBlocks
                .map(
                  (block) =>
                    `${block.index}:${block.tokenColorSample.join('|') || 'none'}`,
                )
                .join('; ')}`,
      })

      addCheck(report, {
        label: `${width}px line-number protocol`,
        pass: brokenLineNumberedBlocks.length === 0,
        message:
          brokenLineNumberedBlocks.length === 0
            ? 'line-numbered blocks have line nodes when present'
            : `broken blocks=${brokenLineNumberedBlocks
                .map((block) => block.index)
                .join(',')}`,
      })
    }
  },

  summary(capture) {
    const blocks = capture.data.top.codeBlocks
    const preview = capture.data.top.preview
    const install = capture.data.top.install
    const markers = blocks.reduce(
      (sum, block) => sum + block.highlightedCount,
      0,
    )
    const lineNumbered = blocks.filter((block) => block.lineNumbers).length

    return `- ${capture.viewport.width}x${capture.viewport.height}: blocks=${
      blocks.length
    }; preview=${preview ? 'yes' : 'missing'}; install=${
      install ? 'yes' : 'missing'
    }; markers=${markers}; lineNumbered=${lineNumbered}`
  },
}
