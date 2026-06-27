import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  buildDir: '.nuxt',
  modules: ['@nuxt/eslint', '@nuxt/content'],
  vite: {
    plugins: [tailwindcss()],
  },
  content: {
    experimental: {
      sqliteConnector: 'native',
    },
  },
  devtools: { enabled: true },
  compatibilityDate: '2024-04-03',
})
