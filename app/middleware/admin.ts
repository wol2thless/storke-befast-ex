export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server) return;

  const adminStore = useAdminStore();
  if (!adminStore.checkAdminAuth()) {
    return navigateTo("/admin/login");
  }
});
