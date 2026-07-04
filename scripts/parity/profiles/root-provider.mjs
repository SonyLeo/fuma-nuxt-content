export const rootProviderProfile = {
  fixture: 'http://127.0.0.1:8888/guide/component-detail',
  name: 'root-provider',
  references: [
    'D:\\Projects\\Learning\\gh\\fumadocs\\packages\\base-ui\\src\\provider\\base.tsx',
    'D:\\Projects\\Work\\fuma-nuxt-content\\design\\layout-provider-parity-plan.md',
  ],
  selector: 'html',

  collect() {
    return `(() => {
      const root = document.documentElement;
      const style = getComputedStyle(root);

      return {
        dir: root.getAttribute('dir'),
        rootProvider: root.getAttribute('data-docs-root-provider'),
        searchEnabled: root.getAttribute('data-docs-search-enabled'),
        languageEnabled: root.getAttribute('data-docs-language-enabled'),
        theme: root.getAttribute('data-docs-theme'),
        themeMode: root.getAttribute('data-docs-theme-mode'),
        themeResolved: root.getAttribute('data-docs-theme-resolved'),
        colorScheme: style.colorScheme,
        searchTriggerCount: document.querySelectorAll('.docs-search-trigger').length,
        themeSwitchCount: document.querySelectorAll('[data-theme-toggle]').length,
        languageSlotCount: document.querySelectorAll('[data-docs-language-select]').length,
      };
    })()`
  },

  summarize(report, helpers) {
    const { addCheck } = helpers

    for (const capture of report.captures) {
      const { data, viewport } = capture

      addCheck(report, {
        label: `${viewport.width}px root provider boundary`,
        pass:
          data.rootProvider === 'true' &&
          data.dir === 'ltr' &&
          data.searchEnabled === 'true' &&
          data.languageEnabled === 'false',
        message: `provider=${data.rootProvider}, dir=${data.dir}, search=${data.searchEnabled}, language=${data.languageEnabled}`,
      })

      addCheck(report, {
        label: `${viewport.width}px theme handoff`,
        pass:
          Boolean(data.theme) &&
          ['light', 'dark', 'system'].includes(data.themeMode) &&
          ['light', 'dark'].includes(data.themeResolved) &&
          Boolean(data.colorScheme),
        message: `theme=${data.theme}, mode=${data.themeMode}, resolved=${data.themeResolved}, scheme=${data.colorScheme}`,
      })

      addCheck(report, {
        label: `${viewport.width}px default provider slots reachable`,
        pass: data.searchTriggerCount >= 1 && data.themeSwitchCount >= 2,
        message: `search=${data.searchTriggerCount}, theme=${data.themeSwitchCount}, language=${data.languageSlotCount}`,
      })
    }
  },

  summary(capture) {
    return `- ${capture.viewport.width}x${capture.viewport.height}: root=${capture.data.rootProvider}; search=${capture.data.searchTriggerCount}; theme=${capture.data.themeSwitchCount}`
  },
}
