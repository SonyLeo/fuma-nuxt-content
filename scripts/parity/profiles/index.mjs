import { accordionProfile } from './accordion.mjs'
import { calloutProfile } from './callout.mjs'
import { cardsProfile } from './cards.mjs'
import { codeBlockProfile } from './code-block.mjs'
import { feedbackProfile } from './feedback.mjs'
import { filesProfile } from './files.mjs'
import { headingProfile } from './heading.mjs'
import { inlineTocProfile } from './inline-toc.mjs'
import { pageActionsProfile } from './page-actions.mjs'
import { pagerProfile } from './pager.mjs'
import { proseDefaultsProfile } from './prose-defaults.mjs'
import { previewProfile } from './preview.mjs'
import { sidebarProfile } from './sidebar.mjs'
import { stepsProfile } from './steps.mjs'
import { tabsProfile } from './tabs.mjs'
import { tocResponsiveProfile } from './toc-responsive.mjs'
import { tocProfile } from './toc.mjs'
import { typeTableProfile } from './type-table.mjs'

export const profiles = new Map([
  [accordionProfile.name, accordionProfile],
  [calloutProfile.name, calloutProfile],
  [cardsProfile.name, cardsProfile],
  [codeBlockProfile.name, codeBlockProfile],
  [feedbackProfile.name, feedbackProfile],
  [filesProfile.name, filesProfile],
  [headingProfile.name, headingProfile],
  [inlineTocProfile.name, inlineTocProfile],
  [pageActionsProfile.name, pageActionsProfile],
  [pagerProfile.name, pagerProfile],
  [proseDefaultsProfile.name, proseDefaultsProfile],
  [previewProfile.name, previewProfile],
  [sidebarProfile.name, sidebarProfile],
  [stepsProfile.name, stepsProfile],
  [tabsProfile.name, tabsProfile],
  [tocResponsiveProfile.name, tocResponsiveProfile],
  [tocProfile.name, tocProfile],
  [typeTableProfile.name, typeTableProfile],
])
