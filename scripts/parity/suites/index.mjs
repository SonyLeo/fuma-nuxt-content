import { codeSuite } from './code.mjs'
import { contentComponentsSuite } from './content-components.mjs'
import { docsShellSuite } from './docs-shell.mjs'
import { fastRegressionSuite } from './fast-regression.mjs'
import { fullRegressionSuite } from './full-regression.mjs'
import { pageActionsSuite } from './page-actions.mjs'
import { pageTailSuite } from './page-tail.mjs'

export const suites = new Map([
  [codeSuite.name, codeSuite],
  [contentComponentsSuite.name, contentComponentsSuite],
  [docsShellSuite.name, docsShellSuite],
  [fastRegressionSuite.name, fastRegressionSuite],
  [fullRegressionSuite.name, fullRegressionSuite],
  [pageActionsSuite.name, pageActionsSuite],
  [pageTailSuite.name, pageTailSuite],
])
