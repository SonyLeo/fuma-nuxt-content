export const filesProfile = {
  fixture: 'http://127.0.0.1:8888/guide/components',
  name: 'files',
  references: [
    'D:\\Projects\\Learning\\gh\\fumadocs\\packages\\base-ui\\src\\components\\files.tsx',
  ],
  selector: '.fd-doc-files',

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
            borderLeftWidth: style.borderLeftWidth,
            borderRadius: style.borderRadius,
            cursor: style.cursor,
            display: style.display,
            gap: style.gap,
            margin: style.margin,
            opacity: style.opacity,
            overflow: style.overflow,
            padding: style.padding,
            paddingLeft: style.paddingLeft,
            textOverflow: style.textOverflow,
            whiteSpace: style.whiteSpace,
          },
        };
      };
      const snapshot = () => [...document.querySelectorAll('.fd-doc-files')].map(
        (root, index) => ({
          index,
          root: pick(root),
          rows: [...root.querySelectorAll('.fd-doc-file,.fd-doc-folder-trigger')].map(
            (element) => pick(element),
          ),
          folders: [...root.querySelectorAll('.fd-doc-folder')].map((folder) => {
            const trigger = folder.querySelector('.fd-doc-folder-trigger');
            const content = folder.querySelector('.fd-doc-folder-content');

            return {
              name: text(trigger),
              disabled: trigger?.hasAttribute('disabled') ?? false,
              expanded: trigger?.getAttribute('aria-expanded'),
              trigger: pick(trigger),
              content: pick(content),
              contentId: content?.id || null,
            };
          }),
          fileNames: [...root.querySelectorAll('.fd-doc-file-name')].map((element) => ({
            text: text(element),
            title: element.getAttribute('title'),
            root: pick(element),
          })),
          folderContent: pick(root.querySelector('.fd-doc-folder-content')),
        }),
      );

      const top = { files: snapshot(), title: document.title, url: location.href };
      const closedFolder = [...document.querySelectorAll('.fd-doc-folder-trigger')].find(
        (element) => text(element) === 'server',
      );
      closedFolder?.scrollIntoView({ block: 'center', inline: 'center' });
      await wait(80);
      closedFolder?.click();
      await wait(180);
      const opened = { files: snapshot(), title: document.title, url: location.href };

      return { top, opened };
    })()`
  },

  summarize(report, helpers) {
    const { addCheck } = helpers

    for (const capture of report.captures) {
      const { data, viewport } = capture
      const width = viewport.width
      const files = data.top.files[0]
      const openedFiles = data.opened.files[0]
      const allRows = data.top.files.flatMap((item) => item.rows)
      const allFolders = data.top.files.flatMap((item) => item.folders)
      const allOpenedFolders = data.opened.files.flatMap((item) => item.folders)
      const allFileNames = data.top.files.flatMap((item) => item.fileNames)
      const folderContents = data.top.files
        .flatMap((item) => item.folders.map((folder) => folder.content))
        .filter(Boolean)
      const appFolder = allFolders.find((item) => item.name === 'app')
      const componentsFolder = allFolders.find(
        (item) => item.name === 'components',
      )
      const serverFolder = allFolders.find((item) => item.name === 'server')
      const openedServerFolder = allOpenedFolders.find(
        (item) => item.name === 'server',
      )
      const disabledFolder = allFolders.find(
        (item) => item.name === 'node_modules',
      )
      const longName = allFileNames.find((item) =>
        item.text.includes('ExceedinglyLongFileName'),
      )

      addCheck(report, {
        label: `${width}px files tree density`,
        pass:
          Boolean(files) &&
          data.top.files.length >= 2 &&
          allRows.length >= 8 &&
          folderContents.some((item) => item.style.borderLeftWidth === '1px'),
        message: files
          ? `trees=${data.top.files.length},rows=${allRows.length}, folderBorders=${folderContents.map((item) => item.style.borderLeftWidth).join('|')}`
          : 'missing',
      })

      addCheck(report, {
        label: `${width}px files folder state contract`,
        pass:
          appFolder?.expanded === 'true' &&
          componentsFolder?.expanded === 'true' &&
          serverFolder?.expanded === 'false' &&
          openedServerFolder?.expanded === 'true' &&
          disabledFolder?.disabled === true &&
          disabledFolder?.expanded === 'false',
        message: files
          ? `app=${appFolder?.expanded},components=${componentsFolder?.expanded},server=${serverFolder?.expanded}->${openedServerFolder?.expanded},disabled=${disabledFolder?.disabled}/${disabledFolder?.expanded}`
          : 'missing',
      })

      addCheck(report, {
        label: `${width}px files nested indentation`,
        pass:
          componentsFolder?.content?.style.borderLeftWidth === '1px' &&
          componentsFolder?.content?.style.margin !== '0px' &&
          componentsFolder?.content?.style.paddingLeft !== '0px',
        message: componentsFolder?.content
          ? `border=${componentsFolder.content.style.borderLeftWidth},margin=${componentsFolder.content.style.margin},paddingLeft=${componentsFolder.content.style.paddingLeft}`
          : 'missing',
      })

      addCheck(report, {
        label: `${width}px files long names truncate`,
        pass:
          longName?.root?.style.overflow === 'hidden' &&
          longName?.root?.style.textOverflow === 'ellipsis' &&
          longName?.root?.style.whiteSpace === 'nowrap' &&
          longName?.title === longName?.text,
        message: longName
          ? `overflow=${longName.root?.style.overflow},textOverflow=${longName.root?.style.textOverflow},whiteSpace=${longName.root?.style.whiteSpace},title=${longName.title}`
          : 'missing',
      })
    }
  },

  summary(capture) {
    const rows = capture.data.top.files.flatMap((item) => item.rows)
    const folders = capture.data.top.files.flatMap((item) => item.folders)

    return `- ${capture.viewport.width}x${capture.viewport.height}: files=${
      capture.data.top.files.length
    }; rows=${rows.length}; folders=${folders.length}`
  },
}
