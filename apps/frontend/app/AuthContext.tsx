"use client";

import { useApolloClient } from "@apollo/client/react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  clearAuth,
  getStoredUser,
  getToken,
  setAuth,
  subscribeAuth,
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

const subscribeIsClient = () => () => {};
function useIsClient() {
  return useSyncExternalStore(
    subscribeIsClient,
    () => true,
    () => false,
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // const [token, setToken] = useState<string | null>(() => getToken());
  // const [user, setUser] = useState<StoredUser | null>(() => getStoredUser());
  const isClient = useIsClient();
  const token = useSyncExternalStore(subscribeAuth, getToken, () => null);
  const user = useSyncExternalStore(subscribeAuth, getStoredUser, () => null);

  const sessionToken = isClient ? token : null;
  const sessionUser = isClient ? user : null;

  const client = useApolloClient();

  // useEffect(() => {
  //   setToken(getToken());
  //   setUser(getStoredUser());
  // }, []);

  const setSession = useCallback(
    async (nextToken: string, nextUser: StoredUser) => {
      setAuth(nextToken, nextUser);
      // setToken(nextToken);
      // setUser(nextUser);
      await client.resetStore();
    },
    [client],
  );

  const logout = useCallback(async () => {
    clearAuth();
    // setToken(null);
    // setUser(null);
    await client.clearStore();
  }, [client]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: sessionUser,
      token: sessionToken,
      isAuthenticated: Boolean(sessionToken && sessionUser),
      setSession,
      logout,
    }),
    [sessionUser, sessionToken, setSession, logout],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}
