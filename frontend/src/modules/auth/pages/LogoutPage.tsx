import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../auth/AuthContext";
import { useAuthTranslation } from "../hooks/useAuthTranslation";

/**
 * Registered at `/logout` (see ../routes.tsx), wrapped in the shared
 * `<ProtectedRoute>`. Calling `logout()` is the entire integration point
 * with the shared auth boundary — no new logout mechanism is invented
 * here (see src/auth/AuthContext.tsx for the client-side token discard,
 * which matches docs/contracts/auth-contract.md's "no server-side
 * blacklist in MVP" note).
 */
export function LogoutPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const t = useAuthTranslation();

  useEffect(() => {
    logout();
    navigate("/login", { replace: true });
    // logout() is stable (useCallback in AuthContext.tsx) and navigate()
    // is stable per React Router — both are safe to omit from deps below,
    // but they're stable anyway so including them is harmless too.
  }, [logout, navigate]);

  return (
    <div className="auth-page">
      <p>{t("auth.logout.signingOut")}</p>
    </div>
  );
}
