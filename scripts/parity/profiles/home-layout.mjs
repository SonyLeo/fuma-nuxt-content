export const homeLayoutProfile = {
  fixture: 'http://127.0.0.1:8888/',
  name: 'home-layout',
  selector: '.docs-home-layout',

  collect() {
    return `(() => {
      const count = (selector) => document.querySelectorAll(selector).length;
      const text = (selector) =>
        document.querySelector(selector)?.textContent?.trim().replace(/\\s+/g, ' ') || '';

      return {
        root: Boolean(document.querySelector('[data-docs-home-layout]')),
        brand: text('.docs-home-brand-text'),
        navLinks: [...document.querySelectorAll('.docs-home-nav-link')].map((link) => ({
          text: link.textContent.trim().replace(/\\s+/g, ' '),
          href: link.getAttribute('href'),
          current: link.getAttribute('aria-current'),
        })),
        themeSwitches: count('.docs-home-tools [data-theme-toggle]'),
        heroTitle: text('.docs-home-title'),
        cardLinks: count('.docs-home-card,.docs-home-link'),
        contentRoot: Boolean(document.querySelector('.docs-home-content')),
      };
    })()`
  },

  summarize(report, helpers) {
    const { addCheck } = helpers

    for (const capture of report.captures) {
      const { data, viewport } = capture

      addCheck(report, {
        label: `${viewport.width}px home layout shell`,
        pass: data.root && data.brand === 'Fumadocs' && data.heroTitle === 'Fumadocs',
        message: `root=${data.root}, brand=${data.brand}, hero=${data.heroTitle}`,
      })

      addCheck(report, {
        label: `${viewport.width}px home shared options`,
        pass: data.navLinks.length >= 1 && data.themeSwitches >= 1,
        message: `nav=${data.navLinks.length}, theme=${data.themeSwitches}`,
      })

      addCheck(report, {
        label: `${viewport.width}px home body remains composable`,
        pass: data.cardLinks >= 3 && data.contentRoot,
        message: `cards=${data.cardLinks}, content=${data.contentRoot}`,
      })
    }
  },

  summary(capture) {
    return `- ${capture.viewport.width}x${capture.viewport.height}: brand=${capture.data.brand}; nav=${capture.data.navLinks.length}; cards=${capture.data.cardLinks}; content=${capture.data.contentRoot}`
  },
}
