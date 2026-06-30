import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { addCheck, cssPxNear, rectNear } from './core/assertions.mjs'
import { ensureChrome, evaluateProfile, httpPreflight } from './core/browser.mjs'
import { parseArgs, parseViewport, usage } from './core/cli.mjs'
import { createReport, formatReport } from './core/report.mjs'
import { profiles } from './profiles/index.mjs'
import { suites } from './suites/index.mjs'

function resolveProfiles(options) {
  if (options.profile) {
    const profile = profiles.get(options.profile)

    if (!profile) {
      throw new Error(`Unknown profile: ${options.profile}`)
    }

    return [profile]
  }

  if (options.suite) {
    const suite = suites.get(options.suite)

    if (!suite) {
      throw new Error(`Unknown suite: ${options.suite}`)
    }

    return suite.profiles.map((name) => {
      const profile = profiles.get(name)

      if (!profile) {
        throw new Error(`Suite ${suite.name} references unknown profile: ${name}`)
      }

      return profile
    })
  }

  return []
}

async function writeDump(options, reports) {
  if (!options.dump) {
    return null
  }

  const directory =
    typeof options.dump === 'string' && options.dump !== 'true'
      ? options.dump
      : '.parity/artifacts'
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const target = join(
    directory,
    `${options.suite || options.profile || 'parity'}-${stamp}.json`,
  )

  await mkdir(directory, { recursive: true })
  await writeFile(
    target,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        options,
        reports,
      },
      null,
      2,
    ),
  )

  return target
}

async function runProfile(profile, options) {
  const profileOptions = {
    ...options,
    selector: options.selector || profile.selector,
    url: options.url || profile.fixture,
  }
  const report = createReport(profile, profileOptions)
  const preflight = await httpPreflight(profileOptions)

  report.checks.push(...preflight.checks)

  if (preflight.checks.some((check) => !check.pass)) {
    return report
  }

  const chrome = await ensureChrome(profileOptions)
  const viewports = profileOptions.viewports.map(parseViewport)

  try {
    for (const viewport of viewports) {
      const data = await evaluateProfile(
        profileOptions,
        viewport,
        profile.collect(profileOptions),
      )

      report.captures.push({
        data,
        viewport,
      })
    }
  } finally {
    chrome.close()
  }

  profile.summarize(report, {
    addCheck,
    cssPxNear,
    rectNear,
  })

  return report
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  const available = {
    profiles: [...profiles.keys()],
    suites: [...suites.keys()],
  }

  if (!options.profile && !options.suite) {
    console.error(usage(available))
    process.exitCode = 1
    return
  }

  if (options.suite === 'full-regression' && options.url) {
    throw new Error(
      [
        'Do not pass --url with --suite=full-regression.',
        'The full regression suite contains profiles with different fixtures;',
        'a global URL would override them and create false failures.',
        'Run full regression without --url, or run a narrower --profile/--suite for a shared fixture.',
      ].join(' '),
    )
  }

  const targetProfiles = resolveProfiles(options)
  const reports = []

  for (const profile of targetProfiles) {
    let report = null

    for (let attempt = 0; attempt <= options.retries; attempt++) {
      report = await runProfile(profile, options)

      if (!report.checks.some((check) => !check.pass) || attempt === options.retries) {
        break
      }

      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    reports.push(report)
  }

  const outputs = reports.map((report) =>
    formatReport(
      report,
      report.captures.map((capture) => {
        const profile = profiles.get(report.profile)

        return profile?.summary?.(capture) ?? ''
      }),
    ),
  )
  const dumpPath = await writeDump(options, reports)

  console.log(outputs.join('\n\n'))

  if (dumpPath) {
    console.log(`\nDump: ${dumpPath}`)
  }

  if (reports.some((report) => report.checks.some((check) => !check.pass))) {
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
