import { defineStore } from "pinia";
import { encrypt, decrypt } from "~/utils/crypto";

interface ThaiDUser {
  cid?: string;
  card_id?: string;
  pid?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  gender?: string;
  birthdate?: string;
  [key: string]: unknown;
}

export const useAuthStore = defineStore("auth", () => {
  const user = ref<ThaiDUser | null>(null);
  const token = ref<string | null>(null);
  const isAuthenticated = ref(false);

  function getPid(): string {
    return user.value?.cid || user.value?.card_id || user.value?.pid || "";
  }

  function login(idToken: string, decoded: ThaiDUser) {
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
    localStorage.setItem("id_token", encrypt(idToken));
    localStorage.setItem("user", encrypt(decoded));
    localStorage.setItem("expires_at", encrypt(expiresAt));
    token.value = idToken;
    user.value = decoded;
    isAuthenticated.value = true;
  }

  function logout() {
    localStorage.removeItem("id_token");
    localStorage.removeItem("user");
    localStorage.removeItem("expires_at");
    token.value = null;
    user.value = null;
    isAuthenticated.value = false;
  }

  function checkAuth(): boolean {
    const encryptedUser = localStorage.getItem("user");
    const encryptedExpires = localStorage.getItem("expires_at");
    const encryptedToken = localStorage.getItem("id_token");

    if (!encryptedUser || !encryptedExpires || !encryptedToken) {
      logout();
      return false;
    }

    const expiresAt = decrypt<number>(encryptedExpires);
    if (!expiresAt || Date.now() >= expiresAt) {
      logout();
      return false;
    }

    const decoded = decrypt<ThaiDUser>(encryptedUser);
    const idToken = decrypt<string>(encryptedToken);
    if (!decoded || !idToken) {
      logout();
      return false;
    }

    user.value = decoded;
    token.value = idToken;
    isAuthenticated.value = true;
    return true;
  }

  return { user, token, isAuthenticated, getPid, login, logout, checkAuth };
});
