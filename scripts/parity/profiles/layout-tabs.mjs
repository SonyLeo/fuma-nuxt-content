export const layoutTabsProfile = {
  fixture: 'http://127.0.0.1:8888/guide/component-detail',
  name: 'layout-tabs',
  references: [
    'D:\\Projects\\Learning\\gh\\fumadocs\\packages\\base-ui\\src\\layouts\\shared\\index.tsx',
    'D:\\Projects\\Learning\\gh\\fumadocs\\packages\\base-ui\\src\\components\\sidebar\\tabs\\index.tsx',
  ],
  selector: '.docs-sidebar-tabs',

  collect() {
    return `(async () => {
      const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      const text = (element) => element?.textContent?.trim().replace(/\\s+/g, ' ') || '';
      const trigger = document.querySelector('.docs-sidebar-tab-trigger');
      const initial = {
        text: text(trigger),
        expanded: trigger?.getAttribute('aria-expanded'),
      };
      trigger?.click();
      await wait(180);
      const options = [...document.querySelectorAll('.docs-sidebar-tab-option')].map((item) => ({
        text: text(item.querySelector('.docs-sidebar-tab-option-title')),
        description: text(item.querySelector('.docs-sidebar-tab-option-description')),
        href: item.getAttribute('href'),
        current: item.getAttribute('aria-current'),
        role: item.getAttribute('role'),
        icon: item.querySelector('.docs-nav-icon,.docs-nav-icon-fallback')?.getAttribute('data-icon'),
      }));

      return {
        initial,
        options,
        panelRole: document.querySelector('.docs-sidebar-tab-panel')?.getAttribute('role'),
      };
    })()`
  },

  summarize(report, helpers) {
    const { addCheck } = helpers

    for (const capture of report.captures) {
      const { data, viewport } = capture
      const active = data.options.find((item) => item.current === 'page')

      addCheck(report, {
        label: `${viewport.width}px active layout tab`,
        pass: data.initial.text === 'Fumadocs UI' && active?.text === 'Fumadocs UI',
        message: `trigger=${data.initial.text}, active=${active?.text ?? 'none'}`,
      })

      addCheck(report, {
        label: `${viewport.width}px layout tab option contract`,
        pass:
          data.panelRole === 'menu' &&
          data.options.length >= 3 &&
          data.options.every((item) => item.href && item.role === 'menuitem'),
        message: `role=${data.panelRole}, options=${data.options.length}`,
      })
    }
  },

  summary(capture) {
    return `- ${capture.viewport.width}x${capture.viewport.height}: tabs=${capture.data.options.length}; active=${capture.data.options.find((item) => item.current === 'page')?.text ?? 'none'}`
  },
}
