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
            const prop = element.querySelector('.fd-doc-type-prop');
            const value = element.querySelector('.fd-doc-type-value');

            return {
              root: pick(element),
              trigger: pick(trigger),
              id: element.getAttribute('id'),
              prop: pick(prop),
              propName: text(prop?.querySelector('code')),
              value: pick(value),
              valueLink: value?.querySelector('a')?.getAttribute('href') || null,
              badges: [...element.querySelectorAll('.fd-doc-type-badge')].map(text),
              deprecated: Boolean(element.querySelector('code.is-deprecated')),
              details: pick(details),
              metaLabels: [...element.querySelectorAll('.fd-doc-type-meta dt')].map(text),
              paramNames: [...element.querySelectorAll('.fd-doc-type-param code')].map(text),
              open: element.getAttribute('data-open'),
              expanded: trigger?.getAttribute('aria-expanded') || null,
              detailsVisible: details
                ? getComputedStyle(details).display !== 'none'
                : false,
            };
          }),
        }));

      if (location.hash) {
        history.replaceState(null, '', location.pathname + location.search);
        await wait(100);
      }

      const top = { typeTables: typeTables(), title: document.title, url: location.href };
      const onChangeTrigger = [...document.querySelectorAll('.fd-doc-type-trigger')].find(
        (element) => text(element).includes('onChange'),
      );
      onChangeTrigger?.scrollIntoView({ block: 'center', inline: 'center' });
      await wait(80);
      onChangeTrigger?.click();
      await wait(220);
      const openedHash = location.hash;
      const opened = {
        typeTables: typeTables(),
        title: document.title,
        url: location.href,
        hash: openedHash,
      };
      if (location.hash) {
        history.replaceState(null, '', location.pathname + location.search);
      }

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
          typeTable.rows.length >= 4 &&
          typeTable.root?.style.display === 'flex' &&
          typeTable.head?.style.display === 'flex',
        message: typeTable
          ? `rows=${typeTable.rows.length}, root=${typeTable.root?.style.display}, head=${typeTable.head?.style.display}`
          : 'missing',
      })

      const titleRow = typeTable?.rows.find((item) => item.propName === 'title')
      const tocRow = typeTable?.rows.find((item) => item.propName === 'toc?')
      const legacyRow = typeTable?.rows.find((item) =>
        item.propName.startsWith('legacy'),
      )
      const callbackRow = typeTable?.rows.find((item) =>
        item.propName.startsWith('onChange'),
      )

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

      addCheck(report, {
        label: `${width}px type table field matrix`,
        pass:
          titleRow?.badges.includes('required') &&
          tocRow?.detailsVisible === false &&
          legacyRow?.deprecated &&
          legacyRow?.badges.includes('deprecated') &&
          callbackRow?.valueLink === '/guide/components',
        message: typeTable
          ? `titleBadges=${titleRow?.badges.join('|')},toc=${tocRow?.propName},legacyDeprecated=${legacyRow?.deprecated}/${legacyRow?.badges.join('|')},callbackLink=${callbackRow?.valueLink}`
          : 'missing',
      })

      addCheck(report, {
        label: `${width}px type table rich details and hash`,
        pass:
          openedTypeRow?.propName.startsWith('onChange') &&
          openedTypeRow?.metaLabels.includes('Type') &&
          openedTypeRow?.metaLabels.includes('Parameters') &&
          openedTypeRow?.metaLabels.includes('Returns') &&
          openedTypeRow?.paramNames.includes('value') &&
          openedTypeRow?.paramNames.includes('event') &&
          data.opened.hash === '#page-on-change',
        message: openedTypeRow
          ? `row=${openedTypeRow.propName},labels=${openedTypeRow.metaLabels.join('|')},params=${openedTypeRow.paramNames.join('|')},hash=${data.opened.hash}`
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
    }; opened=${opened?.propName ?? 'none'}`
  },
}
