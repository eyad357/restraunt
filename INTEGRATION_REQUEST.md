# INTEGRATION_REQUEST.md — P1-FE-03 (Dashboard)

Per the phase instructions: real gaps found in shared infrastructure while
building the Dashboard are documented here rather than patched silently.
None of these blocked the Dashboard from shipping — each has a documented,
conservative workaround inside `frontend/src/modules/dashboard/` — but each
will likely affect other modules too, so they're worth a deliberate
decision rather than being solved ad hoc by whoever hits them next.

---

## 1. New shared file added: `frontend/src/money/formatMoney.ts`

**Not a modification of an existing shared file — a new one.**
`docs/contracts/money-contract.md` states explicitly: *"a shared
`formatMoney()` / `parseMoney()` utility is the only sanctioned place that
touches the numeric value"* and names *"Person 1/frontend owner"* as
responsible for it. No such utility existed before this phase — the
Dashboard is the first module that needs to display a `Money` value, so it
had to exist by now or every money display in the Dashboard would have
hand-rolled its own formatting (exactly what the contract says not to do).

**What was added:** `formatMoney(value: Money, locale: Locale): string` —
formats a single already-computed `Money` string with thousands separators
and a locale-appropriate EGP suffix. Deliberately does **no arithmetic**
(no summing, no percentages) — per this phase's "don't reimplement
financial calculations client-side" rule, every aggregate the Dashboard
shows is computed server-side.

**Ask:** Person 2 (cashier, inventory, expenses, reports, settings) will
also need to display money. Please import `formatMoney` from
`src/money/formatMoney.ts` rather than reformatting `Money` strings
independently, so there's still only one sanctioned place touching the
value, per the contract. If this should live somewhere else (e.g. inside
an existing shared folder instead of a new top-level one), that's a easy
rename — flag it and I'll move it.

## 2. No documented endpoint to resolve a branch name

**Gap:** `Branch` is a defined entity (`frontend/contracts/entities.ts`:
`id`, `name`, `is_active`, `created_at`, `updated_at`), and
`docs/contracts/branch-context-contract.md` describes how a branch is
*scoped* (CASHIER implicit via JWT, OWNER via optional `?branch_id=`) —
but no endpoint anywhere in `docs/contracts/` (checked
`api-contract.md`, `branch-context-contract.md`, and grepped the whole
`docs/` tree for `/branches`) lets the frontend turn a `branch_id` UUID
into a display name. There is also no endpoint to enumerate branches for
an Owner branch-selector.

**Workaround shipped:** The Dashboard header shows a role-appropriate
scope description instead of a name — *"All branches"* for Owner (the
contract's own documented default when `branch_id` is omitted) and *"Your
branch"* for Cashier — never a fabricated name, never a raw UUID.

**Ask:** A `GET /branches` (list, presumably Owner-only or filtered by what
the requester can see) and/or `GET /branches/{id}` endpoint would unblock:
this Dashboard's branch name display, an Owner branch-selector, and
presumably Person 2's `settings` module (branch management is listed under
Settings in `docs/contracts/ownership-map.md`). Worth adding to the Phase
1 backend/contract scope.

## 3. `GET /reports/sales` response shape is not fully specified

**Gap:** `docs/contracts/reporting-contract.md` documents the
*aggregation rule* ("Aggregates `Order.total` for `status = COMPLETED`
orders in the period. Grouped by day within the period for chart-friendly
output.") but not the actual JSON field names of the response.

**Workaround shipped:** `dashboard/services/dashboardApi.ts` assumes a
`{ period, points: [{ date, total }], total }` shape and validates it at
runtime (`isSalesReportResponse`) before trusting it — an incompatible
real backend produces this section's clean "couldn't load" error state
instead of a crash. This is a best-effort reconstruction, not a contract
fact.

**Ask:** Please confirm/document the actual `/reports/sales` response
shape in `reporting-contract.md` once the backend implements it, so this
assumption can be replaced with a contract fact.

## 4. Shared API client never sends `Accept-Language`

**Gap** (first surfaced in P1-FE-02, now affecting a second module):
`docs/contracts/localization-contract.md` says the server uses
`Accept-Language` to localize `message` text, but `src/api/client.ts` (the
shared, frozen client every module besides `auth`'s raw login call uses)
never sets that header on any request. The Dashboard's error states will
show whatever language the backend defaults to, not necessarily the
user's current locale.

**Workaround:** None applied — this is now affecting real error UX in a
second module, which is exactly the signal this should move from "known
limitation" to "actually fix," but `src/api/client.ts` is shared/frozen
and not owned by this phase's scope.

**Ask:** Add an optional `headers` passthrough (or a global
locale-accessor the client reads internally) to
`src/api/client.ts`'s `RequestOptions`/`request()`, so every module
benefits from localized error messages at once rather than each module
reinventing its own raw-fetch workaround (as `modules/auth/services/authApi.ts`
already had to).

---

None of the above required editing `backend/`, `frontend/contracts/`, or
any Person 2 module — all workarounds are contained inside
`frontend/src/modules/dashboard/` (and the one new shared file in item 1,
flagged rather than hidden).
