export const calloutProfile = {
  fixture: 'http://127.0.0.1:8888/guide/components',
  name: 'callout',
  references: [
    'D:\\Projects\\Learning\\gh\\fumadocs\\packages\\base-ui\\src\\components\\callout.tsx',
  ],
  selector: '.fd-callout',

  collect(options = {}) {
    const mutation = options.mutation || ''

    return `(async () => {
      const mutation = ${JSON.stringify(mutation)};
      const round = (value) => Math.round(value * 100) / 100;
      const text = (element) =>
        element?.textContent?.trim().replace(/\\s+/g, ' ') || '';
      const tree = (element, depth = 0) => {
        if (!element || depth > 3) return null;

        return {
          tag: element.tagName.toLowerCase(),
          className: typeof element.className === 'string' ? element.className : '',
          role: element.getAttribute('role'),
          ariaHidden: element.getAttribute('aria-hidden'),
          text: [...element.childNodes]
            .filter((node) => node.nodeType === Node.TEXT_NODE)
            .map((node) => node.textContent?.trim())
            .filter(Boolean)
            .join(' ')
            .slice(0, 80),
          children: [...element.children].map((child) => tree(child, depth + 1)),
        };
      };
      const pick = (element) => {
        if (!element) return null;

        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);

        return {
          tag: element.tagName.toLowerCase(),
          className: typeof element.className === 'string' ? element.className : '',
          text: text(element).slice(0, 160),
          rect: {
            left: round(rect.left),
            right: round(rect.right),
            top: round(rect.top),
            width: round(rect.width),
            height: round(rect.height),
          },
          style: {
            alignItems: style.alignItems,
            alignSelf: style.alignSelf,
            backgroundColor: style.backgroundColor,
            borderBottomWidth: style.borderBottomWidth,
            borderColor: style.borderColor,
            borderLeftWidth: style.borderLeftWidth,
            borderRadius: style.borderRadius,
            borderRightWidth: style.borderRightWidth,
            borderTopWidth: style.borderTopWidth,
            boxShadow: style.boxShadow,
            color: style.color,
            display: style.display,
            fill: style.fill,
            flex: style.flex,
            flexBasis: style.flexBasis,
            flexDirection: style.flexDirection,
            flexGrow: style.flexGrow,
            flexShrink: style.flexShrink,
            fontSize: style.fontSize,
            fontWeight: style.fontWeight,
            gap: style.gap,
            height: style.height,
            justifyContent: style.justifyContent,
            letterSpacing: style.letterSpacing,
            lineHeight: style.lineHeight,
            margin: style.margin,
            maxHeight: style.maxHeight,
            maxWidth: style.maxWidth,
            minHeight: style.minHeight,
            minWidth: style.minWidth,
            opacity: style.opacity,
            outlineColor: style.outlineColor,
            outlineOffset: style.outlineOffset,
            outlineStyle: style.outlineStyle,
            outlineWidth: style.outlineWidth,
            overflow: style.overflow,
            padding: style.padding,
            position: style.position,
            transform: style.transform,
            transitionDuration: style.transitionDuration,
            transitionProperty: style.transitionProperty,
            transitionTimingFunction: style.transitionTimingFunction,
            width: style.width,
          },
        };
      };

      if (mutation === 'callout-broken-layout') {
        const style = document.createElement('style');
        style.setAttribute('data-parity-mutation', mutation);
        style.textContent = [
          '.fd-callout{align-items:flex-start!important;line-height:24.5px!important;}',
          '.fd-callout-bar{align-self:auto!important;height:20px!important;}',
          '.docs-page-body .fd-callout-title{margin:20px 0!important;}',
        ].join('\\n');
        document.head.append(style);
        await new Promise((resolve) => requestAnimationFrame(resolve));
      }

      const callouts = [...document.querySelectorAll('.fd-callout')].map(
        (root, index) => {
          const bar = root.querySelector('.fd-callout-bar');
          const icon = root.querySelector('.fd-callout-icon');
          const content = root.querySelector('.fd-callout-content');
          const title = root.querySelector('.fd-callout-title');
          const body = root.querySelector('.fd-callout-body');

          return {
            index,
            domTree: tree(root),
            root: pick(root),
            bar: pick(bar),
            icon: pick(icon),
            content: pick(content),
            title: pick(title),
            body: pick(body),
            deltas: {
              barToContentHeight: content && bar
                ? round(content.getBoundingClientRect().height - bar.getBoundingClientRect().height)
                : null,
              iconToContentTop: content && icon
                ? round(icon.getBoundingClientRect().top - content.getBoundingClientRect().top)
                : null,
            },
          };
        },
      );

      return {
        callouts,
        title: document.title,
        url: location.href,
      };
    })()`
  },

  summarize(report, helpers) {
    const { addCheck, cssPxNear, rectNear } = helpers

    for (const capture of report.captures) {
      const { data, viewport } = capture
      const width = viewport.width
      const callouts = data.callouts

      addCheck(report, {
        label: `${width}px callouts present`,
        pass: callouts.length >= 2,
        message: `callouts=${callouts.length}`,
      })

      addCheck(report, {
        label: `${width}px callout root rhythm`,
        pass:
          callouts.length > 0 &&
          callouts.every(
            (item) =>
              item.root?.style.display === 'flex' &&
              item.root?.style.alignItems === 'stretch' &&
              cssPxNear(item.root?.style.fontSize, 14, 0.5) &&
              cssPxNear(item.root?.style.lineHeight, 20, 1) &&
              cssPxNear(item.root?.style.gap, 8, 0.5),
          ),
        message:
          callouts.length === 0
            ? 'missing'
            : callouts
                .map(
                  (item) =>
                    `${item.index}:display=${item.root?.style.display},align=${item.root?.style.alignItems},font=${item.root?.style.fontSize},line=${item.root?.style.lineHeight},gap=${item.root?.style.gap}`,
                )
                .join('; '),
      })

      addCheck(report, {
        label: `${width}px callout rail stretches`,
        pass:
          callouts.length > 0 &&
          callouts.every(
            (item) =>
              item.bar?.rect.width <= 3 &&
              item.bar?.style.alignSelf === 'stretch' &&
              rectNear(item.bar?.rect.height, item.content?.rect.height, 1),
          ),
        message:
          callouts.length === 0
            ? 'missing'
            : callouts
                .map(
                  (item) =>
                    `${item.index}:bar=${item.bar?.rect.width}x${item.bar?.rect.height},contentH=${item.content?.rect.height},alignSelf=${item.bar?.style.alignSelf}`,
                )
                .join('; '),
      })

      addCheck(report, {
        label: `${width}px callout title prose reset`,
        pass:
          callouts.length > 0 &&
          callouts.every(
            (item) =>
              item.title?.style.margin === '0px' &&
              item.title?.style.fontWeight !== '700',
          ),
        message:
          callouts.length === 0
            ? 'missing'
            : callouts
                .map(
                  (item) =>
                    `${item.index}:titleMargin=${item.title?.style.margin},titleWeight=${item.title?.style.fontWeight}`,
                )
                .join('; '),
      })

      addCheck(report, {
        label: `${width}px callout icon aligns to first line`,
        pass:
          callouts.length > 0 &&
          callouts.every(
            (item) =>
              cssPxNear(item.icon?.style.width, 20, 1) &&
              cssPxNear(item.icon?.style.height, 20, 1) &&
              Math.abs(item.deltas.iconToContentTop ?? 999) <= 1,
          ),
        message:
          callouts.length === 0
            ? 'missing'
            : callouts
                .map(
                  (item) =>
                    `${item.index}:icon=${item.icon?.style.width}x${item.icon?.style.height},topDelta=${item.deltas.iconToContentTop}`,
                )
                .join('; '),
      })
    }
  },

  summary(capture) {
    const callouts = capture.data.callouts
    const metrics = callouts
      .map(
        (item) =>
          `${item.index}:rootH=${item.root?.rect.height},barH=${item.bar?.rect.height},titleMargin=${item.title?.style.margin}`,
      )
      .join('; ')

    return `- ${capture.viewport.width}x${capture.viewport.height}: callouts=${callouts.length}; ${metrics}`
  },
}
