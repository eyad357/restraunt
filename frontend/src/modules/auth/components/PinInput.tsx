import { forwardRef, type InputHTMLAttributes } from "react";
import { sanitizePinInput } from "../hooks/loginValidation";

interface PinInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange"> {
  value: string;
  onValueChange: (value: string) => void;
  label: string;
  errorMessage?: string;
}

/**
 * Masked, digits-only PIN entry. Deliberately plain (a single masked text
 * input) rather than a segmented/animated keypad widget — the task calls
 * for no unnecessary visual complexity, and the underlying value is still
 * a normal string the login hook sends once, over the wire, on submit.
 */
export const PinInput = forwardRef<HTMLInputElement, PinInputProps>(function PinInput(
  { value, onValueChange, label, errorMessage, id = "auth-pin", ...rest },
  ref,
) {
  const describedBy = errorMessage ? `${id}-error` : undefined;

  return (
    <div className="auth-field">
      <label htmlFor={id} className="auth-field__label">
        {label}
      </label>
      <input
        {...rest}
        ref={ref}
        id={id}
        type="password"
        inputMode="numeric"
        autoComplete="off"
        // PIN is never persisted anywhere client-side beyond this
        // controlled input's in-memory value — see services/authApi.ts.
        value={value}
        onChange={(event) => onValueChange(sanitizePinInput(event.target.value))}
        aria-invalid={Boolean(errorMessage)}
        aria-describedby={describedBy}
        className="auth-field__input auth-field__input--pin"
      />
      {errorMessage ? (
        <p id={`${id}-error`} className="auth-field__error" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
});
