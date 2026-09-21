/**
 * Token/session storage abstraction.
 *
 * Nothing outside this file should call `localStorage` directly for the
 * access token. This keeps the storage mechanism swappable (e.g. moving to
 * an httpOnly-cookie flow, or an in-memory-only store for a kiosk mode)
 * without touching the auth context, the API client, or route protection.
 *
 * Per docs/contracts/auth-contract.md: logout is client-side token discard,
 * there is no server-side blacklist in MVP, so "clear" is sufficient here.
 */

const STORAGE_KEY = "rms.auth.token";

let memoryFallback: string | null = null;

function isStorageAvailable(): boolean {
  try {
    const testKey = "__rms_storage_test__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

const storageAvailable = isStorageAvailable();

export const tokenStorage = {
  get(): string | null {
    if (storageAvailable) {
      return window.localStorage.getItem(STORAGE_KEY);
    }
    return memoryFallback;
  },

  set(token: string): void {
    if (storageAvailable) {
      window.localStorage.setItem(STORAGE_KEY, token);
    } else {
      memoryFallback = token;
    }
  },

  clear(): void {
    if (storageAvailable) {
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      memoryFallback = null;
    }
  },
};
