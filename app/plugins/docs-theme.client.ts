import { docsSiteAdapter } from '~/config/docs-site'

export default defineNuxtPlugin((nuxtApp) => {
  const theme = useDocsTheme(docsSiteAdapter.theme)

  theme.initialize()

  nuxtApp.hook('app:mounted', () => {
    theme.markMounted()
  })
})
