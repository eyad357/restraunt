# Cashier Shift Contract

Status: STABLE (Phase 00)
Owner: Person 2

## States

```text
OPEN ──► ACTIVE ──► CLOSING ──► CLOSED
```

- `OPEN`: shift record created, opening cash counted and entered, not yet taking
  orders (brief separation of counting-in from active use).
- `ACTIVE`: cashier is taking orders/payments/expenses against this shift.
- `CLOSING`: cashier has requested close; system computes `expected_cash`; cashier
  enters `counted_cash`.
- `CLOSED`: finalized, `cash_difference` recorded, immutable thereafter.

**Decision requiring confirmation**: the brief lists `OPEN → ACTIVE → CLOSING →
CLOSED` without describing what distinguishes `OPEN` from `ACTIVE` operationally.
This contract interprets `OPEN` as "opening cash entered, shift row exists" and
`ACTIVE` as "cashier has started transacting," with the transition happening
automatically on the shift's first order/payment/expense (no separate manual
action needed) — the least-complex reading. If product wants a manual
"start shift" button distinct from opening cash entry, this is a one-line change
to the transition trigger, not a schema change.

## Closing calculation

```text
expected_cash = opening_cash
               + sum(cash_sales during this shift)
               - sum(cash_expenses during this shift)

cash_difference = counted_cash - expected_cash
```

Where:
- `cash_sales` = sum of `PaymentComponent.amount` where `method = CASH`,
  `recorded_at` falls within `[opened_at, request-close moment)`, and the order's
  `branch_id` matches the shift's branch. This window is computed once, when
  `request-close` is called (see Endpoints below), and persisted — it is not
  recomputed when `close` is later called.
- `cash_expenses` = sum of `Expense.amount` where `shift_id` = this shift (or,
  for expenses logged without a shift_id, where `recorded_at` falls in the same
  window and `branch_id` matches — see Expense entity note on nullable `shift_id`),
  using the same `[opened_at, request-close moment)` window as `cash_sales`.
- Delivery cash is included in `cash_sales` when the order's payment component is
  `CASH` — this is how "delivery cash must be reflected in end-of-day
  reconciliation" (brief) is satisfied without a separate delivery-cash bucket. No
  double counting: `DeliveryInfo.amount_expected_from_driver` is informational for
  driver-performance reporting (`reporting-contract.md`), not a separate cash-flow
  event — the actual money enters the system via a normal `PaymentComponent`.
- **Rule**: once a shift's status is `CLOSING`, no new `Order`, `PaymentComponent`,
  or `Expense` may be recorded against it (enforced the same way branch-scoping is
  enforced — see branch-context-contract.md's integrity-check pattern). This is
  what makes computing `expected_cash` once, at `request-close` time, safe: nothing
  can change the true cash total between `request-close` and the eventual `close`,
  so there is no "moving target" to recompute against.

## Endpoints

- `POST /cashier-shifts` — opens a shift; body `{opening_cash}`. Status starts
  `OPEN`, immediately usable (transition to `ACTIVE` is automatic per above, and is
  persisted as a normal status-column update the moment the first order/payment/
  expense is recorded against the shift — not a separate manual action).
- `POST /cashier-shifts/{id}/actions/request-close` — transitions `ACTIVE →
  CLOSING`. The server computes `expected_cash` **at this moment** (per the
  Closing calculation above) and persists it on the shift row together with
  `status = CLOSING`. `counted_cash` is not supplied yet. This is the point at
  which `CLOSING` becomes a real, durable, queryable state — a page reload or a
  second device checking the shift's status sees `CLOSING` and the already-computed
  `expected_cash`, not a transient in-flight value that only exists inside one
  request/response cycle.
- `POST /cashier-shifts/{id}/actions/close` — body `{counted_cash}`. **Only valid
  when the shift's current persisted status is `CLOSING`** (calling it from `OPEN`
  or `ACTIVE` returns `409 INVALID_TRANSITION` — see error-contract.md). Sets
  `counted_cash`, computes `cash_difference = counted_cash - expected_cash` using
  the `expected_cash` already persisted by `request-close` (not recomputed — the
  count reflects the cash drawer at the moment closing was requested, not a moving
  target), and sets `status = CLOSED`, `closed_at`.
- This two-step flow (`request-close` then `close`) is what makes the four-state
  enum consistent end-to-end: every state in `OPEN → ACTIVE → CLOSING → CLOSED` has
  its own persisted row, reachable independently, rather than `CLOSING` being
  collapsed into an implementation detail of a single atomic call.
- Only one `ACTIVE`/`OPEN`/`CLOSING` shift per cashier per branch at a time — a
  second open attempt while one exists returns 409 `code: "SHIFT_ALREADY_OPEN"`.

## Audit

`SHIFT_OPENED` on creation, `SHIFT_CLOSED` on close, with `cash_difference` in the
audit metadata for traceability.
