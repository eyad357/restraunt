# Delivery Contract

Status: STABLE (Phase 00)
Owner: Person 2

## Scope (per brief — explicitly simple)

Explicitly excluded: GPS, delivery zones, routing, fleet management, driver
accounts, advanced logistics.

Included: driver assignment (free-text name, not an account — see
`auth-contract.md`), delivery status, amount expected from driver, delivered/
returned state, driver performance metrics.

## States

```text
UNASSIGNED ──► ASSIGNED ──► OUT ──► DELIVERED
                                └──► RETURNED
```

- `UNASSIGNED`: created automatically when an `Order` with `type = DELIVERY` is
  placed (see order-lifecycle-contract.md).
- `ASSIGNED`: a `driver_name` has been set.
- `OUT`: driver has physically left; `assigned_at` is set here (not at `ASSIGNED`)
  — **decision requiring confirmation**: this contract treats "assigned" (paperwork)
  and "out" (physically left) as distinct because driver-performance timing
  (reporting-contract.md) should measure from departure, not from admin
  assignment. If the two are meant to be the same moment, `ASSIGNED` and `OUT` can
  be collapsed into one transition without a schema change.
- `DELIVERED`: order handed over, cash settled. Sets `delivered_at`. Order can now
  move `READY → COMPLETED`.
- `RETURNED`: could not deliver. The parent `Order` moves to `CANCELLED`
  (order-lifecycle-contract.md) — a returned delivery is not a completed sale.

## Cash settlement

`amount_expected_from_driver` is set when the order requires cash-on-delivery
(i.e., no `PaymentComponent` was pre-recorded, or a partial amount remains). On
`DELIVERED`, the operator records the actual `PaymentComponent` (method `CASH`)
for the settled amount — this is what feeds `cash_sales` in the cashier-shift
calculation (see cashier-shift-contract.md). `amount_expected_from_driver` itself
is never summed directly into shift reconciliation; it exists for driver
accountability/performance reporting only.

## Driver performance

Since drivers have no account (contract, not entity), performance is aggregated by
`driver_name` string match over `DeliveryInfo` rows: count of `DELIVERED` vs.
`RETURNED`, average time from `OUT` to `DELIVERED`. **Decision requiring
confirmation**: free-text names risk inconsistent spelling fragmenting a driver's
stats; least-complex MVP-compatible fix is a simple `Driver` reference lookup
(name-only, no auth) rather than full accounts — flagged as an option for Phase 01
if this becomes a real problem, not built now since the brief says drivers are not
required to be system users.

## Endpoints

- `PATCH /orders/{id}/delivery` — assign/update driver, transition status.
- Delivery is always accessed via its parent order (`/orders/{id}/delivery`), never
  as a standalone top-level resource, since it has no independent lifecycle outside
  its order (matches the OrderItem convention in api-contract.md).
