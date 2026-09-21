/**
 * Shared/chrome translation keys only.
 *
 * Business-module strings (orders, menu, kitchen, etc.) belong in each
 * module's own translation file once that module is implemented — do not
 * add module-specific keys here (see LocaleContext.tsx doc comment).
 */
export const en: Record<string, string> = {
  "app.name": "Restaurant Management System",
  "app.loading": "Loading…",
  "app.error.title": "Something went wrong",
  "app.error.body": "An unexpected error occurred. Try reloading the page.",
  "app.error.reload": "Reload",
  "app.notFound.title": "Page not found",
  "app.notFound.body": "The page you're looking for doesn't exist.",
  "app.notFound.home": "Go to home",
  "app.locale.toggle": "العربية",
};
