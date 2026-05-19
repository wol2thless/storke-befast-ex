import CryptoJS from "crypto-js";

const SECRET_KEY = "stroke-app-key";

export function encrypt(data: unknown): string {
  return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
}

export function decrypt<T = unknown>(ciphertext: string): T | null {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8)) as T;
  } catch {
    return null;
  }
}
