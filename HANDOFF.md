# HANDOFF.md

## Phase
P1-FE-03 — Restaurant Dashboard

## Owner
Person 1

## Implemented

A real, production-grade operational Dashboard at `/dashboard` (protected
route), built entirely on the frozen P1-FE-01A foundation and P1-FE-02
auth — no foundation or auth rebuild, no other module started.

Sections, top to bottom, each with its own independent
loading/success/empty/error state:

1. **Dashboard Header** — title, subtitle, current date, role chip
   (Owner/Cashier), and a role-appropriate branch-scope chip ("All
   branches" for Owner, "Your branch" for Cashier — never a fabricated
   branch name; see "API/data assumptions" below).
2. **KPI Summary** — 7 cards: Today's Sales (Owner-only), Today's Orders,
   Pending Orders, Completed Orders, Cancelled Orders, Active Delivery
   Orders, Low Stock Items. Each backed by its own request so one failing
   card never blanks the others.
3. **Order Status Overview** — distribution across the real `OrderStatus`
   enum (`DRAFT`/`PLACED`/`PREPARING`/`READY`/`COMPLETED`/`CANCELLED`) for
   today, as a labeled bar list.
4. **Sales Overview** — a 7-day revenue trend, gated to Owner accounts per
   the reporting contract; hand-rolled inline SVG bar chart (no charting
   library added).
5. **Recent Orders** — the latest 8 orders with time, type, source,
   status, payment status, and total.
6. **Operational Alerts** — unread `ORDER_READY` / `LOW_STOCK`
   notifications, each dismissible via the documented mark-read action.
7. **Quick Actions** — New Order / Kitchen / Cashier / Delivery /
   Inventory, all rendered as real, disabled `<button>` elements with a
   "Not available yet" state, since none of those modules exist yet.

## Files

New (all under `frontend/src/modules/dashboard/` unless noted):
```
INTEGRATION_REQUEST.md                                (repo root)
frontend/src/money/formatMoney.ts                      (NEW SHARED FILE)
frontend/src/modules/dashboard/
  index.ts
  routes.tsx
  types/dashboard.ts
  services/dashboardApi.ts
  hooks/{useAsyncData,useOrderStatusCounts,useTodayOrdersCount,
         useActiveDeliveries,useLowStockItems,useRecentOrders,
         useSalesReport,useAlerts,useDashboardTranslation}.ts
  translations/{en,ar}.ts
  components/{SectionState,KpiCard,icons,StatusBadge,DashboardHeader,
              KpiSummary,OrderStatusOverview,SalesTrendSection,
              RecentOrdersTable,OperationalAlerts,QuickActions}.tsx
  pages/{DashboardPage.tsx,dashboard.css}
```

Modified:
- `frontend/src/modules/dashboard/routes.tsx` — real route registration
  (was an empty skeleton from P1-FE-01A).
- `frontend/src/modules/auth/pages/LoginPage.tsx` — **own module, not
  shared** — default post-login redirect target changed from `/` to
  `/dashboard` now that a real home screen exists.

No shared foundation file was modified. No `backend/`,
`frontend/contracts/`, or Person 2 module was touched.

## Routes

- `/dashboard` — registered by `dashboard/routes.tsx`, auto-discovered by
  the existing `import.meta.glob` mechanism (no shared `router.tsx` edit).
  Wrapped in the shared `<ProtectedRoute>` — redirects to `/login` when
  unauthenticated (verified, see Validation).
- The shared router's root `/` still renders the foundation's
  `FoundationCheckPage` — taking over `/` itself would require editing the
  frozen `router.tsx`. See `INTEGRATION_REQUEST.md` for the proposal to
  eventually make `/` redirect into the dashboard.

## API / data assumptions

Everything the Dashboard fetches goes through the shared
`api/client.ts` helpers, restricted to endpoints/fields the Phase 00
contracts actually document. Where a contract was incomplete, the
assumption is documented in code comments and repeated here:

- **KPI/status counts** use `GET /orders?...&page_size=1` and read
  `meta.total_count` — a documented, cheap exact-count technique, not a
  new endpoint.
- **"Today"** is scoped by `created_at` in UTC calendar-day boundaries —
  no business-day/timezone convention is documented anywhere, so this is
  the least-invented interpretation (see Known Limitations).
- **Active Delivery Orders** and **Low Stock Items** counts are only
  guaranteed exact for the first page (100 rows) returned by their
  respective list calls — the UI shows "at least N" if
  `meta.total_count` exceeds what was returned, rather than asserting a
  possibly-wrong exact number.
- **`/reports/sales` response shape** (`{ period, points: [{date,
  total}], total }`) is a best-effort reconstruction — the contract only
  describes the aggregation rule, not field names. Validated at runtime;
  a mismatched real backend degrades to this section's error state
  instead of crashing.
- **No branch name is ever displayed** — no `GET /branches` endpoint is
  documented anywhere in `docs/contracts/`. The header shows a
  role-appropriate scope description instead ("All branches" / "Your
  branch"), which is the contract's own documented default behavior, not
  an invention.
- **No human order number exists** in the contracts (`Order.id` is a
  UUID) — Recent Orders shows a labeled short UUID fragment (`#XXXXXX`),
  not a fabricated sequential number.
- **Reporting is Owner-only**, per `reporting-contract.md`'s explicit
  "Cashier gets 403 FORBIDDEN_ROLE" rule — the Sales KPI and Sales
  Overview section never issue that request for a Cashier session at
  all; they show a role-appropriate notice instead.

## Shared files modified

None. One new shared file was added:
`frontend/src/money/formatMoney.ts` — `docs/contracts/money-contract.md`
explicitly assigns a shared `formatMoney()`/`parseMoney()` utility to
"Person 1/frontend owner," and the Dashboard is the first module needing
to display a `Money` value. It does no arithmetic — every aggregate
figure is computed server-side, per this phase's own rule against
client-side financial calculations. See `INTEGRATION_REQUEST.md` item 1
for the full rationale and an ask that Person 2 reuse it rather than
reformatting `Money` independently.

## Integration request

`INTEGRATION_REQUEST.md` (included in this archive, repo root) documents
four items found while building this phase, none of which blocked
shipping:
1. New shared `formatMoney.ts` utility (see above) — flagged, not hidden.
2. No documented endpoint to resolve a branch id to a display name, or to
   list branches for an Owner selector.
3. `GET /reports/sales` response shape is not fully specified in
   `reporting-contract.md`.
4. The shared `api/client.ts` still never sends `Accept-Language` (first
   flagged during P1-FE-02, now affecting a second module's error-message
   localization).

## Validation

Run against the exact committed state (commit `01b8d56`):

| Command | Result |
|---|---|
| `npx tsc -b` (strict) | ✅ clean, no output |
| `npm run build` | ✅ succeeds — 82 modules transformed |
| `npm run lint` (oxlint) | ✅ 0 errors; same 3 pre-existing foundation warnings (fast-refresh notices in `LocaleContext.tsx`/`AuthContext.tsx`), none new |

**Visual/behavioral QA** (Playwright, headless Chromium, against a
throwaway mock backend matching the documented contract shapes — the mock
server itself is **not** part of this archive or the repo, it existed only
for this QA session):

- Unauthenticated `GET /dashboard` correctly redirects to `/login` (route
  protection confirmed).
- Real login flow (username + PIN through the actual `LoginForm`) →
  successful redirect to `/dashboard`.
- Every section rendered correct data end-to-end: KPIs, order status
  distribution, 7-day sales chart, recent orders table, operational
  alerts (with working mark-as-read), quick actions (correctly disabled).
- **Arabic (RTL, default)** and **English (LTR)** both verified — correct
  `dir`/`lang`, correct number formatting (Arabic-Indic digits with `ar-EG`
  locale), correct text alignment, no mixed-language strings.
- **No console errors or uncaught exceptions** in any of the above.
- **No horizontal overflow** at 1280px, 1024px, and 800px viewport
  widths — KPI grid reflows from 4→3→2→1 columns; Recent Orders table
  stays within its scroll container.
- **Empty states** verified: with all-zero/empty mock data, Order Status
  Overview, Recent Orders, and Operational Alerts each show their
  professional empty-state copy (no `null`/`undefined`/bare `0` leaking
  into the UI).
- **Error state + Retry** verified: a simulated `500` on `/reports/sales`
  correctly showed the server's error message in the Sales Overview
  section (and `!` in the Today's Sales KPI) without affecting any other
  section, with a working "Retry" button; retrying against a healthy
  backend afterward showed the section recovering with real data.

## Known limitations

- **No real backend exists.** All QA above used a throwaway, contract-shaped
  mock server that is not included in this archive or committed to the
  repo — actual production API integration is untested by construction.
- **"Today" is UTC-calendar-day**, not a configured business-day/timezone
  boundary (none is documented) — an order placed near local midnight in
  a timezone ahead of UTC could land in a different "today" bucket than a
  cashier on the floor expects.
- **Active Delivery Orders and Low Stock Items counts** are only exact up
  to the first 100 rows of their respective lists; beyond that, the UI
  shows "at least N" rather than a possibly-wrong exact figure.
- **No session rehydration on page reload** (a P1-FE-02 limitation,
  unchanged) — a fresh reload always starts logged out until a new login
  completes; this is why the Dashboard could not be reached directly via
  browser URL without going through the login form first in QA.
- **Branch name is never shown** (no endpoint exists to resolve one) —
  see `INTEGRATION_REQUEST.md` item 2.
- **`/reports/sales` response shape is assumed**, not contract-confirmed —
  see `INTEGRATION_REQUEST.md` item 3.

## Commit

`01b8d56` — "feat(frontend): implement restaurant dashboard" — on branch
`person1/frontend`. Not merged into `main`.

Prior commits this builds on: `8c4d158` (P1-FE-01A foundation), `52e2076`
(P1-FE-02 auth).

## Person 2 files modified

NO
