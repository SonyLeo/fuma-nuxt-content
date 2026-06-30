import { accordionProfile } from './accordion.mjs'
import { calloutProfile } from './callout.mjs'
import { codeBlockProfile } from './code-block.mjs'
import { filesProfile } from './files.mjs'
import { inlineTocProfile } from './inline-toc.mjs'
import { pageActionsProfile } from './page-actions.mjs'
import { sidebarProfile } from './sidebar.mjs'
import { tabsProfile } from './tabs.mjs'
import { tocProfile } from './toc.mjs'
import { typeTableProfile } from './type-table.mjs'

export const profiles = new Map([
  [accordionProfile.name, accordionProfile],
  [calloutProfile.name, calloutProfile],
  [codeBlockProfile.name, codeBlockProfile],
  [filesProfile.name, filesProfile],
  [inlineTocProfile.name, inlineTocProfile],
  [pageActionsProfile.name, pageActionsProfile],
  [sidebarProfile.name, sidebarProfile],
  [tabsProfile.name, tabsProfile],
  [tocProfile.name, tocProfile],
  [typeTableProfile.name, typeTableProfile],
])
