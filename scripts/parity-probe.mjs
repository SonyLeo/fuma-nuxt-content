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

  out.chromePort = Number(out.chromePort || 9233)
  out.minBytes = Number(out.minBytes || 1000)
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
    '  node scripts/parity-probe.mjs --url=http://127.0.0.1:3000/guide/component-detail',
    '',
    'Options:',
    '  --selector=#nd-toc',
    '  --profile=toc|sidebar',
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
    });

    const top = collect('top');
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

    return { top, bottom };
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
          : createProbeExpression(options),
      ),
    }
  } finally {
    cdp.close()
  }
}

function addCheck(checks, check) {
  checks.push(check)
}

function summarize(report) {
  if (report.options.profile === 'sidebar') {
    summarizeSidebar(report)
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

    const shell = capture.data.top.rects['.docs-shell-body']
    const page = capture.data.top.rects['#nd-page']
    const toc = capture.data.top.rects['#nd-toc']
    const bottomCurrent = capture.data.bottom.current.at(-1)

    lines.push(
      `- ${capture.viewport.width}x${capture.viewport.height}: shell=${
        shell?.style.gridTemplateColumns ?? 'missing'
      }; page=${page ? `${page.rect.left}-${page.rect.right}` : 'missing'}; toc=${
        toc ? `${toc.style.display}/${toc.rect.width}px` : 'missing'
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

  const report = {
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

  const chrome = await startChrome(options)

  try {
    for (const viewportValue of options.viewports) {
      report.captures.push(await captureViewport(options, viewportValue))
    }
  } finally {
    chrome.kill()
  }

  summarize(report)
  console.log(formatReport(report))

  if (report.checks.some((check) => !check.pass)) {
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
