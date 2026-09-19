# Order Lifecycle Contract

Status: STABLE (Phase 00)
Owner: Person 1

## States

`DRAFT → PLACED → PREPARING → READY → COMPLETED`, with `CANCELLED` reachable from
`DRAFT`, `PLACED`, or `PREPARING` (not from `READY` or `COMPLETED` — a ready/handed
order is not voided via a status flip, since money may already be considered
settled and handed over; see `payment-contract.md`'s `VOID`/`REFUNDED` sections for
the precise, MVP-scoped handling of payment corrections and why a full refund
workflow is explicitly deferred, not silently assumed).

```text
DRAFT ──────► PLACED ──────► PREPARING ──────► READY ──────► COMPLETED
  │              │                │
  └──────────────┴────────────────┘
                 ▼
             CANCELLED
```

## Transition rules

| Transition            | Trigger                                   | Side effects                                            |
|------------------------|--------------------------------------------|------------------------------------------------------------|
| `DRAFT → PLACED`       | Cashier confirms / online order submitted | Creates `KitchenTicket` (`RECEIVED`); audit `ORDER_CREATED` |
| `PLACED → PREPARING`   | Kitchen starts (mirrors `KitchenStatus`)  | `KitchenTicket.status = PREPARING`, `preparing_at` set      |
| `PREPARING → READY`    | Kitchen finishes                          | `KitchenTicket.status = READY`, `ready_at` set; `NotificationType.ORDER_READY` fired |
| `READY → COMPLETED`    | Handover confirmed (pickup/delivery/table)| `completed_at` set; for `DELIVERY` type requires `DeliveryInfo.status = DELIVERED` first — see delivery-contract.md |
| `* → CANCELLED`        | Cashier/owner cancels                     | `cancelled_at` set; audit `ORDER_CANCELLED`; any recorded `PaymentComponent`s must be reconciled per `payment-contract.md` (`VOID` while still correctable, manual out-of-system handling otherwise — no automatic refund) |

## Rules

- `type = PRE_ORDER` orders may sit in `PLACED` with a future `scheduled_for`
  before entering `PREPARING`; the kitchen view filters pre-orders by proximity to
  `scheduled_for` rather than FIFO on `created_at` (display concern, not a new
  status).
- `type = DELIVERY` orders cannot move to `COMPLETED` until their `DeliveryInfo`
  reaches `DELIVERED` or `RETURNED` (a returned order is cancelled, not completed —
  see delivery-contract.md).
- An order's `OrderItem`s, once the order leaves `DRAFT`, are immutable in
  quantity/selection. Corrections after `PLACED` are modeled as cancel + re-create,
  not in-place edits, to keep the kitchen ticket and pricing snapshot trustworthy.
  **Decision requiring confirmation**: if item-level edit-after-placing is required
  (e.g. "customer wants no onion after all"), that needs an explicit
  `OrderItemAmendment` concept; not built in Phase 00 since the brief doesn't
  request it.
- Every transition is a discrete API action (`POST /orders/{id}/actions/{name}`,
  see api-contract.md), never a raw status `PATCH`, so each transition can carry
  its own validation and audit entry.

## Creator/operator for `ONLINE` orders (Phase 00 clarification)

`Order.operator_id` (see domain-entities.md) is **nullable, null only when
`source = ONLINE`**. Rationale:

- `CASHIER` and `PHONE` orders are always created by a logged-in staff member
  (`OWNER` or `CASHIER`) — `operator_id` is required and non-null for these.
- `ONLINE` orders are submitted by the storefront on behalf of a customer, with no
  staff member logged in at creation time. Requiring `operator_id` here would force
  either (a) a fake/shared "system" `CASHIER` account logged in purely to attach
  its ID to orders it didn't take, which would silently pollute cashier-performance
  reporting (`reporting-contract.md`) with orders that cashier never actually
  handled, or (b) introducing a `Customer` user account — explicitly excluded by
  the brief's "Customers are NOT a CRM domain" rule. Neither is acceptable, so
  `operator_id` is simply null for this one source.
- The `DRAFT → PLACED` audit entry (`ORDER_CREATED`) for an `ONLINE` order likewise
  has `actor_id = null` (see `audit-contract.md` and the `AuditLogEntry` entity),
  for the same reason — there is no human actor to attribute it to. This is the
  **only** case in Phase 00 where an audit entry has no actor.
- If a staff member later touches an `ONLINE` order (e.g. a cashier cancels it, or
  a driver is assigned), *that* action's audit entry and any fields it sets (e.g.
  `DeliveryInfo` has no operator field) use the acting staff member's real ID as
  normal — nullability applies only to the original creation, not to every field
  on the order forever.
- `PaymentComponent.recorded_by` for an `ONLINE` order follows the identical rule:
  null when a payment gateway callback records it automatically, non-null when a
  human (e.g. a cashier settling cash-on-delivery) records it — see
  `payment-contract.md`.

This does not add a `Customer` entity, does not add a new `OrderSource`, and does
not change the `ONLINE` value's meaning — it only relaxes a field that was
implicitly (and incorrectly) assumed to always require a staff member.
