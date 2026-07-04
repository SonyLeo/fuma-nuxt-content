export const notFoundProfile = {
  expectedStatus: 404,
  fixture: 'http://127.0.0.1:8888/__stage2_missing_page__',
  name: 'not-found',
  selector: '.docs-not-found',

  collect() {
    return `(() => {
      const text = (selector) =>
        document.querySelector(selector)?.textContent?.trim().replace(/\\s+/g, ' ') || '';
      const action = document.querySelector('.docs-not-found-action');

      return {
        root: Boolean(document.querySelector('[data-docs-not-found]')),
        homeLayout: Boolean(document.querySelector('[data-docs-home-layout]')),
        code: text('.docs-not-found-code'),
        title: text('.docs-not-found-title'),
        description: text('.docs-not-found-description'),
        actionHref: action?.getAttribute('href'),
        actionText: action?.textContent?.trim().replace(/\\s+/g, ' ') || '',
        themeSwitches: document.querySelectorAll('.docs-home-tools [data-theme-toggle]').length,
      };
    })()`
  },

  summarize(report, helpers) {
    const { addCheck } = helpers

    for (const capture of report.captures) {
      const { data, viewport } = capture

      addCheck(report, {
        label: `${viewport.width}px not-found shell`,
        pass:
          data.root &&
          data.homeLayout &&
          data.code === '404' &&
          data.title === 'Page Not Found',
        message: `root=${data.root}, home=${data.homeLayout}, code=${data.code}, title=${data.title}`,
      })

      addCheck(report, {
        label: `${viewport.width}px not-found action`,
        pass: data.actionHref === '/' && data.actionText.includes('Back to Home'),
        message: `href=${data.actionHref}, text=${data.actionText}`,
      })

      addCheck(report, {
        label: `${viewport.width}px not-found shared theme slot`,
        pass: data.themeSwitches >= 1,
        message: `theme=${data.themeSwitches}`,
      })
    }
  },

  summary(capture) {
    return `- ${capture.viewport.width}x${capture.viewport.height}: code=${capture.data.code}; action=${capture.data.actionHref}`
  },
}
