export const accordionProfile = {
  fixture: 'http://127.0.0.1:8888/guide/components',
  name: 'accordion',
  references: [
    'D:\\Projects\\Learning\\gh\\fumadocs\\packages\\base-ui\\src\\components\\accordion.tsx',
  ],
  selector: '.fd-doc-accordions',

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
            display: style.display,
            gridTemplateRows: style.gridTemplateRows,
            padding: style.padding,
          },
        };
      };
      const accordions = () =>
        [...document.querySelectorAll('.fd-doc-accordions')].map((root, index) => ({
          index,
          root: pick(root),
          items: [...root.querySelectorAll('.fd-doc-accordion-item')].map(
            (element) => {
              const trigger = element.querySelector('.fd-doc-accordion-trigger');
              const panel = element.querySelector('.fd-doc-accordion-panel');

              return {
                root: pick(element),
                trigger: pick(trigger),
                copy: pick(element.querySelector('.fd-doc-accordion-copy')),
                panel: pick(panel),
                state: element.getAttribute('data-state'),
                value: element.getAttribute('data-accordion-value'),
                triggerExpanded: trigger?.getAttribute('aria-expanded') || null,
                panelHidden: panel?.getAttribute('hidden') || null,
                panelRole: panel?.getAttribute('role') || null,
              };
            },
          ),
        }));

      const top = { accordions: accordions(), title: document.title, url: location.href };
      const secondAccordion = document
        .querySelectorAll('.fd-doc-accordion-trigger')
        .item(1);
      secondAccordion?.click();
      await wait(220);
      const opened = { accordions: accordions(), title: document.title, url: location.href };

      return { top, opened };
    })()`
  },

  summarize(report, helpers) {
    const { addCheck } = helpers

    for (const capture of report.captures) {
      const { data, viewport } = capture
      const width = viewport.width
      const accordion = data.top.accordions[0]
      const closedAccordion = accordion?.items.find(
        (item) => item.state === 'closed',
      )
      const openedAccordion = data.opened.accordions[0]?.items.find(
        (item) => item.value === 'why-not-vitepress',
      )

      addCheck(report, {
        label: `${width}px accordion protocol`,
        pass:
          Boolean(accordion) &&
          accordion.items.length >= 3 &&
          closedAccordion?.panelHidden === 'until-found' &&
          accordion.items.some((item) => item.copy),
        message: accordion
          ? `items=${accordion.items.length}, closedHidden=${closedAccordion?.panelHidden ?? 'missing'}, copy=${accordion.items.some((item) => item.copy)}`
          : 'missing',
      })

      addCheck(report, {
        label: `${width}px accordion opens clicked item`,
        pass:
          openedAccordion?.state === 'open' &&
          openedAccordion?.triggerExpanded === 'true' &&
          openedAccordion?.panelRole === 'region',
        message: openedAccordion
          ? `state=${openedAccordion.state}, expanded=${openedAccordion.triggerExpanded}, role=${openedAccordion.panelRole}`
          : 'missing',
      })
    }
  },

  summary(capture) {
    const accordion = capture.data.top.accordions[0]
    const opened = capture.data.opened.accordions[0]?.items.find(
      (item) => item.state === 'open',
    )

    return `- ${capture.viewport.width}x${capture.viewport.height}: items=${
      accordion?.items.length ?? 0
    }; opened=${opened?.value ?? 'none'}`
  },
}
