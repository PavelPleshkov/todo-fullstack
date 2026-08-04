"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  clearAuth,
  getStoredUser,
  getToken,
  setAuth,
  type StoredUser,
} from "./lib/auth-storage";

type AuthContextValue = {
  user: StoredUser | null;
  token: string | null;
  isAuthenticated: boolean;
  setSession: (token: string, user: StoredUser) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getToken());
  const [user, setUser] = useState<StoredUser | null>(() => getStoredUser());

  const setSession = useCallback((nextToken: string, nextUser: StoredUser) => {
    setAuth(nextToken, nextUser);
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      setSession,
      logout,
    }),
    [user, token, setSession, logout],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}
