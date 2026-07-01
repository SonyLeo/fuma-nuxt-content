export const feedbackProfile = {
  fixture: 'http://127.0.0.1:8888/guide/components',
  name: 'feedback',
  references: ['app/components/docs/DocsFeedback.vue'],
  selector: '.docs-feedback',

  collect() {
    return `(async () => {
      const text = (element) =>
        element?.textContent?.trim().replace(/\\s+/g, ' ') || '';
      const pick = (element) => {
        if (!element) return null;

        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();

        return {
          tag: element.tagName.toLowerCase(),
          className: typeof element.className === 'string' ? element.className : '',
          text: text(element).slice(0, 220),
          rect: {
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            top: Math.round(rect.top),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          },
          style: {
            alignItems: style.alignItems,
            borderBottomWidth: style.borderBottomWidth,
            borderRadius: style.borderRadius,
            borderTopWidth: style.borderTopWidth,
            color: style.color,
            display: style.display,
            fill: style.fill,
            flexWrap: style.flexWrap,
            fontSize: style.fontSize,
            fontWeight: style.fontWeight,
            gap: style.gap,
            justifyContent: style.justifyContent,
            lineHeight: style.lineHeight,
            margin: style.margin,
            minHeight: style.minHeight,
            padding: style.padding,
          },
        };
      };
      const read = () => {
        const root = document.querySelector('.docs-feedback');
        const buttons = [...document.querySelectorAll('.docs-feedback-button')];

        return {
          actions: pick(document.querySelector('.docs-feedback-actions')),
          ariaLabel: root?.getAttribute('aria-label') || null,
          buttons: buttons.map((button) => ({
            root: pick(button),
            icon: pick(button.querySelector('.docs-feedback-icon')),
            pressed: button.getAttribute('data-pressed'),
            ariaPressed: button.getAttribute('aria-pressed'),
          })),
          pagePath: root?.getAttribute('data-page-path') || null,
          prompt: pick(document.querySelector('.docs-feedback-prompt')),
          root: pick(root),
          sourcePath: root?.getAttribute('data-source-path') || null,
          thanks: pick(document.querySelector('.docs-feedback-thanks')),
          thanksAriaLive:
            document.querySelector('.docs-feedback-thanks')?.getAttribute('aria-live') ||
            null,
        };
      };

      const before = read();
      await new Promise((resolve) => requestAnimationFrame(resolve));

      const positiveButton = document.querySelector('.docs-feedback-button');
      positiveButton?.dispatchEvent(
        new MouseEvent('click', { bubbles: true, cancelable: true }),
      );
      await new Promise((resolve) => setTimeout(resolve, 250));

      return {
        afterPositive: read(),
        before,
        title: document.title,
        url: location.href,
      };
    })()`
  },

  summarize(report, helpers) {
    const { addCheck } = helpers

    for (const capture of report.captures) {
      const { data, viewport } = capture
      const width = viewport.width
      const before = data.before
      const after = data.afterPositive

      addCheck(report, {
        label: `${width}px feedback shell`,
        pass:
          before.ariaLabel === 'Page feedback' &&
          before.root?.style.display === 'flex' &&
          before.root?.style.flexWrap === 'wrap' &&
          before.root?.style.alignItems === 'center' &&
          before.root?.style.borderTopWidth === '1px' &&
          before.root?.style.borderBottomWidth === '1px' &&
          before.prompt?.text.length > 0 &&
          before.pagePath === '/guide/components' &&
          before.sourcePath === '/guide/components',
        message: before.root
          ? `display=${before.root.style.display}/${before.root.style.flexWrap},border=${before.root.style.borderTopWidth}/${before.root.style.borderBottomWidth},path=${before.pagePath},source=${before.sourcePath}`
          : 'missing',
      })

      addCheck(report, {
        label: `${width}px feedback buttons`,
        pass:
          before.buttons.length === 2 &&
          before.buttons[0]?.root?.text === 'Helpful' &&
          before.buttons[1]?.root?.text === 'Not helpful' &&
          before.buttons.every(
            (button) =>
              button.root?.style.minHeight === '36px' &&
              Number.parseFloat(button.root?.style.borderRadius ?? '0') >= 999 &&
              button.icon?.rect.width === 16 &&
              button.icon?.rect.height === 16 &&
              (button.pressed === 'false' || button.pressed === null),
          ),
        message: `buttons=${before.buttons
          .map((button) => `${button.root?.text}/${button.pressed}/${button.root?.style.minHeight}`)
          .join('|')}`,
      })

      addCheck(report, {
        label: `${width}px feedback selected state`,
        pass:
          after.buttons[0]?.pressed === 'true' &&
          after.buttons[0]?.ariaPressed === 'true' &&
          (after.buttons[1]?.pressed === 'false' ||
            after.buttons[1]?.pressed === null) &&
          after.thanks?.text === 'Thanks for the feedback.' &&
          after.thanksAriaLive === 'polite',
        message: `pressed=${after.buttons
          .map((button) => `${button.root?.text}/${button.pressed}/${button.ariaPressed}`)
          .join('|')},thanks=${after.thanks?.text ?? 'missing'}/${after.thanksAriaLive ?? 'missing'}`,
      })

      addCheck(report, {
        label: `${width}px feedback responsive width`,
        pass:
          before.root?.rect.width > 0 &&
          before.root?.rect.width <= 900 &&
          before.buttons.every((button) => button.root?.rect.width > 0),
        message: `root=${before.root?.rect.width},buttons=${before.buttons
          .map((button) => button.root?.rect.width)
          .join('|')}`,
      })
    }
  },

  summary(capture) {
    return `- ${capture.viewport.width}x${capture.viewport.height}: buttons=${
      capture.data.before.buttons.length
    }; selected=${capture.data.afterPositive.buttons[0]?.pressed ?? 'missing'}`
  },
}
