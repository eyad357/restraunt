# Kitchen Contract

Status: STABLE (Phase 00)
Owner: Person 1

## States

```text
RECEIVED ──► PREPARING ──► READY ──► COMPLETED
```

One `KitchenTicket` per `Order`, created automatically when the order transitions
`DRAFT → PLACED` (see order-lifecycle-contract.md). `KitchenStatus` and
`OrderStatus` are kept in lockstep for the shared states (`PREPARING`, `READY`,
`COMPLETED`) — a kitchen action (`POST /kitchen-tickets/{id}/actions/{name}`)
drives both the ticket and the parent order's status in the same transaction, so
they can never drift apart.

## What the kitchen view shows

Per the brief: order notes, item notes, and selected modifiers/configuration —
i.e. the kitchen ticket read model is a projection of `Order.notes`,
`OrderItem.notes`, and each `OrderItem`'s `modifiers` (via `OrderItemModifier`,
using the frozen `name_snapshot`, not a live join to `Modifier`, so a ticket always
shows exactly what was ordered even if the modifier catalog changes later).

## Kitchen performance

Derived entirely from the four `KitchenTicket` timestamps:

```text
time_to_start   = preparing_at - received_at
time_to_ready   = ready_at - preparing_at
time_to_complete= completed_at - ready_at
total_kitchen_time = completed_at - received_at
```

No separate performance-log entity — reporting reads these timestamps directly
(see reporting-contract.md). This satisfies "kitchen performance should be
measurable from timestamps" without inventing additional tracking.

## Endpoints

- `GET /kitchen-tickets?status=...&branch_id=...` — the live kitchen board view,
  filterable by status, sorted `created_at` ascending by default (oldest/most
  urgent first) except `PRE_ORDER` items which sort by `scheduled_for` (see
  order-lifecycle-contract.md).
- `POST /kitchen-tickets/{id}/actions/start` (`RECEIVED → PREPARING`)
- `POST /kitchen-tickets/{id}/actions/ready` (`PREPARING → READY`, fires
  `ORDER_READY` notification)
- `POST /kitchen-tickets/{id}/actions/complete` (`READY → COMPLETED`, subject to
  the delivery gate in order-lifecycle-contract.md for `DELIVERY` orders)
