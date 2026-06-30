export const sidebarProfile = {
  fixture: 'http://127.0.0.1:8888/guide/component-detail',
  name: 'sidebar',
  selector: '#nd-sidebar',

  collect() {
    return `(async () => {
      const rectSelectors = [
        '#nd-docs-layout',
        '#nd-sidebar',
        '.docs-sidebar-inner',
        '.docs-sidebar-nav',
        '.docs-sidebar-footer',
        '.docs-sidebar-floating',
        '.docs-shell-content',
      ];
      const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
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
            opacity: style.opacity,
            overflow: style.overflow,
            padding: style.padding,
            position: style.position,
            transform: style.transform,
            width: style.width,
          },
        };
      };

      const links = () =>
        [...document.querySelectorAll('.docs-sidebar-link')].map((element) => ({
          text: text(element.querySelector('.docs-sidebar-link-label')),
          href: element.getAttribute('href'),
          current: element.getAttribute('aria-current'),
          icon:
            element
              .querySelector('.docs-nav-icon,.docs-nav-icon-fallback')
              ?.getAttribute('data-icon') || null,
        }));
      const tabOptions = () =>
        [...document.querySelectorAll('.docs-sidebar-tab-option')].map(
          (element) => ({
            title: text(element.querySelector('.docs-sidebar-tab-option-title')),
            current: element.getAttribute('aria-current'),
          }),
        );
      const collect = (phase) => ({
        phase,
        url: location.href,
        title: document.title,
        root: pick(document.querySelector('#nd-sidebar')),
        rects: Object.fromEntries(
          rectSelectors.map((item) => [item, pick(document.querySelector(item))]),
        ),
        state: {
          layoutCollapsed:
            document
              .querySelector('#nd-docs-layout')
              ?.getAttribute('data-sidebar-collapsed') || null,
          sidebarCollapsed:
            document.querySelector('#nd-sidebar')?.getAttribute('data-collapsed') ||
            null,
          sidebarHovered:
            document.querySelector('#nd-sidebar')?.getAttribute('data-hovered') ||
            null,
          brand: text(document.querySelector('.docs-sidebar-brand-text')),
          tabTrigger: text(document.querySelector('.docs-sidebar-tab-trigger')),
          tabExpanded:
            document
              .querySelector('.docs-sidebar-tab-trigger')
              ?.getAttribute('aria-expanded') || null,
          tabPanelExists: Boolean(document.querySelector('.docs-sidebar-tab-panel')),
          floatingExists: Boolean(document.querySelector('.docs-sidebar-floating')),
          floatingHidden:
            document
              .querySelector('.docs-sidebar-floating')
              ?.classList.contains('is-hidden') || false,
          separators: [...document.querySelectorAll('.docs-sidebar-separator')].map(
            text,
          ),
          links: links(),
          tabOptions: tabOptions(),
        },
      });

      const top = collect('top');

      document.querySelector('.docs-sidebar-tab-trigger')?.click();
      await wait(180);
      const dropdown = collect('dropdown-open');

      document.querySelector('.docs-sidebar-collapse')?.click();
      await wait(320);
      const collapsed = collect('collapsed');

      const zone = document.querySelector('.docs-sidebar-hover-zone');
      zone?.dispatchEvent(
        new PointerEvent('pointerenter', {
          bubbles: false,
          pointerType: 'mouse',
          clientX: 1,
        }),
      );
      await wait(320);
      const hover = collect('collapsed-hover');

      document.querySelector('.docs-sidebar-floating-button')?.click();
      await wait(180);
      const pinned = collect('pinned');

      return { top, dropdown, collapsed, hover, pinned };
    })()`
  },

  summarize(report, helpers) {
    const { addCheck } = helpers
    const expectedTab = report.options.sidebarExpectedTab || 'Fumadocs UI'
    const expectedCurrent = report.options.sidebarExpectedCurrent || 'Accordion'
    const expectedSeparators =
      report.options.sidebarExpectedSeparators || [
        'Introduction',
        'References',
        'Components',
        'Layouts',
      ]

    for (const capture of report.captures) {
      const { data, viewport } = capture
      const width = viewport.width
      const top = data.top
      const dropdown = data.dropdown
      const collapsed = data.collapsed
      const hover = data.hover
      const pinned = data.pinned

      addCheck(report, {
        label: `${width}px runtime selector ${report.options.selector}`,
        pass: Boolean(top.root),
        message: top.root ? `${top.root.rect.width}px wide` : 'missing',
      })

      addCheck(report, {
        label: `${width}px sidebar tab selected`,
        pass: top.state.tabTrigger === expectedTab,
        message: `trigger=${top.state.tabTrigger || 'none'}`,
      })

      addCheck(report, {
        label: `${width}px sidebar tab closed by default`,
        pass: top.state.tabExpanded === 'false' && !top.state.tabPanelExists,
        message: `expanded=${top.state.tabExpanded}, panel=${top.state.tabPanelExists}`,
      })

      const missingSeparators = expectedSeparators.filter(
        (item) => !top.state.separators.includes(item),
      )
      addCheck(report, {
        label: `${width}px sidebar separators`,
        pass: missingSeparators.length === 0,
        message:
          missingSeparators.length === 0
            ? top.state.separators.join(', ')
            : `missing ${missingSeparators.join(', ')}`,
      })

      const current = top.state.links.find((item) => item.current === 'page')
      addCheck(report, {
        label: `${width}px sidebar current item`,
        pass: current?.text === expectedCurrent,
        message: `current=${current?.text ?? 'none'}`,
      })

      const dropdownNavTop = dropdown.rects['.docs-sidebar-nav']?.rect.top
      const topNavTop = top.rects['.docs-sidebar-nav']?.rect.top
      addCheck(report, {
        label: `${width}px tab dropdown overlays nav flow`,
        pass:
          dropdown.state.tabExpanded === 'true' &&
          dropdown.state.tabPanelExists &&
          dropdownNavTop === topNavTop,
        message: `expanded=${dropdown.state.tabExpanded}, panel=${dropdown.state.tabPanelExists}, navTop=${topNavTop}->${dropdownNavTop}`,
      })

      addCheck(report, {
        label: `${width}px active tab in dropdown`,
        pass: dropdown.state.tabOptions.some(
          (item) => item.title === expectedTab && item.current === 'page',
        ),
        message: JSON.stringify(dropdown.state.tabOptions),
      })

      if (width >= 960) {
        const collapsedInner = collapsed.rects['.docs-sidebar-inner']
        addCheck(report, {
          label: `${width}px collapse hides sidebar column`,
          pass:
            collapsed.state.layoutCollapsed === 'true' &&
            collapsed.state.sidebarCollapsed === 'true' &&
            collapsed.state.floatingExists &&
            collapsedInner?.style.opacity === '0',
          message: `layout=${collapsed.state.layoutCollapsed}, sidebar=${collapsed.state.sidebarCollapsed}, floating=${collapsed.state.floatingExists}, opacity=${collapsedInner?.style.opacity ?? 'missing'}`,
        })

        const hoverInner = hover.rects['.docs-sidebar-inner']
        addCheck(report, {
          label: `${width}px hover reveals collapsed sidebar`,
          pass:
            hover.state.sidebarHovered === 'true' &&
            hover.state.floatingHidden &&
            hoverInner?.style.opacity === '1' &&
            (hoverInner?.rect.left ?? -1) >= 0,
          message: `hovered=${hover.state.sidebarHovered}, floatingHidden=${hover.state.floatingHidden}, opacity=${hoverInner?.style.opacity ?? 'missing'}, left=${hoverInner?.rect.left ?? 'missing'}`,
        })

        addCheck(report, {
          label: `${width}px floating pin restores sidebar`,
          pass:
            pinned.state.layoutCollapsed === 'false' &&
            pinned.state.sidebarCollapsed === 'false' &&
            !pinned.state.floatingExists,
          message: `layout=${pinned.state.layoutCollapsed}, sidebar=${pinned.state.sidebarCollapsed}, floating=${pinned.state.floatingExists}`,
        })
      }
    }
  },

  summary(capture) {
    const top = capture.data.top
    const collapsed = capture.data.collapsed
    const hover = capture.data.hover

    return `- ${capture.viewport.width}x${capture.viewport.height}: tab=${
      top.state.tabTrigger || 'missing'
    }; links=${top.state.links.length}; separators=${
      top.state.separators.join('/') || 'missing'
    }; collapsed=${collapsed.state.layoutCollapsed}/${
      collapsed.rects['.docs-sidebar-inner']?.style.opacity ?? 'n/a'
    }; hover=${hover.state.sidebarHovered}/${
      hover.rects['.docs-sidebar-inner']?.style.opacity ?? 'n/a'
    }`
  },
}
