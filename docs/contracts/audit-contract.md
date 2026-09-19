# Audit Log Contract

Status: STABLE (Phase 00)
Owner: Shared

## Model

See `AuditLogEntry` in domain-entities.md. Every audited action writes exactly one
row, in the **same transaction** as the business change it records — an audit
write must never fail silently or happen "best effort" after the fact, since a
missing audit entry for a completed action is worse than the action failing
outright.

## Minimum covered actions (per brief)

`LOGIN`, `ORDER_CREATED`, `ORDER_CANCELLED`, `PAYMENT_RECORDED`,
`EXPENSE_CREATED`, `INVENTORY_UPDATED`, `MENU_ITEM_CHANGED`, `PRICE_CHANGED`,
`SETTINGS_CHANGED`, `SHIFT_OPENED`, `SHIFT_CLOSED`. See `enums.md` → `AuditAction`.

## Required fields on every entry

`actor_id` (nullable only for `ORDER_CREATED` on an `ONLINE` order — the sole
system-initiated action with no human actor in Phase 00; see
order-lifecycle-contract.md and domain-entities.md), `branch_id` (nullable only
for true cross-branch owner actions), `action`, `entity_type`, `entity_id`,
`metadata` (JSON, action-specific — e.g. `PRICE_CHANGED` metadata includes
`{old_price, new_price}`), `created_at`.

## Rules

- Audit entries are **immutable** and **never deleted**, including when the
  underlying entity is later changed again — the log is the append-only history.
- `MENU_ITEM_CHANGED` covers Category/Product/Variant/Modifier edits generically
  (`entity_type` distinguishes which); `PRICE_CHANGED` is a **separate**, more
  specific action fired in addition to `MENU_ITEM_CHANGED` whenever a price field
  changes, so financial-relevant history can be queried without filtering generic
  menu-edit noise.
- Audit reads are Owner-only (`GET /audit-log`), filterable by `actor_id`,
  `action`, `entity_type`, `branch_id`, date range — reusing the standard
  filtering conventions in api-contract.md.
- Audit writing is a cross-cutting concern implemented as a shared service/helper
  both Person 1 and Person 2 call from their respective domain code — it is not
  reimplemented per-module (see ownership-map.md, "Shared: audit conventions").
- Except for the single `ORDER_CREATED`-on-`ONLINE`-order case noted above, every
  audited action has a non-null `actor_id`. In particular, `PAYMENT_RECORDED` for
  an online payment-gateway callback still has a null `actor_id` for the same
  reason (mirrors `PaymentComponent.recorded_by` — see payment-contract.md), but
  `ORDER_CANCELLED`, `SHIFT_OPENED`/`SHIFT_CLOSED`, and every other action always
  have a human actor, since they cannot happen without a logged-in staff member.
