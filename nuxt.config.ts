// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  modules: [
    "@nuxtjs/color-mode",
    "@nuxtjs/supabase",
    "@nuxt/eslint",
    "@nuxt/image",
    "nuxt-typed-router",
  ],
  css: ["~/assets/css/tailwind.css"],
  vite: {
    plugins: [tailwindcss()],
  },
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
  components: [
    {
      path: "~/components/ui",
      pathPrefix: false,
    },
  ],
  runtimeConfig: {
    public: {
      turnstileKey: "1x00000000000000000000AA",
    },
  },
  supabase: {
    redirectOptions: {
      login: "/login",
      callback: "/confirm",
      exclude: ["/", "/privacy", "/reset"],
    },
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
    },
  },
});
