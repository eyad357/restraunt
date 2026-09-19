# Inventory Contract

Status: STABLE (Phase 00)
Owner: Person 2

## Scope (per brief — explicitly simple)

In scope: inventory item, current quantity, unit, low-stock threshold, stock
adjustment, low-stock state, inventory value.

Explicitly out of scope: supplier management, purchase orders, procurement
workflows, warehouse management, full recipe/BOM engine.

## Model

See `InventoryItem` and `InventoryAdjustment` in `domain-entities.md`.
`current_quantity` is a **derived/cached** value equal to the sum of all
`InventoryAdjustment.quantity_delta` for that item, but stored directly on
`InventoryItem` (not recomputed on every read) for performance — every adjustment
updates both the adjustment log row and the cached `current_quantity` in the same
transaction.

## Low-stock state

`is_low_stock = current_quantity <= low_stock_threshold` — computed at read time,
not stored. Crossing this threshold on a `SALE_DEDUCT` or `WASTE` adjustment fires
`NotificationType.LOW_STOCK` (see notification-contract.md), guarded so it fires
once per crossing (not on every subsequent adjustment while still low) —
implementation detail: check `was_low_stock` before vs. after the adjustment.

## Inventory value

```text
inventory_value = sum(item.current_quantity * item.unit_cost) for all items where unit_cost is not null
```

Items with `unit_cost = null` are excluded from the total and separately listed as
"value unknown" in the report (see reporting-contract.md) rather than silently
treated as zero, which would understate value without saying so.

## Sale-linked deduction — explicitly deferred

**Decision requiring confirmation, marked extensible, not built in Phase 00**: the
brief forbids a "full recipe/BOM engine" but the Reporting Contract's Food Cost
section implies *some* linkage between sales and stock consumption is eventually
wanted. Phase 00 does not create a Product↔InventoryItem linkage table. Consequence:
`InventoryAdjustmentReason.SALE_DEDUCT` exists in the enum for forward-compatibility
but nothing in Phase 00 writes it automatically — all inventory deductions in MVP
are manual (`CORRECTION`, `WASTE`, `RECEIVED`). This is the least-complex
interpretation: automatic sale-linked deduction requires exactly the BOM engine the
brief says not to build.

## Endpoints

- `POST /inventory-items` / `PATCH /inventory-items/{id}` — manage items (name,
  unit, threshold, unit_cost). Does not touch quantity directly.
- `POST /inventory-items/{id}/adjustments` — the only way `current_quantity`
  changes. Body `{reason, quantity_delta}`. Audit `INVENTORY_UPDATED`.
