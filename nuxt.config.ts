// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },

  future: {
    compatibilityVersion: 4
  },

  modules: [
    '@nuxt/ui',
    '@nuxt/eslint'
  ],

  ui: {
    colors: {
      primary: 'blue'
    }
  },

  colorMode: {
    preference: 'light'
  }
})
