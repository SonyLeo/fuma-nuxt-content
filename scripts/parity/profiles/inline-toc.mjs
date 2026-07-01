export const inlineTocProfile = {
  fixture: 'http://127.0.0.1:8888/guide/components',
  name: 'inline-toc',
  references: [
    'D:\\Projects\\Learning\\gh\\fumadocs\\packages\\base-ui\\src\\components\\inline-toc.tsx',
  ],
  selector: '.fd-doc-inline-toc',

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
            color: style.color,
            borderLeftWidth: style.borderLeftWidth,
            display: style.display,
            padding: style.padding,
            paddingInlineStart: style.paddingInlineStart,
            transform: style.transform,
          },
        };
      };
      const snapshot = () => [...document.querySelectorAll('.fd-doc-inline-toc')].map(
        (root, index) => ({
          index,
          state: root.getAttribute('data-state'),
          open: root.getAttribute('data-open'),
          root: pick(root),
          trigger: pick(root.querySelector('.fd-doc-inline-toc-trigger')),
          chevron: pick(root.querySelector('.fd-doc-inline-toc-chevron')),
          content: pick(root.querySelector('.fd-doc-inline-toc-content')),
          expanded:
            root
              .querySelector('.fd-doc-inline-toc-trigger')
              ?.getAttribute('aria-expanded') || null,
          links: [...root.querySelectorAll('.fd-doc-inline-toc-link')].map(
            (element) => ({
              root: pick(element),
              href: element.getAttribute('href'),
              active: element.classList.contains('is-active'),
              paddingInlineStart: getComputedStyle(element).paddingInlineStart,
            }),
          ),
        }),
      );

      const top = { inlineTocs: snapshot(), title: document.title, url: location.href };
      const collapsedTrigger = top.inlineTocs[1]?.trigger;
      const collapsedButton = document
        .querySelectorAll('.fd-doc-inline-toc-trigger')
        .item(1);
      collapsedButton?.scrollIntoView({ block: 'center', inline: 'center' });
      await wait(80);
      collapsedButton?.click();
      await wait(180);
      const opened = { inlineTocs: snapshot(), title: document.title, url: location.href };

      return { top, opened, clickedText: collapsedTrigger?.text ?? '' };
    })()`
  },

  summarize(report, helpers) {
    const { addCheck } = helpers

    for (const capture of report.captures) {
      const { data, viewport } = capture
      const width = viewport.width
      const inlineToc = data.top.inlineTocs[0]
      const collapsedToc = data.top.inlineTocs[1]
      const openedToc = data.opened.inlineTocs[1]

      addCheck(report, {
        label: `${width}px inline toc contract`,
        pass:
          Boolean(inlineToc) &&
          inlineToc.expanded === 'true' &&
          inlineToc.links.length >= 3 &&
          inlineToc.links.some((item) => item.active) &&
          inlineToc.links.some((item) => item.paddingInlineStart !== '0px') &&
          inlineToc.links.every(
            (item) => item.root?.style.borderLeftWidth === '1px',
          ),
        message: inlineToc
          ? `expanded=${inlineToc.expanded}, links=${inlineToc.links.length}, active=${inlineToc.links.some((item) => item.active)}, padding=${inlineToc.links.map((item) => item.paddingInlineStart).join('|')}, border=${inlineToc.links[0]?.root?.style.borderLeftWidth ?? 'missing'}`
          : 'missing',
      })

      addCheck(report, {
        label: `${width}px inline toc collapsed interaction`,
        pass:
          collapsedToc?.expanded === 'false' &&
          collapsedToc?.content?.style.display === 'none' &&
          openedToc?.expanded === 'true' &&
          openedToc?.content?.style.display !== 'none',
        message: collapsedToc
          ? `collapsed=${collapsedToc.expanded}/${collapsedToc.content?.style.display},opened=${openedToc?.expanded}/${openedToc?.content?.style.display}`
          : 'missing',
      })
    }
  },

  summary(capture) {
    const inlineToc = capture.data.top.inlineTocs[0]
    const collapsedToc = capture.data.top.inlineTocs[1]

    return `- ${capture.viewport.width}x${capture.viewport.height}: inlineToc=${
      inlineToc?.links.length ?? 0
    }; expanded=${inlineToc?.expanded ?? 'missing'}; collapsed=${collapsedToc?.expanded ?? 'missing'}`
  },
}
