# Phase 00 — Architecture & Technical Contracts

This directory is the technical contract layer for the Restaurant Management
System, derived from `RESTAURANT_SYSTEM_MASTER_SPEC.md` (repo root). It exists so
Person 1 and Person 2 can build their owned modules (see `ownership-map.md`)
independently without producing incompatible code.

**Nothing under `docs/`, `frontend/contracts/`, or `backend/contracts/` implements
business features.** These are contracts only — no application code, no mock
screens, no business logic.

## Architecture summary

- **Style**: modular monolith. One FastAPI application, one PostgreSQL database,
  internally organized into the modules in `ownership-map.md` — not separate
  deployable services.
- **Backend**: FastAPI + SQLAlchemy + PostgreSQL, JWT/session auth, `Decimal` money
  everywhere (`money-contract.md`).
- **Frontend**: React + TypeScript, RTL-first, Arabic primary / English secondary
  (`localization-contract.md`), consuming the shared types in
  `frontend/contracts/`.
- **Multi-branch** from day one (`branch-context-contract.md`); **offline-ready
  conventions**, not an offline engine, in Phase 00 (`offline-readiness-contract.md`).

## Index

| File | Covers |
|------|--------|
| `enums/enums.md` | Every enumerated value, canonical source for `backend/contracts/enums.py` and `frontend/contracts/enums.ts` |
| `domain-entities.md` | Every entity's fields and relations |
| `database-map.md` | ER overview, dedup rules, FK/branch-ownership explicitness |
| `money-contract.md` | Decimal/NUMERIC rules, wire format |
| `api/api-contract.md` | URLs, envelopes, pagination, filtering, sorting, idempotency, branch header |
| `error-contract.md` | Error shape + error code registry |
| `auth-contract.md` | PIN login, JWT claims, roles |
| `branch-context-contract.md` | Branch resolution and enforcement rules |
| `order-lifecycle-contract.md` | Order state machine |
| `payment-contract.md` | Payment components, derived MIXED/status, MVP-scoped `VOID`, reserved-only `REFUNDED` |
| `cashier-shift-contract.md` | Shift state machine (two-step `request-close`/`close` for a durable `CLOSING` state), closing calculation |
| `inventory-contract.md` | Inventory scope, low-stock, value, deferred BOM |
| `delivery-contract.md` | Delivery state machine, cash settlement, driver performance |
| `kitchen-contract.md` | Kitchen ticket state machine, performance timestamps |
| `printing-contract.md` | `PrintService` abstraction |
| `notification-contract.md` | Notification types, triggers, polling |
| `audit-contract.md` | Audit entry shape, minimum covered actions |
| `reporting-contract.md` | Every report endpoint, Food Cost extensibility stub |
| `localization-contract.md` | `LocalizedString`, RTL, `Accept-Language` |
| `offline-readiness-contract.md` | Local persistence boundary, idempotency-as-sync-key |
| `testing-conventions.md` | Backend/frontend test expectations |
| `ownership-map.md` | Person 1 / Person 2 / Shared directory map |
| `git-integration-rules.md` | Branching, PR review rules for contract changes |
| `examples/*.json` | Sample request/response payloads, including `online-order-example.json` for the `ONLINE`/`operator_id`-null case |

## Contract summary (one line each)

- **Entities**: Branch, User, Category, Product, Variant, Modifier, Order,
  OrderItem, OrderItemModifier, PaymentComponent, CashierShift, Expense,
  InventoryItem, InventoryAdjustment, DeliveryInfo, KitchenTicket, Notification,
  AuditLogEntry — see `domain-entities.md`.
- **Lifecycles**: Order (`DRAFT→PLACED→PREPARING→READY→COMPLETED`, +`CANCELLED`),
  Kitchen (`RECEIVED→PREPARING→READY→COMPLETED`), CashierShift
  (`OPEN→ACTIVE→CLOSING→CLOSED`), Delivery
  (`UNASSIGNED→ASSIGNED→OUT→DELIVERED`/`RETURNED`).
- **Money**: NUMERIC/Decimal end-to-end, string over the wire, no floats anywhere.
- **API**: `/api/v1`, `{data, meta}` / `{error}` envelopes, offset pagination,
  `Idempotency-Key` on unsafe-to-double-submit writes.

## Ownership summary

Person 1: Auth, Branches, Menu, Orders, Payments, Kitchen, Printing.
Person 2: Dashboard, Inventory, Expenses, Cashier, Delivery, Reports, Audit,
Notifications, Settings.
Shared: core infra, contracts themselves, localization, UI primitives, testing
infra. Full detail in `ownership-map.md`.

## Decisions resolved in the Phase 00 clarification pass

These were previously flagged as open questions and are now confirmed, with the
contract changes made to match (see `git-integration-rules.md` for why these
required cross-review):

1. **`ONLINE` order creator/operator** (`order-lifecycle-contract.md`,
   `domain-entities.md`, `audit-contract.md`, `payment-contract.md`): `Order.
   operator_id` is nullable, null only when `source = ONLINE`. No fake staff
   account and no `Customer`/CRM entity is introduced. The same nullability
   extends to `PaymentComponent.recorded_by` and the `ORDER_CREATED` audit
   entry's `actor_id` for the identical reason. This is the only place in Phase
   00 where an audit entry has no actor.
2. **Cashier shift `CLOSING` durability** (`cashier-shift-contract.md`): resolved
   as durable. The close workflow is now explicitly two actions —
   `POST .../actions/request-close` (persists `status = CLOSING` and
   `expected_cash`) then `POST .../actions/close` (persists `counted_cash`,
   `cash_difference`, `status = CLOSED`) — so every one of the four lifecycle
   states has its own persisted row, and no new transactions may be recorded
   against a `CLOSING` shift.
3. **`REFUNDED` / `VOID` payment statuses** (`payment-contract.md`): `VOID` is
   real and MVP-scoped — it corrects a mis-recorded `PaymentComponent`, gated to
   orders not yet `READY`/`COMPLETED`. `REFUNDED` is explicitly documented as
   **reserved for a future phase**; no Phase 00 endpoint can produce it. An
   actual refund in MVP is handled out-of-system (e.g. a manual `Expense` entry),
   not through the payment/order contracts.
4. **Branch-specific menu/pricing** (`branch-context-contract.md`,
   `database-map.md`): confirmed as a single shared catalog with a single shared
   price list across all branches — no contradiction existed in the contracts to
   resolve, and per-branch pricing is not introduced. Documented as a confirmed
   MVP decision rather than an open question.

## Remaining unresolved decisions requiring confirmation

Each is also flagged inline in its contract file, with the least-complex
MVP-compatible interpretation already applied so work is not blocked:

1. Whether a distinct "Kitchen Staff" role is needed beyond Owner/Cashier
   (`enums.md`).
2. Whether `OrderStatus` should be a strict mirror of `KitchenStatus` or is allowed
   to diverge for delivery-gating (`order-lifecycle-contract.md`) — current choice:
   allowed to diverge.
3. Whether Modifiers should be global or per-product (`domain-entities.md`) —
   current choice: per-product.
4. Item-level edit-after-placing an order — current choice: not supported in MVP
   (cancel + re-create instead) (`order-lifecycle-contract.md`).
5. Exact semantic difference between `OPEN` and `ACTIVE` cashier-shift states —
   current choice: `ACTIVE` triggers automatically on the shift's first
   transaction, no separate manual action (`cashier-shift-contract.md`). (Note:
   this is narrower than before — the `CLOSING`-durability half of this item is
   now resolved; see above.)
6. Tipping / intentional overpayment — current choice: rejected as `OVERPAYMENT`
   (`payment-contract.md`).
7. Whether/when a real refund workflow (reversing a `PaymentComponent` on a
   completed order) will be built — deferred to a later phase; `REFUNDED` is
   reserved in the enum for when it is (`payment-contract.md`).
8. Whether `ASSIGNED` and `OUT` delivery states should collapse into one
   (`delivery-contract.md`) — current choice: kept distinct for performance timing.
9. Driver identity as free text vs. a lightweight non-auth `Driver` lookup entity
   (`delivery-contract.md`) — current choice: free text in Phase 00.
10. Whether JWT needs a refresh-token flow for unattended terminals
    (`auth-contract.md`) — current choice: none in MVP.
11. Whether failed logins should be audited (`auth-contract.md`) — current choice:
    not in Phase 00.

## Validation performed

- Every `.json` file under `examples/` parses as valid JSON (checked with
  `python -m json.tool`).
- `backend/contracts/enums.py` parses as valid Python (checked with `python -m py_compile`).
- `frontend/contracts/*.ts` type-checked for internal consistency (no import
  cycles; every enum referenced in `entities.ts`/`api.ts` exists in `enums.ts`).
- Cross-checked every enum value in `enums.md` against `enums.py` and `enums.ts`
  for exact 1:1 correspondence.
- Cross-checked every entity in `domain-entities.md` against `entities.ts` for
  field-name and nullability correspondence.
- Checked for duplicate entity representations per the rules in `database-map.md`.
- Checked branch-scoping is explicit and non-nullable on every operational entity
  (`Order`, `InventoryItem`, `Expense`, `CashierShift`) and intentionally absent
  from catalog entities.
- Checked every enum used consistently by name across all contract files (no
  divergent spelling/casing).
- Checked money fields are `Decimal`/`NUMERIC`/string-wire in every file that
  mentions a monetary value — no `float`/`number` usage found.
- Checked Person 1 / Person 2 ownership boundaries have no entity or endpoint
  claimed by both.

## Recommended next phase

**Phase 01 — Person 1: Auth + Branches + Menu CRUD** and **Phase 01 — Person 2:
Cashier Shift + Inventory CRUD**, run in parallel, each building strictly against
these contracts. Recommend a short joint review before Phase 01 starts to confirm
or overturn the 11 remaining flagged decisions above (down from 12 after this
clarification pass), since several (especially #4, #7) affect how much
scaffolding each person builds up front. Phase 00 is otherwise ready to be
frozen — see the validation results below.
