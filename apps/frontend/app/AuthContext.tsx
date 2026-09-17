"use client";

import { useApolloClient } from "@apollo/client/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
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
  setSession: (token: string, user: StoredUser) => Promise<void>;
  logout: () => Promise<void>;
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

  const client = useApolloClient();

  useEffect(() => {
    setToken(getToken());
    setUser(getStoredUser());
  }, []);

  const setSession = useCallback(
    async (nextToken: string, nextUser: StoredUser) => {
      setAuth(nextToken, nextUser);
      setToken(nextToken);
      setUser(nextUser);
      await client.resetStore();
    },
    [client],
  );

  const logout = useCallback(async () => {
    clearAuth();
    setToken(null);
    setUser(null);
    await client.clearStore();
  }, [client]);

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
