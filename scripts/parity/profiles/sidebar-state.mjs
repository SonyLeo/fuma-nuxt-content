export const sidebarStateProfile = {
  fixture: 'http://127.0.0.1:8888/guide/component-detail',
  name: 'sidebar-state',
  references: [
    'D:\\Projects\\Learning\\gh\\fumadocs\\packages\\base-ui\\src\\components\\sidebar\\base.tsx',
    'D:\\Projects\\Work\\fuma-nuxt-content\\design\\layout-provider-parity-plan.md',
  ],
  selector: '#nd-sidebar',

  collect() {
    return `(async () => {
      const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      const isVisible = (element) => {
        if (!element) return false;

        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();

        return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
      };
      const state = (phase) => ({
        phase,
        layoutCollapsed: document.querySelector('#nd-docs-layout')?.getAttribute('data-sidebar-collapsed'),
        mobileOpen: document.querySelector('#nd-docs-layout')?.getAttribute('data-sidebar-mobile-open'),
        sidebarCollapsed: document.querySelector('#nd-sidebar')?.getAttribute('data-collapsed'),
        sidebarHovered: document.querySelector('#nd-sidebar')?.getAttribute('data-hovered'),
        tabsExpanded: document.querySelector('.docs-sidebar-tab-trigger')?.getAttribute('aria-expanded'),
        tabPanel: Boolean(document.querySelector('.docs-sidebar-tab-panel')),
        mobilePanel: Boolean(document.querySelector('.docs-mobile-nav-panel')),
      });

      const initial = state('initial');
      document.querySelector('.docs-sidebar-tab-trigger')?.click();
      await wait(160);
      const tabsOpen = state('tabs-open');
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await wait(160);
      const tabsClosed = state('tabs-closed');
      document.querySelector('.docs-sidebar-collapse')?.click();
      await wait(260);
      const collapsed = state('collapsed');
      document.querySelector('.docs-sidebar-hover-zone')?.dispatchEvent(
        new PointerEvent('pointerenter', { pointerType: 'mouse', clientX: 1 }),
      );
      await wait(260);
      const hovered = state('hovered');

      const mobileTrigger = document.querySelector('.docs-mobile-nav-trigger');
      if (isVisible(mobileTrigger)) {
        mobileTrigger.click();
        await wait(220);
      }
      const mobile = state('mobile');

      return { initial, tabsOpen, tabsClosed, collapsed, hovered, mobile };
    })()`
  },

  summarize(report, helpers) {
    const { addCheck } = helpers

    for (const capture of report.captures) {
      const { data, viewport } = capture

      addCheck(report, {
        label: `${viewport.width}px tabs state provider`,
        pass:
          data.tabsOpen.tabsExpanded === 'true' &&
          data.tabsOpen.tabPanel &&
          data.tabsClosed.tabsExpanded === 'false' &&
          !data.tabsClosed.tabPanel,
        message: `open=${data.tabsOpen.tabsExpanded}/${data.tabsOpen.tabPanel}, closed=${data.tabsClosed.tabsExpanded}/${data.tabsClosed.tabPanel}`,
      })

      if (viewport.width >= 960) {
        addCheck(report, {
          label: `${viewport.width}px collapsed state provider`,
          pass:
            data.collapsed.layoutCollapsed === 'true' &&
            data.collapsed.sidebarCollapsed === 'true',
          message: `layout=${data.collapsed.layoutCollapsed}, sidebar=${data.collapsed.sidebarCollapsed}`,
        })

        addCheck(report, {
          label: `${viewport.width}px hover preview state provider`,
          pass: data.hovered.sidebarHovered === 'true',
          message: `hovered=${data.hovered.sidebarHovered}`,
        })
      }

      if (viewport.width < 960) {
        addCheck(report, {
          label: `${viewport.width}px mobile drawer state provider`,
          pass: data.mobile.mobileOpen === 'true' && data.mobile.mobilePanel,
          message: `mobile=${data.mobile.mobileOpen}, panel=${data.mobile.mobilePanel}`,
        })
      }
    }
  },

  summary(capture) {
    return `- ${capture.viewport.width}x${capture.viewport.height}: collapsed=${capture.data.collapsed.layoutCollapsed}; mobile=${capture.data.mobile.mobileOpen}`
  },
}
