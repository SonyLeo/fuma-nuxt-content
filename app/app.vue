<script setup lang="ts">
import { createDocsThemeInitScript } from '~/utils/docs-theme'

import './assets/css/tailwind.css'
import './assets/css/tokens.css'
import './assets/css/themes.css'
import './assets/css/ui.css'
import './assets/css/shell.css'
import './assets/css/prose.css'
import './assets/css/content.css'

const site = useDocsSite()

useHead({
  script: [
    {
      key: 'docs-theme-init',
      innerHTML: createDocsThemeInitScript(site.theme),
      tagPosition: 'head',
    },
  ],
})
</script>

<template>
  <DocsRootProvider v-bind="site.root">
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </DocsRootProvider>
</template>
