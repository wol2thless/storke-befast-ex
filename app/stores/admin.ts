import { defineStore } from "pinia";
import { encrypt, decrypt } from "~/utils/crypto";

interface AdminUser {
  id: number;
  provider_id: string;
  name: string;
  role: "admin" | "staff" | "supervisor";
}

export const useAdminStore = defineStore("admin", () => {
  const adminUser = ref<AdminUser | null>(null);
  const adminToken = ref<string | null>(null);
  const isAuthenticated = ref(false);
  const loading = ref(false);
  const error = ref<string | null>(null);

  function clearError() {
    error.value = null;
  }

  async function adminLogin(providerId: string, password: string) {
    loading.value = true;
    error.value = null;
    try {
      const data = await $fetch<{
        success: boolean;
        message?: string;
        token?: string;
        admin_data?: AdminUser;
      }>("/api/admin/login", {
        method: "POST",
        body: { provider_id: providerId, password },
      });

      if (data.success && data.token && data.admin_data) {
        const expiresAt = Date.now() + 8 * 60 * 60 * 1000;
        localStorage.setItem("admin_token", encrypt(data.token));
        localStorage.setItem("admin_user", encrypt(data.admin_data));
        localStorage.setItem("admin_expires_at", encrypt(expiresAt));
        adminToken.value = data.token;
        adminUser.value = data.admin_data;
        isAuthenticated.value = true;
        loading.value = false;
        return { success: true };
      } else {
        error.value = data.message || "เข้าสู่ระบบไม่สำเร็จ";
        loading.value = false;
        return { success: false, error: error.value };
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการเชื่อมต่อ";
      error.value = msg;
      loading.value = false;
      return { success: false, error: msg };
    }
  }

  function adminLogout() {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    localStorage.removeItem("admin_expires_at");
    adminToken.value = null;
    adminUser.value = null;
    isAuthenticated.value = false;
  }

  function checkAdminAuth(): boolean {
    const encryptedToken = localStorage.getItem("admin_token");
    const encryptedUser = localStorage.getItem("admin_user");
    const encryptedExpires = localStorage.getItem("admin_expires_at");

    if (!encryptedToken || !encryptedUser || !encryptedExpires) {
      adminLogout();
      return false;
    }

    const expiresAt = decrypt<number>(encryptedExpires);
    if (!expiresAt || Date.now() >= expiresAt) {
      adminLogout();
      return false;
    }

    const userData = decrypt<AdminUser>(encryptedUser);
    const tokenData = decrypt<string>(encryptedToken);
    if (!userData || !tokenData) {
      adminLogout();
      return false;
    }

    adminUser.value = userData;
    adminToken.value = tokenData;
    isAuthenticated.value = true;
    return true;
  }

  function isAdmin(): boolean {
    return adminUser.value?.role === "admin";
  }

  function getToken(): string | null {
    const encryptedToken = localStorage.getItem("admin_token");
    if (!encryptedToken) return null;
    return decrypt<string>(encryptedToken);
  }

  return {
    adminUser,
    adminToken,
    isAuthenticated,
    loading,
    error,
    clearError,
    adminLogin,
    adminLogout,
    checkAdminAuth,
    isAdmin,
    getToken,
  };
});
