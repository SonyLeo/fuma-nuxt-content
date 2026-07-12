export const layoutSlotsProfile = {
  fixture: 'http://127.0.0.1:8888/guide/component-detail',
  name: 'layout-slots',
  references: [
    'D:\\Projects\\Learning\\gh\\fumadocs\\packages\\base-ui\\src\\layouts\\shared\\client.tsx',
    'D:\\Projects\\Work\\fuma-nuxt-content\\design\\decisions.md',
  ],
  selector: '.docs-shell',

  collect() {
    return `(async () => {
      const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      const visible = (element) => {
        if (!element) return false;
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return rect.width > 0 && rect.height > 0 && style.display !== 'none';
      };
      const count = (selector) => document.querySelectorAll(selector).length;
      const surfaceCounts = () => ({
        headerSearch: count('.docs-header .docs-search-trigger'),
        headerTheme: count('.docs-header [data-theme-toggle]'),
        sidebarSearch: count('#nd-sidebar .docs-search-trigger'),
        sidebarTheme: count('#nd-sidebar [data-theme-toggle]'),
        mobileTheme: count('.docs-mobile-nav-panel [data-theme-toggle]'),
        language: count('[data-docs-language-select]'),
      });

      const initial = surfaceCounts();
      const trigger = document.querySelector('.docs-mobile-nav-trigger');
      if (trigger && visible(trigger)) {
        trigger.click();
        await wait(220);
      }
      const mobile = surfaceCounts();

      return {
        initial,
        mobile,
        mobileOpen: Boolean(document.querySelector('.docs-mobile-nav-panel')),
        rootSearchEnabled: document.documentElement.getAttribute('data-docs-search-enabled'),
        rootLanguageEnabled: document.documentElement.getAttribute('data-docs-language-enabled'),
      };
    })()`
  },

  summarize(report, helpers) {
    const { addCheck } = helpers

    for (const capture of report.captures) {
      const { data, viewport } = capture

      addCheck(report, {
        label: `${viewport.width}px shared slot defaults`,
        pass:
          data.rootSearchEnabled === 'true' &&
          data.rootLanguageEnabled === 'false' &&
          data.initial.headerTheme >= 1 &&
          data.initial.sidebarTheme >= 1,
        message: JSON.stringify(data.initial),
      })

      addCheck(report, {
        label: `${viewport.width}px search replacement slot`,
        pass: data.initial.headerSearch >= 1 && data.initial.sidebarSearch >= 1,
        message: `header=${data.initial.headerSearch}, sidebar=${data.initial.sidebarSearch}`,
      })

      if (viewport.width < 960) {
        addCheck(report, {
          label: `${viewport.width}px mobile slot path`,
          pass: data.mobileOpen && data.mobile.mobileTheme >= 1,
          message: `open=${data.mobileOpen}, mobileTheme=${data.mobile.mobileTheme}`,
        })
      }
    }
  },

  summary(capture) {
    return `- ${capture.viewport.width}x${capture.viewport.height}: ${JSON.stringify(capture.data.initial)}`
  },
}
