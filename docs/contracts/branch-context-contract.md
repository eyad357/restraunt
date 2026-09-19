# Branch Context Contract

Status: STABLE (Phase 00)
Owner: Shared

## Principle

The system is multi-branch from day one (brief, "Multi-Branch" section). Every
operational entity — Order, InventoryItem, Expense, CashierShift, KitchenTicket
(via Order), DeliveryInfo (via Order) — carries `branch_id` explicitly. There is no
"default branch" fallback in the data model.

## Resolution rules

1. **CASHIER session**: `branch_id` comes from the JWT claim, set once at login.
   It is never accepted from the request body/query for this role — if a `CASHIER`
   sends a mismatched `branch_id`, the server ignores the client value and uses the
   session's, or rejects with 403 if the endpoint requires an explicit match
   (implementation detail, but the client value is never authoritative).
2. **OWNER session**: no bound branch. Must supply branch context per
   `api-contract.md` (`X-Branch-Id` header for writes, `?branch_id=` for reads).
   Omitting on a list GET means "all branches visible to this owner."
3. **Catalog entities** (Category, Product, Variant, Modifier) are **not**
   branch-scoped in MVP — one shared menu, with one shared set of prices, across
   all branches. **This is a confirmed MVP decision, not an open question**: the
   brief specifies multi-branch operational data (orders, inventory, expenses,
   shifts, kitchen, delivery, reports — see the Principle above) but never asks for
   per-branch menus or per-branch pricing, and nothing elsewhere in these contracts
   requires it — `domain-entities.md`'s `Product`/`Variant`/`Modifier` tables carry
   no `branch_id`, and `database-map.md` documents the same catalog tables as
   intentionally branch-**less**, so there is no contradiction to resolve here.
   Phase 00 therefore keeps a single global catalog and does not introduce
   per-branch pricing.
   If a genuine business need for branch-specific menus or prices emerges later, it
   is additive: a `BranchProductOverride` entity (branch_id + product/variant/
   modifier reference + overridden price/availability) can sit alongside the
   existing shared catalog without changing `Product`/`Variant`/`Modifier`
   themselves or anything that already reads them — no Phase 00 contract needs to
   change to accommodate it.
4. **User** is branch-scoped for `CASHIER` (one branch), branch-agnostic for
   `OWNER`.

## Cross-branch reporting

Reports (`reporting-contract.md`) accept an optional branch filter; omitted means
aggregate across all branches the requester can see. A `CASHIER` can never request
cross-branch reports — reporting endpoints enforce the same role/branch check as
every other endpoint.

## Data integrity rule

A request that would create a relationship spanning two branches (e.g. an
InventoryAdjustment on Branch A's item recorded during Branch B's shift) is
rejected with `422` and `code: "BRANCH_MISMATCH"`. This is checked at the service
layer, not just the database FK layer, since FKs alone can't express "same branch
on both sides."
