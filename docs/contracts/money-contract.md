# Money & Decimal Contract

Status: STABLE (Phase 00)
Owner: Shared

## Rules

1. **Currency**: EGP only. No multi-currency support, no currency field on money
   values in MVP — it is implicit system-wide. If multi-currency is ever needed,
   every money field would need an accompanying currency code; not built now
   because the brief states EGP only.
2. **Storage**: PostgreSQL `NUMERIC(12, 2)`. Never `FLOAT`/`DOUBLE PRECISION`.
3. **Backend runtime type**: Python `Decimal`, never `float`. All arithmetic
   (totals, modifiers, shift reconciliation) is performed in `Decimal` with
   explicit rounding (`ROUND_HALF_UP` to 2 decimal places) at the point a value is
   persisted or displayed — not at every intermediate step, to avoid compounding
   rounding error.
4. **Wire format**: money is serialized as a **JSON string** (`"45.50"`), not a
   number, in every API request/response (see `api-contract.md`). This prevents
   JS's IEEE-754 doubles from ever touching a money value, even transiently.
5. **Frontend runtime type**: money strings are parsed into a fixed-point-safe
   representation for display and light math (e.g. a decimal library such as
   `decimal.js` — implementation detail for Person 1/frontend owner of the shared
   money utility) rather than native JS numbers. The shared TypeScript contract
   types money fields as `string`, and a shared `formatMoney()` / `parseMoney()`
   utility is the only sanctioned place that touches the numeric value.
6. **Zero and negative values**: negative money values are valid only for specific
   documented cases (e.g. `cash_difference` on a shift close can be negative if
   short). Product/Modifier prices are non-negative by convention (see
   domain-entities.md note on Modifier `price_delta`).
