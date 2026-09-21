/**
 * Auth-module-local translations. Kept out of the shared chrome
 * dictionaries (src/i18n/translations/) per this phase's instructions —
 * only this module reads these keys, via useAuthTranslation.
 */
export const en = {
  "auth.login.title": "Sign in",
  "auth.login.subtitle": "Enter your username and PIN to continue.",
  "auth.login.usernameLabel": "Username",
  "auth.login.usernamePlaceholder": "Enter your username",
  "auth.login.pinLabel": "PIN",
  "auth.login.pinPlaceholder": "Enter your PIN",
  "auth.login.submit": "Sign in",
  "auth.login.submitting": "Signing in…",
  "auth.validation.usernameRequired": "Username is required.",
  "auth.validation.pinRequired": "PIN is required.",
  "auth.validation.pinDigitsOnly": "PIN must contain digits only.",
  "auth.validation.pinLength": "PIN must be between 4 and 8 digits.",
  "auth.error.transport": "Couldn't reach the server. Check your connection and try again.",
  "auth.error.generic": "Sign-in failed. Please check your username and PIN and try again.",
  "auth.logout.signingOut": "Signing out…",
} as const;
