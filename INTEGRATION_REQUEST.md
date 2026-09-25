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

---

# P1-FE-04 (Orders) — additional items

Same discipline as above: gaps found while building the Orders module,
documented rather than silently resolved. None blocked shipping — each
has a conservative, disclosed workaround inside
`frontend/src/modules/orders/`.

## 5. `formatMoney.ts` extended with `sumMoney`/`scaleMoney`

**Not a new file — an additive extension of the file created in item 1.**
Order creation needs a running cart estimate before submission (a
Category → Product → Variant → Modifier cart, per this phase's brief),
which requires adding/multiplying `Money` values. Per money-contract.md's
own assignment of this utility to "Person 1/frontend owner," this was
extended rather than having the Orders module hand-roll its own money
arithmetic (which the contract explicitly says not to do).

**What was added:** `sumMoney(values: Money[]): Money` and
`scaleMoney(value: Money, factor: number): Money` — both via integer-cents
arithmetic (no floating-point drift), explicitly documented as
CLIENT-SIDE-ESTIMATE-ONLY. Nothing computed by these functions is ever
submitted to the backend as a price — `CreateOrderRequest`
(`modules/orders/types/order.ts`) only ever sends product/variant/modifier
IDs and quantities; the server computes and owns the real total.

**Ask:** same as item 1 — Person 2's modules (cashier, inventory,
expenses) should reuse `sumMoney`/`scaleMoney` from
`src/money/formatMoney.ts` for any similar estimate-only math rather than
reimplementing it, so there's still one sanctioned place touching `Money`.

## 6. No documented request body shape for `POST /orders`

**Gap:** `docs/contracts/api/api-contract.md`'s idempotency section
confirms the endpoint exists ("`POST /orders`... require an
`Idempotency-Key`"), and `docs/contracts/examples/order-example.json` /
`online-order-example.json` show the *response* shape, but no document
anywhere specifies the *request* body — not the field names, not whether
a cashier-created order lands directly in `PLACED` or has to pass through
`DRAFT` via some other not-yet-documented item-mutation endpoint first
(`order-lifecycle-contract.md` only says an order's items are "mutable
while DRAFT," never how).

**Workaround shipped:** `modules/orders/types/order.ts`'s
`CreateOrderRequest` is a conservative, documented assumption: `{ type,
source, items: [{ product_id, variant_id, modifier_ids, quantity, notes
}], notes, scheduled_for }` — no price fields (server computes those), no
`branch_id` in the body (branch context is the existing header/implicit
mechanism, per branch-context-contract.md). The service layer
(`services/ordersApi.ts`) calls `POST /orders` once, assuming this
directly places the order (matching how a real POS actually operates:
cashier builds the cart locally, confirms once).

**Ask:** Please confirm/document the real `POST /orders` request schema,
and settle whether cashier-created orders go straight to `PLACED` or need
a separate confirm/place action after creation. This is the single
biggest unconfirmed assumption in the Orders module — everything else
(list, details, cancel, payments, delivery) is built against endpoints
whose *existence* is at least confirmed in `api-contract.md`, even where
some field-level details were still inferred.

## 7. No menu/catalog browsing endpoint exists at all

**Gap:** Order creation needs to browse Category → Product → Variant →
Modifier (explicitly required by this phase's brief), but no such
endpoint is documented anywhere — checked `api-contract.md`,
`domain-entities.md`, and grepped the whole `docs/` tree for
`/products`, `/categories`, `/variants`, `/modifiers` (the only hit was
the unrelated `GET /reports/products` ranking endpoint).

**Workaround shipped:** `modules/orders/services/menuCatalogService.ts`
defines the `MenuCatalogService` boundary the UI depends on. The
**shipped, default** implementation (`UnavailableMenuCatalogService`)
never calls any endpoint — it always rejects, and order creation shows a
clear "menu data isn't available yet" state, never fake products. A
second implementation (`ExperimentalHttpMenuCatalogService`), calling
proposed-but-unconfirmed endpoint names (`GET /categories`, `GET
/products?category_id=`, `GET /products/{id}/variants`, `GET
/products/{id}/modifiers`), exists **only** for this phase's own
interactive QA and is never active unless the operator explicitly sets
`VITE_ORDERS_EXPERIMENTAL_MENU_API=1` in their own local `.env` (unset by
default; not present in the committed `.env.example`). This is the
"temporary development mock" this phase's own instructions explicitly
allow, kept fully isolated from the production code path.

**Ask:** This is the most consequential gap in the whole phase — Order
creation cannot function against a real backend at all until a menu/
catalog read API is documented. Endpoint names above are only a proposal
for discussion, not a request to adopt them as-is.

## 8. `OrderItem` has no product/variant display name

**Gap:** `frontend/contracts/entities.ts`'s `OrderItem` carries
`product_id`/`variant_id` (UUIDs) but no name snapshot for either —
unlike `OrderItemModifier`, which does carry `name_snapshot` specifically
so historical items stay readable if the menu changes later. There's no
way for the frontend to show "Double Burger" in Order Details; only a
truncated UUID fragment.

**Workaround shipped:** `modules/orders/components/OrderItemsList.tsx`
shows a labeled short ID fragment (matching the existing convention for
the order's own ID) rather than fabricating or looking up a name through
the (currently unavailable — see item 7) menu catalog.

**Ask:** Consider adding a `product_name_snapshot`/`variant_name_snapshot`
to `OrderItem`, mirroring what `OrderItemModifier` already does, so order
history stays human-readable without depending on the menu catalog still
having that product.

## 9. `PaymentComponent` has no `voided` field despite the derivation formula referencing one

**Gap:** `docs/contracts/payment-contract.md` defines `paid_total =
sum(component.amount for component in order.payments where not voided)`,
but the canonical `PaymentComponent` entity
(`frontend/contracts/entities.ts`) has no `voided`/`is_voided` field —
there's no way for the frontend to know which components are void.

**Workaround shipped:** `modules/orders/components/PaymentPanel.tsx`
never re-derives `paid_total` or a "remaining balance" itself — it only
displays the already-authoritative `order.payment_status` and
`order.total`, and gates the payment form on `payment_status !== "PAID"`
rather than a self-computed remaining amount that could be wrong.

**Ask:** Add the missing field to `PaymentComponent` (or document how a
voided component is otherwise represented — e.g. removed from the array
entirely) so a future "remaining balance" display can be built correctly.

## 10. `DeliveryInfo` has no address field

**Gap:** This phase's own brief lists "delivery address/reference" as
Orders-relevant delivery information, but `DeliveryInfo`
(`frontend/contracts/entities.ts`) has no address field at all — only
`status`, `driver_name`, `amount_expected_from_driver`, `assigned_at`,
`delivered_at`.

**Workaround shipped:** No address field is shown or invented; the
Delivery panel (`modules/orders/components/DeliveryPanel.tsx`) displays a
short note explaining the gap rather than a blank or fabricated field.

**Ask:** A delivery order without a stored address is operationally odd
for a real restaurant — worth confirming whether this was an intentional
Phase 00 scope cut (address captured elsewhere?) or an oversight.

## 11. Owner-initiated order creation is blocked by item 2 (no branch endpoint)

Not a new gap — a direct, blocking consequence of item 2 for this phase
specifically. Creating an order via `POST /orders` as an OWNER session
requires an explicit `X-Branch-Id` header (branch-context-contract.md),
and there is still no data source to pick a branch from. Order creation
is disabled for OWNER sessions with a clear, translated explanation
rather than sending a guessed or missing header. CASHIER order creation
is fully functional (branch is implicit from their session).

---

None of items 5–11 required editing `backend/`, `frontend/contracts/`,
`docs/`, or any Person 2 module. Item 5 extends the one shared file this
module owns responsibility for (per money-contract.md); everything else
is contained inside `frontend/src/modules/orders/`.

---

# P1-FE-05 (Menu) — additional items

Same discipline as above. This phase confirms and significantly extends
item 7 from P1-FE-04 (the missing menu-catalog endpoint) — Menu is the
module directly affected, being the "authoritative management surface"
for the same entities Orders can only browse read-only.

## 12. No menu-management endpoint exists at all (read OR write)

**Gap:** Confirmed again, more thoroughly this time: grepped the entire
`docs/` tree for `/categories`, `/products`, `/variants`, `/modifiers`
and read `domain-entities.md`'s full Category/Product/Variant/Modifier
section. The canonical entity SHAPES are confirmed
(`frontend/contracts/entities.ts`: `Category { id, name, sort_order,
is_active }`, `Product { id, category_id, name, base_price, is_active }`,
`Variant { id, product_id, name, price, is_default }`, `Modifier { id,
product_id, name, price_delta, is_active }`), but no read or write
endpoint for any of them is documented anywhere.

**Workaround shipped:** `modules/menu/services/menuService.ts` defines
the `MenuService` boundary (list/create/update for all four entities).
The shipped default (`UnavailableMenuService`) never calls any endpoint —
every Menu page shows "menu management isn't available yet," never fake
categories/products. A second implementation
(`ExperimentalHttpMenuService`), calling proposed-but-unconfirmed REST
endpoints (`GET/POST /categories`, `PATCH /categories/{id}`, `GET/POST
/products`, `PATCH /products/{id}`, `GET/POST /products/{id}/variants`,
`PATCH /variants/{id}`, `GET/POST /products/{id}/modifiers`, `PATCH
/modifiers/{id}`), exists only for this phase's own interactive QA,
gated behind `VITE_MENU_EXPERIMENTAL_API=1` (unset by default, not in
the committed `.env.example`) — same isolation pattern as P1-FE-04 item 7.

**Ask:** This is the same gap as P1-FE-04 item 7, now affecting the
module whose entire purpose is managing these entities. Confirming a
real menu-management API unblocks both this module and Orders' catalog
browsing in one pass.

## 13. Orders' `MenuCatalogService` and Menu's `MenuService` are two separate interfaces

**Not a bug — a deliberate consequence of module ownership rules.**
`modules/orders/services/menuCatalogService.ts` (read-only, built in
P1-FE-04) and `modules/menu/services/menuService.ts` (full CRUD, this
phase) are separate, module-local interfaces, even though they overlap
significantly (both read Category/Product/Variant/Modifier). This
phase's own instructions say "do NOT modify Orders unless absolutely
necessary," so Menu does not reach into Orders' module to unify them.
Both already import the same canonical entity types from
`frontend/contracts/entities.ts` — nothing about the entities themselves
is duplicated, only the small service-interface shape.

**Ask:** Once a real menu API exists, consider whether the read-only
subset (list categories/products/variants/modifiers) is worth promoting
to a genuinely shared boundary (e.g. under `src/` alongside
`src/money/formatMoney.ts`) that both Orders and Menu import, rather than
each module maintaining its own copy. That would be a shared-file change
requiring its own `INTEGRATION_REQUEST.md` sign-off at that time — not
done unilaterally now.

## 14. `Variant` has no `is_active` field — deactivation isn't supported

**Not a gap — a confirmed, deliberate absence.** Unlike Category,
Product, and Modifier (all of which have `is_active`), `Variant`
(`frontend/contracts/entities.ts`) has only `is_default`, no active/
inactive flag. The Menu module's Variant form and list therefore have no
activate/deactivate control — this matches the canonical contract
exactly rather than inventing one for consistency with its sibling
entities.

## 15. No documented way to atomically switch a product's default variant

**Gap:** `domain-entities.md` states "Exactly one variant per product
should be default, enforced at application layer" but documents no
endpoint (e.g. an `actions/set-default`) for switching which variant
holds that flag — only per-variant create/update in general.

**Workaround shipped:** The Variant form lets an operator check "Default"
on any variant they create or edit, sent as a plain field on that one
variant's own request. This frontend does NOT attempt to auto-unset
`is_default` on a product's other variants when one is newly marked
default — doing so would mean either inventing a bulk-update call that
isn't documented, or firing multiple undocumented-shape requests to
simulate one. The UI carries a visible note explaining this isn't
automated yet.

**Ask:** Confirm whether "enforced at application layer" means the
backend will reject/auto-correct multiple defaults server-side (in which
case the frontend doesn't need to do anything more), or whether the
frontend is expected to orchestrate this — and if so, via what call.

## 16. No documented role restriction for menu management

**Gap:** Unlike `/reports/*` (explicitly Owner-only per
`reporting-contract.md`), no contract states whether Menu management is
restricted to OWNER or open to CASHIER too.

**Decision made, not invented:** Per this phase's own "do not invent
additional roles/restrictions" rule, Menu management is accessible to
both roles equally — no restriction is enforced, since none is
documented. Worth confirming with product: a real restaurant likely
wants pricing/menu changes restricted to Owner, but that's a product
decision this frontend shouldn't make unilaterally by inventing a gate.

## 17. Category/Product/Variant/Modifier are not branch-scoped

**Not a gap — a confirmed, useful fact.** `domain-entities.md`'s own
table for each of these four entities lists no `branch_id` field, unlike
Order/InventoryItem/CashierShift. The Menu module therefore never sends
a branch header or param on any call — this is a documented reading of
an explicit contract fact, not an oversight or an invented shortcut.

## 18. Small in-module navigation added (not a shared-file change)

`modules/menu/components/MenuNav.tsx` — a minimal Categories/Products
link bar rendered at the top of those two pages. The shared `AppShell`
(frozen) has no navigation menu yet; adding one there would be a
shared-file change outside this module's authorized scope. This is
purely local to `modules/menu/`, listed here only for visibility, not
because it required sign-off.

---

None of items 12–18 required editing `backend/`, `frontend/contracts/`,
`docs/`, any Person 2 module, Orders, Dashboard, Auth, or any frozen
shared foundation file. Everything is contained inside
`frontend/src/modules/menu/`.


