export const cardsProfile = {
  fixture: 'http://127.0.0.1:8888/guide/components',
  name: 'cards',
  references: [
    'D:\\Projects\\Learning\\gh\\fumadocs\\packages\\base-ui\\src\\components\\card.tsx',
  ],
  selector: '.fd-card-grid',

  collect() {
    return `(() => {
      const text = (element) =>
        element?.textContent?.trim().replace(/\\s+/g, ' ') || '';
      const pick = (element) => {
        if (!element) return null;

        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();

        return {
          tag: element.tagName.toLowerCase(),
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
            backgroundColor: style.backgroundColor,
            borderRadius: style.borderRadius,
            borderWidth: style.borderWidth,
            boxShadow: style.boxShadow,
            color: style.color,
            containerType: style.containerType,
            display: style.display,
            fontSize: style.fontSize,
            fontWeight: style.fontWeight,
            gap: style.gap,
            gridColumn: style.gridColumn,
            gridTemplateColumns: style.gridTemplateColumns,
            lineHeight: style.lineHeight,
            margin: style.margin,
            overflowWrap: style.overflowWrap,
            padding: style.padding,
            textDecorationLine: style.textDecorationLine,
            transitionProperty: style.transitionProperty,
          },
        };
      };

      const grids = [...document.querySelectorAll('.fd-card-grid')].map((root, index) => {
        const cards = [...root.querySelectorAll(':scope > [data-card]')];

        return {
          index,
          root: pick(root),
          cards: cards.map((card) => ({
            root: pick(card),
            hasDataCard: card.hasAttribute('data-card'),
            href: card.getAttribute('href'),
            target: card.getAttribute('target'),
            rel: card.getAttribute('rel'),
            icon: pick(card.querySelector('.fd-doc-card-icon')),
            iconName:
              card.querySelector('.fd-doc-card-icon [data-icon]')?.getAttribute('data-icon') ||
              null,
            header: pick(card.querySelector('.fd-doc-card-header')),
            title: pick(card.querySelector('.fd-doc-card-header h3')),
            badge: pick(card.querySelector('.fd-doc-card-badge')),
            description: pick(card.querySelector('.fd-doc-card-description')),
            slot: pick(card.querySelector('.fd-doc-card-slot')),
          })),
        };
      });

      return {
        grids,
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
      const grid = data.grids[0]
      const cards = grid?.cards ?? []
      const linkCards = cards.filter((item) => item.href)
      const externalCard = cards.find((item) => item.href?.startsWith('https://'))
      const badgeCard = cards.find((item) => item.badge)
      const slotCard = cards.find((item) => item.root?.tag === 'div')
      const iconCards = cards.filter((item) => item.icon)
      const columnCount = grid?.root?.style.gridTemplateColumns
        ?.split(' ')
        .filter(Boolean).length ?? 0

      addCheck(report, {
        label: `${width}px cards grid rendered`,
        pass:
          Boolean(grid) &&
          grid.cards.length >= 4 &&
          grid.root?.style.display === 'grid' &&
          grid.root?.style.containerType === 'inline-size' &&
          grid.root?.style.gap === '12px',
        message: grid
          ? `cards=${grid.cards.length},display=${grid.root?.style.display},container=${grid.root?.style.containerType},gap=${grid.root?.style.gap}`
          : 'missing',
      })

      addCheck(report, {
        label: `${width}px card protocol matrix`,
        pass:
          cards.every((item) => item.hasDataCard) &&
          linkCards.length >= 3 &&
          iconCards.length >= 4 &&
          Boolean(externalCard) &&
          externalCard?.target === '_blank' &&
          Boolean(externalCard?.rel?.includes('noopener')) &&
          Boolean(badgeCard) &&
          Boolean(slotCard?.slot?.text),
        message: `links=${linkCards.length},icons=${iconCards
          .map((item) => item.iconName)
          .join('|')},external=${externalCard?.target}/${externalCard?.rel},badge=${badgeCard?.badge?.text},slot=${slotCard?.slot?.text ? 'yes' : 'missing'}`,
      })

      addCheck(report, {
        label: `${width}px card visual rhythm`,
        pass:
          cards.every(
            (item) =>
              item.root?.style.borderRadius === '12px' &&
              item.root?.style.padding === '16px' &&
              item.title?.style.fontSize === '14px' &&
              item.title?.style.lineHeight === '20px' &&
              item.title?.style.fontWeight === '500' &&
              item.title?.style.overflowWrap === 'anywhere',
          ) &&
          iconCards.every(
            (item) =>
              item.icon?.style.borderRadius === '8px' &&
              item.icon?.rect.width >= 28 &&
              item.icon?.rect.height >= 28,
          ),
        message: cards[0]
          ? `cardRadius=${cards[0].root?.style.borderRadius},padding=${cards[0].root?.style.padding},title=${cards[0].title?.style.fontSize}/${cards[0].title?.style.lineHeight}/${cards[0].title?.style.fontWeight},icon=${iconCards[0]?.icon?.rect.width}x${iconCards[0]?.icon?.rect.height}`
          : 'missing',
      })

      const shouldBeSingleColumn = width <= 640
      const allCardsSpanGrid = cards.every(
        (item) =>
          grid?.root &&
          Math.abs(item.root.rect.left - grid.root.rect.left) <= 2 &&
          Math.abs(item.root.rect.width - grid.root.rect.width) <= 3,
      )

      addCheck(report, {
        label: `${width}px cards responsive columns`,
        pass: shouldBeSingleColumn
          ? allCardsSpanGrid
          : columnCount >= 2 && !allCardsSpanGrid,
        message: `columns=${columnCount},single=${allCardsSpanGrid},grid=${grid?.root?.rect.width},cards=${cards
          .map((item) => item.root?.rect.width)
          .join('|')}`,
      })
    }
  },

  summary(capture) {
    const grid = capture.data.grids[0]
    const cards = grid?.cards ?? []

    return `- ${capture.viewport.width}x${capture.viewport.height}: grids=${
      capture.data.grids.length
    }; cards=${cards.length}; columns=${grid?.root?.style.gridTemplateColumns ?? 'none'}`
  },
}
