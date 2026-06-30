export const typeTableProfile = {
  fixture: 'http://127.0.0.1:8888/guide/components',
  name: 'type-table',
  references: [
    'D:\\Projects\\Learning\\gh\\fumadocs\\packages\\base-ui\\src\\components\\type-table.tsx',
  ],
  selector: '.fd-doc-type-table',

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
            gridTemplateColumns: style.gridTemplateColumns,
            padding: style.padding,
          },
        };
      };
      const typeTables = () =>
        [...document.querySelectorAll('.fd-doc-type-table')].map((root, index) => ({
          index,
          root: pick(root),
          head: pick(root.querySelector('.fd-doc-type-table-head')),
          rows: [...root.querySelectorAll('.fd-doc-type-row')].map((element) => {
            const trigger = element.querySelector('.fd-doc-type-trigger');
            const details = element.querySelector('.fd-doc-type-details');

            return {
              root: pick(element),
              trigger: pick(trigger),
              prop: pick(element.querySelector('.fd-doc-type-prop')),
              value: pick(element.querySelector('.fd-doc-type-value')),
              details: pick(details),
              open: element.getAttribute('data-open'),
              expanded: trigger?.getAttribute('aria-expanded') || null,
              detailsVisible: details
                ? getComputedStyle(details).display !== 'none'
                : false,
            };
          }),
        }));

      const top = { typeTables: typeTables(), title: document.title, url: location.href };
      const firstTypeTrigger = document.querySelector('.fd-doc-type-trigger');
      firstTypeTrigger?.click();
      await wait(180);
      const opened = { typeTables: typeTables(), title: document.title, url: location.href };

      return { top, opened };
    })()`
  },

  summarize(report, helpers) {
    const { addCheck } = helpers

    for (const capture of report.captures) {
      const { data, viewport } = capture
      const width = viewport.width
      const typeTable = data.top.typeTables[0]
      const openedTypeRow = data.opened.typeTables[0]?.rows.find(
        (item) => item.expanded === 'true',
      )

      addCheck(report, {
        label: `${width}px type table rendered`,
        pass:
          Boolean(typeTable) &&
          typeTable.rows.length >= 2 &&
          typeTable.root?.style.display === 'flex' &&
          typeTable.head?.style.display === 'flex',
        message: typeTable
          ? `rows=${typeTable.rows.length}, root=${typeTable.root?.style.display}, head=${typeTable.head?.style.display}`
          : 'missing',
      })

      addCheck(report, {
        label: `${width}px type table expands details`,
        pass:
          openedTypeRow?.expanded === 'true' &&
          openedTypeRow?.detailsVisible &&
          openedTypeRow?.details?.style.display === 'grid',
        message: openedTypeRow
          ? `expanded=${openedTypeRow.expanded}, visible=${openedTypeRow.detailsVisible}, display=${openedTypeRow.details?.style.display}`
          : 'missing',
      })
    }
  },

  summary(capture) {
    const table = capture.data.top.typeTables[0]
    const opened = capture.data.opened.typeTables[0]?.rows.find(
      (item) => item.expanded === 'true',
    )

    return `- ${capture.viewport.width}x${capture.viewport.height}: typeRows=${
      table?.rows.length ?? 0
    }; opened=${opened?.prop?.text ?? 'none'}`
  },
}
