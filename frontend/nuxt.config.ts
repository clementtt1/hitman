export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: false },
  telemetry: false,
  modules: [
    'nuxt-socket-io',
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss'
  ],
  io: {
    sockets: [{
      name: 'main',
      url: 'http://localhost:3000'
    }]
  },
  css: ['~/assets/css/main.css'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  }
})