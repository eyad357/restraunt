# HANDOFF.md

## Phase
P1-FE-04 — Orders Frontend Module

## Owner
Person 1

## Module
Orders (`frontend/src/modules/orders/`)

## Branch
`person1/frontend`

## Implemented

A production-grade Orders workspace, protected by the existing auth
mechanism, built entirely on the frozen foundation/auth/dashboard work:

- **`/orders`** — list with filters (status, type, source, payment
  status, date range, and a client-side search over the loaded page),
  paginated table, empty/loading/error states with retry.
- **`/orders/:orderId`** — full order details: items (with modifiers,
  quantities, notes), order-level notes, subtotal/total, payment
  breakdown with a record-payment form and per-payment void action,
  a delivery panel for DELIVERY orders (driver assignment, status
  transitions), and a cancel action gated to the documented allowed
  statuses.
- **`/orders/new`** — order-level fields (type, source,
  scheduled-for for PRE_ORDER, notes), a Category → Product → Variant
  → Modifier browsing/configuration flow, a client-side cart with an
  estimated running total, and a single order-submission call.

Every async operation has independent loading/success/empty/error
handling with retry where appropriate, per this phase's own
instructions — no section blanks the whole page.

## Files added/modified

**New** (all under `frontend/src/modules/orders/`):
```
index.ts, routes.tsx
types/order.ts
services/{ordersApi,menuCatalogService}.ts
hooks/{useAsyncData,useMutation,useOrder,useOrdersList,
       useOrderMutations,useMenuCatalog,useCart,useOrdersTranslation}.ts
translations/{en,ar}.ts
components/{SectionState,StatusBadges,OrdersHeader,OrderFiltersBar,
            OrdersTable,OrderItemsList,PaymentPanel,DeliveryPanel,
            CancelOrderControl,CategoryProductPicker,ItemConfigurator,
            CartPanel}.tsx
pages/{OrdersListPage,OrderDetailsPage,NewOrderPage,orders.css}
```

**Modified:**
- `frontend/src/modules/orders/routes.tsx` — real route registration
  (was an empty skeleton).
- `frontend/src/money/formatMoney.ts` — **extended**, not newly created
  (see "Shared files touched" below).
- `INTEGRATION_REQUEST.md` — extended with 7 new items (5–11) found
  during this phase, appended after the existing P1-FE-03 items.

No `backend/`, `docs/`, `frontend/contracts/`, Menu/Kitchen/Cashier/
Inventory/Delivery/Expenses/Reports/Settings module, Dashboard module,
Auth module, or shared foundation file (bootstrap, router, API client,
AuthContext, ProtectedRoute, LocaleContext, shared UI primitives,
global theme, environment config) was touched.

## Shared files touched

One, and only an **additive extension**: `frontend/src/money/formatMoney.ts`
gained `sumMoney()` and `scaleMoney()` — integer-cents-safe arithmetic
used only for the order-creation cart's client-side estimated total.
Nothing these compute is ever submitted to the backend; order creation
only ever sends product/variant/modifier IDs and quantities — the
server computes and owns the real total. This follows the same
disclosure this file already established in P1-FE-03 (money-contract.md
assigns this utility to "Person 1/frontend owner"). Documented as
item 5 in `INTEGRATION_REQUEST.md`.

## Dependencies

None added. Same dependency set as the rest of the project
(`react`, `react-dom`, `react-router-dom`).

## Contract dependencies

- `docs/contracts/api/api-contract.md` — generic REST/pagination/
  filtering conventions, idempotency requirements, actions convention.
- `docs/contracts/order-lifecycle-contract.md` — `OrderStatus`
  transitions, which ones are cancellable.
- `docs/contracts/payment-contract.md` — payment recording/void
  endpoints and rules, MIXED-via-multiple-calls convention.
- `docs/contracts/delivery-contract.md` — delivery info shape and the
  `PATCH /orders/{id}/delivery` endpoint.
- `docs/contracts/branch-context-contract.md` — branch scoping for
  order creation.
- `docs/contracts/money-contract.md` — `Money` handling rules.
- `docs/contracts/offline-readiness-contract.md` — Idempotency-Key
  generation convention.
- `frontend/contracts/{entities,enums,api}.ts` — every domain type
  used is imported from here, nothing duplicated.

## API assumptions (see `INTEGRATION_REQUEST.md` for full detail)

1. **`POST /orders` request body shape** is not documented — inferred
   conservatively (IDs + quantities only, no prices, no `branch_id` in
   body). The single biggest assumption in this phase (item 6).
2. **No menu/catalog browsing endpoint exists at all** — order creation
   ships with an honest "unavailable" default; an isolated,
   opt-in-only experimental adapter exists purely for this phase's own
   QA (item 7).
3. `OrderItem` has no product/variant display name — shown as a
   labeled short ID instead (item 8).
4. `PaymentComponent` has no `voided` field despite the contract's own
   `paid_total` formula referencing one — no "remaining balance" is
   self-computed; only the server's `payment_status`/`total` are
   trusted (item 9).
5. `DeliveryInfo` has no address field — none shown or invented
   (item 10).
6. Owner-initiated order creation is disabled (no branch-selection
   data source — item 11, a consequence of the P1-FE-03 branch-name
   gap).
7. Order list `search` is client-side over the loaded page only — no
   search/full-text filter is documented for `/orders`.

## Known limitations

- **No real backend exists.** All QA below used a throwaway,
  contract-shaped mock server (not included in this archive or
  committed to the repo) plus the isolated experimental catalog
  adapter — actual production API integration is untested by
  construction.
- **Order creation is unusable end-to-end against a real backend
  today** — it depends on the undocumented menu-catalog endpoint
  (see API assumptions #2). The UI, cart mechanics, and submission
  call are fully built and tested against the throwaway mock; only the
  real catalog data source is missing.
- **Owner cannot create orders** until a branch-selection data source
  exists (API assumptions #6).
- **No session rehydration on page reload** (a P1-FE-02 limitation,
  unchanged) — a fresh reload always starts logged out.
- Product/variant names in Order Details are truncated IDs, not
  human-readable names (API assumptions #3).
- No delivery address is ever shown (API assumptions #5) — a real
  delivery order's UI is missing what is normally essential
  information, purely because the contract doesn't carry it yet.

## Validation

| Command | Result |
|---|---|
| `npx tsc -b` (strict) | ✅ clean, no output |
| `npm run build` | ✅ succeeds — 110 modules transformed |
| `npm run lint` (oxlint) | ✅ 0 errors; same 3 pre-existing foundation warnings, none new |

**Interactive/visual QA** (Playwright, headless Chromium, against a
throwaway mock backend — not part of this archive or the repo):

- Unauthenticated `/orders` → redirects to `/login`; successful login
  correctly returns to the originally-requested `/orders` (not just the
  dashboard).
- Orders list: all filters, pagination, and the table itself verified
  with real (mock) data in both Arabic (RTL) and English (LTR); no
  console/page errors; no horizontal overflow at 1280px.
- Order details for a DELIVERY order: delivery panel rendered, driver
  assignment worked and updated the UI immediately.
- Payment recording on a PENDING-payment order: form submission
  correctly transitioned the order to `PAID`.
- Cancellation: confirm dialog, confirmed cancellation correctly
  transitioned a `PLACED` order to `CANCELLED`.
- Full order creation: category → product → variant → modifier →
  quantity → note → add to cart → order-level notes → submit. Cart's
  client-side estimated total was verified arithmetically correct
  (Large variant + Extra cheese modifier × quantity 2), and the
  server's authoritative total correctly replaced the estimate once
  the order was actually created.
- Owner session: `/orders/new` correctly shows the branch-required
  gate instead of the creation flow.
- Empty state verified (filtering to a status with zero matching mock
  orders).

## Integration instructions

1. Extract this archive into your local repo root (same layout as the
   previous handoffs): `frontend/src/modules/orders/`,
   `frontend/src/money/formatMoney.ts` (overwrite — it's an extension
   of the existing file, not a new one), and `INTEGRATION_REQUEST.md`
   (overwrite — it now includes both the P1-FE-03 and P1-FE-04 items).
2. `cd frontend && npm install` (no new dependencies, but safe to
   re-run).
3. `npm run dev`, then sign in and visit `/orders`, `/orders/new`, and
   `/orders/:id` for any listed order.
4. Order creation will show "menu data isn't available yet" until a
   real menu/catalog endpoint exists — this is expected, honest
   behavior, not a bug (see API assumptions #2). To exercise the
   creation UI's mechanics without a backend, set
   `VITE_ORDERS_EXPERIMENTAL_MENU_API=1` in a local `.env` against a
   test server implementing the proposed (unconfirmed)
   `/categories`/`/products`/.../variants`/`.../modifiers` shapes —
   never do this in a shipped/production build.

## Commit

`4e8991e` — "feat(frontend): implement restaurant orders" — on branch
`person1/frontend`. Not merged into `main`.

Builds on: `8c4d158` (P1-FE-01A foundation), `52e2076` (P1-FE-02 auth),
`01b8d56` (P1-FE-03 dashboard).

## Person 2 files modified

NO
