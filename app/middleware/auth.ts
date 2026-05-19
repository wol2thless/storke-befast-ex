export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server) return;

  const authStore = useAuthStore();
  if (!authStore.checkAuth()) {
    return navigateTo("/login");
  }
});
