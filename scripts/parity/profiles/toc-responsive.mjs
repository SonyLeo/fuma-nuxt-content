export const tocResponsiveProfile = {
  fixture: 'http://127.0.0.1:8888/guide/component-detail',
  name: 'toc-responsive',
  selector: '#nd-docs-layout',

  collect(options) {
    const settleMs = Math.max(Number(options.settleMs || 1200), 1800)

    return `(async () => {
      const settleMs = ${JSON.stringify(settleMs)};
      const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      const text = (element) =>
        element?.textContent?.trim().replace(/\\s+/g, ' ') || '';
      const rectFor = (element) => {
        if (!element) return null;

        const rect = element.getBoundingClientRect();

        return {
          bottom: Math.round(rect.bottom),
          height: Math.round(rect.height),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          top: Math.round(rect.top),
          width: Math.round(rect.width),
        };
      };
      const pick = (element) => {
        if (!element) return null;

        const style = getComputedStyle(element);

        return {
          tag: element.tagName.toLowerCase(),
          id: element.id || null,
          className: typeof element.className === 'string' ? element.className : '',
          text: text(element).slice(0, 140),
          rect: rectFor(element),
          style: {
            display: style.display,
            gridArea: style.gridArea,
            gridColumn: style.gridColumn,
            gridTemplateAreas: style.gridTemplateAreas,
            gridTemplateColumns: style.gridTemplateColumns,
            height: style.height,
            maxHeight: style.maxHeight,
            overflow: style.overflow,
            overflowX: style.overflowX,
            overflowY: style.overflowY,
            padding: style.padding,
            position: style.position,
            top: style.top,
            width: style.width,
            zIndex: style.zIndex,
          },
        };
      };
      const all = (selector) => [...document.querySelectorAll(selector)];
      const first = (selector) => document.querySelector(selector);
      const tocPopover = () => {
        const root = first('.docs-toc-popover');
        const surface = first('.docs-toc-popover-surface');
        const trigger = first('.docs-toc-popover-trigger');
        const panel = first('.docs-toc-popover-panel');
        const scroll = first('.docs-toc-popover-scroll');
        const links = all('.docs-toc-popover-panel a');

        return {
          root: pick(root),
          surface: pick(surface),
          trigger: pick(trigger),
          triggerExpanded: trigger?.getAttribute('aria-expanded') || null,
          triggerState: trigger?.getAttribute('data-state') || null,
          panel: pick(panel),
          panelHidden: panel?.hasAttribute('hidden') ?? null,
          panelState: panel?.getAttribute('data-state') || null,
          scroll: pick(scroll),
          links: links.map((element) => ({
            text: text(element),
            href: element.getAttribute('href'),
            current: element.getAttribute('aria-current'),
          })),
        };
      };
      const mobileNav = () => {
        const root = first('.docs-mobile-nav');
        const trigger = first('#docs-mobile-nav-trigger');
        const panel = first('#docs-mobile-nav-panel');

        return {
          root: pick(root),
          trigger: pick(trigger),
          triggerExpanded: trigger?.getAttribute('aria-expanded') || null,
          panel: pick(panel),
          panelExists: Boolean(panel),
        };
      };
      const collect = (phase) => ({
        phase,
        url: location.href,
        viewport: {
          innerHeight,
          innerWidth,
          scrollWidth: document.documentElement.scrollWidth,
          scrollHeight: document.documentElement.scrollHeight,
        },
        scroll: {
          x: Math.round(scrollX),
          y: Math.round(scrollY),
        },
        rects: {
          header: pick(first('.docs-header')),
          shell: pick(first('#nd-docs-layout')),
          sidebar: pick(first('#nd-sidebar')),
          sidebarInner: pick(first('.docs-sidebar-inner')),
          content: pick(first('.docs-shell-content')),
          frame: pick(first('.docs-page-frame')),
          page: pick(first('#nd-page')),
          pageBody: pick(first('.docs-page-body')),
          toc: pick(first('#nd-toc')),
        },
        tocPopover: tocPopover(),
        mobileNav: mobileNav(),
      });

      const top = collect('top');
      window.scrollTo(0, Math.min(700, document.documentElement.scrollHeight - innerHeight));
      await wait(240);
      const sticky = collect('sticky');

      first('.docs-toc-popover-trigger')?.click();
      await wait(220);
      const popoverOpen = collect('popover-open');

      window.dispatchEvent(
        new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }),
      );
      await wait(180);
      const escapeClosed = collect('escape-closed');

      first('.docs-toc-popover-trigger')?.click();
      await wait(180);
      document.body.dispatchEvent(
        new MouseEvent('click', { bubbles: true, clientX: 1, clientY: 1 }),
      );
      await wait(180);
      const outsideClosed = collect('outside-closed');

      first('.docs-toc-popover-trigger')?.click();
      await wait(180);
      first('.docs-toc-popover-panel a')?.click();
      await wait(settleMs);
      const linkClosed = collect('link-closed');

      if (innerWidth < 960) {
        first('#docs-mobile-nav-trigger')?.click();
        await wait(220);
      }

      const mobileOpen = collect('mobile-open');

      return {
        top,
        sticky,
        popoverOpen,
        escapeClosed,
        outsideClosed,
        linkClosed,
        mobileOpen,
      };
    })()`
  },

  summarize(report, helpers) {
    const { addCheck } = helpers

    for (const capture of report.captures) {
      const { data, viewport } = capture
      const width = viewport.width
      const top = data.top
      const sticky = data.sticky
      const open = data.popoverOpen
      const escapeClosed = data.escapeClosed
      const outsideClosed = data.outsideClosed
      const linkClosed = data.linkClosed
      const mobileOpen = data.mobileOpen
      const shell = top.rects.shell
      const content = top.rects.content
      const frame = top.rects.frame
      const page = top.rects.page
      const sidebar = top.rects.sidebar
      const toc = top.rects.toc

      addCheck(report, {
        label: `${width}px runtime selector ${report.options.selector}`,
        pass: Boolean(shell),
        message: shell ? `${shell.rect.width}px wide` : 'missing',
      })

      addCheck(report, {
        label: `${width}px no horizontal document overflow`,
        pass: top.viewport.scrollWidth <= width + 1,
        message: `scrollWidth=${top.viewport.scrollWidth}, viewport=${width}`,
      })

      addCheck(report, {
        label: `${width}px content/page frame present`,
        pass: Boolean(content && frame && page),
        message: `content=${content?.rect.width ?? 'missing'}, frame=${
          frame?.rect.width ?? 'missing'
        }, page=${page?.rect.width ?? 'missing'}`,
      })

      if (content && frame) {
        addCheck(report, {
          label: `${width}px page frame stays inside content column`,
          pass:
            frame.rect.left >= content.rect.left - 1 &&
            frame.rect.right <= content.rect.right + 1,
          message: `content=${content.rect.left}-${content.rect.right}, frame=${frame.rect.left}-${frame.rect.right}`,
        })
      }

      if (width >= 960 && sidebar && content) {
        addCheck(report, {
          label: `${width}px content clears desktop sidebar`,
          pass:
            sidebar.style.display !== 'none' &&
            content.rect.left >= sidebar.rect.right - 1,
          message: `sidebar=${sidebar.style.display}/${sidebar.rect.left}-${sidebar.rect.right}, content=${content.rect.left}-${content.rect.right}`,
        })
      }

      if (width >= 1280) {
        addCheck(report, {
          label: `${width}px desktop toc visible and reserved`,
          pass:
            Boolean(toc) &&
            toc.style.display !== 'none' &&
            toc.rect.width >= 240 &&
            frame?.style.gridTemplateColumns.split(' ').length >= 2,
          message: `toc=${toc?.style.display ?? 'missing'}/${
            toc?.rect.width ?? 'missing'
          }, frameColumns=${frame?.style.gridTemplateColumns ?? 'missing'}`,
        })

        if (page && toc) {
          addCheck(report, {
            label: `${width}px page and desktop toc do not overlap`,
            pass: page.rect.right <= toc.rect.left + 1,
            message: `page=${page.rect.left}-${page.rect.right}, toc=${toc.rect.left}-${toc.rect.right}`,
          })
        }

        addCheck(report, {
          label: `${width}px responsive toc popover hidden on desktop`,
          pass:
            top.tocPopover.root?.style.display === 'none' ||
            (top.tocPopover.root?.rect.width ?? 1) === 0,
          message: `display=${top.tocPopover.root?.style.display ?? 'missing'}, width=${
            top.tocPopover.root?.rect.width ?? 'missing'
          }`,
        })
      }

      if (width < 1280) {
        addCheck(report, {
          label: `${width}px desktop toc hidden below xl`,
          pass: !toc || toc.style.display === 'none' || toc.rect.width === 0,
          message: `display=${toc?.style.display ?? 'missing'}, width=${
            toc?.rect.width ?? 'missing'
          }`,
        })

        addCheck(report, {
          label: `${width}px page frame switches to toc-popover row`,
          pass:
            Boolean(frame) &&
            frame.style.gridTemplateAreas.includes('toc-popover') &&
            frame.style.gridTemplateAreas.includes('page') &&
            !frame.style.gridTemplateAreas.includes('toc"'),
          message: `areas=${frame?.style.gridTemplateAreas ?? 'missing'}, columns=${
            frame?.style.gridTemplateColumns ?? 'missing'
          }`,
        })

        addCheck(report, {
          label: `${width}px toc popover visible below xl`,
          pass:
            Boolean(top.tocPopover.root) &&
            top.tocPopover.root.style.display !== 'none' &&
            top.tocPopover.triggerExpanded === 'false',
          message: `display=${top.tocPopover.root?.style.display ?? 'missing'}, expanded=${top.tocPopover.triggerExpanded}`,
        })

        addCheck(report, {
          label: `${width}px toc popover opens and stays in column`,
          pass:
            open.tocPopover.triggerExpanded === 'true' &&
            open.tocPopover.panel?.style.display !== 'none' &&
            Boolean(content) &&
            open.tocPopover.panel.rect.left >= content.rect.left - 1 &&
            open.tocPopover.panel.rect.right <= content.rect.right + 1,
          message: `expanded=${open.tocPopover.triggerExpanded}, panel=${
            open.tocPopover.panel?.rect.left ?? 'missing'
          }-${open.tocPopover.panel?.rect.right ?? 'missing'}, content=${
            content?.rect.left ?? 'missing'
          }-${content?.rect.right ?? 'missing'}`,
        })

        addCheck(report, {
          label: `${width}px toc popover has scroll-bounded links`,
          pass:
            open.tocPopover.links.length > 0 &&
            Number.parseFloat(open.tocPopover.scroll?.style.maxHeight || '0') <=
              viewport.height * 0.5 + 1 &&
            open.tocPopover.scroll?.style.overflow !== 'visible',
          message: `links=${open.tocPopover.links.length}, maxHeight=${
            open.tocPopover.scroll?.style.maxHeight ?? 'missing'
          }, overflow=${open.tocPopover.scroll?.style.overflow ?? 'missing'}`,
        })

        addCheck(report, {
          label: `${width}px toc popover closes on Escape/outside/link`,
          pass:
            escapeClosed.tocPopover.triggerExpanded === 'false' &&
            outsideClosed.tocPopover.triggerExpanded === 'false' &&
            linkClosed.tocPopover.triggerExpanded === 'false',
          message: `escape=${escapeClosed.tocPopover.triggerExpanded}, outside=${outsideClosed.tocPopover.triggerExpanded}, link=${linkClosed.tocPopover.triggerExpanded}`,
        })
      }

      if (width < 960) {
        const header = sticky.rects.header
        const stickyTrigger = sticky.tocPopover.trigger

        addCheck(report, {
          label: `${width}px mobile sidebar replaced by mobile nav`,
          pass:
            top.rects.sidebar?.style.display === 'none' &&
            top.mobileNav.root?.style.display !== 'none',
          message: `sidebar=${top.rects.sidebar?.style.display ?? 'missing'}, mobileNav=${
            top.mobileNav.root?.style.display ?? 'missing'
          }`,
        })

        addCheck(report, {
          label: `${width}px sticky toc popover clears mobile header`,
          pass:
            Boolean(header && stickyTrigger) &&
            header.style.display !== 'none' &&
            stickyTrigger.rect.top >= header.rect.bottom - 1,
          message: `header=${header?.rect.top ?? 'missing'}-${
            header?.rect.bottom ?? 'missing'
          }, trigger=${stickyTrigger?.rect.top ?? 'missing'}-${
            stickyTrigger?.rect.bottom ?? 'missing'
          }, top=${sticky.tocPopover.root?.style.top ?? 'missing'}`,
        })

        addCheck(report, {
          label: `${width}px mobile nav opens without horizontal overflow`,
          pass:
            mobileOpen.mobileNav.triggerExpanded === 'true' &&
            mobileOpen.mobileNav.panelExists &&
            mobileOpen.viewport.scrollWidth <= width + 1,
          message: `expanded=${mobileOpen.mobileNav.triggerExpanded}, panel=${mobileOpen.mobileNav.panelExists}, scrollWidth=${mobileOpen.viewport.scrollWidth}`,
        })
      }
    }
  },

  summary(capture) {
    const { data, viewport } = capture
    const top = data.top
    const sticky = data.sticky
    const open = data.popoverOpen
    const frame = top.rects.frame
    const content = top.rects.content
    const toc = top.rects.toc

    return `- ${viewport.width}x${viewport.height}: content=${
      content ? `${content.rect.left}-${content.rect.right}` : 'missing'
    }; frame=${frame ? `${frame.rect.left}-${frame.rect.right}` : 'missing'}; areas=${
      frame?.style.gridTemplateAreas ?? 'missing'
    }; toc=${toc ? `${toc.style.display}/${toc.rect.width}px` : 'missing'}; popover=${
      top.tocPopover.root
        ? `${top.tocPopover.root.style.display}/${top.tocPopover.root.rect.left}-${top.tocPopover.root.rect.right}`
        : 'missing'
    }; open=${open.tocPopover.triggerExpanded}/${
      open.tocPopover.panel?.rect.top ?? 'missing'
    }; stickyTop=${sticky.tocPopover.trigger?.rect.top ?? 'missing'}`
  },
}
