# Payment Contract

Status: STABLE (Phase 00)
Owner: Person 1

## Model

An `Order` has zero or more `PaymentComponent`s (see domain-entities.md). Each
component has exactly one concrete `PaymentMethod` (`CASH`, `CARD`, `WALLET`,
`INSTAPAY`) and an amount. `MIXED` is never stored on a component — it is a
**derived** display value on the order:

`PaymentComponent.recorded_by` is nullable, following the same rule as
`Order.operator_id` (see order-lifecycle-contract.md): null only when the parent
order's `source = ONLINE` and the component was written automatically by a
payment-gateway callback rather than a human. Non-null in every other case,
including a cashier manually settling cash-on-delivery for an online order.

```text
distinct_methods = set(component.method for component in order.payments)
order.payment_method_display = distinct_methods.pop() if len(distinct_methods) == 1
                                else "MIXED" if len(distinct_methods) > 1
                                else null  # no payments recorded yet
```

## PaymentStatus derivation (MVP-active states)

```text
paid_total = sum(component.amount for component in order.payments where not voided)

PENDING   if paid_total == 0
PARTIAL   if 0 < paid_total < order.total
PAID      if paid_total >= order.total
```

`PENDING`, `PARTIAL`, and `PAID` are the only `PaymentStatus` values any Phase 00
endpoint can produce. They are always derived at read time from the sum above —
never written directly by application code.

## `VOID` — MVP-active, explicit semantics

`VOID` is a real, implemented Phase 00 state, but with a narrow meaning: it marks
a `PaymentComponent` that was **recorded in error** (wrong method selected, wrong
amount entered, accidental duplicate submission) **before the order has reached
`READY` or `COMPLETED`** (see order-lifecycle-contract.md's order-state gate,
below). Voiding removes the component from `paid_total` and records the reason in
the action's audit metadata, but the row itself is never deleted (financial
records are never hard-deleted — see domain-entities.md conventions).

- Endpoint: `POST /orders/{id}/payments/{payment_id}/actions/void`.
- **Gate**: only permitted while the parent `Order.status` is `DRAFT`, `PLACED`,
  `PREPARING`, or `CANCELLED` (see order-lifecycle-contract.md for the full order
  state machine). Attempting to void a payment on an order that is `READY` or
  `COMPLETED` returns `409 INVALID_TRANSITION` (see
  error-contract.md) — by that point money may already be considered settled
  and handed over, and correcting it is a refund, not a void (see below).
- `VOID` is a mistake-correction tool for the same shift/session, not a way to
  reverse money after the fact.

## `REFUNDED` — reserved, not implemented in Phase 00

The brief requires the MVP not to implement a complex accounting engine, and no
refund workflow is defined in Phase 00. **`REFUNDED` exists in the `PaymentStatus`
enum only for forward compatibility and must not be set by any Phase 00 code
path.** No endpoint, action, or automatic derivation in this phase produces it.

If a business needs to return money to a customer in MVP (e.g. a completed order
was wrong and cash was already handed over), that is an **out-of-system,
manual** operation in Phase 00 — for example, the branch logs it as a negative
adjustment via a normal `Expense` entry at the cashier's/owner's discretion
(see expense/cashier-shift contracts) rather than through any payment-void or
refund endpoint. This keeps the books roughly reconciled without pretending a
refund workflow exists.

A real refund workflow (reversing a `PaymentComponent` on a completed order,
tying it back to the original payment, adjusting reports) is explicitly deferred
to a later phase. When it is built, it will use this already-reserved
`REFUNDED` value rather than requiring an enum change — this is why the value is
kept rather than removed.

## Endpoints

- `POST /orders/{id}/payments` — records one `PaymentComponent`. Supports multiple
  calls for a split/mixed payment (e.g. half cash, half card). Idempotency-Key
  required (see api-contract.md) since double-submission of a payment is a real
  financial risk on a flaky connection.
- Recording a payment that brings `paid_total >= order.total` does **not**
  automatically transition order status — payment and order-fulfillment lifecycles
  are independent (an order can be fully paid while still `PREPARING`).

## Constraints

- `sum(payments.amount) <= order.total` is enforced at the API layer (422
  `code: "OVERPAYMENT"`) except when the excess is explicitly flagged as a tip —
  **decision requiring confirmation**: the brief does not mention tipping; MVP has
  no tip field, so overpayment is simply rejected rather than silently accepted.
- No accounting engine (ledger entries, double-entry bookkeeping) is built — this
  matches the brief's explicit "do not implement a complex accounting engine."
  Reporting reads directly from `PaymentComponent` and `Expense` rows.
