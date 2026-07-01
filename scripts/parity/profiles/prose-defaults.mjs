export const proseDefaultsProfile = {
  fixture: 'http://127.0.0.1:8888/guide/components',
  name: 'prose-defaults',
  references: [
    'D:\\Projects\\Learning\\gh\\fumadocs\\packages\\base-ui\\src\\mdx.tsx',
  ],
  selector: '#prose-defaults',

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
            color: style.color,
            display: style.display,
            fontFamily: style.fontFamily,
            fontSize: style.fontSize,
            fontWeight: style.fontWeight,
            lineHeight: style.lineHeight,
            margin: style.margin,
            minWidth: style.minWidth,
            overflowX: style.overflowX,
            padding: style.padding,
            textDecorationColor: style.textDecorationColor,
            textDecorationLine: style.textDecorationLine,
            textDecorationThickness: style.textDecorationThickness,
            textUnderlineOffset: style.textUnderlineOffset,
            verticalAlign: style.verticalAlign,
          },
        };
      };

      const heading = document.querySelector('#prose-defaults');
      const nodes = [];
      let cursor = heading?.nextElementSibling || null;

      while (cursor && !(cursor.matches('h2'))) {
        nodes.push(cursor);
        cursor = cursor.nextElementSibling;
      }

      const root = heading?.closest('.docs-page-body') || document;
      const internalLink = [...nodes.flatMap((node) => [...node.querySelectorAll('a')])].find(
        (element) => element.textContent?.includes('internal docs link'),
      );
      const externalLink = [...nodes.flatMap((node) => [...node.querySelectorAll('a')])].find(
        (element) => element.textContent?.includes('external docs link'),
      );
      const inlineCode = nodes
        .flatMap((node) => [...node.querySelectorAll('code')])
        .find((element) => text(element) === 'inline code');
      const tableWrapper = nodes.find((node) => node.classList.contains('fd-doc-table'));
      const table = tableWrapper?.querySelector('table') || null;
      const th = table?.querySelector('th') || null;
      const td = table?.querySelector('td') || null;
      const figure =
        nodes.find((node) => node.classList.contains('fd-doc-image')) ||
        nodes.map((node) => node.querySelector('.fd-doc-image')).find(Boolean);
      const image = figure?.querySelector('img') || null;
      const caption = figure?.querySelector('figcaption') || null;

      return {
        caption: pick(caption),
        externalLink: {
          root: pick(externalLink),
          href: externalLink?.getAttribute('href') || null,
          rel: externalLink?.getAttribute('rel') || null,
          target: externalLink?.getAttribute('target') || null,
        },
        figure: pick(figure),
        heading: pick(heading),
        image: {
          root: pick(image),
          alt: image?.getAttribute('alt') || null,
          decoding: image?.getAttribute('decoding') || null,
          loading: image?.getAttribute('loading') || null,
          src: image?.getAttribute('src') || null,
        },
        inlineCode: pick(inlineCode),
        internalLink: {
          root: pick(internalLink),
          href: internalLink?.getAttribute('href') || null,
          rel: internalLink?.getAttribute('rel') || null,
          target: internalLink?.getAttribute('target') || null,
        },
        nodeTags: nodes.map((node) => node.tagName.toLowerCase()).join('|'),
        root: pick(root),
        table: pick(table),
        tableCell: pick(td),
        tableHeader: pick(th),
        tableWrapper: pick(tableWrapper),
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

      addCheck(report, {
        label: `${width}px prose links`,
        pass:
          data.internalLink.href === '/guide/getting-started' &&
          !data.internalLink.target &&
          ['https://www.fumadocs.dev', 'https://www.fumadocs.dev/'].includes(
            data.externalLink.href,
          ) &&
          data.externalLink.target === '_blank' &&
          Boolean(data.externalLink.rel?.includes('noopener')) &&
          data.internalLink.root?.style.textDecorationLine === 'underline' &&
          data.externalLink.root?.style.textDecorationLine === 'underline',
        message: `internal=${data.internalLink.href}/${data.internalLink.target ?? 'same'},external=${data.externalLink.href}/${data.externalLink.target}/${data.externalLink.rel}`,
      })

      addCheck(report, {
        label: `${width}px prose inline code`,
        pass:
          data.inlineCode?.className.includes('fd-doc-inline-code') &&
          data.inlineCode?.style.display === 'inline' &&
          Number.parseFloat(data.inlineCode?.style.borderRadius ?? '0') >= 5 &&
          data.inlineCode?.style.fontFamily.includes('Mono'),
        message: data.inlineCode
          ? `class=${data.inlineCode.className},radius=${data.inlineCode.style.borderRadius},font=${data.inlineCode.style.fontFamily}`
          : 'missing',
      })

      addCheck(report, {
        label: `${width}px prose table wrapper`,
        pass:
          data.tableWrapper?.style.overflowX === 'auto' &&
          data.tableWrapper?.style.borderWidth === '1px' &&
          data.table?.style.display === 'table' &&
          data.table?.style.margin === '0px' &&
          data.tableHeader?.style.fontWeight === '600' &&
          data.tableCell?.style.minWidth === '128px',
        message: data.tableWrapper
          ? `wrapper=${data.tableWrapper.style.overflowX}/${data.tableWrapper.style.borderWidth},table=${data.table?.style.display}/${data.table?.style.margin},cell=${data.tableCell?.style.minWidth}`
          : `missing tags=${data.nodeTags}`,
      })

      addCheck(report, {
        label: `${width}px prose image`,
        pass:
          data.figure?.style.overflowX === 'auto' &&
          data.image.src === '/favicon.ico' &&
          data.image.alt === 'TinyRobot docs favicon' &&
          data.image.loading === 'lazy' &&
          data.image.decoding === 'async' &&
          data.image.root?.style.margin === '0px' &&
          data.caption?.text === 'TinyRobot docs favicon',
        message: data.image.root
          ? `src=${data.image.src},alt=${data.image.alt},loading=${data.image.loading},figure=${data.figure?.style.overflowX},caption=${data.caption?.text ?? 'missing'}`
          : `missing tags=${data.nodeTags}`,
      })
    }
  },

  summary(capture) {
    return `- ${capture.viewport.width}x${capture.viewport.height}: nodes=${
      capture.data.nodeTags
    }; table=${capture.data.tableWrapper ? 'yes' : 'missing'}; image=${
      capture.data.image.root ? 'yes' : 'missing'
    }`
  },
}
