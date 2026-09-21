/**
 * Shared money formatting utility.
 *
 * NEW SHARED FILE — added during P1-FE-03 (Dashboard), not part of the
 * original P1-FE-01A foundation. See INTEGRATION_REQUEST.md for why this
 * was added now rather than silently: docs/contracts/money-contract.md
 * explicitly states "a shared `formatMoney()` / `parseMoney()` utility is
 * the only sanctioned place that touches the numeric value" and names
 * "Person 1/frontend owner" as responsible for it. The Dashboard is the
 * first module that needs to display a money value, so this is where it
 * had to exist by. Any other module (cashier, inventory, expenses,
 * reports, orders, menu) should import from here rather than formatting a
 * `Money` string itself.
 *
 * Deliberately does NOT do arithmetic (no summing, no percentage math).
 * Per the Dashboard task's own rule ("do not reimplement financial
 * calculations client-side"), every aggregate figure this app displays
 * (today's sales, report totals, etc.) is computed server-side and handed
 * to the frontend already summed — this utility only formats a single
 * already-computed value for display. If a future module genuinely needs
 * money arithmetic (not just display), that is a separate, explicit
 * decision — see money-contract.md's note that a decimal library would be
 * needed for that, which this file does not add.
 */

import type { Money } from "../../contracts/entities";
import type { Locale } from "../../contracts/enums";

const CURRENCY_SUFFIX: Record<Locale, string> = {
  ar: "ج.م",
  en: "EGP",
};

/**
 * Formats an already-rounded 2-decimal `Money` string for display, with
 * thousands separators and a locale-appropriate EGP suffix. Never sums or
 * otherwise combines multiple Money values — pass one value in, get one
 * formatted string out.
 *
 * Money digits are formatted LTR-isolated regardless of locale (see
 * localization-contract.md's bidi convention for numbers) — apply the
 * shared `.money` CSS class (src/index.css) to the element you render
 * this into.
 */
export function formatMoney(value: Money, locale: Locale): string {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    // Defensive: a malformed Money string should never crash the UI.
    return value;
  }

  const formattedNumber = new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-EG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numeric);

  return `${formattedNumber} ${CURRENCY_SUFFIX[locale]}`;
}
