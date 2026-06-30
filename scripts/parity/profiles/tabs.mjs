export const tabsProfile = {
  fixture: 'http://127.0.0.1:8888/guide/components',
  name: 'tabs',
  references: [
    'D:\\Projects\\Learning\\gh\\fumadocs\\packages\\base-ui\\src\\components\\tabs.tsx',
  ],
  selector: '.fd-doc-tabs',

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
            borderBottomWidth: style.borderBottomWidth,
            display: style.display,
            flexDirection: style.flexDirection,
            flexWrap: style.flexWrap,
            gap: style.gap,
            overflowX: style.overflowX,
            padding: style.padding,
          },
        };
      };
      const tabs = () =>
        [...document.querySelectorAll('.fd-doc-tabs:not(.fd-doc-code-tabs)')].map(
          (root, index) => ({
            index,
            root: pick(root),
            list: pick(root.querySelector('.fd-doc-tabs-list')),
            triggers: [...root.querySelectorAll('.fd-doc-tab-trigger')].map(
              (element) => ({
                root: pick(element),
                text: text(element),
                state: element.getAttribute('data-state'),
                selected: element.getAttribute('aria-selected'),
              }),
            ),
            panels: [...root.querySelectorAll('.fd-doc-tab-panel')].map(
              (element) => ({
                root: pick(element),
                state: element.getAttribute('data-state'),
                hidden: element.hasAttribute('hidden'),
              }),
            ),
          }),
        );

      const top = { tabs: tabs(), title: document.title, url: location.href };
      const secondTab = document
        .querySelectorAll('.fd-doc-tabs:not(.fd-doc-code-tabs) .fd-doc-tab-trigger')
        .item(1);
      secondTab?.click();
      await wait(180);
      const switched = { tabs: tabs(), title: document.title, url: location.href };

      return { top, switched };
    })()`
  },

  summarize(report, helpers) {
    const { addCheck } = helpers

    for (const capture of report.captures) {
      const { data, viewport } = capture
      const width = viewport.width
      const tabs = data.top.tabs[0]
      const activeTab = tabs?.triggers.find((item) => item.state === 'active')
      const inactivePanels =
        tabs?.panels.filter((item) => item.state === 'inactive') ?? []
      const switchedTab = data.switched.tabs[0]?.triggers.find(
        (item) => item.text === 'Code',
      )

      addCheck(report, {
        label: `${width}px tabs list rhythm`,
        pass:
          Boolean(tabs) &&
          tabs.root?.style.display === 'flex' &&
          tabs.list?.style.flexWrap === 'nowrap' &&
          tabs.list?.style.overflowX !== 'visible' &&
          activeTab?.root?.style.borderBottomWidth !== '0px',
        message: tabs
          ? `root=${tabs.root?.style.display}, wrap=${tabs.list?.style.flexWrap}, overflowX=${tabs.list?.style.overflowX}, active=${activeTab?.text ?? 'none'}, border=${activeTab?.root?.style.borderBottomWidth ?? 'missing'}`
          : 'missing',
      })

      addCheck(report, {
        label: `${width}px tabs state switches`,
        pass:
          switchedTab?.state === 'active' &&
          switchedTab?.selected === 'true' &&
          inactivePanels.some((item) => item.hidden),
        message: `code=${switchedTab?.state ?? 'missing'}/${switchedTab?.selected ?? 'missing'}, inactiveHidden=${inactivePanels
          .map((item) => item.hidden)
          .join(',')}`,
      })
    }
  },

  summary(capture) {
    const top = capture.data.top.tabs[0]
    const switched = capture.data.switched.tabs[0]?.triggers.find(
      (item) => item.state === 'active',
    )

    return `- ${capture.viewport.width}x${capture.viewport.height}: tabs=${
      capture.data.top.tabs.length
    }; triggers=${top?.triggers.length ?? 0}; switched=${switched?.text ?? 'none'}`
  },
}
