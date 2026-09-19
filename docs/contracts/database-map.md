# Database Relationship / Domain Map

Status: STABLE (Phase 00)
Owner: Shared

## Entity relationship overview

```text
Branch 1──* User
Branch 1──* Order
Branch 1──* InventoryItem
Branch 1──* Expense
Branch 1──* CashierShift

Category 1──* Product
Product 1──* Variant
Product 1──* Modifier

Order *──1 Branch
Order *──1 User (operator_id)
Order 1──* OrderItem
Order 1──* PaymentComponent
Order 1──0/1 DeliveryInfo   (only when type = DELIVERY)
Order 1──1 KitchenTicket

OrderItem *──1 Product
OrderItem *──0/1 Variant
OrderItem 1──* OrderItemModifier

OrderItemModifier *──1 Modifier   (name/price frozen as snapshot at order time)

CashierShift *──1 Branch
CashierShift *──1 User (cashier_id)
CashierShift 1──* Expense (optional — Expense.shift_id nullable)

InventoryItem 1──* InventoryAdjustment

AuditLogEntry *──1 User (actor_id)
AuditLogEntry *──0/1 Branch

Notification *──1 Branch
```

## Rules that keep this from becoming duplicated entities

- There is exactly **one** representation of "an order line's price" —
  `OrderItem.unit_price` + its `OrderItemModifier.price_delta_snapshot` rows. The
  live catalog (`Product.base_price`, `Variant.price`, `Modifier.price_delta`) is
  never re-read to compute a historical order's total; it's only the source at the
  moment of creating a *new* order.
- There is exactly one representation of "did the customer pay" —
  `PaymentComponent` rows. `Order.payment_method_display` and
  `Order.payment_status` (see payment-contract.md) are **derived**, not columns
  that could drift out of sync with the payment rows; they are computed at read
  time or via a database view/materialized trigger (implementation detail), never
  written independently by application code.
- There is exactly one representation of "how much stock is left" —
  `InventoryItem.current_quantity`, kept in sync with the `InventoryAdjustment` log
  in the same transaction (see inventory-contract.md) — never two counters.
- Kitchen state lives only on `KitchenTicket`; `Order.status` mirrors it for the
  shared states but the **timestamps** used for performance reporting live only on
  `KitchenTicket`, not duplicated onto `Order`.

## Foreign key / branch-ownership explicitness

Every table listed under "Operational data" in `branch-context-contract.md`
(`Order`, `InventoryItem`, `Expense`, `CashierShift`) has a **non-nullable**
`branch_id` foreign key. `Category`/`Product`/`Variant`/`Modifier` are
intentionally branch-**less** in MVP — a single shared catalog with a single
shared price list across all branches. This is a confirmed MVP decision (see
branch-context-contract.md point 3 for the rationale), not a gap: no contract in
this repository assumes or requires per-branch pricing.

## UUIDs

All primary keys are UUIDv4, generated application-side at creation time (needed
for the offline-readiness convention — see offline-readiness-contract.md — where a
future offline client must be able to mint an ID before ever contacting the
server).
