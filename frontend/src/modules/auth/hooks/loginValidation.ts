/**
 * Client-side validation only — a UI guardrail so the submit button isn't
 * enabled for obviously-incomplete input. NOT authoritative: the backend
 * remains the source of truth for what a valid username/PIN actually is
 * (see docs/contracts/auth-contract.md, which itself flags the minimum PIN
 * length as "a recommendation, confirm with product before launch" rather
 * than a settled rule). Do not tighten this into business logic.
 */

import type { en } from "../translations/en";

type ValidationKey = Extract<keyof typeof en, `auth.validation.${string}`>;

const PIN_MIN_LENGTH = 4;
const PIN_MAX_LENGTH = 8; // UI guard only, not a contract rule.

export interface LoginFieldErrors {
  username?: ValidationKey;
  pin?: ValidationKey;
}

export function validateLoginFields(username: string, pin: string): LoginFieldErrors {
  const errors: LoginFieldErrors = {};

  if (username.trim().length === 0) {
    errors.username = "auth.validation.usernameRequired";
  }

  if (pin.length === 0) {
    errors.pin = "auth.validation.pinRequired";
  } else if (!/^\d+$/.test(pin)) {
    errors.pin = "auth.validation.pinDigitsOnly";
  } else if (pin.length < PIN_MIN_LENGTH || pin.length > PIN_MAX_LENGTH) {
    errors.pin = "auth.validation.pinLength";
  }

  return errors;
}

export function sanitizePinInput(rawValue: string): string {
  return rawValue.replace(/\D/g, "").slice(0, PIN_MAX_LENGTH);
}
