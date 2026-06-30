export const filesProfile = {
  fixture: 'http://127.0.0.1:8888/guide/components',
  name: 'files',
  references: [
    'D:\\Projects\\Learning\\gh\\fumadocs\\packages\\base-ui\\src\\components\\files.tsx',
  ],
  selector: '.fd-doc-files',

  collect() {
    return `(async () => {
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
            borderLeftWidth: style.borderLeftWidth,
            display: style.display,
            gap: style.gap,
            margin: style.margin,
            padding: style.padding,
          },
        };
      };
      const files = [...document.querySelectorAll('.fd-doc-files')].map(
        (root, index) => ({
          index,
          root: pick(root),
          rows: [...root.querySelectorAll('.fd-doc-file,.fd-doc-folder-trigger')].map(
            (element) => pick(element),
          ),
          folderContent: pick(root.querySelector('.fd-doc-folder-content')),
        }),
      );

      return { files, title: document.title, url: location.href };
    })()`
  },

  summarize(report, helpers) {
    const { addCheck } = helpers

    for (const capture of report.captures) {
      const { data, viewport } = capture
      const width = viewport.width
      const files = data.files[0]

      addCheck(report, {
        label: `${width}px files tree density`,
        pass:
          Boolean(files) &&
          files.rows.length >= 4 &&
          files.folderContent?.style.borderLeftWidth === '1px',
        message: files
          ? `rows=${files.rows.length}, folderBorder=${files.folderContent?.style.borderLeftWidth ?? 'missing'}`
          : 'missing',
      })
    }
  },

  summary(capture) {
    const files = capture.data.files[0]

    return `- ${capture.viewport.width}x${capture.viewport.height}: files=${
      capture.data.files.length
    }; rows=${files?.rows.length ?? 0}`
  },
}
