export const stepsProfile = {
  fixture: 'http://127.0.0.1:8888/guide/components',
  name: 'steps',
  references: [
    'D:\\Projects\\Learning\\gh\\fumadocs\\packages\\base-ui\\src\\components\\steps.tsx',
  ],
  selector: '.fd-steps',

  collect() {
    return `(() => {
      const text = (element) =>
        element?.textContent?.trim().replace(/\\s+/g, ' ') || '';
      const pick = (element) => {
        if (!element) return null;

        const style = getComputedStyle(element);
        const before = getComputedStyle(element, '::before');
        const after = getComputedStyle(element, '::after');
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
            color: style.color,
            counterIncrement: style.counterIncrement,
            counterReset: style.counterReset,
            display: style.display,
            fontSize: style.fontSize,
            lineHeight: style.lineHeight,
            margin: style.margin,
            marginTop: style.marginTop,
            padding: style.padding,
            paddingLeft: style.paddingLeft,
            position: style.position,
          },
          before: {
            backgroundColor: before.backgroundColor,
            borderRadius: before.borderRadius,
            color: before.color,
            content: before.content,
            display: before.display,
            height: before.height,
            left: before.left,
            top: before.top,
            width: before.width,
          },
          after: {
            backgroundColor: after.backgroundColor,
            bottom: after.bottom,
            content: after.content,
            display: after.display,
            left: after.left,
            top: after.top,
            width: after.width,
          },
        };
      };

      const roots = [...document.querySelectorAll('.fd-steps')].map((root, index) => {
        const listItems = [...root.querySelectorAll(':scope li')];
        const explicitSteps = [...root.querySelectorAll(':scope > .fd-step')];
        const items = [...listItems, ...explicitSteps];

        return {
          index,
          root: pick(root),
          listItems: listItems.map(pick),
          explicitSteps: explicitSteps.map(pick),
          items: items.map((item) => ({
            root: pick(item),
            firstChild: pick(item.firstElementChild),
            link: pick(item.querySelector('a')),
            code: pick(item.querySelector('code')),
          })),
        };
      });

      return {
        roots,
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
      const roots = data.roots
      const listRoot = roots.find((item) => item.listItems.length >= 3)
      const explicitRoot = roots.find((item) => item.explicitSteps.length >= 3)
      const allItems = roots.flatMap((item) => item.items)
      const itemsWithRail = allItems.filter(
        (item) => item.root?.after.content !== 'none',
      )
      const itemsWithMarker = allItems.filter(
        (item) =>
          item.root?.before.content !== 'none' &&
          item.root?.before.width === '32px' &&
          item.root?.before.height === '32px',
      )
      const linkItem = allItems.find((item) => item.link)
      const codeItem = allItems.find((item) => item.code)

      addCheck(report, {
        label: `${width}px steps render both authoring paths`,
        pass:
          roots.length >= 2 &&
          Boolean(listRoot) &&
          Boolean(explicitRoot) &&
          listRoot?.listItems.length === 3 &&
          explicitRoot?.explicitSteps.length === 3,
        message: `roots=${roots.length},list=${listRoot?.listItems.length ?? 0},explicit=${explicitRoot?.explicitSteps.length ?? 0}`,
      })

      addCheck(report, {
        label: `${width}px steps marker and rail contract`,
        pass:
          allItems.length >= 6 &&
          itemsWithMarker.length === allItems.length &&
          itemsWithRail.length >= allItems.length - roots.length &&
          allItems.every(
            (item) =>
              item.root?.style.position === 'relative' &&
              item.root?.style.paddingLeft === '48px' &&
              Number.parseFloat(item.root?.before.borderRadius ?? '0') >= 999,
          ) &&
          itemsWithRail.every((item) => item.root?.after.width === '1px'),
        message: `items=${allItems.length},markers=${itemsWithMarker.length},rails=${itemsWithRail.length},padding=${allItems[0]?.root?.style.paddingLeft},marker=${allItems[0]?.root?.before.width}x${allItems[0]?.root?.before.height},rail=${itemsWithRail[0]?.root?.after.width}`,
      })

      const explicitItems = roots.flatMap((item) =>
        item.items.filter((entry) => entry.root?.className.includes('fd-step')),
      )
      const listTextItems = roots.flatMap((item) =>
        item.items.filter((entry) => entry.root?.tag === 'li'),
      )

      addCheck(report, {
        label: `${width}px steps prose reset and inline content`,
        pass:
          explicitItems.every(
            (item) => item.firstChild?.style.marginTop === '0px',
          ) &&
          listTextItems.every((item) => item.root?.text.length > 0) &&
          Boolean(linkItem?.link?.text) &&
          Boolean(codeItem?.code?.text),
        message: `explicitFirstMargins=${explicitItems
          .map((item) => item.firstChild?.style.marginTop ?? 'missing')
          .join('|')},link=${linkItem?.link?.text ?? 'missing'},code=${codeItem?.code?.text ?? 'missing'}`,
      })

      addCheck(report, {
        label: `${width}px steps responsive wrapping`,
        pass:
          allItems.every((item) => item.root?.rect.width > 0) &&
          (width > 640 || allItems.some((item) => item.root.rect.height >= 80)),
        message: `widths=${allItems
          .map((item) => item.root?.rect.width)
          .join('|')},heights=${allItems
          .map((item) => item.root?.rect.height)
          .join('|')}`,
      })
    }
  },

  summary(capture) {
    const roots = capture.data.roots
    const allItems = roots.flatMap((item) => item.items)

    return `- ${capture.viewport.width}x${capture.viewport.height}: roots=${
      roots.length
    }; items=${allItems.length}; explicit=${
      roots.find((item) => item.explicitSteps.length)?.explicitSteps.length ?? 0
    }`
  },
}
