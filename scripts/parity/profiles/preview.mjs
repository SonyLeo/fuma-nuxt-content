export const previewProfile = {
  fixture: 'http://127.0.0.1:8888/guide/components',
  name: 'preview',
  references: [
    'app/components/content/DocPreview.vue',
    'app/components/content/DocInstallCard.vue',
  ],
  selector: '.fd-doc-preview',

  collect() {
    return `(() => {
      const text = (element) =>
        element?.textContent?.trim().replace(/\\s+/g, ' ') || '';
      const pick = (element) => {
        if (!element) return null;

        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();

        return {
          tag: element.tagName.toLowerCase(),
          className: typeof element.className === 'string' ? element.className : '',
          text: text(element).slice(0, 260),
          rect: {
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            top: Math.round(rect.top),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          },
          style: {
            backgroundColor: style.backgroundColor,
            borderRadius: style.borderRadius,
            borderTopWidth: style.borderTopWidth,
            borderWidth: style.borderWidth,
            boxShadow: style.boxShadow,
            color: style.color,
            display: style.display,
            fontSize: style.fontSize,
            fontWeight: style.fontWeight,
            lineHeight: style.lineHeight,
            margin: style.margin,
            minHeight: style.minHeight,
            overflow: style.overflow,
            padding: style.padding,
          },
        };
      };

      const preview = document.querySelector('.fd-doc-preview');
      const canvas = preview?.querySelector('.fd-doc-preview-canvas') || null;
      const description = preview?.querySelector('.fd-doc-preview-description') || null;
      const source = preview?.querySelector('.fd-doc-preview-source') || null;
      const sourceCodeBlock = source?.querySelector('.fd-doc-code-block') || null;
      const sourceCopy = source?.querySelector('.fd-doc-code-copy') || null;
      const counter = preview?.querySelector('.preview-counter') || null;

      const install = document.querySelector('.fd-doc-install-card');
      const installCommand = install?.querySelector('.fd-doc-install-command') || null;
      const installCodeBlock = install?.querySelector('.fd-doc-code-block') || null;
      const installCopy = install?.querySelector('.fd-doc-code-copy') || null;

      return {
        install: {
          command: pick(installCommand),
          codeBlock: pick(installCodeBlock),
          copy: pick(installCopy),
          description: pick(install?.querySelector('.fd-doc-install-description')),
          root: pick(install),
          title: pick(install?.querySelector('.fd-doc-install-title')),
        },
        preview: {
          canvas: pick(canvas),
          canvasAria: canvas?.getAttribute('aria-label') || null,
          canvasRole: canvas?.getAttribute('role') || null,
          counter: pick(counter),
          description: pick(description),
          root: pick(preview),
          source: pick(source),
          sourceCodeBlock: pick(sourceCodeBlock),
          sourceCopy: pick(sourceCopy),
        },
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
      const { install, preview } = data

      addCheck(report, {
        label: `${width}px preview shell`,
        pass:
          preview.root?.className.includes('is-frame') &&
          preview.root?.style.overflow === 'hidden' &&
          preview.root?.style.borderRadius === '12px' &&
          preview.root?.style.borderWidth === '1px' &&
          preview.canvas?.style.display === 'grid' &&
          preview.canvas?.style.minHeight === '128px' &&
          preview.canvasRole === 'region' &&
          preview.canvasAria === 'Preview',
        message: preview.root
          ? `class=${preview.root.className},canvas=${preview.canvas?.style.display}/${preview.canvas?.style.minHeight},role=${preview.canvasRole}/${preview.canvasAria}`
          : 'missing',
      })

      addCheck(report, {
        label: `${width}px preview content and source`,
        pass:
          Boolean(preview.counter?.text.includes('Preview Counter')) &&
          preview.description?.text.includes('交互组件') &&
          preview.source?.style.borderTopWidth === '1px' &&
          preview.sourceCodeBlock?.style.margin === '0px' &&
          preview.sourceCodeBlock?.style.borderWidth === '0px' &&
          Boolean(preview.sourceCopy),
        message: `counter=${preview.counter?.text ?? 'missing'},description=${preview.description?.text ?? 'missing'},source=${preview.source?.style.borderTopWidth},code=${preview.sourceCodeBlock?.style.margin}/${preview.sourceCodeBlock?.style.borderWidth},copy=${Boolean(preview.sourceCopy)}`,
      })

      addCheck(report, {
        label: `${width}px install card shell`,
        pass:
          install.root?.style.borderRadius === '12px' &&
          install.root?.style.borderWidth === '1px' &&
          install.root?.style.padding === '12px' &&
          install.title?.text === 'Install Preview' &&
          install.title?.style.fontWeight === '500' &&
          install.description?.text.includes('local docs workspace') &&
          install.command?.style.margin === '0px',
        message: install.root
          ? `padding=${install.root.style.padding},title=${install.title?.text}/${install.title?.style.fontWeight},description=${install.description?.text}`
          : 'missing',
      })

      addCheck(report, {
        label: `${width}px install command code block`,
        pass:
          install.codeBlock?.text.includes('pnpm dlx fuma-nuxt-content add preview') &&
          install.codeBlock?.style.margin === '0px' &&
          install.codeBlock?.style.backgroundColor !== 'rgba(0, 0, 0, 0)' &&
          Boolean(install.copy) &&
          install.root?.rect.width > 0 &&
          install.root?.rect.width <= preview.root?.rect.width + 2,
        message: `command=${install.codeBlock?.text ?? 'missing'},margin=${install.codeBlock?.style.margin},copy=${Boolean(install.copy)},width=${install.root?.rect.width}/${preview.root?.rect.width}`,
      })
    }
  },

  summary(capture) {
    return `- ${capture.viewport.width}x${capture.viewport.height}: preview=${
      capture.data.preview.root ? 'yes' : 'missing'
    }; install=${capture.data.install.root ? 'yes' : 'missing'}`
  },
}
