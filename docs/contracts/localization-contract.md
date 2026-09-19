# Localization & RTL Contract

Status: STABLE (Phase 00)
Owner: Shared

## Languages

- Arabic (`ar`) — primary, default.
- English (`en`) — secondary, supported.
- No other locales in MVP.

## LocalizedString shape

Used for any user-facing name (Category, Product, Variant, Modifier,
InventoryItem — see domain-entities.md):

```ts
type LocalizedString = {
  ar: string;
  en: string | null; // null falls back to `ar` at render time, never blank
};
```

Stored as a JSON column on the backend (`{"ar": "...", "en": "..."}`), not as two
separate flat columns, so adding a locale later doesn't require a migration per
field.

## Request-level locale selection

- `Accept-Language: ar` or `en` header selects which locale the **server** uses
  for anything it generates as plain text (error `message`, notification text,
  print receipts) — see `api-contract.md` error format note.
- The frontend selects its own UI chrome language independently and sends
  `Accept-Language` to match, but `LocalizedString` fields are always returned
  **in full** (`{ar, en}`) regardless of `Accept-Language` — the frontend picks
  which key to render, so it can offer a language toggle without refetching.

## RTL

- Frontend is RTL-first: base layout direction is `rtl` when locale is `ar`, `ltr`
  for `en`. This is a frontend layout concern (CSS logical properties, icon
  mirroring) — not something the API contract encodes, since the API returns data,
  not layout direction.
- Numbers and money remain LTR within RTL text (standard bidi convention for
  digits/currency) — a frontend concern noted here so both developers style
  consistently.

## Rule

Nothing in the domain contract, enums, or API assumes a single language — every
place a human-readable label appears uses `LocalizedString`, and every enum value
(`OrderStatus`, etc.) is a stable machine code translated **client-side** via a
shared translation table, never stored as localized text in the database.
