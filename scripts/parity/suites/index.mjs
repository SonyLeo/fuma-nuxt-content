import { codeSuite } from './code.mjs'
import { contentComponentsSuite } from './content-components.mjs'
import { docsShellSuite } from './docs-shell.mjs'
import { fullRegressionSuite } from './full-regression.mjs'
import { pageActionsSuite } from './page-actions.mjs'

export const suites = new Map([
  [codeSuite.name, codeSuite],
  [contentComponentsSuite.name, contentComponentsSuite],
  [docsShellSuite.name, docsShellSuite],
  [fullRegressionSuite.name, fullRegressionSuite],
  [pageActionsSuite.name, pageActionsSuite],
])
