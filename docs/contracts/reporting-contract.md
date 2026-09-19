# Reporting Contract

Status: STABLE (Phase 00)
Owner: Person 2

## Principle

All reports are **read-only aggregations** over existing entities — no new
write-side entities are introduced for reporting. Every report accepts the
standard branch/date filters from `api-contract.md` and `branch-context-contract.md`.

## Reports

### Daily / Weekly / Monthly Sales
`GET /reports/sales?period=daily|weekly|monthly&branch_id=...&date=...`
Aggregates `Order.total` for `status = COMPLETED` orders in the period. Grouped by
day within the period for chart-friendly output.

### Top Products / Least Selling Products
`GET /reports/products?rank=top|least&limit=...`
Aggregates `OrderItem.quantity` and `line_total` grouped by `product_id`, joined to
current `Product.name` for display (historical `OrderItem` pricing is preserved
via snapshots per domain-entities.md, but the **name** shown in this report is
current, not a snapshot — acceptable since renaming a product doesn't need
historical relabeling the way price does).

### Food Cost
Per brief: **must not invent a complex accounting/COGS system.** Since Phase 00
deliberately does not build a recipe/BOM engine (see inventory-contract.md), Food
Cost in MVP is defined as an **extensible stub**:

```text
GET /reports/food-cost?branch_id=...&date_from=...&date_to=...

response.data = {
  "available": false,
  "reason": "No recipe/BOM linkage between products and inventory items in MVP.",
  "revenue": "12345.00"   // still computed — this part IS available
}
```

When a BOM linkage exists (future phase), `available` becomes `true` and the
response gains `cost_of_goods_sold` and `food_cost_percentage` fields — additive,
non-breaking. This satisfies the brief's explicit instruction to document what's
available rather than fabricate a number.

### Inventory Value
`GET /reports/inventory-value?branch_id=...` — see inventory-contract.md
calculation; includes the "value unknown" list for items missing `unit_cost`.

### Expenses
`GET /reports/expenses?branch_id=...&date_from=...&date_to=...` — sum and list of
`Expense` rows in range.

### Profit
```text
profit = sales_revenue (COMPLETED orders) - expenses - (cost_of_goods_sold if available, else omitted with the same "available: false" flag as Food Cost)
```
Documented as a **simple** profit figure (revenue minus expenses), explicitly not a
full P&L — matches "must not invent a complex accounting system."

### Cashier Performance
`GET /reports/cashier-performance?branch_id=...` — per cashier: shift count, total
sales handled, average `cash_difference` (accuracy indicator), count of shifts
closed short/over.

### Driver Performance
`GET /reports/driver-performance?branch_id=...` — see delivery-contract.md;
grouped by `driver_name`: delivered count, returned count, average
`OUT → DELIVERED` duration.

### Kitchen Performance
`GET /reports/kitchen-performance?branch_id=...` — see kitchen-contract.md;
average `time_to_start`, `time_to_ready`, `total_kitchen_time` across
`KitchenTicket`s in range.

## Rules

- No report performs cross-branch joins that bypass `branch-context-contract.md`'s
  access rules — a `CASHIER` calling any `/reports/*` endpoint gets 403
  (`FORBIDDEN_ROLE`); reporting is Owner-only in MVP unless product later wants a
  branch-scoped cashier view of their own shift's numbers (which already exists via
  `CashierShift` directly, not through `/reports/*`).
