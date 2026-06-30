export const tocProfile = {
  fixture: 'http://127.0.0.1:8888/guide/component-detail',
  name: 'toc',
  selector: '#nd-toc',

  collect(options) {
    const selector = options.selector || this.selector
    const activeSelector = options.activeSelector || '.docs-toc-link.is-active'
    const currentSelector =
      options.currentSelector || '.docs-toc-link[aria-current]'
    const headingSelector =
      options.headingSelector ||
      '.docs-page-body h2[id], .docs-page-body h3[id], .docs-page-body h4[id]'
    const settleMs = Math.max(Number(options.settleMs || 1200), 3200)

    return `(async () => {
      const selector = ${JSON.stringify(selector)};
      const activeSelector = ${JSON.stringify(activeSelector)};
      const currentSelector = ${JSON.stringify(currentSelector)};
      const headingSelector = ${JSON.stringify(headingSelector)};
      const settleMs = ${JSON.stringify(settleMs)};
      const rectSelectors = [
        '.docs-shell-body',
        '.docs-sidebar',
        '.docs-sidebar-inner',
        '.docs-shell-content',
        '.docs-page-frame',
        '#nd-page',
        '#nd-toc',
        '.docs-toc-popover',
      ];

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
          text: text(element).slice(0, 120),
          rect: {
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            width: Math.round(rect.width),
            top: Math.round(rect.top),
            height: Math.round(rect.height),
          },
          style: {
            display: style.display,
            gridArea: style.gridArea,
            gridTemplateColumns: style.gridTemplateColumns,
            height: style.height,
            overflow: style.overflow,
            padding: style.padding,
            position: style.position,
            width: style.width,
          },
        };
      };

      const activeItems = () =>
        [...document.querySelectorAll(activeSelector)].map((element) => ({
          text: text(element),
          href: element.getAttribute('href'),
          current: element.getAttribute('aria-current'),
        }));
      const currentItems = () =>
        [...document.querySelectorAll(currentSelector)].map((element) => ({
          text: text(element),
          href: element.getAttribute('href'),
          current: element.getAttribute('aria-current'),
        }));
      const headings = () =>
        [...document.querySelectorAll(headingSelector)].map((element) => ({
          id: element.id,
          text: text(element),
          top: Math.round(element.getBoundingClientRect().top + scrollY),
        }));
      const tocPopover = () => {
        const root = document.querySelector('.docs-toc-popover');
        const surface = document.querySelector('.docs-toc-popover-surface');
        const trigger = document.querySelector('.docs-toc-popover-trigger');
        const panel = document.querySelector('.docs-toc-popover-panel');
        const progress = trigger?.querySelector('[role="progressbar"]');

        return {
          root: pick(root),
          surface: pick(surface),
          trigger: pick(trigger),
          triggerExpanded: trigger?.getAttribute('aria-expanded') || null,
          triggerState: trigger?.getAttribute('data-state') || null,
          progress: pick(progress),
          progressValue: progress?.getAttribute('aria-valuenow') || null,
          progressMax: progress?.getAttribute('aria-valuemax') || null,
          panel: pick(panel),
          panelHidden: panel?.hasAttribute('hidden') ?? null,
          panelState: panel?.getAttribute('data-state') || null,
          links: [...(panel?.querySelectorAll('a') ?? [])].map((element) => ({
            text: text(element),
            href: element.getAttribute('href'),
            current: element.getAttribute('aria-current'),
          })),
        };
      };

      const collect = (phase) => ({
        phase,
        url: location.href,
        title: document.title,
        scroll: {
          y: Math.round(scrollY),
          innerHeight,
          docHeight: document.documentElement.scrollHeight,
          bodyHeight: document.body.offsetHeight,
          bottomDelta: Math.round(
            document.documentElement.scrollHeight - scrollY - innerHeight,
          ),
        },
        root: pick(document.querySelector(selector)),
        rects: Object.fromEntries(
          rectSelectors.map((item) => [item, pick(document.querySelector(item))]),
        ),
        active: activeItems(),
        current: currentItems(),
        headings: headings(),
        tocPopover: tocPopover(),
      });

      const top = collect('top');
      document.querySelector('.docs-toc-popover-trigger')?.click();
      await new Promise((resolve) => setTimeout(resolve, 300));
      const popoverOpen = collect('popover-open');
      window.scrollTo(0, document.documentElement.scrollHeight);
      const startedAt = performance.now();

      while (performance.now() - startedAt < settleMs) {
        await new Promise((resolve) => setTimeout(resolve, 200));

        const bottomDelta = Math.round(
          document.documentElement.scrollHeight - scrollY - innerHeight,
        );
        const lastHeading = headings().at(-1);
        const current = currentItems().at(-1);

        if (
          bottomDelta === 0 &&
          lastHeading &&
          current?.href === '#' + lastHeading.id
        ) {
          break;
        }
      }

      const bottom = collect('bottom');

      return { top, popoverOpen, bottom };
    })()`
  },

  summarize(report, helpers) {
    const { addCheck } = helpers

    for (const capture of report.captures) {
      const { data, viewport } = capture
      const width = viewport.width
      const target = data.top.root

      addCheck(report, {
        label: `${width}px runtime selector ${report.options.selector}`,
        pass: Boolean(target),
        message: target ? `${target.rect.width}px wide` : 'missing',
      })

      if (width >= 1280) {
        addCheck(report, {
          label: `${width}px desktop toc visible`,
          pass:
            Boolean(target) && target.style.display !== 'none' && target.rect.width > 0,
          message: target
            ? `display=${target.style.display}, width=${target.rect.width}`
            : 'missing',
        })
      }

      if (width < 1280) {
        const topPopover = data.top.tocPopover
        const openPopover = data.popoverOpen.tocPopover
        const trigger = openPopover.trigger
        const panel = openPopover.panel

        addCheck(report, {
          label: `${width}px toc popover visible`,
          pass:
            Boolean(topPopover.root) &&
            topPopover.root.style.display !== 'none' &&
            topPopover.root.rect.width > 0,
          message: topPopover.root
            ? `display=${topPopover.root.style.display}, width=${topPopover.root.rect.width}`
            : 'missing',
        })

        addCheck(report, {
          label: `${width}px toc popover closed by default`,
          pass:
            topPopover.triggerExpanded === 'false' &&
            topPopover.panel?.style.display === 'none',
          message: `expanded=${topPopover.triggerExpanded}, panelDisplay=${
            topPopover.panel?.style.display ?? 'missing'
          }`,
        })

        addCheck(report, {
          label: `${width}px toc popover opens inline`,
          pass:
            openPopover.triggerExpanded === 'true' &&
            panel?.style.display !== 'none' &&
            panel?.style.position === 'static' &&
            panel?.rect.left === openPopover.root?.rect.left &&
            panel?.rect.top === (trigger?.rect.top ?? 0) + (trigger?.rect.height ?? 0),
          message: `expanded=${openPopover.triggerExpanded}, display=${
            panel?.style.display ?? 'missing'
          }, position=${panel?.style.position ?? 'missing'}, left=${
            panel?.rect.left ?? 'missing'
          }, top=${panel?.rect.top ?? 'missing'}`,
        })

        addCheck(report, {
          label: `${width}px toc popover progressbar`,
          pass:
            openPopover.progress?.tag === 'svg' &&
            openPopover.progressValue !== null &&
            openPopover.progressMax === '1',
          message: openPopover.progress
            ? `tag=${openPopover.progress.tag}, value=${openPopover.progressValue}, max=${openPopover.progressMax}`
            : 'missing',
        })

        addCheck(report, {
          label: `${width}px toc popover links available`,
          pass: openPopover.links.length > 0,
          message: `links=${openPopover.links.length}`,
        })
      }

      const shell = data.top.rects['.docs-shell-body']

      if (shell) {
        addCheck(report, {
          label: `${width}px shell grid captured`,
          pass: Boolean(shell.style.gridTemplateColumns),
          message: shell.style.gridTemplateColumns || 'missing',
        })
      }

      const lastHeading = data.bottom.headings.at(-1)
      const bottomCurrent = data.bottom.current.at(-1)

      if (lastHeading && width >= 1280) {
        addCheck(report, {
          label: `${width}px bottom current reaches last heading`,
          pass: bottomCurrent?.href === `#${lastHeading.id}`,
          message: `current=${bottomCurrent?.href ?? 'none'}, last=#${lastHeading.id}`,
        })
      }
    }
  },

  summary(capture) {
    const shell = capture.data.top.rects['.docs-shell-body']
    const page = capture.data.top.rects['#nd-page']
    const toc = capture.data.top.rects['#nd-toc']
    const popover = capture.data.popoverOpen?.tocPopover
    const bottomCurrent = capture.data.bottom.current.at(-1)

    return `- ${capture.viewport.width}x${capture.viewport.height}: shell=${
      shell?.style.gridTemplateColumns ?? 'missing'
    }; page=${page ? `${page.rect.left}-${page.rect.right}` : 'missing'}; toc=${
      toc ? `${toc.style.display}/${toc.rect.width}px` : 'missing'
    }; popover=${
      popover?.panel
        ? `${popover.triggerExpanded}/${popover.panel.style.position}/${popover.panel.rect.top}px`
        : 'missing'
    }; bottomCurrent=${bottomCurrent?.href ?? 'none'}`
  },
}
