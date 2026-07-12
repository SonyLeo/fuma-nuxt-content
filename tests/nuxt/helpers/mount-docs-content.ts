import type { VueWrapper } from '@vue/test-utils'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { nextTick, type ComponentPublicInstance } from 'vue'
import DocsContentHarness from './DocsContentHarness.vue'

async function waitForAnimationFrame() {
  await new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => resolve())
  })
}

export async function mountDocsContent(path: string) {
  const wrapper = (await mountSuspended(DocsContentHarness, {
    props: {
      path,
    },
  })) as VueWrapper<ComponentPublicInstance>

  await nextTick()
  await waitForAnimationFrame()
  await nextTick()

  return wrapper
}
