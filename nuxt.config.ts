// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  modules: [
    "@nuxtjs/tailwindcss",
    "shadcn-nuxt",
    "@nuxtjs/color-mode",
    "@nuxtjs/supabase",
    "@nuxt/eslint",
    "@nuxt/image",
    "nuxt-typed-router",
  ],
  app: {
    head: {
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.svg" }],

      bodyAttrs: {
        class: "dark",
      },
    },
  },
  nitro: {
    storage: {
      data: {
        driver: "fs",
        base: "./data",
      },
    },
  },
  router: {
    options: {
      scrollBehaviorType: "smooth",
    },
  },
  components: false,
});
