# Notification Contract

Status: STABLE (Phase 00)
Owner: Person 2

## Scope

MVP types only: `ORDER_READY`, `LOW_STOCK` (see enums.md). No push infrastructure,
no email/SMS — in-app notification feed only (per brief, "keep notifications
simple").

## Model

See `Notification` in domain-entities.md. `payload` is a small JSON object specific
to the type:

```text
ORDER_READY: { "order_id": UUID }
LOW_STOCK:   { "inventory_item_id": UUID, "current_quantity": Decimal }
```

## Delivery mechanism

Phase 00 defines the contract, not the transport. Least-complex MVP-compatible
option: polling (`GET /notifications?is_read=false`) rather than WebSockets/SSE,
consistent with "keep notifications simple" and the modular-monolith,
no-extra-infrastructure stance. **Decision requiring confirmation**: if real-time
push is actually required (e.g. kitchen display must update instantly), that's a
transport-layer addition (WebSocket channel) that reuses this same `Notification`
entity — not a contract change.

## Triggers

- `ORDER_READY`: fired by the kitchen contract's `RECEIVED... → READY` (see
  kitchen-contract.md) — one notification per order, targeted at the branch (not a
  specific user), since any cashier at that branch should see it.
- `LOW_STOCK`: fired by the inventory contract when an adjustment causes
  `current_quantity` to cross at or below `low_stock_threshold` (see
  inventory-contract.md) — fires once per crossing, not on every subsequent
  adjustment while still low.

## Endpoints

- `GET /notifications` — branch-scoped list, filterable by `is_read`, `type`.
- `POST /notifications/{id}/actions/mark-read`.
