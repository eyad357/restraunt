import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../../../auth/AuthContext";
import { useLocale } from "../../../i18n/LocaleContext";
import { ApiError, ApiTransportError } from "../../../api/ApiError";
import { login as loginRequest } from "../services/authApi";

export type LoginStatus = "idle" | "loading" | "error";

interface UseLoginResult {
  status: LoginStatus;
  /** Null unless status === "error". Distinguishing ApiError (server
   * responded with the documented error envelope) from ApiTransportError
   * (network/parse failure before that) so the UI can show the right
   * message — see components/LoginForm.tsx. */
  error: ApiError | ApiTransportError | null;
  submit: (username: string, pin: string) => Promise<boolean>;
}

/**
 * Owns the login request lifecycle (loading/error state) and, on success,
 * hands the result to the shared `AuthContext` via `setSession` — this
 * hook does not itself decide what "being logged in" means app-wide, it
 * only produces the session data per docs/contracts/auth-contract.md.
 */
export function useLogin(): UseLoginResult {
  const { setSession } = useAuth();
  const { locale } = useLocale();
  const [status, setStatus] = useState<LoginStatus>("idle");
  const [error, setError] = useState<ApiError | ApiTransportError | null>(null);
  // Avoids setting state after unmount if the component navigates away
  // while a request is in flight.
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const submit = useCallback(
    async (username: string, pin: string): Promise<boolean> => {
      setStatus("loading");
      setError(null);
      try {
        const result = await loginRequest({ username, pin }, locale);
        setSession({ token: result.access_token, user: result.user });
        if (mountedRef.current) setStatus("idle");
        return true;
      } catch (caught) {
        if (!mountedRef.current) return false;
        setStatus("error");
        setError(
          caught instanceof ApiError || caught instanceof ApiTransportError
            ? caught
            : new ApiTransportError(0, "Unexpected login error."),
        );
        return false;
      }
    },
    [locale, setSession],
  );

  return { status, error, submit };
}
