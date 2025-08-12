// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  app: {
    head: {
      title: "Metu Pira",
      meta: [
        {
          name: "description",
          content: "An app for tracking your expenses and incomes",
        },
      ],
    },
  },
  devtools: { enabled: true },
  modules: [
    "@nuxt/fonts",
    "@nuxt/icon",
    "@nuxt/eslint",
    "@nuxtjs/supabase",
    "nuxt-echarts",
  ],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  css: ["~/assets/css/main.css"],
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_KEY,
    },
  },
  supabase: {
    redirectOptions: {
      login: "/auth/signin",
      callback: "/auth/callback",
      include: undefined,
      exclude: ["/"],
      cookieRedirect: false,
    },
  },
  fonts: {
    families: [{ name: "Inter", provider: "google" }],
  },
  echarts: {},
});
