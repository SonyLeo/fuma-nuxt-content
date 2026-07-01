export const pagerProfile = {
  fixture: 'http://127.0.0.1:8888/guide/components',
  name: 'pager',
  references: ['app/components/docs/DocsPager.vue'],
  selector: '.docs-pager',

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
            alignSelf: style.alignSelf,
            backgroundColor: style.backgroundColor,
            borderRadius: style.borderRadius,
            borderWidth: style.borderWidth,
            color: style.color,
            display: style.display,
            flexDirection: style.flexDirection,
            fontSize: style.fontSize,
            fontWeight: style.fontWeight,
            gap: style.gap,
            gridTemplateColumns: style.gridTemplateColumns,
            lineHeight: style.lineHeight,
            minHeight: style.minHeight,
            overflow: style.overflow,
            padding: style.padding,
            textAlign: style.textAlign,
            textDecorationLine: style.textDecorationLine,
            textOverflow: style.textOverflow,
            whiteSpace: style.whiteSpace,
          },
        };
      };

      const root = document.querySelector('.docs-pager');
      const link = (selector) => {
        const element = root?.querySelector(selector);
        return {
          description: pick(element?.querySelector('.docs-pager-description')),
          href: element?.getAttribute('href') || null,
          icon: pick(element?.querySelector('.docs-pager-icon')),
          root: pick(element),
          title: pick(element?.querySelector('.docs-pager-title')),
          titleRow: pick(element?.querySelector('.docs-pager-title-row')),
        };
      };

      return {
        next: link('.docs-pager-link.is-next'),
        previous: link('.docs-pager-link.is-previous'),
        root: pick(root),
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
      const { next, previous, root } = data
      const links = [previous, next].filter((item) => item.root)
      const hasBoth = Boolean(previous.root && next.root)
      const columnCount =
        root?.style.gridTemplateColumns?.split(' ').filter(Boolean).length ?? 0

      addCheck(report, {
        label: `${width}px pager shell`,
        pass:
          Boolean(root) &&
          links.length >= 1 &&
          root.className.includes('has-both') === hasBoth &&
          root?.style.display === 'grid' &&
          root?.style.gap === '16px' &&
          (hasBoth && width > 640 ? columnCount === 2 : columnCount === 1),
        message: root
          ? `class=${root.className},display=${root.style.display},gap=${root.style.gap},columns=${root.style.gridTemplateColumns}`
          : 'missing',
      })

      addCheck(report, {
        label: `${width}px pager links`,
        pass:
          links.length >= 1 &&
          links.every(
            (item) =>
              item.root?.tag === 'a' &&
              item.href?.startsWith('/guide/') &&
              item.root?.style.textDecorationLine === 'none' &&
              item.root?.style.minHeight === '80px' &&
              item.root?.style.padding === '16px',
          ),
        message: `prev=${previous.href}/${previous.root?.style.minHeight}/${previous.root?.style.padding},next=${next.href}/${next.root?.style.minHeight}/${next.root?.style.padding}`,
      })

      addCheck(report, {
        label: `${width}px pager title rows`,
        pass:
          links.length >= 1 &&
          links.every(
            (item) =>
              item.title?.text.length > 0 &&
              ['flex', 'inline-flex'].includes(
                item.titleRow?.style.display,
              ) &&
              item.icon?.rect.width === 16 &&
              item.title?.style.whiteSpace === 'nowrap' &&
              item.title?.style.textOverflow === 'ellipsis',
          ) &&
          (!next.root ||
            (next.root.style.textAlign === 'right' &&
              next.titleRow?.style.flexDirection === 'row-reverse')),
        message: `prev=${previous.title?.text}/${previous.title?.style.whiteSpace}/${previous.title?.style.textOverflow},next=${next.title?.text}/${next.root?.style.textAlign}/${next.titleRow?.style.flexDirection}`,
      })

      addCheck(report, {
        label: `${width}px pager responsive width`,
        pass:
          root?.rect.width > 0 &&
          links.every((item) => item.root?.rect.width > 0) &&
          (!hasBoth ||
            (width <= 640
              ? Math.abs(previous.root.rect.left - next.root.rect.left) <= 2
              : previous.root.rect.right <= next.root.rect.left)),
        message: `root=${root?.rect.width},prev=${previous.root?.rect.left}-${previous.root?.rect.right},next=${next.root?.rect.left}-${next.root?.rect.right}`,
      })
    }
  },

  summary(capture) {
    return `- ${capture.viewport.width}x${capture.viewport.height}: prev=${
      capture.data.previous.href ?? 'missing'
    }; next=${capture.data.next.href ?? 'missing'}; columns=${
      capture.data.root?.style.gridTemplateColumns ?? 'missing'
    }`
  },
}
