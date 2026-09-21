/**
 * Auth state boundary.
 *
 * This provides the SHAPE of an authenticated session and how it is
 * set/cleared. It intentionally does NOT implement the login screen or the
 * `POST /api/v1/auth/login` call — that is the auth module's business logic
 * (a later phase). What lives here is shared because both the router's
 * route-protection boundary and the API client's auth-header behavior
 * (via tokenStorage) need a single source of truth for "is someone logged
 * in, and as whom".
 *
 * Shape follows docs/contracts/auth-contract.md: JWT claims are
 * `sub` (user id), `role`, `branch_id` (null for OWNER), `exp`.
 */

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { User } from "../../contracts/entities";
import { tokenStorage } from "./tokenStorage";

export interface AuthSession {
  token: string;
  user: User;
}

interface AuthContextValue {
  session: AuthSession | null;
  isAuthenticated: boolean;
  /** Called by the (future) login flow once the backend returns a session.
   * Not a login implementation itself — just the state transition. */
  setSession: (session: AuthSession) => void;
  /** Client-side token discard per docs/contracts/auth-contract.md — no
   * server-side blacklist call is required in MVP. */
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<AuthSession | null>(null);

  const setSession = useCallback((next: AuthSession) => {
    tokenStorage.set(next.token);
    setSessionState(next);
  }, []);

  const logout = useCallback(() => {
    tokenStorage.clear();
    setSessionState(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isAuthenticated: session !== null,
      setSession,
      logout,
    }),
    [session, setSession, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
