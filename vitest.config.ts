import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    environmentOptions: {
      nuxt: {
        domEnvironment: 'happy-dom',
      },
    },
    include: ['tests/nuxt/**/*.nuxt.spec.ts'],
    restoreMocks: true,
    setupFiles: ['tests/nuxt/setup.ts'],
  },
})
