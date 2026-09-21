import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../auth/AuthContext";
import { useLogin } from "../hooks/useLogin";
import { useAuthTranslation } from "../hooks/useAuthTranslation";
import { LoginForm } from "../components/LoginForm";
import "./auth.css";

interface LocationState {
  from?: { pathname: string };
}

/**
 * Default post-login destination. Updated during P1-FE-03 (Dashboard) from
 * "/" to "/dashboard" now that a real home screen exists — this is an edit
 * inside the auth module (Person 1's own), not a shared-foundation file,
 * so it didn't need an INTEGRATION_REQUEST.md. See dashboard/routes.tsx
 * for why the dashboard registers at "/dashboard" rather than taking over
 * the shared router's "/" index route.
 */
const DEFAULT_AUTHENTICATED_PATH = "/dashboard";

export function LoginPage() {
  const { isAuthenticated } = useAuth();
  const { status, error, submit } = useLogin();
  const t = useAuthTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  // Guest-only gating: this is the inverse of <ProtectedRoute> (see
  // src/auth/ProtectedRoute.tsx) and belongs here rather than as a new
  // shared component, since redirecting an already-authenticated user away
  // from the login screen is specific to this one page.
  if (isAuthenticated) {
    const state = location.state as LocationState | null;
    return <Navigate to={state?.from?.pathname ?? DEFAULT_AUTHENTICATED_PATH} replace />;
  }

  async function handleSubmit(username: string, pin: string) {
    const succeeded = await submit(username, pin);
    if (succeeded) {
      const state = location.state as LocationState | null;
      navigate(state?.from?.pathname ?? DEFAULT_AUTHENTICATED_PATH, { replace: true });
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-card__title">{t("auth.login.title")}</h1>
        <p className="auth-card__subtitle">{t("auth.login.subtitle")}</p>
        <LoginForm status={status} error={error} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
