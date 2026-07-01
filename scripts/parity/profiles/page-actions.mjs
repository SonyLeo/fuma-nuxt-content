export const pageActionsProfile = {
  fixture: 'http://127.0.0.1:8888/guide/components',
  name: 'page-actions',
  references: [
    'D:\\Projects\\Learning\\gh\\fumadocs\\packages\\base-ui\\src\\layouts\\shared\\page-actions.tsx',
    'D:\\Projects\\Learning\\gh\\fumadocs\\packages\\base-ui\\src\\layouts\\docs\\page\\slots\\footer.tsx',
    'D:\\Projects\\Learning\\gh\\fumadocs\\apps\\docs\\components\\feedback\\client.tsx',
  ],
  selector: '.docs-page-actions',

  collect(options) {
    const selector = options.selector || this.selector

    return `(async () => {
      const selector = ${JSON.stringify(selector)};
      const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      const waitFor = async (predicate, timeout = 1200, interval = 60) => {
        const startedAt = Date.now();

        while (Date.now() - startedAt < timeout) {
          if (predicate()) return true;
          await wait(interval);
        }

        return predicate();
      };
      const text = (element) =>
        element?.textContent?.trim().replace(/\\s+/g, ' ') || '';
      const pick = (element) => {
        if (!element) return null;

        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();

        return {
          tag: element.tagName.toLowerCase(),
          id: element.id || null,
          className: typeof element.className === 'string' ? element.className : '',
          text: text(element).slice(0, 180),
          ariaLabel: element.getAttribute('aria-label'),
          dataActionId: element.getAttribute('data-action-id'),
          dataState: element.getAttribute('data-state'),
          rect: {
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            width: Math.round(rect.width),
            top: Math.round(rect.top),
            height: Math.round(rect.height),
          },
          style: {
            alignItems: style.alignItems,
            backgroundColor: style.backgroundColor,
            borderBottomWidth: style.borderBottomWidth,
            borderColor: style.borderColor,
            borderRadius: style.borderRadius,
            borderTopWidth: style.borderTopWidth,
            color: style.color,
            display: style.display,
            flexDirection: style.flexDirection,
            flexWrap: style.flexWrap,
            fontSize: style.fontSize,
            fontWeight: style.fontWeight,
            gap: style.gap,
            gridTemplateColumns: style.gridTemplateColumns,
            justifyContent: style.justifyContent,
            lineHeight: style.lineHeight,
            margin: style.margin,
            maxHeight: style.maxHeight,
            maxWidth: style.maxWidth,
            minHeight: style.minHeight,
            minWidth: style.minWidth,
            overflow: style.overflow,
            padding: style.padding,
            position: style.position,
            top: style.top,
            left: style.left,
            width: style.width,
          },
        };
      };

      const pageActions = () => {
        const root = document.querySelector(selector);
        const openTrigger = document.querySelector('.docs-page-open-trigger');
        const popover = document.querySelector('.docs-page-open-popover');

        return {
          root: pick(root),
          copy: pick(document.querySelector('.docs-page-action[aria-label*="Copy"]')),
          openTrigger: pick(openTrigger),
          openExpanded: openTrigger?.getAttribute('aria-expanded') || null,
          openState: openTrigger?.getAttribute('data-state') || null,
          popover: pick(popover),
          options: [...document.querySelectorAll('.docs-page-open-option')].map(
            (element) => ({
              root: pick(element),
              actionId: element.getAttribute('data-action-id'),
              href: element.getAttribute('href'),
              rel: element.getAttribute('rel'),
              state: element.getAttribute('data-state'),
              target: element.getAttribute('target'),
            }),
          ),
        };
      };

      const feedback = () => {
        const root = document.querySelector('.docs-feedback');
        const buttons = [...document.querySelectorAll('.docs-feedback-button')].map(
          (element) => ({
            root: pick(element),
            pressed: element.getAttribute('data-pressed'),
            ariaPressed: element.getAttribute('aria-pressed'),
          }),
        );

        return {
          root: pick(root),
          prompt: pick(document.querySelector('.docs-feedback-prompt')),
          buttons,
          thanks: pick(document.querySelector('.docs-feedback-thanks')),
        };
      };

      const pager = () => {
        const root = document.querySelector('.docs-pager');

        return {
          root: pick(root),
          links: [...document.querySelectorAll('.docs-pager-link')].map(
            (element) => ({
              root: pick(element),
              title: pick(element.querySelector('.docs-pager-title')),
              description: pick(element.querySelector('.docs-pager-description')),
              icon: pick(element.querySelector('.docs-pager-icon')),
              href: element.getAttribute('href'),
            }),
          ),
          spacers: [...document.querySelectorAll('.docs-pager-spacer')].length,
        };
      };

      const collect = (phase) => ({
        phase,
        title: document.title,
        url: location.href,
        root: pick(document.querySelector(selector)),
        preview: {
          root: pick(document.querySelector('.fd-doc-preview')),
          canvas: pick(document.querySelector('.fd-doc-preview-canvas')),
          description: pick(document.querySelector('.fd-doc-preview-description')),
          source: pick(document.querySelector('.fd-doc-preview-source')),
          codeBlock: pick(
            document.querySelector('.fd-doc-preview-source .fd-doc-code-block'),
          ),
          rawComponents: [
            ...document.querySelectorAll(
              '.fd-doc-preview doccodeblock,.fd-doc-preview previewcounter',
            ),
          ].map((element) => element.tagName.toLowerCase()),
        },
        pageActions: pageActions(),
        feedback: feedback(),
        pager: pager(),
        footer: pick(document.querySelector('.docs-page-footer')),
      });

      const top = collect('top');

      const openMenuReady = () =>
        document
          .querySelector('.docs-page-open-trigger')
          ?.getAttribute('aria-expanded') === 'true' &&
        document.querySelectorAll('.docs-page-open-option').length > 0;

      for (let attempt = 0; attempt < 3 && !openMenuReady(); attempt += 1) {
        const trigger = document.querySelector('.docs-page-open-trigger');
        trigger?.scrollIntoView({ block: 'center', inline: 'nearest' });
        await wait(80);
        trigger?.click();
        await waitFor(openMenuReady, 900);
      }
      const openMenu = collect('open-menu');

      const feedbackReady = () =>
        [...document.querySelectorAll('.docs-feedback-button')].some(
          (element) =>
            element.getAttribute('data-pressed') === 'true' ||
            element.getAttribute('aria-pressed') === 'true',
        ) && Boolean(document.querySelector('.docs-feedback-thanks'));

      for (let attempt = 0; attempt < 3 && !feedbackReady(); attempt += 1) {
        const button = document.querySelector('.docs-feedback-button');
        button?.scrollIntoView({ block: 'center', inline: 'nearest' });
        await wait(80);
        button?.click();
        await waitFor(feedbackReady, 900);
      }
      const feedbackSelected = collect('feedback-selected');

      return { top, openMenu, feedbackSelected };
    })()`
  },

  summarize(report, helpers) {
    const { addCheck } = helpers

    for (const capture of report.captures) {
      const { data, viewport } = capture
      const width = viewport.width
      const top = data.top
      const openMenu = data.openMenu
      const feedbackSelected = data.feedbackSelected
      const actions = top.pageActions
      const openedActions = openMenu.pageActions
      const pager = top.pager
      const optionLabels = openedActions.options.map(
        (item) => item.root?.text || '',
      )
      const expectedOptionLabels = [
        'Open in GitHub',
        'Edit page',
        'Open in Scira AI',
        'Open in ChatGPT',
        'Open in Claude',
        'Open in Cursor',
      ]
      const missingOptionLabels = expectedOptionLabels.filter(
        (label) => !optionLabels.includes(label),
      )
      const buttonHeightDelta =
        actions.copy && actions.openTrigger
          ? Math.abs(actions.copy.rect.height - actions.openTrigger.rect.height)
          : Number.POSITIVE_INFINITY

      addCheck(report, {
        label: `${width}px runtime selector ${report.options.selector}`,
        pass: Boolean(top.root),
        message: top.root ? `${top.root.rect.width}px wide` : 'missing',
      })

      addCheck(report, {
        label: `${width}px preview frame`,
        pass:
          Boolean(top.preview.root) &&
          Boolean(top.preview.canvas) &&
          Boolean(top.preview.source) &&
          Boolean(top.preview.codeBlock) &&
          top.preview.rawComponents.length === 0 &&
          top.preview.root.style.overflow === 'hidden',
        message: top.preview.root
          ? `canvas=${Boolean(top.preview.canvas)}, source=${Boolean(top.preview.source)}, code=${Boolean(top.preview.codeBlock)}, raw=${top.preview.rawComponents.join('/') || 'none'}, overflow=${top.preview.root.style.overflow}`
          : 'missing',
      })

      addCheck(report, {
        label: `${width}px page actions button contract`,
        pass:
          Boolean(actions.root) &&
          Boolean(actions.copy) &&
          Boolean(actions.openTrigger) &&
          actions.root.style.alignItems === 'center' &&
          actions.copy.text === 'Copy Markdown' &&
          actions.copy.dataActionId === 'copy-markdown' &&
          actions.copy.style.fontSize === '12px' &&
          actions.openTrigger.text === 'Open' &&
          actions.openTrigger.style.fontSize === actions.copy.style.fontSize &&
          buttonHeightDelta <= 1,
        message: actions.root
          ? `align=${actions.root.style.alignItems}, copy=${actions.copy?.text ?? 'missing'} ${actions.copy?.style.fontSize ?? 'missing'} h=${actions.copy?.rect.height ?? 'missing'}, open=${actions.openTrigger?.text ?? 'missing'} ${actions.openTrigger?.style.fontSize ?? 'missing'} h=${actions.openTrigger?.rect.height ?? 'missing'}`
          : 'missing',
      })

      addCheck(report, {
        label: `${width}px open menu expands`,
        pass:
          openedActions.openExpanded === 'true' &&
          openedActions.openState === 'open' &&
          Boolean(openedActions.popover) &&
          openedActions.options.length > 0,
        message: `expanded=${openedActions.openExpanded}, state=${openedActions.openState}, options=${openedActions.options.length}`,
      })

      const popover = openedActions.popover
      const openTrigger = openedActions.openTrigger
      const expectedTop =
        popover && openTrigger ? openTrigger.rect.top + openTrigger.rect.height + 8 : 0
      const maxLeft =
        popover && openTrigger
          ? Math.max(8, width - popover.rect.width - 8)
          : 0
      const expectedLeft =
        popover && openTrigger
          ? Math.max(8, Math.min(openTrigger.rect.left, maxLeft))
          : 0

      addCheck(report, {
        label: `${width}px open menu geometry`,
        pass:
          Boolean(popover) &&
          Boolean(openTrigger) &&
          popover.style.position === 'fixed' &&
          popover.rect.width >= 230 &&
          Math.abs(popover.rect.top - expectedTop) <= 3 &&
          Math.abs(popover.rect.left - expectedLeft) <= 4 &&
          popover.rect.left >= 8 &&
          popover.rect.right <= width - 8 + 4,
        message: popover
          ? `rect=${popover.rect.left},${popover.rect.top},${popover.rect.width} expected=${expectedLeft},${expectedTop} position=${popover.style.position}`
          : 'missing',
      })

      addCheck(report, {
        label: `${width}px open menu option contract`,
        pass:
          openedActions.options.length >= expectedOptionLabels.length &&
          missingOptionLabels.length === 0 &&
          openedActions.options.every(
            (item) =>
              item.href &&
              item.target === '_blank' &&
              item.root?.style.display === 'flex' &&
              item.root?.style.fontSize === '14px',
          ),
        message: `labels=${optionLabels.join('/')} missing=${
          missingOptionLabels.join('/') || 'none'
        }`,
      })

      addCheck(report, {
        label: `${width}px feedback controls`,
        pass:
          Boolean(top.feedback.root) &&
          top.feedback.buttons.length === 2 &&
          feedbackSelected.feedback.buttons.some(
            (item) => item.pressed === 'true' || item.ariaPressed === 'true',
          ) &&
          Boolean(feedbackSelected.feedback.thanks),
        message: top.feedback.root
          ? `buttons=${top.feedback.buttons.length}, selected=${feedbackSelected.feedback.buttons
              .map((item) => item.pressed || item.ariaPressed || 'false')
              .join('/')}, thanks=${Boolean(feedbackSelected.feedback.thanks)}`
          : 'missing',
      })

      addCheck(report, {
        label: `${width}px pager items`,
        pass:
          Boolean(pager.root) &&
          pager.links.length >= 1 &&
          pager.links.every((item) => item.href && item.title && item.icon),
        message: pager.root
          ? `links=${pager.links.length}, spacers=${pager.spacers}, titles=${pager.links
              .map((item) => item.title?.text || 'missing')
              .join('/')}, icons=${pager.links
              .map((item) => Boolean(item.icon))
              .join('/')}`
          : 'missing',
      })
    }
  },

  summary(capture) {
    const top = capture.data.top
    const openMenu = capture.data.openMenu
    const feedbackSelected = capture.data.feedbackSelected

    return `- ${capture.viewport.width}x${capture.viewport.height}: preview=${
      top.preview.root ? 'yes' : 'missing'
    }; actions=${top.pageActions.copy ? 'copy' : 'missing'}/open=${
      openMenu.pageActions.openExpanded
    } options=${openMenu.pageActions.options.length}; feedback=${
      feedbackSelected.feedback.thanks ? 'selected' : 'idle'
    }; pagerLinks=${top.pager.links.length}`
  },
}
