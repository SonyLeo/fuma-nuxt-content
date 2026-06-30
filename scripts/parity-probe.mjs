import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const DEFAULT_CHROME_PATH =
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'

function parseArgs(argv) {
  const seen = new Set()
  const out = {
    activeSelector: '.docs-toc-link.is-active',
    chromePort: 9233,
    currentSelector: '.docs-toc-link[aria-current]',
    headingSelector:
      '.docs-page-body h2[id], .docs-page-body h3[id], .docs-page-body h4[id]',
    minBytes: 1000,
    profile: 'toc',
    rects:
      '.docs-shell-body,.docs-sidebar,.docs-sidebar-inner,.docs-shell-content,.docs-page-frame,#nd-page,#nd-toc,.docs-toc-popover',
    retries: 1,
    selector: '#nd-toc',
    sidebarExpectedCurrent: 'Accordion',
    sidebarExpectedSeparators: 'Introduction,References,Components,Layouts',
    sidebarExpectedTab: 'Fumadocs UI',
    settleMs: 3200,
    viewports: ['2048x1152', '994x935'],
  }

  for (const arg of argv) {
    if (!arg.startsWith('--')) {
      continue
    }

    const [key, value = ''] = arg.slice(2).split('=')
    seen.add(key)
    out[key] = value
  }

  if (out.profile === 'sidebar') {
    if (!seen.has('selector')) {
      out.selector = '#nd-sidebar'
    }

    if (!seen.has('rects')) {
      out.rects =
        '#nd-docs-layout,#nd-sidebar,.docs-sidebar-inner,.docs-sidebar-nav,.docs-sidebar-footer,.docs-sidebar-floating,.docs-shell-content'
    }
  }

  if (out.profile === 'code-block') {
    if (!seen.has('selector')) {
      out.selector = '.fd-doc-code-block'
    }

    if (!seen.has('rects')) {
      out.rects =
        '.fd-doc-preview,.fd-doc-install-card,.fd-doc-code-block,.fd-doc-code-block-header,.fd-doc-code-block-body'
    }
  }

  if (out.profile === 'content-components') {
    if (!seen.has('selector')) {
      out.selector = '.fd-callout'
    }

    if (!seen.has('rects')) {
      out.rects =
        '.fd-callout,.fd-doc-tabs,.fd-doc-accordions,.fd-doc-files,.fd-doc-inline-toc,.fd-doc-type-table'
    }
  }

  if (out.profile === 'page-actions') {
    if (!seen.has('selector')) {
      out.selector = '.docs-page-actions'
    }

    if (!seen.has('rects')) {
      out.rects =
        '.fd-doc-preview,.docs-page-actions,.docs-feedback,.docs-pager,.docs-page-footer'
    }
  }

  out.chromePort = Number(out.chromePort || 9233)
  out.minBytes = Number(out.minBytes || 1000)
  out.retries = Number(out.retries || 0)
  out.settleMs = Number(out.settleMs || 3200)
  out.rects = String(out.rects || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
  out.viewports = String(out.viewports || '2048x1152')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
  out.sidebarExpectedSeparators = String(out.sidebarExpectedSeparators || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)

  return out
}

function usage() {
  return [
    'Usage:',
    '  node scripts/parity-probe.mjs --url=http://127.0.0.1:8888/guide/component-detail',
    '',
    'Options:',
    '  --selector=#nd-toc',
    '  --profile=toc|sidebar|code-block|content-components|page-actions',
    '  --viewports=2048x1152,994x935',
    '  --rects=.docs-shell-body,#nd-page,#nd-toc',
    '  --activeSelector=.docs-toc-link.is-active',
    '  --currentSelector=.docs-toc-link[aria-current]',
    '  --headingSelector=.docs-page-body h2[id],.docs-page-body h3[id]',
    '  --sidebarExpectedTab=Fumadocs UI',
    '  --sidebarExpectedCurrent=Accordion',
    '  --sidebarExpectedSeparators=Introduction,References,Components,Layouts',
    '  --chromePath=C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    '  --chromePort=9233',
    '  --retries=1',
    '  --settleMs=3200',
  ].join('\n')
}

function parseViewport(value) {
  const match = /^(?<width>\d+)x(?<height>\d+)$/.exec(value)

  if (!match?.groups) {
    throw new Error(`Invalid viewport: ${value}`)
  }

  return {
    width: Number(match.groups.width),
    height: Number(match.groups.height),
  }
}

function tokenForSelector(selector) {
  if (selector.startsWith('#')) {
    return `id="${selector.slice(1)}"`
  }

  if (selector.startsWith('.')) {
    return selector.slice(1)
  }

  return `<${selector}`
}

async function httpPreflight(options) {
  const checks = []
  let body = ''
  let status = 0

  try {
    const response = await fetch(options.url)
    status = response.status
    body = await response.text()
    checks.push({
      label: 'http 200',
      pass: response.ok,
      message: `received ${response.status}`,
    })
  } catch (error) {
    checks.push({
      label: 'fetch url',
      pass: false,
      message: error instanceof Error ? error.message : String(error),
    })
  }

  checks.push({
    label: 'minimum html size',
    pass: body.length >= options.minBytes,
    message: `received ${body.length} bytes`,
  })
  checks.push({
    label: 'not nuxt error page',
    pass: body.length > 0 && !body.includes('An error has occurred'),
    message: body.includes('An error has occurred')
      ? 'Nuxt error page detected'
      : 'no Nuxt error marker',
  })

  if (options.selector) {
    const token = tokenForSelector(options.selector)
    checks.push({
      label: `ssr selector ${options.selector}`,
      pass: body.includes(token),
      message: `looked for ${JSON.stringify(token)}`,
    })
  }

  return {
    status,
    bytes: body.length,
    checks,
  }
}

async function waitForChrome(port, attempts = 40) {
  for (let i = 0; i < attempts; i++) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/version`)

      if (response.ok) {
        return true
      }
    } catch {
      // Chrome is still starting.
    }

    await new Promise((resolve) => setTimeout(resolve, 125))
  }

  return false
}

async function startChrome(options) {
  const chromePath =
    options.chromePath || process.env.CHROME_PATH || DEFAULT_CHROME_PATH

  if (!existsSync(chromePath)) {
    throw new Error(`Chrome executable not found: ${chromePath}`)
  }

  const profile = await mkdtemp(join(tmpdir(), 'codex-parity-probe-'))
  const child = spawn(
    chromePath,
    [
      '--headless=new',
      `--remote-debugging-port=${options.chromePort}`,
      `--user-data-dir=${profile}`,
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      'about:blank',
    ],
    {
      stdio: 'ignore',
      windowsHide: true,
    },
  )

  if (!(await waitForChrome(options.chromePort))) {
    child.kill()
    throw new Error(`Chrome did not start on port ${options.chromePort}`)
  }

  return child
}

async function connectCdp(webSocketDebuggerUrl) {
  const ws = new WebSocket(webSocketDebuggerUrl)

  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true })
    ws.addEventListener('error', reject, { once: true })
  })

  let id = 0
  const pending = new Map()
  const events = []

  ws.addEventListener('message', (event) => {
    const message = JSON.parse(event.data)

    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id)
      pending.delete(message.id)

      if (message.error) {
        reject(new Error(JSON.stringify(message.error)))
      } else {
        resolve(message.result)
      }

      return
    }

    if (message.method) {
      events.push(message)
    }
  })

  return {
    events,
    send(method, params = {}) {
      const callId = ++id
      ws.send(JSON.stringify({ id: callId, method, params }))

      return new Promise((resolve, reject) => {
        pending.set(callId, { resolve, reject })
      })
    },
    close() {
      ws.close()
    },
  }
}

async function openCdpPage(options, viewport) {
  const target = await fetch(
    `http://127.0.0.1:${options.chromePort}/json/new?${encodeURIComponent('about:blank')}`,
    { method: 'PUT' },
  ).then((response) => response.json())
  const cdp = await connectCdp(target.webSocketDebuggerUrl)

  await cdp.send('Page.enable')
  await cdp.send('Runtime.enable')
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: 1,
    mobile: false,
  })
  await cdp.send('Page.navigate', { url: options.url })

  for (let i = 0; i < 80; i++) {
    if (cdp.events.some((event) => event.method === 'Page.loadEventFired')) {
      await new Promise((resolve) => setTimeout(resolve, 1800))
      return cdp
    }

    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  await new Promise((resolve) => setTimeout(resolve, 1800))
  return cdp
}

function createProbeExpression(options) {
  return `(async () => {
    const rectSelectors = ${JSON.stringify(options.rects)};
    const selector = ${JSON.stringify(options.selector)};
    const activeSelector = ${JSON.stringify(options.activeSelector)};
    const currentSelector = ${JSON.stringify(options.currentSelector)};
    const headingSelector = ${JSON.stringify(options.headingSelector)};
    const settleMs = ${JSON.stringify(options.settleMs)};

    const pick = (element) => {
      if (!element) return null;

      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();

      return {
        tag: element.tagName.toLowerCase(),
        id: element.id || null,
        className: typeof element.className === 'string' ? element.className : '',
        text: element.textContent?.trim().replace(/\\s+/g, ' ').slice(0, 120) || '',
        rect: {
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
          top: Math.round(rect.top),
          height: Math.round(rect.height),
        },
        style: {
          display: style.display,
          position: style.position,
          gridArea: style.gridArea,
          gridTemplateColumns: style.gridTemplateColumns,
          padding: style.padding,
          width: style.width,
          height: style.height,
          overflow: style.overflow,
        },
      };
    };

    const activeItems = () =>
      [...document.querySelectorAll(activeSelector)].map((element) => ({
        text: element.textContent?.trim().replace(/\\s+/g, ' ') || '',
        href: element.getAttribute('href'),
        current: element.getAttribute('aria-current'),
      }));
    const currentItems = () =>
      [...document.querySelectorAll(currentSelector)].map((element) => ({
        text: element.textContent?.trim().replace(/\\s+/g, ' ') || '',
        href: element.getAttribute('href'),
        current: element.getAttribute('aria-current'),
      }));
    const headings = () =>
      [...document.querySelectorAll(headingSelector)].map((element) => ({
        id: element.id,
        text: element.textContent?.trim().replace(/\\s+/g, ' ') || '',
        top: Math.round(element.getBoundingClientRect().top + scrollY),
      }));
    const tocPopover = () => {
      const root = document.querySelector('.docs-toc-popover');
      const surface = document.querySelector('.docs-toc-popover-surface');
      const trigger = document.querySelector('.docs-toc-popover-trigger');
      const panel = document.querySelector('.docs-toc-popover-panel');
      const progress = trigger?.querySelector('[role="progressbar"]');

      return {
        root: pick(root),
        surface: pick(surface),
        trigger: pick(trigger),
        triggerExpanded: trigger?.getAttribute('aria-expanded') || null,
        triggerState: trigger?.getAttribute('data-state') || null,
        progress: pick(progress),
        progressValue: progress?.getAttribute('aria-valuenow') || null,
        progressMax: progress?.getAttribute('aria-valuemax') || null,
        panel: pick(panel),
        panelHidden: panel?.hasAttribute('hidden') ?? null,
        panelState: panel?.getAttribute('data-state') || null,
        links: [...(panel?.querySelectorAll('a') ?? [])].map((element) => ({
          text: element.textContent?.trim().replace(/\\s+/g, ' ') || '',
          href: element.getAttribute('href'),
          current: element.getAttribute('aria-current'),
        })),
      };
    };

    const collect = (phase) => ({
      phase,
      url: location.href,
      title: document.title,
      scroll: {
        y: Math.round(scrollY),
        innerHeight,
        docHeight: document.documentElement.scrollHeight,
        bodyHeight: document.body.offsetHeight,
        bottomDelta: Math.round(
          document.documentElement.scrollHeight - scrollY - innerHeight,
        ),
      },
      root: pick(document.querySelector(selector)),
      rects: Object.fromEntries(
        rectSelectors.map((item) => [item, pick(document.querySelector(item))]),
      ),
      active: activeItems(),
      current: currentItems(),
      headings: headings(),
      tocPopover: tocPopover(),
    });

    const top = collect('top');
    document.querySelector('.docs-toc-popover-trigger')?.click();
    await new Promise((resolve) => setTimeout(resolve, 300));
    const popoverOpen = collect('popover-open');
    window.scrollTo(0, document.documentElement.scrollHeight);
    const startedAt = performance.now();

    while (performance.now() - startedAt < settleMs) {
      await new Promise((resolve) => setTimeout(resolve, 200));

      const bottomDelta = Math.round(
        document.documentElement.scrollHeight - scrollY - innerHeight,
      );
      const lastHeading = headings().at(-1);
      const current = currentItems().at(-1);

      if (bottomDelta === 0 && lastHeading && current?.href === '#' + lastHeading.id) {
        break;
      }
    }

    const bottom = collect('bottom');

    return { top, popoverOpen, bottom };
  })()`
}

function createSidebarProbeExpression(options) {
  return `(async () => {
    const rectSelectors = ${JSON.stringify(options.rects)};
    const selector = ${JSON.stringify(options.selector)};

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
          position: style.position,
          gridArea: style.gridArea,
          gridTemplateColumns: style.gridTemplateColumns,
          padding: style.padding,
          width: style.width,
          height: style.height,
          overflow: style.overflow,
          opacity: style.opacity,
          transform: style.transform,
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
      [...document.querySelectorAll('.docs-sidebar-tab-option')].map((element) => ({
        title: text(element.querySelector('.docs-sidebar-tab-option-title')),
        current: element.getAttribute('aria-current'),
      }));
    const collect = (phase) => ({
      phase,
      url: location.href,
      title: document.title,
      root: pick(document.querySelector(selector)),
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
}

function createCodeBlockProbeExpression(options) {
  return `(async () => {
    const rectSelectors = ${JSON.stringify(options.rects)};
    const selector = ${JSON.stringify(options.selector)};

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
          position: style.position,
          padding: style.padding,
          margin: style.margin,
          width: style.width,
          height: style.height,
          maxHeight: style.maxHeight,
          overflow: style.overflow,
          overflowX: style.overflowX,
          overflowY: style.overflowY,
          borderRadius: style.borderRadius,
          borderTopWidth: style.borderTopWidth,
          borderColor: style.borderColor,
          backgroundColor: style.backgroundColor,
          color: style.color,
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
          lineHeight: style.lineHeight,
        },
      };
    };

    const codeBlocks = () =>
      [...document.querySelectorAll('.fd-doc-code-block')].map((root, index) => {
        const header = root.querySelector('.fd-doc-code-block-header');
        const caption = root.querySelector('figcaption');
        const floating = root.querySelector('.fd-doc-code-block-floating-actions');
        const actions = root.querySelector('.fd-doc-code-block-actions');
        const copy = root.querySelector('.fd-doc-code-copy');
        const body = root.querySelector('.fd-doc-code-block-body');
        const pre = root.querySelector('pre');
        const code = root.querySelector('pre code, .fd-doc-code-block-body > code');
        const icon = root.querySelector('.fd-doc-code-block-icon');
        const highlighted = root.querySelectorAll('.highlighted, .highlighted-word, .diff');
        const highlightedWords = root.querySelectorAll('.highlighted-word');
        const lines = root.querySelectorAll('.line');
        const firstLine = root.querySelector('.line');
        const tokenColors = [
          ...root.querySelectorAll('.line span:not(.highlighted-word)'),
        ]
          .map((element) => ({
            text: text(element),
            color: getComputedStyle(element).color,
          }))
          .filter((item) => item.text && item.color);
        const distinctTokenColors = new Set(
          tokenColors.map((item) => item.color),
        );

        return {
          index,
          root: pick(root),
          header: pick(header),
          caption: pick(caption),
          floating: pick(floating),
          actions: pick(actions),
          copy: pick(copy),
          body: pick(body),
          pre: pick(pre),
          code: pick(code),
          icon: pick(icon),
          firstLine: pick(firstLine),
          dir: root.getAttribute('dir'),
          tabIndex: root.getAttribute('tabindex'),
          bodyRole: body?.getAttribute('role') || null,
          bodyTabIndex: body?.getAttribute('tabindex'),
          copyAria: copy?.getAttribute('aria-label') || null,
          lineNumbers: root.hasAttribute('data-line-numbers'),
          highlightedCount: highlighted.length,
          highlightedWordCount: highlightedWords.length,
          lineCount: lines.length,
          markerVisible: root.textContent.includes('[!code'),
          distinctTokenColorCount: distinctTokenColors.size,
          tokenColorSample: Array.from(distinctTokenColors).slice(0, 6),
          scroll: body
            ? {
                clientWidth: Math.round(body.clientWidth),
                scrollWidth: Math.round(body.scrollWidth),
                clientHeight: Math.round(body.clientHeight),
                scrollHeight: Math.round(body.scrollHeight),
              }
            : null,
        };
      });

    const tabs = () =>
      [...document.querySelectorAll('.fd-doc-code-tabs')].map((root, index) => {
        const triggers = [...root.querySelectorAll('.fd-doc-tab-trigger')].map(
          (element) => ({
            text: text(element),
            state: element.getAttribute('data-state'),
            selected: element.getAttribute('aria-selected'),
          }),
        );
        const panels = [...root.querySelectorAll('.fd-doc-tab-panel')].map(
          (element) => ({
            state: element.getAttribute('data-state'),
            hidden: element.hasAttribute('hidden'),
          }),
        );

        return {
          index,
          root: pick(root),
          list: pick(root.querySelector('.fd-doc-tabs-list')),
          triggers,
          panels,
        };
      });

    const collect = (phase) => ({
      phase,
      url: location.href,
      title: document.title,
      root: pick(document.querySelector(selector)),
      rects: Object.fromEntries(
        rectSelectors.map((item) => [item, pick(document.querySelector(item))]),
      ),
      headings: [...document.querySelectorAll('.docs-page-body h2[id], .docs-page-body h3[id]')]
        .map((element) => ({
          id: element.id,
          text: text(element),
        })),
      preview: pick(document.querySelector('.fd-doc-preview')),
      install: pick(document.querySelector('.fd-doc-install-card')),
      codeBlocks: codeBlocks(),
      tabs: tabs(),
    });

    const top = collect('top');
    const secondTab = document.querySelectorAll('.fd-doc-code-tabs .fd-doc-tab-trigger').item(1);
    if (secondTab) {
      secondTab.scrollIntoView({ block: 'center', inline: 'center' });
      await wait(120);
      secondTab.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'mouse' }));
      secondTab.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      secondTab.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
      secondTab.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    }
    await wait(320);
    const switched = collect('tab-switched');

    return { top, switched };
  })()`
}

function createContentComponentsProbeExpression(options) {
  return `(async () => {
    const rectSelectors = ${JSON.stringify(options.rects)};
    const selector = ${JSON.stringify(options.selector)};

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
        text: text(element).slice(0, 160),
        rect: {
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
          top: Math.round(rect.top),
          height: Math.round(rect.height),
        },
        style: {
          display: style.display,
          flexDirection: style.flexDirection,
          gridTemplateColumns: style.gridTemplateColumns,
          gap: style.gap,
          flexWrap: style.flexWrap,
          alignItems: style.alignItems,
          padding: style.padding,
          margin: style.margin,
          width: style.width,
          height: style.height,
          overflow: style.overflow,
          overflowX: style.overflowX,
          borderRadius: style.borderRadius,
          borderTopWidth: style.borderTopWidth,
          borderBottomWidth: style.borderBottomWidth,
          borderLeftWidth: style.borderLeftWidth,
          borderColor: style.borderColor,
          backgroundColor: style.backgroundColor,
          color: style.color,
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
          lineHeight: style.lineHeight,
          boxShadow: style.boxShadow,
        },
      };
    };

    const callouts = () =>
      [...document.querySelectorAll('.fd-callout')].map((root, index) => ({
        index,
        root: pick(root),
        bar: pick(root.querySelector('.fd-callout-bar')),
        icon: pick(root.querySelector('.fd-callout-icon')),
        content: pick(root.querySelector('.fd-callout-content')),
        title: pick(root.querySelector('.fd-callout-title')),
        body: pick(root.querySelector('.fd-callout-body')),
      }));

    const tabs = () =>
      [...document.querySelectorAll('.fd-doc-tabs:not(.fd-doc-code-tabs)')].map(
        (root, index) => ({
          index,
          root: pick(root),
          list: pick(root.querySelector('.fd-doc-tabs-list')),
          triggers: [...root.querySelectorAll('.fd-doc-tab-trigger')].map(
            (element) => ({
              root: pick(element),
              text: text(element),
              state: element.getAttribute('data-state'),
              selected: element.getAttribute('aria-selected'),
            }),
          ),
          panels: [...root.querySelectorAll('.fd-doc-tab-panel')].map(
            (element) => ({
              root: pick(element),
              state: element.getAttribute('data-state'),
              hidden: element.hasAttribute('hidden'),
            }),
          ),
        }),
      );

    const accordions = () =>
      [...document.querySelectorAll('.fd-doc-accordions')].map((root, index) => ({
        index,
        root: pick(root),
        items: [...root.querySelectorAll('.fd-doc-accordion-item')].map(
          (element) => {
            const trigger = element.querySelector('.fd-doc-accordion-trigger');
            const panel = element.querySelector('.fd-doc-accordion-panel');

            return {
              root: pick(element),
              trigger: pick(trigger),
              copy: pick(element.querySelector('.fd-doc-accordion-copy')),
              panel: pick(panel),
              state: element.getAttribute('data-state'),
              value: element.getAttribute('data-accordion-value'),
              triggerExpanded: trigger?.getAttribute('aria-expanded') || null,
              panelHidden: panel?.getAttribute('hidden') || null,
              panelRole: panel?.getAttribute('role') || null,
            };
          },
        ),
      }));

    const files = () =>
      [...document.querySelectorAll('.fd-doc-files')].map((root, index) => ({
        index,
        root: pick(root),
        rows: [...root.querySelectorAll('.fd-doc-file,.fd-doc-folder-trigger')].map(
          (element) => pick(element),
        ),
        folderContent: pick(root.querySelector('.fd-doc-folder-content')),
      }));

    const inlineTocs = () =>
      [...document.querySelectorAll('.fd-doc-inline-toc')].map((root, index) => ({
        index,
        root: pick(root),
        trigger: pick(root.querySelector('.fd-doc-inline-toc-trigger')),
        content: pick(root.querySelector('.fd-doc-inline-toc-content')),
        expanded:
          root
            .querySelector('.fd-doc-inline-toc-trigger')
            ?.getAttribute('aria-expanded') || null,
        links: [...root.querySelectorAll('.fd-doc-inline-toc-link')].map(
          (element) => ({
            root: pick(element),
            href: element.getAttribute('href'),
            paddingInlineStart: getComputedStyle(element).paddingInlineStart,
          }),
        ),
      }));

    const typeTables = () =>
      [...document.querySelectorAll('.fd-doc-type-table')].map((root, index) => ({
        index,
        root: pick(root),
        head: pick(root.querySelector('.fd-doc-type-table-head')),
        rows: [...root.querySelectorAll('.fd-doc-type-row')].map((element) => {
          const trigger = element.querySelector('.fd-doc-type-trigger');
          const details = element.querySelector('.fd-doc-type-details');

          return {
            root: pick(element),
            trigger: pick(trigger),
            prop: pick(element.querySelector('.fd-doc-type-prop')),
            value: pick(element.querySelector('.fd-doc-type-value')),
            details: pick(details),
            open: element.getAttribute('data-open'),
            expanded: trigger?.getAttribute('aria-expanded') || null,
            detailsVisible: details ? getComputedStyle(details).display !== 'none' : false,
          };
        }),
      }));

    const collect = (phase) => ({
      phase,
      url: location.href,
      title: document.title,
      root: pick(document.querySelector(selector)),
      rects: Object.fromEntries(
        rectSelectors.map((item) => [item, pick(document.querySelector(item))]),
      ),
      callouts: callouts(),
      tabs: tabs(),
      accordions: accordions(),
      files: files(),
      inlineTocs: inlineTocs(),
      typeTables: typeTables(),
    });

    const top = collect('top');

    const secondTab = document
      .querySelectorAll('.fd-doc-tabs:not(.fd-doc-code-tabs) .fd-doc-tab-trigger')
      .item(1);
    secondTab?.click();
    await wait(180);
    const tabSwitched = collect('tab-switched');

    const secondAccordion = document
      .querySelectorAll('.fd-doc-accordion-trigger')
      .item(1);
    secondAccordion?.click();
    await wait(220);
    const accordionOpened = collect('accordion-opened');

    const firstTypeTrigger = document.querySelector('.fd-doc-type-trigger');
    firstTypeTrigger?.click();
    await wait(180);
    const typeOpened = collect('type-opened');

    return { top, tabSwitched, accordionOpened, typeOpened };
  })()`
}

function createPageActionsProbeExpression(options) {
  return `(async () => {
    const rectSelectors = ${JSON.stringify(options.rects)};
    const selector = ${JSON.stringify(options.selector)};

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
        text: text(element).slice(0, 180),
        rect: {
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
          top: Math.round(rect.top),
          height: Math.round(rect.height),
        },
        style: {
          display: style.display,
          gridTemplateColumns: style.gridTemplateColumns,
          flexDirection: style.flexDirection,
          flexWrap: style.flexWrap,
          alignItems: style.alignItems,
          justifyContent: style.justifyContent,
          gap: style.gap,
          padding: style.padding,
          margin: style.margin,
          width: style.width,
          minHeight: style.minHeight,
          overflow: style.overflow,
          borderRadius: style.borderRadius,
          borderTopWidth: style.borderTopWidth,
          borderBottomWidth: style.borderBottomWidth,
          borderColor: style.borderColor,
          backgroundColor: style.backgroundColor,
          color: style.color,
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
          lineHeight: style.lineHeight,
        },
      };
    };

    const pageActions = () => {
      const root = document.querySelector(selector);
      const openTrigger = document.querySelector('.docs-page-open-trigger');
      const popover = document.querySelector('.docs-page-open-popover');

      return {
        root: pick(root),
        copy: pick(document.querySelector('.docs-page-action[aria-label*="Copy"]')),
        openTrigger: pick(openTrigger),
        openExpanded: openTrigger?.getAttribute('aria-expanded') || null,
        openState: openTrigger?.getAttribute('data-state') || null,
        popover: pick(popover),
        options: [...document.querySelectorAll('.docs-page-open-option')].map(
          (element) => ({
            root: pick(element),
            href: element.getAttribute('href'),
            target: element.getAttribute('target'),
          }),
        ),
      };
    };

    const feedback = () => {
      const root = document.querySelector('.docs-feedback');
      const buttons = [...document.querySelectorAll('.docs-feedback-button')].map(
        (element) => ({
          root: pick(element),
          pressed: element.getAttribute('data-pressed'),
          ariaPressed: element.getAttribute('aria-pressed'),
        }),
      );

      return {
        root: pick(root),
        prompt: pick(document.querySelector('.docs-feedback-prompt')),
        buttons,
        thanks: pick(document.querySelector('.docs-feedback-thanks')),
      };
    };

    const pager = () => {
      const root = document.querySelector('.docs-pager');

      return {
        root: pick(root),
        links: [...document.querySelectorAll('.docs-pager-link')].map(
          (element) => ({
            root: pick(element),
            title: pick(element.querySelector('.docs-pager-title')),
            description: pick(element.querySelector('.docs-pager-description')),
            icon: pick(element.querySelector('.docs-pager-icon')),
            href: element.getAttribute('href'),
          }),
        ),
        spacers: [...document.querySelectorAll('.docs-pager-spacer')].length,
      };
    };

    const collect = (phase) => ({
      phase,
      url: location.href,
      title: document.title,
      root: pick(document.querySelector(selector)),
      rects: Object.fromEntries(
        rectSelectors.map((item) => [item, pick(document.querySelector(item))]),
      ),
      preview: {
        root: pick(document.querySelector('.fd-doc-preview')),
        canvas: pick(document.querySelector('.fd-doc-preview-canvas')),
        description: pick(document.querySelector('.fd-doc-preview-description')),
        source: pick(document.querySelector('.fd-doc-preview-source')),
        codeBlock: pick(
          document.querySelector('.fd-doc-preview-source .fd-doc-code-block'),
        ),
        rawComponents: [
          ...document.querySelectorAll(
            '.fd-doc-preview doccodeblock,.fd-doc-preview previewcounter',
          ),
        ].map((element) => element.tagName.toLowerCase()),
      },
      pageActions: pageActions(),
      feedback: feedback(),
      pager: pager(),
      footer: pick(document.querySelector('.docs-page-footer')),
    });

    const top = collect('top');

    document.querySelector('.docs-page-open-trigger')?.click();
    await wait(220);
    const openMenu = collect('open-menu');

    document.querySelector('.docs-feedback-button')?.click();
    await wait(180);
    const feedbackSelected = collect('feedback-selected');

    return { top, openMenu, feedbackSelected };
  })()`
}

async function evaluate(cdp, expression) {
  const result = await cdp.send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
  })

  if (result.exceptionDetails) {
    throw new Error(JSON.stringify(result.exceptionDetails))
  }

  return result.result.value
}

async function captureViewport(options, viewportValue) {
  const viewport = parseViewport(viewportValue)
  const cdp = await openCdpPage(options, viewport)

  try {
    return {
      viewport,
      data: await evaluate(
        cdp,
        options.profile === 'sidebar'
          ? createSidebarProbeExpression(options)
          : options.profile === 'code-block'
            ? createCodeBlockProbeExpression(options)
            : options.profile === 'content-components'
              ? createContentComponentsProbeExpression(options)
              : options.profile === 'page-actions'
                ? createPageActionsProbeExpression(options)
                : createProbeExpression(options),
      ),
    }
  } finally {
    cdp.close()
  }
}

async function runRuntimeProbe(options, preflightChecks) {
  const report = {
    options,
    checks: [...preflightChecks],
    captures: [],
  }
  const chrome = await startChrome(options)

  try {
    for (const viewportValue of options.viewports) {
      report.captures.push(await captureViewport(options, viewportValue))
    }
  } finally {
    chrome.kill()
  }

  summarize(report)

  return report
}

function addCheck(checks, check) {
  checks.push(check)
}

function cssPx(value) {
  return Number.parseFloat(String(value ?? '').replace('px', ''))
}

function cssPxNear(value, expected, tolerance = 0.75) {
  const actual = cssPx(value)

  return Number.isFinite(actual) && Math.abs(actual - expected) <= tolerance
}

function summarize(report) {
  if (report.options.profile === 'sidebar') {
    summarizeSidebar(report)
    return
  }

  if (report.options.profile === 'code-block') {
    summarizeCodeBlock(report)
    return
  }

  if (report.options.profile === 'content-components') {
    summarizeContentComponents(report)
    return
  }

  if (report.options.profile === 'page-actions') {
    summarizePageActions(report)
    return
  }

  for (const capture of report.captures) {
    const { viewport, data } = capture
    const width = viewport.width
    const target = data.top.root

    addCheck(report.checks, {
      label: `${width}px runtime selector ${report.options.selector}`,
      pass: Boolean(target),
      message: target ? `${target.rect.width}px wide` : 'missing',
    })

    if (width >= 1280) {
      addCheck(report.checks, {
        label: `${width}px desktop toc visible`,
        pass: Boolean(target) && target.style.display !== 'none' && target.rect.width > 0,
        message: target
          ? `display=${target.style.display}, width=${target.rect.width}`
          : 'missing',
      })
    }

    if (width < 1280) {
      const topPopover = data.top.tocPopover
      const openPopover = data.popoverOpen.tocPopover
      const trigger = openPopover.trigger
      const panel = openPopover.panel

      addCheck(report.checks, {
        label: `${width}px toc popover visible`,
        pass:
          Boolean(topPopover.root) &&
          topPopover.root.style.display !== 'none' &&
          topPopover.root.rect.width > 0,
        message: topPopover.root
          ? `display=${topPopover.root.style.display}, width=${topPopover.root.rect.width}`
          : 'missing',
      })

      addCheck(report.checks, {
        label: `${width}px toc popover closed by default`,
        pass:
          topPopover.triggerExpanded === 'false' &&
          topPopover.panel?.style.display === 'none',
        message: `expanded=${topPopover.triggerExpanded}, panelDisplay=${
          topPopover.panel?.style.display ?? 'missing'
        }`,
      })

      addCheck(report.checks, {
        label: `${width}px toc popover opens inline`,
        pass:
          openPopover.triggerExpanded === 'true' &&
          panel?.style.display !== 'none' &&
          panel?.style.position === 'static' &&
          panel?.rect.left === openPopover.root?.rect.left &&
          panel?.rect.top === (trigger?.rect.top ?? 0) + (trigger?.rect.height ?? 0),
        message: `expanded=${openPopover.triggerExpanded}, display=${
          panel?.style.display ?? 'missing'
        }, position=${panel?.style.position ?? 'missing'}, left=${
          panel?.rect.left ?? 'missing'
        }, top=${panel?.rect.top ?? 'missing'}`,
      })

      addCheck(report.checks, {
        label: `${width}px toc popover progressbar`,
        pass:
          openPopover.progress?.tag === 'svg' &&
          openPopover.progressValue !== null &&
          openPopover.progressMax === '1',
        message: openPopover.progress
          ? `tag=${openPopover.progress.tag}, value=${openPopover.progressValue}, max=${openPopover.progressMax}`
          : 'missing',
      })

      addCheck(report.checks, {
        label: `${width}px toc popover links available`,
        pass: openPopover.links.length > 0,
        message: `links=${openPopover.links.length}`,
      })
    }

    const shell = data.top.rects['.docs-shell-body']

    if (shell) {
      addCheck(report.checks, {
        label: `${width}px shell grid captured`,
        pass: Boolean(shell.style.gridTemplateColumns),
        message: shell.style.gridTemplateColumns || 'missing',
      })
    }

    const lastHeading = data.bottom.headings.at(-1)
    const bottomCurrent = data.bottom.current.at(-1)

    if (lastHeading && width >= 1280) {
      addCheck(report.checks, {
        label: `${width}px bottom current reaches last heading`,
        pass: bottomCurrent?.href === `#${lastHeading.id}`,
        message: `current=${bottomCurrent?.href ?? 'none'}, last=#${lastHeading.id}`,
      })
    }
  }
}

function summarizeContentComponents(report) {
  for (const capture of report.captures) {
    const { viewport, data } = capture
    const width = viewport.width
    const top = data.top
    const callouts = top.callouts
    const tabs = top.tabs[0]
    const activeTab = tabs?.triggers.find((item) => item.state === 'active')
    const inactivePanels = tabs?.panels.filter((item) => item.state === 'inactive') ?? []
    const switchedTab = data.tabSwitched.tabs[0]?.triggers.find(
      (item) => item.text === 'Code',
    )
    const accordion = top.accordions[0]
    const closedAccordion = accordion?.items.find((item) => item.state === 'closed')
    const openedAccordion = data.accordionOpened.accordions[0]?.items.find(
      (item) => item.value === 'why-not-vitepress',
    )
    const files = top.files[0]
    const inlineToc = top.inlineTocs[0]
    const typeTable = top.typeTables[0]
    const openedTypeRow = data.typeOpened.typeTables[0]?.rows.find(
      (item) => item.expanded === 'true',
    )

    addCheck(report.checks, {
      label: `${width}px runtime selector ${report.options.selector}`,
      pass: Boolean(top.root),
      message: top.root ? `${top.root.rect.width}px wide` : 'missing',
    })

    addCheck(report.checks, {
      label: `${width}px callout contract`,
      pass:
        callouts.length >= 2 &&
        callouts.every(
          (item) =>
            item.root?.style.display === 'flex' &&
            item.root?.style.alignItems === 'stretch' &&
            cssPxNear(item.root?.style.lineHeight, 20, 1) &&
            item.bar?.rect.width <= 3 &&
            Math.abs((item.bar?.rect.height ?? 0) - (item.content?.rect.height ?? 0)) <=
              1 &&
            cssPxNear(item.icon?.style.width, 20, 1) &&
            item.icon?.rect.height <= 21 &&
            (!item.title || item.title.style.margin === '0px') &&
            item.title?.style.fontWeight !== '700',
        ),
      message:
        callouts.length === 0
          ? 'missing'
          : callouts
              .map(
                (item) =>
                  `${item.index}:display=${item.root?.style.display},align=${item.root?.style.alignItems},line=${item.root?.style.lineHeight},bar=${item.bar?.rect.width}x${item.bar?.rect.height},contentH=${item.content?.rect.height},icon=${item.icon?.style.width}x${item.icon?.rect.height},titleMargin=${item.title?.style.margin},titleWeight=${item.title?.style.fontWeight}`,
              )
              .join('; '),
    })

    addCheck(report.checks, {
      label: `${width}px tabs list rhythm`,
      pass:
        Boolean(tabs) &&
        tabs.root?.style.display === 'flex' &&
        tabs.list?.style.flexWrap === 'nowrap' &&
        tabs.list?.style.overflowX !== 'visible' &&
        activeTab?.root?.style.borderBottomWidth !== '0px',
      message: tabs
        ? `root=${tabs.root?.style.display}, wrap=${tabs.list?.style.flexWrap}, overflowX=${tabs.list?.style.overflowX}, active=${activeTab?.text ?? 'none'}, border=${activeTab?.root?.style.borderBottomWidth ?? 'missing'}`
        : 'missing',
    })

    addCheck(report.checks, {
      label: `${width}px tabs state switches`,
      pass:
        switchedTab?.state === 'active' &&
        switchedTab?.selected === 'true' &&
        inactivePanels.some((item) => item.hidden),
      message: `code=${switchedTab?.state ?? 'missing'}/${switchedTab?.selected ?? 'missing'}, inactiveHidden=${inactivePanels
        .map((item) => item.hidden)
        .join(',')}`,
    })

    addCheck(report.checks, {
      label: `${width}px accordion protocol`,
      pass:
        Boolean(accordion) &&
        accordion.items.length >= 3 &&
        closedAccordion?.panelHidden === 'until-found' &&
        accordion.items.some((item) => item.copy),
      message: accordion
        ? `items=${accordion.items.length}, closedHidden=${closedAccordion?.panelHidden ?? 'missing'}, copy=${accordion.items.some((item) => item.copy)}`
        : 'missing',
    })

    addCheck(report.checks, {
      label: `${width}px accordion opens clicked item`,
      pass:
        openedAccordion?.state === 'open' &&
        openedAccordion?.triggerExpanded === 'true' &&
        openedAccordion?.panelRole === 'region',
      message: openedAccordion
        ? `state=${openedAccordion.state}, expanded=${openedAccordion.triggerExpanded}, role=${openedAccordion.panelRole}`
        : 'missing',
    })

    addCheck(report.checks, {
      label: `${width}px files tree density`,
      pass:
        Boolean(files) &&
        files.rows.length >= 4 &&
        files.folderContent?.style.borderLeftWidth === '1px',
      message: files
        ? `rows=${files.rows.length}, folderBorder=${files.folderContent?.style.borderLeftWidth ?? 'missing'}`
        : 'missing',
    })

    addCheck(report.checks, {
      label: `${width}px inline toc contract`,
      pass:
        Boolean(inlineToc) &&
        inlineToc.expanded === 'true' &&
        inlineToc.links.length >= 3 &&
        inlineToc.links.every((item) => item.root?.style.borderLeftWidth === '1px'),
      message: inlineToc
        ? `expanded=${inlineToc.expanded}, links=${inlineToc.links.length}, border=${inlineToc.links[0]?.root?.style.borderLeftWidth ?? 'missing'}`
        : 'missing',
    })

    addCheck(report.checks, {
      label: `${width}px type table rendered`,
      pass:
        Boolean(typeTable) &&
        typeTable.rows.length >= 2 &&
        typeTable.root?.style.display === 'flex' &&
        typeTable.head?.style.display === 'flex',
      message: typeTable
        ? `rows=${typeTable.rows.length}, root=${typeTable.root?.style.display}, head=${typeTable.head?.style.display}`
        : 'missing',
    })

    addCheck(report.checks, {
      label: `${width}px type table expands details`,
      pass:
        openedTypeRow?.expanded === 'true' &&
        openedTypeRow?.detailsVisible &&
        openedTypeRow?.details?.style.display === 'grid',
      message: openedTypeRow
        ? `expanded=${openedTypeRow.expanded}, visible=${openedTypeRow.detailsVisible}, display=${openedTypeRow.details?.style.display}`
        : 'missing',
    })
  }
}

function summarizePageActions(report) {
  for (const capture of report.captures) {
    const { viewport, data } = capture
    const width = viewport.width
    const top = data.top
    const openMenu = data.openMenu
    const feedbackSelected = data.feedbackSelected
    const actions = top.pageActions
    const pager = top.pager

    addCheck(report.checks, {
      label: `${width}px runtime selector ${report.options.selector}`,
      pass: Boolean(top.root),
      message: top.root ? `${top.root.rect.width}px wide` : 'missing',
    })

    addCheck(report.checks, {
      label: `${width}px preview frame`,
      pass:
        Boolean(top.preview.root) &&
        Boolean(top.preview.canvas) &&
        Boolean(top.preview.source) &&
        Boolean(top.preview.codeBlock) &&
        top.preview.rawComponents.length === 0 &&
        top.preview.root.style.overflow === 'hidden',
      message: top.preview.root
        ? `canvas=${Boolean(top.preview.canvas)}, source=${Boolean(top.preview.source)}, code=${Boolean(top.preview.codeBlock)}, raw=${top.preview.rawComponents.join('/') || 'none'}, overflow=${top.preview.root.style.overflow}`
        : 'missing',
    })

    addCheck(report.checks, {
      label: `${width}px page actions visible`,
      pass:
        Boolean(actions.root) &&
        Boolean(actions.copy) &&
        Boolean(actions.openTrigger) &&
        actions.copy.text.includes('Copy Markdown'),
      message: actions.root
        ? `copy=${actions.copy?.text ?? 'missing'}, open=${actions.openTrigger?.text ?? 'missing'}`
        : 'missing',
    })

    addCheck(report.checks, {
      label: `${width}px open menu expands`,
      pass:
        openMenu.pageActions.openExpanded === 'true' &&
        openMenu.pageActions.openState === 'open' &&
        Boolean(openMenu.pageActions.popover) &&
        openMenu.pageActions.options.length > 0,
      message: `expanded=${openMenu.pageActions.openExpanded}, state=${openMenu.pageActions.openState}, options=${openMenu.pageActions.options.length}`,
    })

    addCheck(report.checks, {
      label: `${width}px feedback controls`,
      pass:
        Boolean(top.feedback.root) &&
        top.feedback.buttons.length === 2 &&
        feedbackSelected.feedback.buttons.some(
          (item) => item.pressed === 'true' || item.ariaPressed === 'true',
        ) &&
        Boolean(feedbackSelected.feedback.thanks),
      message: top.feedback.root
        ? `buttons=${top.feedback.buttons.length}, selected=${feedbackSelected.feedback.buttons
            .map((item) => item.pressed || item.ariaPressed || 'false')
            .join('/')}, thanks=${Boolean(feedbackSelected.feedback.thanks)}`
        : 'missing',
    })

    addCheck(report.checks, {
      label: `${width}px pager items`,
      pass:
        Boolean(pager.root) &&
        pager.links.length >= 1 &&
        pager.links.every((item) => item.href && item.title && item.icon),
      message: pager.root
        ? `links=${pager.links.length}, spacers=${pager.spacers}, titles=${pager.links
            .map((item) => item.title?.text || 'missing')
            .join('/')}, icons=${pager.links
            .map((item) => Boolean(item.icon))
            .join('/')}`
        : 'missing',
    })
  }
}

function summarizeCodeBlock(report) {
  for (const capture of report.captures) {
    const { viewport, data } = capture
    const width = viewport.width
    const blocks = data.top.codeBlocks
    const titled = blocks.find((block) => block.header && block.caption)
    const untitled = blocks.find((block) => !block.header && block.floating)
    const highlighted = blocks.find((block) => block.highlightedCount > 0)
    const highlightedWord = blocks.find((block) => block.highlightedWordCount > 0)
    const markerLeaks = blocks.filter((block) => block.markerVisible)
    const missingPreBlocks = blocks.filter((block) => block.lineCount > 0 && !block.pre)
    const collapsedTokenBlocks = blocks.filter(
      (block) => block.lineCount > 0 && block.distinctTokenColorCount < 2,
    )
    const brokenLineNumberedBlocks = blocks.filter(
      (block) => block.lineNumbers && block.lineCount === 0,
    )
    const highlightedBlocks = blocks.filter((block) => block.lineCount > 0)
    const wrongThemeBlocks = highlightedBlocks.filter(
      (block) =>
        !block.root?.className.includes('catppuccin-latte') ||
        !block.root?.className.includes('catppuccin-mocha'),
    )
    const paddedPreBlocks = highlightedBlocks.filter(
      (block) =>
        block.pre?.style.padding !== '0px' ||
        block.pre?.style.backgroundColor !== 'rgba(0, 0, 0, 0)',
    )
    const wrongCodeScaleBlocks = highlightedBlocks.filter(
      (block) =>
        !cssPxNear(block.code?.style.fontSize, 13) ||
        !cssPxNear(block.firstLine?.style.lineHeight, 18.57),
    )
    const heavyHeaderCopyBlocks = blocks.filter(
      (block) =>
        block.header &&
        block.copy &&
        (block.copy.rect.height > 26 ||
          block.copy.style.borderTopWidth !== '0px' ||
          block.copy.style.backgroundColor !== 'rgba(0, 0, 0, 0)'),
    )
    const first = blocks[0]
    const headingTexts = data.top.headings.map((item) => item.text)

    addCheck(report.checks, {
      label: `${width}px code blocks present`,
      pass: blocks.length >= 3,
      message: `blocks=${blocks.length}`,
    })

    addCheck(report.checks, {
      label: `${width}px code root contract`,
      pass:
        first?.root?.tag === 'figure' &&
        first.dir === 'ltr' &&
        first.tabIndex === '-1' &&
        first.root.className.includes('shiki') &&
        first.root.className.includes('not-prose'),
      message: first
        ? `tag=${first.root?.tag}, dir=${first.dir}, tabindex=${first.tabIndex}, class=${first.root?.className}`
        : 'missing',
    })

    addCheck(report.checks, {
      label: `${width}px code theme contract`,
      pass: wrongThemeBlocks.length === 0,
      message:
        wrongThemeBlocks.length === 0
          ? 'highlighted blocks use catppuccin-latte/mocha'
          : `wrong theme blocks=${wrongThemeBlocks
              .map((block) => `${block.index}:${block.root?.className}`)
              .join('; ')}`,
    })

    addCheck(report.checks, {
      label: `${width}px code viewport accessible`,
      pass:
        blocks.every((block) => block.bodyRole === 'region') &&
        blocks.every((block) => block.bodyTabIndex === '0') &&
        blocks.every((block) => block.body?.style.overflow !== 'visible'),
      message: blocks
        .map(
          (block) =>
            `${block.index}:role=${block.bodyRole},tab=${block.bodyTabIndex},overflow=${block.body?.style.overflow ?? 'missing'}`,
        )
        .join('; '),
    })

    addCheck(report.checks, {
      label: `${width}px preview wrapper present`,
      pass:
        Boolean(data.top.preview) &&
        data.top.preview.style.display !== 'none' &&
        data.top.preview.rect.width > 0,
      message: data.top.preview
        ? `display=${data.top.preview.style.display}, width=${data.top.preview.rect.width}`
        : 'missing',
    })

    addCheck(report.checks, {
      label: `${width}px install card present`,
      pass:
        Boolean(data.top.install) &&
        data.top.install.style.display !== 'none' &&
        data.top.install.text.includes('@fumadocs/cli'),
      message: data.top.install
        ? `display=${data.top.install.style.display}, text=${data.top.install.text}`
        : 'missing',
    })

    addCheck(report.checks, {
      label: `${width}px component page headings`,
      pass:
        headingTexts.includes('Usage') &&
        headingTexts.includes('Keep Background') &&
        headingTexts.includes('Icons'),
      message: headingTexts.join(', '),
    })

    addCheck(report.checks, {
      label: `${width}px titled code header`,
      pass:
        Boolean(titled?.header && titled.caption && titled.copy) &&
        titled.caption.text === 'config.js' &&
        titled.header.text === titled.caption.text &&
        titled.caption.style.margin === '0px' &&
        titled.caption.style.fontWeight === '400',
      message: titled
        ? `header=${titled.header?.text || 'none'}, caption=${titled.caption?.text || 'none'}, margin=${titled.caption?.style.margin}, weight=${titled.caption?.style.fontWeight}, copy=${Boolean(titled.copy)}`
        : 'missing',
    })

    addCheck(report.checks, {
      label: `${width}px code typography density`,
      pass: wrongCodeScaleBlocks.length === 0,
      message:
        wrongCodeScaleBlocks.length === 0
          ? 'code font-size and line-height match compact profile'
          : `wrong scale blocks=${wrongCodeScaleBlocks
              .map(
                (block) =>
                  `${block.index}:font=${block.code?.style.fontSize},line=${block.firstLine?.style.lineHeight}`,
              )
              .join('; ')}`,
    })

    addCheck(report.checks, {
      label: `${width}px pre wrapper is neutral`,
      pass: paddedPreBlocks.length === 0,
      message:
        paddedPreBlocks.length === 0
          ? 'pre wrappers have no padding/background'
          : `padded pre blocks=${paddedPreBlocks
              .map(
                (block) =>
                  `${block.index}:padding=${block.pre?.style.padding},bg=${block.pre?.style.backgroundColor}`,
              )
              .join('; ')}`,
    })

    addCheck(report.checks, {
      label: `${width}px titled code icon`,
      pass: Boolean(titled?.icon?.tag === 'svg' && titled.icon.rect.width > 0),
      message: titled?.icon
        ? `tag=${titled.icon.tag}, width=${titled.icon.rect.width}`
        : 'missing',
    })

    addCheck(report.checks, {
      label: `${width}px untitled floating copy`,
      pass: Boolean(untitled?.floating && untitled.copy),
      message: untitled
        ? `floating=${Boolean(untitled.floating)}, copy=${Boolean(untitled.copy)}`
        : 'missing',
    })

    addCheck(report.checks, {
      label: `${width}px header copy button weight`,
      pass: heavyHeaderCopyBlocks.length === 0,
      message:
        heavyHeaderCopyBlocks.length === 0
          ? 'header copy buttons are compact and transparent'
          : `heavy copy blocks=${heavyHeaderCopyBlocks
              .map(
                (block) =>
                  `${block.index}:h=${block.copy.rect.height},border=${block.copy.style.borderTopWidth},bg=${block.copy.style.backgroundColor}`,
              )
              .join('; ')}`,
    })

    addCheck(report.checks, {
      label: `${width}px highlighted code markers`,
      pass: Boolean(highlighted),
      message: highlighted
        ? `block=${highlighted.index}, markers=${highlighted.highlightedCount}`
        : 'missing highlighted markers',
    })

    addCheck(report.checks, {
      label: `${width}px highlighted word marker`,
      pass: Boolean(highlightedWord),
      message: highlightedWord
        ? `block=${highlightedWord.index}, words=${highlightedWord.highlightedWordCount}`
        : 'missing highlighted word',
    })

    addCheck(report.checks, {
      label: `${width}px notation markers removed`,
      pass: markerLeaks.length === 0,
      message:
        markerLeaks.length === 0
          ? 'no notation text leaked'
          : `leaked blocks=${markerLeaks.map((block) => block.index).join(',')}`,
    })

    addCheck(report.checks, {
      label: `${width}px highlighted code uses pre wrapper`,
      pass: missingPreBlocks.length === 0,
      message:
        missingPreBlocks.length === 0
          ? 'all highlighted blocks have pre'
          : `missing pre blocks=${missingPreBlocks.map((block) => block.index).join(',')}`,
    })

    addCheck(report.checks, {
      label: `${width}px token colors applied`,
      pass: collapsedTokenBlocks.length === 0,
      message:
        collapsedTokenBlocks.length === 0
          ? blocks
              .filter((block) => block.lineCount > 0)
              .map(
                (block) =>
                  `${block.index}:${block.distinctTokenColorCount} colors`,
              )
              .join('; ')
          : `collapsed blocks=${collapsedTokenBlocks
              .map(
                (block) =>
                  `${block.index}:${block.tokenColorSample.join('|') || 'none'}`,
              )
              .join('; ')}`,
    })

    addCheck(report.checks, {
      label: `${width}px line-number protocol`,
      pass: brokenLineNumberedBlocks.length === 0,
      message:
        brokenLineNumberedBlocks.length === 0
          ? 'line-numbered blocks have line nodes when present'
          : `broken blocks=${brokenLineNumberedBlocks.map((block) => block.index).join(',')}`,
    })
  }
}

function summarizeSidebar(report) {
  for (const capture of report.captures) {
    const { viewport, data } = capture
    const width = viewport.width
    const top = data.top
    const dropdown = data.dropdown
    const collapsed = data.collapsed
    const hover = data.hover
    const pinned = data.pinned

    addCheck(report.checks, {
      label: `${width}px runtime selector ${report.options.selector}`,
      pass: Boolean(top.root),
      message: top.root ? `${top.root.rect.width}px wide` : 'missing',
    })

    addCheck(report.checks, {
      label: `${width}px sidebar tab selected`,
      pass: top.state.tabTrigger === report.options.sidebarExpectedTab,
      message: `trigger=${top.state.tabTrigger || 'none'}`,
    })

    addCheck(report.checks, {
      label: `${width}px sidebar tab closed by default`,
      pass: top.state.tabExpanded === 'false' && !top.state.tabPanelExists,
      message: `expanded=${top.state.tabExpanded}, panel=${top.state.tabPanelExists}`,
    })

    const missingSeparators = report.options.sidebarExpectedSeparators.filter(
      (item) => !top.state.separators.includes(item),
    )
    addCheck(report.checks, {
      label: `${width}px sidebar separators`,
      pass: missingSeparators.length === 0,
      message:
        missingSeparators.length === 0
          ? top.state.separators.join(', ')
          : `missing ${missingSeparators.join(', ')}`,
    })

    const current = top.state.links.find((item) => item.current === 'page')
    addCheck(report.checks, {
      label: `${width}px sidebar current item`,
      pass: current?.text === report.options.sidebarExpectedCurrent,
      message: `current=${current?.text ?? 'none'}`,
    })

    const dropdownNavTop = dropdown.rects['.docs-sidebar-nav']?.rect.top
    const topNavTop = top.rects['.docs-sidebar-nav']?.rect.top
    addCheck(report.checks, {
      label: `${width}px tab dropdown overlays nav flow`,
      pass:
        dropdown.state.tabExpanded === 'true' &&
        dropdown.state.tabPanelExists &&
        dropdownNavTop === topNavTop,
      message: `expanded=${dropdown.state.tabExpanded}, panel=${dropdown.state.tabPanelExists}, navTop=${topNavTop}->${dropdownNavTop}`,
    })

    addCheck(report.checks, {
      label: `${width}px active tab in dropdown`,
      pass: dropdown.state.tabOptions.some(
        (item) =>
          item.title === report.options.sidebarExpectedTab &&
          item.current === 'page',
      ),
      message: JSON.stringify(dropdown.state.tabOptions),
    })

    if (width >= 960) {
      const collapsedInner = collapsed.rects['.docs-sidebar-inner']
      addCheck(report.checks, {
        label: `${width}px collapse hides sidebar column`,
        pass:
          collapsed.state.layoutCollapsed === 'true' &&
          collapsed.state.sidebarCollapsed === 'true' &&
          collapsed.state.floatingExists &&
          collapsedInner?.style.opacity === '0',
        message: `layout=${collapsed.state.layoutCollapsed}, sidebar=${collapsed.state.sidebarCollapsed}, floating=${collapsed.state.floatingExists}, opacity=${collapsedInner?.style.opacity ?? 'missing'}`,
      })

      const hoverInner = hover.rects['.docs-sidebar-inner']
      addCheck(report.checks, {
        label: `${width}px hover reveals collapsed sidebar`,
        pass:
          hover.state.sidebarHovered === 'true' &&
          hover.state.floatingHidden &&
          hoverInner?.style.opacity === '1' &&
          (hoverInner?.rect.left ?? -1) >= 0,
        message: `hovered=${hover.state.sidebarHovered}, floatingHidden=${hover.state.floatingHidden}, opacity=${hoverInner?.style.opacity ?? 'missing'}, left=${hoverInner?.rect.left ?? 'missing'}`,
      })

      addCheck(report.checks, {
        label: `${width}px floating pin restores sidebar`,
        pass:
          pinned.state.layoutCollapsed === 'false' &&
          pinned.state.sidebarCollapsed === 'false' &&
          !pinned.state.floatingExists,
        message: `layout=${pinned.state.layoutCollapsed}, sidebar=${pinned.state.sidebarCollapsed}, floating=${pinned.state.floatingExists}`,
      })
    }
  }
}

function formatReport(report) {
  const failed = report.checks.filter((check) => !check.pass)
  const lines = [
    `Parity probe: ${report.options.url}`,
    `Status: ${failed.length === 0 ? 'PASS' : 'FAIL'}`,
    `Checks: ${report.checks.length - failed.length}/${report.checks.length} passed`,
  ]

  if (failed.length > 0) {
    lines.push('', 'Failed checks:')

    for (const check of failed) {
      lines.push(`- ${check.label}: ${check.message}`)
    }
  }

  lines.push('', 'Captured highlights:')

  for (const capture of report.captures) {
    if (report.options.profile === 'sidebar') {
      const top = capture.data.top
      const collapsed = capture.data.collapsed
      const hover = capture.data.hover

      lines.push(
        `- ${capture.viewport.width}x${capture.viewport.height}: tab=${
          top.state.tabTrigger || 'missing'
        }; links=${top.state.links.length}; separators=${
          top.state.separators.join('/') || 'missing'
        }; collapsed=${collapsed.state.layoutCollapsed}/${collapsed.rects['.docs-sidebar-inner']?.style.opacity ?? 'n/a'}; hover=${hover.state.sidebarHovered}/${hover.rects['.docs-sidebar-inner']?.style.opacity ?? 'n/a'}`,
      )
      continue
    }

    if (report.options.profile === 'code-block') {
      const blocks = capture.data.top.codeBlocks
      const preview = capture.data.top.preview
      const install = capture.data.top.install
      const markers = blocks.reduce((sum, block) => sum + block.highlightedCount, 0)
      const lineNumbered = blocks.filter((block) => block.lineNumbers).length

      lines.push(
        `- ${capture.viewport.width}x${capture.viewport.height}: blocks=${
          blocks.length
        }; preview=${preview ? 'yes' : 'missing'}; install=${
          install ? 'yes' : 'missing'
        }; markers=${markers}; lineNumbered=${lineNumbered}`,
      )
      continue
    }

    if (report.options.profile === 'content-components') {
      const top = capture.data.top
      const switchedTab = capture.data.tabSwitched.tabs[0]?.triggers.find(
        (item) => item.state === 'active',
      )
      const openedTypeRow = capture.data.typeOpened.typeTables[0]?.rows.find(
        (item) => item.expanded === 'true',
      )

      lines.push(
        `- ${capture.viewport.width}x${capture.viewport.height}: callouts=${
          top.callouts.length
        }; tabs=${top.tabs.length}/${switchedTab?.text ?? 'none'}; accordions=${
          top.accordions[0]?.items.length ?? 0
        }; files=${top.files[0]?.rows.length ?? 0}; inlineToc=${
          top.inlineTocs[0]?.links.length ?? 0
        }; typeRows=${top.typeTables[0]?.rows.length ?? 0}/open=${
          openedTypeRow?.prop?.text ?? 'none'
        }`,
      )
      continue
    }

    if (report.options.profile === 'page-actions') {
      const top = capture.data.top
      const openMenu = capture.data.openMenu
      const feedbackSelected = capture.data.feedbackSelected

      lines.push(
        `- ${capture.viewport.width}x${capture.viewport.height}: preview=${
          top.preview.root ? 'yes' : 'missing'
        }; actions=${
          top.pageActions.copy ? 'copy' : 'missing'
        }/open=${openMenu.pageActions.openExpanded}; feedback=${
          feedbackSelected.feedback.thanks ? 'selected' : 'idle'
        }; pagerLinks=${top.pager.links.length}`,
      )
      continue
    }

    const shell = capture.data.top.rects['.docs-shell-body']
    const page = capture.data.top.rects['#nd-page']
    const toc = capture.data.top.rects['#nd-toc']
    const popover = capture.data.popoverOpen?.tocPopover
    const bottomCurrent = capture.data.bottom.current.at(-1)

    lines.push(
      `- ${capture.viewport.width}x${capture.viewport.height}: shell=${
        shell?.style.gridTemplateColumns ?? 'missing'
      }; page=${page ? `${page.rect.left}-${page.rect.right}` : 'missing'}; toc=${
        toc ? `${toc.style.display}/${toc.rect.width}px` : 'missing'
      }; popover=${
        popover?.panel
          ? `${popover.triggerExpanded}/${popover.panel.style.position}/${popover.panel.rect.top}px`
          : 'missing'
      }; bottomCurrent=${bottomCurrent?.href ?? 'none'}`,
    )
  }

  return lines.join('\n')
}

async function main() {
  const options = parseArgs(process.argv.slice(2))

  if (!options.url) {
    console.error(usage())
    process.exitCode = 1
    return
  }

  let report = {
    options,
    checks: [],
    captures: [],
  }
  const preflight = await httpPreflight(options)

  report.checks.push(...preflight.checks)

  if (preflight.checks.some((check) => !check.pass)) {
    console.log(formatReport(report))
    process.exitCode = 1
    return
  }

  for (let attempt = 0; attempt <= options.retries; attempt++) {
    report = await runRuntimeProbe(options, preflight.checks)

    if (!report.checks.some((check) => !check.pass) || attempt === options.retries) {
      break
    }

    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  console.log(formatReport(report))

  if (report.checks.some((check) => !check.pass)) {
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
