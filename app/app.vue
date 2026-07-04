<script setup lang="ts">
import { docsSiteConfig } from '~/config/docs-site'
import { createDocsThemeInitScript } from '~/utils/docs-theme'

import './assets/css/tailwind.css'
import './assets/css/tokens.css'
import './assets/css/themes.css'
import './assets/css/ui.css'
import './assets/css/shell.css'
import './assets/css/prose.css'
import './assets/css/content.css'

useHead({
  script: [
    {
      key: 'docs-theme-init',
      innerHTML: createDocsThemeInitScript(docsSiteConfig.theme),
      tagPosition: 'head',
    },
  ],
})
</script>

<template>
  <DocsRootProvider
    dir="ltr"
    :search="{ enabled: docsSiteConfig.search?.enabled !== false }"
  >
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </DocsRootProvider>
</template>
