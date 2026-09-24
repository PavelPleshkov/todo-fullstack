const TOKEN_KEY = "accessToken";
const USER_KEY = "authUser";

let cachedUserRaw: string | null = null;
let cachedUser: StoredUser | null = null;

export type StoredUser = {
  id: number;
  email: string;
  role: string;
  createdAt: string;
};

const listeners = new Set<() => void>();

function emitAuthChange() {
  listeners.forEach((listener) => listener());
}

export function subscribeAuth(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): StoredUser | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(USER_KEY);

  if (raw === cachedUserRaw) {
    return cachedUser;
  }

  cachedUserRaw = raw;

  if (!raw) {
    cachedUser = null;
    return null;
  }

  try {
    cachedUser = JSON.parse(raw) as StoredUser;
  } catch {
    cachedUser = null;
  }

  return cachedUser;
}

export function setAuth(token: string, user: StoredUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  emitAuthChange();
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  emitAuthChange();
}
