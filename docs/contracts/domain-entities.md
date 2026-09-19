# Domain Entity Contract

Status: STABLE (Phase 00)
Owner: Shared (per-entity ownership noted inline; see `ownership-map.md`)

## Purpose

Canonical, implementation-neutral definition of every entity in the system. This is
the contract both developers build against. Backend ORM models and frontend
TypeScript types must each be **projections** of what's defined here — neither
copies the other (see `typescript-contracts.md` and `database-map.md`).

## Conventions that apply to every entity

- Primary key: `id: UUID` unless documented otherwise.
- `created_at`, `updated_at`: UTC timestamps, ISO-8601, on every persisted entity.
- Money fields: `Decimal`, currency implicitly EGP (see `money-contract.md`). Never
  `float`.
- Branch-scoped entities carry `branch_id: UUID` (see `branch-context-contract.md`).
- Soft-delete is **not** used in Phase 00 unless stated; cancellation/void states are
  modeled explicitly via status enums instead of deleting rows.

---

## Branch (Person 1)

| Field        | Type      | Notes                          |
|--------------|-----------|----------------------------------|
| id           | UUID      |                                   |
| name         | string    | Display name, bilingual-capable (see localization) |
| is_active    | bool      |                                   |
| created_at   | timestamp |                                   |
| updated_at   | timestamp |                                   |

## User (Shared, owned by Person 1)

| Field          | Type       | Notes                                     |
|----------------|------------|---------------------------------------------|
| id             | UUID       |                                              |
| full_name      | string     |                                              |
| role           | UserRole   | `OWNER` \| `CASHIER`                        |
| pin_hash       | string     | Hashed, never plaintext (see auth-contract) |
| branch_id      | UUID \| null | Null for `OWNER` (all-branch access); required for `CASHIER` |
| is_active      | bool       |                                              |
| created_at     | timestamp  |                                              |
| updated_at     | timestamp  |                                              |

## Category (Person 1)

| Field       | Type   | Notes |
|-------------|--------|-------|
| id          | UUID   |       |
| name        | LocalizedString | See localization-contract.md |
| sort_order  | int    |       |
| is_active   | bool   |       |

## Product (Person 1)

| Field         | Type             | Notes                          |
|---------------|------------------|-----------------------------------|
| id            | UUID             |                                    |
| category_id   | UUID             | FK → Category                     |
| name          | LocalizedString  |                                    |
| base_price    | Decimal          | Used when a product has no variants |
| is_active     | bool             |                                    |

## Variant (Person 1)

| Field        | Type            | Notes                                  |
|--------------|-----------------|-------------------------------------------|
| id           | UUID            |                                            |
| product_id   | UUID            | FK → Product                              |
| name         | LocalizedString | e.g. "Single", "Double", "Triple"         |
| price        | Decimal         | Absolute price for this variant (overrides base_price, does not add to it) |
| is_default   | bool            | Exactly one variant per product should be default, enforced at application layer |

## Modifier (Person 1)

| Field           | Type            | Notes                                     |
|-----------------|-----------------|-----------------------------------------------|
| id              | UUID            |                                                |
| product_id      | UUID            | FK → Product (modifiers are scoped per-product in MVP, not global) |
| name            | LocalizedString | e.g. "Extra cheese", "No onion"               |
| price_delta     | Decimal         | Added to item price; can be 0 (e.g. "No onion") or negative only if explicitly documented — MVP assumes >= 0 |
| is_active       | bool            |                                                |

Decision requiring confirmation: brief does not say whether modifiers can be
shared across products (e.g. a global "Extra cheese" reused everywhere) or are
per-product. This contract chooses **per-product** as the least-complex
MVP-compatible interpretation. A global modifier library can be layered on later
without breaking this shape (Product-level modifiers would simply reference a
shared `ModifierDefinition`).

## Order (Person 1)

| Field            | Type          | Notes                                             |
|------------------|---------------|-----------------------------------------------------|
| id               | UUID          |                                                       |
| branch_id        | UUID          |                                                       |
| source           | OrderSource   | `CASHIER` \| `PHONE` \| `ONLINE`                     |
| type             | OrderType     | `TAKEAWAY` \| `PICKUP` \| `DELIVERY` \| `PRE_ORDER`  |
| status           | OrderStatus   |                                                       |
| operator_id      | UUID \| null  | FK → User. The staff member who created/owns the order. **Null only when `source = ONLINE`** — see order-lifecycle-contract.md. Required (non-null) for `CASHIER` and `PHONE` sources. |
| notes            | string \| null | Order-level notes                                   |
| subtotal         | Decimal       | Sum of item totals before order-level adjustments    |
| total            | Decimal       | Final payable amount                                 |
| scheduled_for    | timestamp \| null | Required when `type = PRE_ORDER`, else null      |
| created_at       | timestamp     |                                                       |
| updated_at       | timestamp     |                                                       |
| completed_at     | timestamp \| null |                                                   |
| cancelled_at     | timestamp \| null |                                                   |

Relations: `items: OrderItem[]`, `payments: PaymentComponent[]`,
`delivery: DeliveryInfo | null` (present only when `type = DELIVERY`),
`kitchen_state: KitchenTicket`.

**MVP decision (Phase 00 clarification)**: an `ONLINE` order is created by the
storefront on behalf of a customer, not by a logged-in staff member. Earlier
drafts of this contract implicitly required `operator_id` on every order, which
would have forced either a fake `CASHIER`/`OWNER` session to "own" online orders,
or a Customer User account. Neither is acceptable: the brief explicitly excludes a
Customer/CRM domain (see `RESTAURANT_SYSTEM_MASTER_SPEC.md`), and attributing an
online order to a real staff member who didn't create it would corrupt audit and
cashier-performance reporting. `operator_id` is therefore nullable, null
exclusively for `source = ONLINE`. No `Customer` entity is introduced — the
storefront/online-ordering surface itself is the recognized creator for these
orders, tracked only as `source = ONLINE`, not as a User. See
`order-lifecycle-contract.md` for the full rationale and downstream effects on
audit and payment recording.

## OrderItem (Person 1)

| Field           | Type      | Notes                                                |
|-----------------|-----------|---------------------------------------------------------|
| id              | UUID      |                                                           |
| order_id        | UUID      | FK → Order                                               |
| product_id      | UUID      | FK → Product                                             |
| variant_id      | UUID \| null | FK → Variant, if the product has variants             |
| quantity        | int       | >= 1                                                     |
| unit_price      | Decimal   | Snapshot of variant/base price **at time of order**      |
| notes           | string \| null | Item-level notes, e.g. "well done"                  |
| line_total      | Decimal   | `(unit_price + sum(modifier price_delta)) * quantity`    |

Relations: `modifiers: OrderItemModifier[]`.

Rule: `unit_price` and modifier `price_delta_snapshot` are **frozen at order
creation time**. A later price change to the Product/Variant/Modifier must never
retroactively change historical orders. This is why OrderItem stores its own
snapshot fields rather than joining live to catalog tables for money math.

## OrderItemModifier (Person 1)

| Field                | Type    | Notes                                  |
|----------------------|---------|--------------------------------------------|
| id                   | UUID    |                                              |
| order_item_id        | UUID    | FK → OrderItem                              |
| modifier_id          | UUID    | FK → Modifier                               |
| name_snapshot        | string  | Frozen display name at order time           |
| price_delta_snapshot | Decimal | Frozen price delta at order time            |

## PaymentComponent (Person 1)

| Field        | Type          | Notes                                             |
|--------------|---------------|-----------------------------------------------------|
| id           | UUID          |                                                       |
| order_id     | UUID          | FK → Order                                           |
| method       | PaymentMethod | One concrete method, never `MIXED` on a component    |
| amount       | Decimal       |                                                       |
| recorded_by  | UUID \| null  | FK → User. **Null only when the parent order's `source = ONLINE`** and the component was recorded automatically by a payment gateway callback rather than a staff member — mirrors `Order.operator_id`. Never null when a human operator recorded the payment (including a cashier settling cash-on-delivery for an online order, in which case `recorded_by` is that cashier). |
| recorded_at  | timestamp     |                                                       |

Rule: An order's aggregate `payment_status` and whether it is displayed as `MIXED`
is derived from **counting distinct methods across its PaymentComponents** — it is
never stored redundantly as `MIXED` on the component itself. See
`payment-contract.md`. `payment_status` itself is derived, not a stored column —
see `payment-contract.md` for the `PENDING`/`PARTIAL`/`PAID` derivation and the
MVP-only semantics of `REFUNDED`/`VOID`.

## CashierShift (Person 2)

| Field              | Type                | Notes                                 |
|--------------------|---------------------|------------------------------------------|
| id                 | UUID                |                                            |
| branch_id          | UUID                |                                            |
| cashier_id         | UUID                | FK → User                                 |
| status             | CashierShiftStatus  |                                            |
| opening_cash       | Decimal             |                                            |
| counted_cash       | Decimal \| null     | Filled at `CLOSING`                       |
| expected_cash      | Decimal \| null     | Computed at `CLOSING` (see cashier-shift-contract.md) |
| cash_difference    | Decimal \| null     | `counted_cash - expected_cash`            |
| opened_at          | timestamp           |                                            |
| closed_at          | timestamp \| null   |                                            |

## Expense (Person 2)

| Field       | Type    | Notes                        |
|-------------|---------|----------------------------------|
| id          | UUID    |                                   |
| branch_id   | UUID    |                                   |
| shift_id    | UUID \| null | FK → CashierShift, null if logged outside an active shift |
| description | string  | e.g. "Bread"                     |
| amount      | Decimal |                                   |
| recorded_by | UUID    | FK → User                        |
| recorded_at | timestamp |                                 |

## InventoryItem (Person 2)

| Field              | Type    | Notes                    |
|--------------------|---------|------------------------------|
| id                 | UUID    |                               |
| branch_id          | UUID    |                               |
| name               | LocalizedString |                       |
| unit               | string  | e.g. "kg", "pcs", "L"         |
| current_quantity   | Decimal |                               |
| low_stock_threshold| Decimal |                               |
| unit_cost          | Decimal \| null | Used for inventory value; null if unknown |

## InventoryAdjustment (Person 2)

| Field         | Type                        | Notes                     |
|---------------|-----------------------------|-------------------------------|
| id            | UUID                        |                                |
| item_id       | UUID                        | FK → InventoryItem            |
| reason        | InventoryAdjustmentReason   |                                |
| quantity_delta| Decimal                     | Signed (+/-)                  |
| recorded_by   | UUID                        | FK → User                     |
| recorded_at   | timestamp                   |                                |

## DeliveryInfo (Person 2)

| Field                   | Type            | Notes                            |
|-------------------------|-----------------|--------------------------------------|
| id                      | UUID            |                                       |
| order_id                | UUID            | FK → Order, 1:1                      |
| driver_name             | string          | Free text — drivers are not User accounts (see auth-contract.md) |
| status                  | DeliveryStatus  |                                        |
| amount_expected_from_driver | Decimal    | Cash the driver owes back at settlement |
| assigned_at             | timestamp \| null |                                     |
| delivered_at            | timestamp \| null |                                     |

## KitchenTicket (Person 1)

| Field         | Type          | Notes                                       |
|---------------|---------------|-------------------------------------------------|
| id            | UUID          |                                                   |
| order_id      | UUID          | FK → Order, 1:1                                  |
| status        | KitchenStatus |                                                   |
| received_at   | timestamp     |                                                   |
| preparing_at  | timestamp \| null |                                               |
| ready_at      | timestamp \| null |                                               |
| completed_at  | timestamp \| null |                                               |

Kitchen performance (`reporting-contract.md`) is derived entirely from these four
timestamps — no separate performance-log entity is needed in MVP.

## Notification (Person 2)

| Field       | Type              | Notes           |
|-------------|-------------------|---------------------|
| id          | UUID              |                     |
| branch_id   | UUID              |                     |
| type        | NotificationType  | `ORDER_READY` \| `LOW_STOCK` |
| payload     | JSON              | Type-specific data, e.g. `{order_id}` or `{inventory_item_id}` |
| is_read     | bool              |                     |
| created_at  | timestamp         |                     |

## AuditLogEntry (Shared)

| Field       | Type         | Notes                              |
|-------------|--------------|----------------------------------------|
| id          | UUID         |                                          |
| actor_id    | UUID \| null | FK → User. **Null only for system-initiated actions with no human actor** — in Phase 00 the sole such case is `ORDER_CREATED` for an `ONLINE` order (mirrors `Order.operator_id` — see order-lifecycle-contract.md). Every other audited action always has a human `actor_id`. |
| branch_id   | UUID \| null | Null only for cross-branch owner actions|
| action      | AuditAction  |                                          |
| entity_type | string       | e.g. `"Order"`, `"Product"`              |
| entity_id   | UUID         |                                          |
| metadata    | JSON         | Action-specific details (e.g. old/new price) |
| created_at  | timestamp    |                                          |

## PrintJob (Person 1)

Not persisted as a domain record in MVP — see `printing-contract.md` for why
printing is modeled as a stateless service call rather than an entity.
