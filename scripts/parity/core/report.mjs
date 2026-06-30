export function createReport(profile, options) {
  return {
    captures: [],
    checks: [],
    options,
    profile: profile.name,
  }
}

export function formatReport(report, summaryLines = []) {
  const failed = report.checks.filter((check) => !check.pass)
  const lines = [
    `Parity profile: ${report.profile}`,
    `URL: ${report.options.url}`,
    `Status: ${failed.length === 0 ? 'PASS' : 'FAIL'}`,
    `Checks: ${report.checks.length - failed.length}/${report.checks.length} passed`,
  ]

  if (failed.length > 0) {
    lines.push('', 'Failed checks:')

    for (const check of failed) {
      lines.push(`- ${check.label}: ${check.message}`)
    }
  }

  if (summaryLines.length > 0) {
    lines.push('', 'Captured highlights:', ...summaryLines)
  }

  return lines.join('\n')
}
