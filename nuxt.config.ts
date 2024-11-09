import Aura from '@primevue/themes/aura'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  // TODO: hmmm
  ssr: true,
  modules: [
    'nitro-cloudflare-dev',
    '@primevue/nuxt-module',
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
    'nuxt-lodash',
    '@vueuse/nuxt',
    '@formkit/auto-animate/nuxt',
  ],
  lodash: {
    prefix: '_',
    upperAfterPrefix: false,
  },
  primevue: {
    options: {
      theme: {
        preset: Aura,
      },
    },
  },
  tailwindcss: {
    config: {
      plugins: [require('tailwindcss-primeui')],
      //content: ["./presets/**/*.{js,vue,ts}"],
    },
  },
  nitro: {
    preset: 'cloudflare_pages',
    prerender: {
      autoSubfolderIndex: false,
    },
  },
  runtimeConfig: {
    public: {
      apiOrigin: 'http://localhost:8787',
    },
  },
})
