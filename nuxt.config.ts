export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxt/ui", "@pinia/nuxt"],
  css: ["~/assets/css/main.css"],
  routeRules: {
    "/admin/**": { ssr: false },
  },
  runtimeConfig: {
    dbHost: "localhost",
    dbPort: "8889",
    dbUser: "root",
    dbPass: "root",
    dbName: "stroke",
    thaidApiUrl: "https://hatyaihospital.go.th/ThaiD/api-ext/",
    appointmentApiUrl: "",
    public: {
      thaidClientId: "",
      basePath: "",
      manualUrl: "",
      adminManualUrl: "",
      assessmentFormUrl: "",
    },
  },
});
