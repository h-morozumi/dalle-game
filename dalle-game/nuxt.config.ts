// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@nuxt/ui"],
  runtimeConfig: {
    // 公開環境変数
    public: {
    },
    // サーバサイド環境変数
    aiVisionEndpoint: process.env.AI_VISION_ENDPOINT, // AI Vision Endpoint URL
    aiVisionApiKey: process.env.AI_VISION_API_KEY, // AI Vision API Key
    dalle2Endpoint: process.env.DALLE2_ENDPOINT, // Azure OpenAI DALL-E v2 Endpoint URL
    dalle2ApiKey: process.env.DALLE2_API_KEY, // Azure OpenAI DALL-E v2 API Key
    dalle3Endpoint: process.env.DALLE3_ENDPOINT, // Azure OpenAI DALL-E v3 Endpoint URL
    dalle3ApiKey: process.env.DALLE3_API_KEY, // Azure OpenAI DALL-E v3 API Key
    mongoConnection: process.env.MONGO_CONNECTION, // MongoDB Connection String
  }
})