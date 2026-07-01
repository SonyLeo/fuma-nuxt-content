export const headingProfile = {
  fixture: 'http://127.0.0.1:8888/guide/components',
  name: 'heading',
  references: [
    'D:\\Projects\\Learning\\gh\\fumadocs\\packages\\base-ui\\src\\components\\heading.tsx',
  ],
  selector: '.docs-heading',

  collect() {
    return `(async () => {
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
          text: text(element).slice(0, 220),
          rect: {
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            top: Math.round(rect.top),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          },
          style: {
            color: style.color,
            display: style.display,
            flexWrap: style.flexWrap,
            gap: style.gap,
            alignItems: style.alignItems,
            fontSize: style.fontSize,
            fontWeight: style.fontWeight,
            lineHeight: style.lineHeight,
            margin: style.margin,
            opacity: style.opacity,
            scrollMarginTop: style.scrollMarginTop,
            textDecorationLine: style.textDecorationLine,
          },
        };
      };

      let copiedText = null;
      const installClipboardStub = () => {
        try {
          Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: {
              writeText: async (value) => {
                copiedText = value;
              },
            },
          });
        } catch {}
      };

      const headings = [...document.querySelectorAll('.docs-heading')].map(
        (root, index) => {
          const anchor = root.querySelector('.docs-heading-anchor');
          const copy = root.querySelector('.docs-heading-copy');

          return {
            index,
            root: pick(root),
            anchor: pick(anchor),
            copy: pick(copy),
            anchorHref: anchor?.getAttribute('href') || null,
            anchorDataCard: anchor?.hasAttribute('data-card') || false,
            copyAria: copy?.getAttribute('aria-label') || null,
            copySize: copy?.getAttribute('data-size') || null,
            copyVariant: copy?.getAttribute('data-variant') || null,
            copyHasIcon: Boolean(copy?.querySelector('svg')),
          };
        },
      );

      const target = [...document.querySelectorAll('.docs-heading')].find(
        (root) => root.id && root.querySelector('.docs-heading-copy'),
      );
      const targetCopy = target?.querySelector('.docs-heading-copy');
      const initialCopyAria = targetCopy?.getAttribute('aria-label') || null;

      installClipboardStub();

      if (targetCopy) {
        targetCopy.click();
        await new Promise((resolve) => setTimeout(resolve, 120));
      }

      const afterCopyAria = targetCopy?.getAttribute('aria-label') || null;

      return {
        afterCopyAria,
        copiedText,
        headings,
        initialCopyAria,
        targetId: target?.id || null,
        title: document.title,
        url: location.href,
      };
    })()`
  },

  summarize(report, helpers) {
    const { addCheck } = helpers

    for (const capture of report.captures) {
      const { data, viewport } = capture
      const width = viewport.width
      const headings = data.headings
      const h2 = headings.find((item) => item.root?.tag === 'h2')
      const withIds = headings.filter((item) => item.root?.id)
      const copiedHash =
        typeof data.copiedText === 'string'
          ? decodeURIComponent(new URL(data.copiedText).hash.slice(1))
          : null

      addCheck(report, {
        label: `${width}px heading protocol rendered`,
        pass:
          headings.length >= 8 &&
          withIds.length === headings.length &&
          withIds.every(
            (item) =>
              item.anchorHref === `#${item.root.id}` &&
              item.anchorDataCard &&
              item.copy &&
              item.copySize === 'icon-xs' &&
              item.copyVariant === 'ghost' &&
              item.copyHasIcon,
          ),
        message: `headings=${headings.length},withIds=${withIds.length},first=${headings[0]?.root?.id}/${headings[0]?.anchorHref},copy=${headings[0]?.copySize}/${headings[0]?.copyVariant}`,
      })

      addCheck(report, {
        label: `${width}px heading layout rhythm`,
        pass:
          withIds.every(
            (item) =>
              item.root?.style.display === 'flex' &&
              item.root?.style.alignItems === 'center' &&
              item.root?.style.flexWrap === 'wrap' &&
              item.root?.style.gap === '4px' &&
              item.root?.style.scrollMarginTop === '112px',
          ) &&
          h2?.root?.style.fontSize === '24px' &&
          h2?.root?.style.lineHeight === '30px',
        message: h2
          ? `h2=${h2.root?.style.display}/${h2.root?.style.gap}/${h2.root?.style.scrollMarginTop}/${h2.root?.style.fontSize}/${h2.root?.style.lineHeight}`
          : 'missing h2',
      })

      addCheck(report, {
        label: `${width}px heading anchor and copy visibility`,
        pass:
          withIds.every(
            (item) =>
              item.anchor?.style.textDecorationLine === 'none' &&
              item.copy?.style.opacity === '0',
          ) && data.initialCopyAria === 'Copy Anchor Link',
        message: `anchorDecoration=${withIds[0]?.anchor?.style.textDecorationLine},copyOpacity=${withIds[0]?.copy?.style.opacity},aria=${data.initialCopyAria}`,
      })

      addCheck(report, {
        label: `${width}px heading copy interaction`,
        pass:
          Boolean(data.targetId) &&
          data.afterCopyAria === 'Copied Anchor Link' &&
          copiedHash === data.targetId,
        message: `target=${data.targetId},aria=${data.afterCopyAria},hash=${copiedHash ?? 'missing'},copied=${data.copiedText ?? 'missing'}`,
      })
    }
  },

  summary(capture) {
    const headings = capture.data.headings

    return `- ${capture.viewport.width}x${capture.viewport.height}: headings=${
      headings.length
    }; target=${capture.data.targetId}; copied=${
      capture.data.copiedText ? 'yes' : 'missing'
    }`
  },
}
