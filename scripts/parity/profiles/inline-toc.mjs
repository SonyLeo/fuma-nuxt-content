export const inlineTocProfile = {
  fixture: 'http://127.0.0.1:8888/guide/components',
  name: 'inline-toc',
  references: [
    'D:\\Projects\\Learning\\gh\\fumadocs\\packages\\base-ui\\src\\components\\inline-toc.tsx',
  ],
  selector: '.fd-doc-inline-toc',

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
          className: typeof element.className === 'string' ? element.className : '',
          text: text(element).slice(0, 160),
          rect: {
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            top: Math.round(rect.top),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          },
          style: {
            borderLeftWidth: style.borderLeftWidth,
            display: style.display,
            padding: style.padding,
            paddingInlineStart: style.paddingInlineStart,
          },
        };
      };
      const inlineTocs = [...document.querySelectorAll('.fd-doc-inline-toc')].map(
        (root, index) => ({
          index,
          root: pick(root),
          trigger: pick(root.querySelector('.fd-doc-inline-toc-trigger')),
          content: pick(root.querySelector('.fd-doc-inline-toc-content')),
          expanded:
            root
              .querySelector('.fd-doc-inline-toc-trigger')
              ?.getAttribute('aria-expanded') || null,
          links: [...root.querySelectorAll('.fd-doc-inline-toc-link')].map(
            (element) => ({
              root: pick(element),
              href: element.getAttribute('href'),
              paddingInlineStart: getComputedStyle(element).paddingInlineStart,
            }),
          ),
        }),
      );

      return { inlineTocs, title: document.title, url: location.href };
    })()`
  },

  summarize(report, helpers) {
    const { addCheck } = helpers

    for (const capture of report.captures) {
      const { data, viewport } = capture
      const width = viewport.width
      const inlineToc = data.inlineTocs[0]

      addCheck(report, {
        label: `${width}px inline toc contract`,
        pass:
          Boolean(inlineToc) &&
          inlineToc.expanded === 'true' &&
          inlineToc.links.length >= 3 &&
          inlineToc.links.every(
            (item) => item.root?.style.borderLeftWidth === '1px',
          ),
        message: inlineToc
          ? `expanded=${inlineToc.expanded}, links=${inlineToc.links.length}, border=${inlineToc.links[0]?.root?.style.borderLeftWidth ?? 'missing'}`
          : 'missing',
      })
    }
  },

  summary(capture) {
    const inlineToc = capture.data.inlineTocs[0]

    return `- ${capture.viewport.width}x${capture.viewport.height}: inlineToc=${
      inlineToc?.links.length ?? 0
    }; expanded=${inlineToc?.expanded ?? 'missing'}`
  },
}
