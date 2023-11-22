// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@nuxt/ui"],
  runtimeConfig: {
    // 公開可能な設定
    public: {
      apiBase: process.env.API_BASE ,
      // 他の公開環境変数
    },
    // サーバーサイド限定の設定
    apiSecret: process.env.API_SECRET,
    // 他の秘密の環境変数
  }
})