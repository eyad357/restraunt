/**
 * Shared money formatting/estimation utility.
 *
 * NEW SHARED FILE — added during P1-FE-03 (Dashboard), extended during
 * P1-FE-04 (Orders). See INTEGRATION_REQUEST.md for why this exists at
 * all: docs/contracts/money-contract.md explicitly states "a shared
 * `formatMoney()` / `parseMoney()` utility is the only sanctioned place
 * that touches the numeric value" and names "Person 1/frontend owner" as
 * responsible for it. Any module needing to display or estimate money
 * should import from here rather than touching a `Money` string itself.
 *
 * `formatMoney` does no arithmetic — pass one already-computed value in,
 * get one formatted string out. `sumMoney`/`scaleMoney` (added in
 * P1-FE-04) DO arithmetic, but only for CLIENT-SIDE ESTIMATES that are
 * never submitted to the backend as fact: the Orders module's
 * order-creation cart needs a running total to show the operator before
 * submission, computed from Product/Variant/Modifier prices that are
 * already visible client-side. The actual order — and its authoritative
 * `subtotal`/`total` — is always computed server-side once submitted
 * (see modules/orders/types/order.ts's CreateOrderRequest, which never
 * sends a price). No decimal-library dependency was added: amounts here
 * are small retail POS values, so integer-cents arithmetic (parse to
 * whole cents, operate on integers, format back) is precision-safe
 * without floating-point drift, well within safe-integer range.
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

function toCents(value: Money): number {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Math.round(numeric * 100) : 0;
}

function fromCents(cents: number): Money {
  return (cents / 100).toFixed(2);
}

/**
 * Sums several `Money` values into one, via integer cents — for a
 * CLIENT-SIDE ESTIMATE ONLY (e.g. a cart preview total before an order is
 * submitted). Never use the result as the value actually sent to the
 * backend for persistence; the server computes and owns the real total.
 */
export function sumMoney(values: Money[]): Money {
  return fromCents(values.reduce((total, value) => total + toCents(value), 0));
}

/**
 * Multiplies a `Money` value by a positive integer factor (e.g. line
 * quantity), via integer cents — same client-side-estimate-only scope as
 * `sumMoney`.
 */
export function scaleMoney(value: Money, factor: number): Money {
  return fromCents(toCents(value) * Math.max(0, Math.trunc(factor)));
}
