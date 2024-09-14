import Aura from '@primevue/themes/aura';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2024-04-03',
    devtools: { enabled: true },
    modules: [
        '@primevue/nuxt-module',
        '@pinia/nuxt',
        '@nuxtjs/tailwindcss',
        'nuxt-lodash',
        '@formkit/auto-animate'
    ],
    lodash: {
        prefix: "_",
        upperAfterPrefix: false,
    },
    primevue: {
        options: {
            theme: {
                preset: Aura
            }
        }
    },
    tailwindcss: {
        config: {
            plugins: [require('tailwindcss-primeui')],
            //content: ["./presets/**/*.{js,vue,ts}"],
        }
    }
})
