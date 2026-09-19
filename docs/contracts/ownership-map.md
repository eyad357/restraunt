# Module Ownership Map

Status: STABLE (Phase 00)

## Person 1

| Module         | Backend dir (proposed)          | Frontend dir (proposed)         |
|----------------|----------------------------------|-----------------------------------|
| Authentication | `backend/app/auth/`             | `frontend/src/features/auth/`     |
| Branches       | `backend/app/branches/`         | `frontend/src/features/branches/` |
| Menu (Category/Product/Variant/Modifier) | `backend/app/menu/` | `frontend/src/features/menu/` |
| Orders         | `backend/app/orders/`           | `frontend/src/features/orders/`   |
| Payments       | `backend/app/payments/`         | `frontend/src/features/payments/` |
| Kitchen        | `backend/app/kitchen/`          | `frontend/src/features/kitchen/`  |
| Printing       | `backend/app/printing/`         | `frontend/src/features/printing/` |

## Person 2

| Module         | Backend dir (proposed)          | Frontend dir (proposed)              |
|----------------|-----------------------------------|-----------------------------------------|
| Dashboard      | `backend/app/dashboard/`         | `frontend/src/features/dashboard/`      |
| Inventory      | `backend/app/inventory/`         | `frontend/src/features/inventory/`      |
| Expenses       | `backend/app/expenses/`          | `frontend/src/features/expenses/`       |
| Cashier (shifts)| `backend/app/cashier/`          | `frontend/src/features/cashier/`        |
| Delivery       | `backend/app/delivery/`          | `frontend/src/features/delivery/`       |
| Reports        | `backend/app/reports/`           | `frontend/src/features/reports/`        |
| Audit          | `backend/app/audit/`             | `frontend/src/features/audit/`          |
| Notifications  | `backend/app/notifications/`     | `frontend/src/features/notifications/`  |
| Settings       | `backend/app/settings/`          | `frontend/src/features/settings/`       |

## Shared (either developer may touch, changes require the other's review)

| Concern                | Location                                        |
|-------------------------|--------------------------------------------------|
| Core infra (DB session, app factory, config) | `backend/app/core/`               |
| Shared enums/types      | `docs/contracts/enums/`, `backend/contracts/`, `frontend/contracts/` |
| API conventions         | `docs/contracts/api/`                            |
| Localization            | `backend/app/i18n/`, `frontend/src/i18n/`        |
| UI primitives           | `frontend/src/components/ui/`                    |
| Authentication contract | `docs/contracts/auth-contract.md` (impl in Person 1's `auth/`, consumed by both) |
| Branch context          | `docs/contracts/branch-context-contract.md`      |
| Error format            | `docs/contracts/error-contract.md`               |
| Audit conventions       | `backend/app/audit/` (helper used by both modules' write paths) |
| Testing infrastructure  | `backend/tests/conftest.py`, `frontend/src/test-utils/` |

## Independence rule

Person 1 and Person 2 must be able to build and test their modules against the
contracts in `docs/contracts/` **without** the other person's implementation
existing yet — every cross-module reference (e.g. Delivery referencing Order,
Kitchen referencing Order) is defined by ID + documented shape here, never by
importing the other person's ORM model or component directly. Where Person 2's
module needs data Person 1 owns (e.g. Reports reading `Order`/`OrderItem`), it
reads through the documented entity contract, not through Person 1's internal
service functions.
