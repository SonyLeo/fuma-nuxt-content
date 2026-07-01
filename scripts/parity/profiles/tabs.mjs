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
            label: text(root.querySelector('.fd-doc-tabs-label')),
            triggers: [
              ...root.querySelectorAll(
                ':scope > .fd-doc-tabs-list > .fd-doc-tab-trigger',
              ),
            ].map(
              (element) => ({
                root: pick(element),
                text: text(element),
                state: element.getAttribute('data-state'),
                selected: element.getAttribute('aria-selected'),
                controls: element.getAttribute('aria-controls'),
              }),
            ),
            panels: [
              ...root.querySelectorAll(
                ':scope > .fd-doc-tabs-panels > .fd-doc-tab-panel',
              ),
            ].map(
              (element) => ({
                root: pick(element),
                text: text(element),
                state: element.getAttribute('data-state'),
                hidden: element.hasAttribute('hidden'),
                labelledby: element.getAttribute('aria-labelledby'),
              }),
            ),
          }),
        );
      const codeTabs = () =>
        [...document.querySelectorAll('.fd-doc-code-tabs')].map((root, index) => ({
          index,
          root: pick(root),
          list: pick(root.querySelector(':scope > .fd-doc-tabs-list')),
          triggers: [
            ...root.querySelectorAll(
              ':scope > .fd-doc-tabs-list > .fd-doc-tab-trigger',
            ),
          ].map((element) => ({
            root: pick(element),
            text: text(element),
            state: element.getAttribute('data-state'),
            selected: element.getAttribute('aria-selected'),
          })),
          panels: [
            ...root.querySelectorAll(
              ':scope > .fd-doc-tabs-panels > .fd-doc-tab-panel',
            ),
          ].map((element) => ({
            root: pick(element),
            text: text(element),
            state: element.getAttribute('data-state'),
            hidden: element.hasAttribute('hidden'),
            codeBlocks: element.querySelectorAll('.fd-doc-code-block').length,
          })),
        }));

      const top = {
        tabs: tabs(),
        codeTabs: codeTabs(),
        title: document.title,
        url: location.href,
      };
      const firstTabs = document.querySelector('.fd-doc-tabs:not(.fd-doc-code-tabs)');
      const secondTab = firstTabs
        ?.querySelectorAll(':scope > .fd-doc-tabs-list > .fd-doc-tab-trigger')
        .item(1);
      secondTab?.scrollIntoView({ block: 'center', inline: 'center' });
      await wait(80);
      secondTab?.click();
      await wait(320);
      const switched = {
        tabs: tabs(),
        codeTabs: codeTabs(),
        title: document.title,
        url: location.href,
      };

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
      const switchedTabs = data.switched.tabs[0]
      const inactivePanels =
        switchedTabs?.panels.filter((item) => item.state === 'inactive') ?? []
      const switchedTab = data.switched.tabs[0]?.triggers.find(
        (item) => item.text === 'Code',
      )
      const simpleTabs = data.top.tabs[1]
      const simpleActive = simpleTabs?.triggers.find(
        (item) => item.state === 'active',
      )
      const codeTabs = data.top.codeTabs[0]
      const codeTabsActive = codeTabs?.triggers.find(
        (item) => item.state === 'active',
      )

      addCheck(report, {
        label: `${width}px tabs examples present`,
        pass: data.top.tabs.length >= 2,
        message: `tabs=${data.top.tabs.length}`,
      })

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

      addCheck(report, {
        label: `${width}px tabs simple mode defaultIndex and label`,
        pass:
          simpleTabs?.label === 'Mode' &&
          simpleTabs?.triggers.length === 3 &&
          simpleActive?.text === 'Code Example' &&
          simpleActive?.selected === 'true' &&
          simpleTabs?.panels.some(
            (item) =>
              item.state === 'active' &&
              item.text.includes('second tab is active'),
          ),
        message: simpleTabs
          ? `label=${simpleTabs.label},triggers=${simpleTabs.triggers
              .map((item) => `${item.text}:${item.state}/${item.selected}`)
              .join('|')}`
          : 'missing',
      })

      addCheck(report, {
        label: `${width}px code tabs shell contract`,
        pass:
          Boolean(codeTabs) &&
          codeTabs?.root?.style.display === 'flex' &&
          codeTabs?.list?.style.overflowX !== 'visible' &&
          codeTabs?.triggers.length === 2 &&
          codeTabsActive?.text === 'pnpm' &&
          codeTabsActive?.selected === 'true' &&
          codeTabs?.panels.some(
            (item) => item.state === 'active' && item.codeBlocks === 1,
          ),
        message: codeTabs
          ? `triggers=${codeTabs.triggers
              .map((item) => `${item.text}:${item.state}/${item.selected}`)
              .join('|')},codeBlocks=${codeTabs.panels
              .map((item) => `${item.state}:${item.codeBlocks}`)
              .join('|')}`
          : 'missing',
      })
    }
  },

  summary(capture) {
    const top = capture.data.top.tabs[0]
    const simple = capture.data.top.tabs[1]
    const switched = capture.data.switched.tabs[0]?.triggers.find(
      (item) => item.state === 'active',
    )

    const codeTabs = capture.data.top.codeTabs[0]

    return `- ${capture.viewport.width}x${capture.viewport.height}: tabs=${
      capture.data.top.tabs.length
    }; triggers=${top?.triggers.length ?? 0}; switched=${switched?.text ?? 'none'}; simpleActive=${
      simple?.triggers.find((item) => item.state === 'active')?.text ?? 'none'
    }; codeTabs=${codeTabs?.triggers.length ?? 0}`
  },
}
