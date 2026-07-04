import { docsSiteConfig } from '~/config/docs-site'

export default defineNuxtPlugin((nuxtApp) => {
  const theme = useDocsTheme(docsSiteConfig.theme)

  theme.initialize()

  nuxtApp.hook('app:mounted', () => {
    theme.markMounted()
  })
})
