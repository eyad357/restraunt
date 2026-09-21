import { useId, useState, type FormEvent } from "react";
import { PinInput } from "./PinInput";
import { useAuthTranslation } from "../hooks/useAuthTranslation";
import { validateLoginFields, type LoginFieldErrors } from "../hooks/loginValidation";
import { ApiError } from "../../../api/ApiError";
import type { LoginStatus } from "../hooks/useLogin";

interface LoginFormProps {
  status: LoginStatus;
  error: Error | null;
  onSubmit: (username: string, pin: string) => void;
}

export function LoginForm({ status, error, onSubmit }: LoginFormProps) {
  const t = useAuthTranslation();
  const usernameId = useId();
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});
  const isLoading = status === "loading";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const errors = validateLoginFields(username, pin);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    onSubmit(username.trim(), pin);
  }

  // See services/authApi.ts and hooks/useLogin.ts: no documented error
  // `code` exists yet for "wrong username/PIN" (checked against
  // docs/contracts/error-contract.md), so an ApiError's server-provided,
  // already-localized `message` is shown as-is; a transport-level failure
  // (network/parse, no server message at all) falls back to a local
  // translation instead.
  const authErrorMessage =
    status === "error"
      ? error instanceof ApiError
        ? error.message
        : t("auth.error.transport")
      : null;

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <div className="auth-field">
        <label htmlFor={usernameId} className="auth-field__label">
          {t("auth.login.usernameLabel")}
        </label>
        <input
          id={usernameId}
          type="text"
          autoComplete="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder={t("auth.login.usernamePlaceholder")}
          aria-invalid={Boolean(fieldErrors.username)}
          aria-describedby={fieldErrors.username ? `${usernameId}-error` : undefined}
          className="auth-field__input"
        />
        {fieldErrors.username ? (
          <p id={`${usernameId}-error`} className="auth-field__error" role="alert">
            {t(fieldErrors.username)}
          </p>
        ) : null}
      </div>

      <PinInput
        value={pin}
        onValueChange={setPin}
        label={t("auth.login.pinLabel")}
        placeholder={t("auth.login.pinPlaceholder")}
        errorMessage={fieldErrors.pin ? t(fieldErrors.pin) : undefined}
      />

      {authErrorMessage ? (
        <p className="auth-form__error" role="alert">
          {authErrorMessage}
        </p>
      ) : null}

      <button type="submit" className="btn btn--primary auth-form__submit" disabled={isLoading}>
        {isLoading ? t("auth.login.submitting") : t("auth.login.submit")}
      </button>
    </form>
  );
}
