export const themeProfile = {
  fixture: 'http://127.0.0.1:8888/guide/code-block',
  name: 'theme',
  references: [
    'D:\\Projects\\Learning\\gh\\fumadocs\\packages\\base-ui\\src\\provider\\base.tsx',
    'D:\\Projects\\Learning\\gh\\fumadocs\\packages\\base-ui\\src\\layouts\\shared\\slots\\theme-switch.tsx',
    'D:\\Projects\\Learning\\gh\\fumadocs\\packages\\base-ui\\css\\purple.css',
    'D:\\Projects\\Work\\fuma-nuxt-content\\design\\theme-runtime-parity-plan.md',
  ],
  selector: '.docs-theme-switch',

  collect() {
    return `(async () => {
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
          ariaLabel: element.getAttribute('aria-label'),
          ariaPressed: element.getAttribute('aria-pressed'),
          dataActive: element.getAttribute('data-active'),
          dataActiveMode: element.getAttribute('data-active-mode'),
          dataThemeMode: element.getAttribute('data-theme-mode'),
          rect: {
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            width: Math.round(rect.width),
            top: Math.round(rect.top),
            height: Math.round(rect.height),
          },
          style: {
            backgroundColor: style.backgroundColor,
            borderColor: style.borderColor,
            borderRadius: style.borderRadius,
            color: style.color,
            display: style.display,
            gap: style.gap,
            height: style.height,
            overflow: style.overflow,
            padding: style.padding,
            width: style.width,
          },
        };
      };

      const rootState = () => {
        const root = document.documentElement;
        const style = getComputedStyle(root);

        return {
          className: root.className,
          colorScheme: style.colorScheme,
          dataDocsTheme: root.getAttribute('data-docs-theme'),
          dataDocsThemeMode: root.getAttribute('data-docs-theme-mode'),
          dataDocsThemeResolved: root.getAttribute('data-docs-theme-resolved'),
          dark: root.classList.contains('dark'),
          localStorageMode: (() => {
            try {
              return window.localStorage.getItem('fuma-nuxt-theme');
            } catch {
              return null;
            }
          })(),
          tokens: {
            background: style.getPropertyValue('--docs-color-background').trim(),
            foreground: style.getPropertyValue('--docs-color-foreground').trim(),
            primary: style.getPropertyValue('--docs-color-primary').trim(),
            fdPrimary: style.getPropertyValue('--color-fd-primary').trim(),
          },
          prefersDark:
            !!window.matchMedia &&
            window.matchMedia('(prefers-color-scheme: dark)').matches,
        };
      };

      const switches = () =>
        [...document.querySelectorAll('[data-theme-toggle]')].map((root, index) => ({
          index,
          root: pick(root),
          surface:
            root.closest('.docs-header') ? 'header' :
            root.closest('.docs-mobile-nav-panel') ? 'mobile' :
            root.closest('#nd-sidebar') ? 'sidebar' :
            'unknown',
          buttons: [...root.querySelectorAll('button')].map((button) => pick(button)),
          activeButtons: [...root.querySelectorAll('[data-active="true"]')].map(
            (button) => pick(button),
          ),
        }));

      const codeState = () => {
        const block = document.querySelector('.fd-doc-code-block');
        const span = block?.querySelector('code span');

        return {
          block: pick(block),
          blockClass: typeof block?.className === 'string' ? block.className : '',
          tokenColor: span ? getComputedStyle(span).color : null,
        };
      };

      const collect = (phase) => ({
        phase,
        root: rootState(),
        switches: switches(),
        headerSwitchCount: document.querySelectorAll('.docs-header [data-theme-toggle]').length,
        sidebarSwitchCount: document.querySelectorAll('#nd-sidebar [data-theme-toggle]').length,
        mobileSwitchCount: document.querySelectorAll(
          '.docs-mobile-nav-panel [data-theme-toggle]',
        ).length,
        mobilePanelOpen: Boolean(document.querySelector('.docs-mobile-nav-panel')),
        code: codeState(),
      });

      const clickMode = async (mode) => {
        const buttons = [
          ...document.querySelectorAll(
            '.docs-theme-button[data-theme-mode="' + mode + '"]',
          ),
        ];
        const button =
          buttons.find((element) => {
            const rect = element.getBoundingClientRect();
            const style = getComputedStyle(element);

            return (
              rect.width > 0 &&
              rect.height > 0 &&
              style.display !== 'none' &&
              style.visibility !== 'hidden'
            );
          }) ?? buttons[0];

        button?.scrollIntoView({ block: 'center', inline: 'nearest' });
        await wait(80);
        button?.click();
        await wait(220);
      };

      const openMobilePanel = async () => {
        const trigger = document.querySelector('.docs-mobile-nav-trigger');
        if (!trigger) return;
        if (!document.querySelector('.docs-mobile-nav-panel')) {
          trigger.click();
          await wait(220);
        }
      };

      const initial = collect('initial');
      await clickMode('dark');
      const dark = collect('dark');
      await clickMode('light');
      const light = collect('light');
      await clickMode('system');
      const system = collect('system');
      await openMobilePanel();
      const mobile = collect('mobile-open');

      return { initial, dark, light, system, mobile };
    })()`
  },

  summarize(report, helpers) {
    const { addCheck } = helpers
    const expectedPreset = report.options.themeExpectedPreset || 'default'

    for (const capture of report.captures) {
      const { data, viewport } = capture
      const width = viewport.width
      const initial = data.initial
      const dark = data.dark
      const light = data.light
      const system = data.system
      const mobile = data.mobile
      const visibleSwitches = initial.switches.filter(
        (item) => item.root?.rect.width > 0 && item.root?.rect.height > 0,
      )

      addCheck(report, {
        label: `${width}px theme root initialized`,
        pass:
          initial.root.dataDocsTheme === expectedPreset &&
          ['light', 'dark', 'system'].includes(initial.root.dataDocsThemeMode) &&
          ['light', 'dark'].includes(initial.root.dataDocsThemeResolved),
        message: `preset=${initial.root.dataDocsTheme}, mode=${initial.root.dataDocsThemeMode}, resolved=${initial.root.dataDocsThemeResolved}`,
      })

      addCheck(report, {
        label: `${width}px theme switch surfaces`,
        pass:
          initial.switches.length >= 2 &&
          visibleSwitches.length >= 1 &&
          initial.headerSwitchCount >= 1 &&
          initial.sidebarSwitchCount >= 1 &&
          visibleSwitches.every(
            (item) =>
              ['flex', 'inline-flex'].includes(item.root?.style.display) &&
              item.root?.style.borderRadius !== '0px' &&
              item.buttons.length >= 2,
          ),
        message: `switches=${initial.switches.length}, visible=${visibleSwitches.length}, header=${initial.headerSwitchCount}, sidebar=${initial.sidebarSwitchCount}`,
      })

      addCheck(report, {
        label: `${width}px theme switch accessibility`,
        pass: initial.switches.every((item) =>
          item.buttons.every(
            (button) =>
              button?.ariaLabel &&
              ['true', 'false'].includes(button.ariaPressed ?? ''),
          ),
        ),
        message: initial.switches
          .map((item) =>
            `${item.surface}:${item.buttons
              .map(
                (button) =>
                  `${button?.ariaLabel || 'missing'}=${button?.ariaPressed}`,
              )
              .join('/')}`,
          )
          .join('; '),
      })

      addCheck(report, {
        label: `${width}px dark mode state`,
        pass:
          dark.root.dark === true &&
          dark.root.dataDocsThemeMode === 'dark' &&
          dark.root.dataDocsThemeResolved === 'dark' &&
          dark.root.localStorageMode === 'dark' &&
          dark.root.colorScheme.includes('dark'),
        message: `dark=${dark.root.dark}, mode=${dark.root.dataDocsThemeMode}, resolved=${dark.root.dataDocsThemeResolved}, storage=${dark.root.localStorageMode}, colorScheme=${dark.root.colorScheme}`,
      })

      addCheck(report, {
        label: `${width}px light mode state`,
        pass:
          light.root.dark === false &&
          light.root.dataDocsThemeMode === 'light' &&
          light.root.dataDocsThemeResolved === 'light' &&
          light.root.localStorageMode === 'light' &&
          light.root.colorScheme.includes('light'),
        message: `dark=${light.root.dark}, mode=${light.root.dataDocsThemeMode}, resolved=${light.root.dataDocsThemeResolved}, storage=${light.root.localStorageMode}, colorScheme=${light.root.colorScheme}`,
      })

      const expectedSystemResolved = system.root.prefersDark ? 'dark' : 'light'
      addCheck(report, {
        label: `${width}px system mode state`,
        pass:
          system.root.dataDocsThemeMode === 'system' &&
          system.root.dataDocsThemeResolved === expectedSystemResolved &&
          system.root.localStorageMode === 'system',
        message: `prefersDark=${system.root.prefersDark}, resolved=${system.root.dataDocsThemeResolved}, storage=${system.root.localStorageMode}`,
      })

      addCheck(report, {
        label: `${width}px active switch state follows mode`,
        pass:
          dark.switches.every((item) =>
            item.activeButtons.some((button) => button.dataThemeMode === 'dark'),
          ) &&
          light.switches.every((item) =>
            item.activeButtons.some((button) => button.dataThemeMode === 'light'),
          ) &&
          system.switches.every((item) =>
            item.activeButtons.some((button) => button.dataThemeMode === 'system'),
          ),
        message: `dark=${dark.switches
          .map((item) => item.activeButtons.map((button) => button.dataThemeMode).join('/'))
          .join(';')}, light=${light.switches
          .map((item) => item.activeButtons.map((button) => button.dataThemeMode).join('/'))
          .join(';')}, system=${system.switches
          .map((item) => item.activeButtons.map((button) => button.dataThemeMode).join('/'))
          .join(';')}`,
      })

      addCheck(report, {
        label: `${width}px code dark token reachable`,
        pass:
          !dark.code.block ||
          !dark.code.blockClass.includes('shiki-themes') ||
          (dark.code.blockClass.includes('catppuccin-mocha') &&
            Boolean(dark.code.tokenColor) &&
            dark.root.tokens.primary === dark.root.tokens.fdPrimary),
        message: dark.code.blockClass.includes('shiki-themes')
          ? `class=${dark.code.blockClass}, tokenColor=${dark.code.tokenColor}, primary=${dark.root.tokens.primary}, fd=${dark.root.tokens.fdPrimary}`
          : `no themed Shiki block on fixture; primary=${dark.root.tokens.primary}, fd=${dark.root.tokens.fdPrimary}`,
      })

      if (width < 960) {
        addCheck(report, {
          label: `${width}px mobile theme entry`,
          pass: mobile.mobilePanelOpen && mobile.mobileSwitchCount >= 1,
          message: `panel=${mobile.mobilePanelOpen}, switches=${mobile.mobileSwitchCount}`,
        })
      }
    }
  },

  summary(capture) {
    const { initial, dark, light, system, mobile } = capture.data

    return `- ${capture.viewport.width}x${capture.viewport.height}: switches=${
      initial.switches.length
    }; dark=${dark.root.dark}/${dark.root.localStorageMode}; light=${
      light.root.dark
    }/${light.root.localStorageMode}; system=${
      system.root.dataDocsThemeResolved
    }; mobile=${mobile.mobileSwitchCount}`
  },
}
