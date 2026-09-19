# Enum Contract

Status: STABLE (Phase 00)
Owner: Shared

## Purpose

This file is the single canonical definition of every enumerated value used across
the system. Backend (`backend/contracts/enums.py`) and frontend
(`frontend/contracts/enums.ts`) are both generated **from this document**, not the
other way around. If a value needs to change, change it here first, then update both
language files in the same commit.

Rules:

- Enum values are stored and transmitted as **UPPER_SNAKE_CASE strings**, never
  integers. This keeps the database self-documenting and avoids silent renumbering
  bugs.
- Never remove or renumber a value once it has shipped. Deprecate by documenting it
  as `DEPRECATED` and stop issuing it; keep it readable for historical rows.
- Every enum below states which module owns it (Person 1 / Person 2 / Shared), per
  `docs/contracts/ownership-map.md`.

---

## UserRole (Shared)

| Value     | Meaning                                   |
|-----------|--------------------------------------------|
| `OWNER`   | Full access, all branches, all settings    |
| `CASHIER` | Branch-scoped operational access           |

Decision requiring confirmation: the brief names only Owner and Cashier. No
"Manager" or "Kitchen Staff" role exists in MVP. Kitchen and delivery screens are
therefore accessed by Owner/Cashier sessions, not by a separate role. If a distinct
kitchen-display login is wanted later, this enum extends without breaking existing
values.

## OrderSource (Person 1)

| Value     |
|-----------|
| `CASHIER` |
| `PHONE`   |
| `ONLINE`  |

## OrderType (Person 1)

| Value       |
|-------------|
| `TAKEAWAY`  |
| `PICKUP`    |
| `DELIVERY`  |
| `PRE_ORDER` |

## OrderStatus (Person 1)

| Value       | Meaning                                                    |
|-------------|-------------------------------------------------------------|
| `DRAFT`     | Being built at the register / online cart, not yet fired    |
| `PLACED`    | Confirmed, sent to kitchen                                  |
| `PREPARING` | Kitchen actively working it (mirrors KitchenStatus)         |
| `READY`     | Kitchen finished; awaiting pickup/delivery/handover         |
| `COMPLETED` | Handed to customer/driver and closed                        |
| `CANCELLED` | Voided before completion                                    |

Decision requiring confirmation: the brief does not enumerate order-level statuses
explicitly (only kitchen statuses). This contract treats `OrderStatus` as the
customer/business-facing lifecycle and `KitchenStatus` (below) as the
kitchen-internal lifecycle for the same order; they are correlated but not
identical, since an order can be `READY` while still waiting on a driver
(`DeliveryStatus`). This is the least-complex interpretation consistent with the
brief's separate Kitchen Contract section.

## KitchenStatus (Person 1)

| Value        |
|--------------|
| `RECEIVED`   |
| `PREPARING`  |
| `READY`      |
| `COMPLETED`  |

## PaymentMethod (Person 1)

| Value      |
|------------|
| `CASH`     |
| `CARD`     |
| `WALLET`   |
| `INSTAPAY` |
| `MIXED`    |

Note: `MIXED` is a marker on the **order's** payment summary, not on an individual
`PaymentComponent`. Each `PaymentComponent` uses one of the concrete methods
(`CASH`, `CARD`, `WALLET`, `INSTAPAY`); see `payment-contract.md`.

## PaymentStatus (Person 1)

| Value       |
|-------------|
| `PENDING`   |
| `PARTIAL`   |
| `PAID`      |
| `REFUNDED`  |
| `VOID`      |

## CashierShiftStatus (Person 2)

| Value      |
|------------|
| `OPEN`     |
| `ACTIVE`   |
| `CLOSING`  |
| `CLOSED`   |

## DeliveryStatus (Person 2)

| Value         | Meaning                                  |
|---------------|--------------------------------------------|
| `UNASSIGNED`  | Order marked DELIVERY, no driver yet     |
| `ASSIGNED`    | Driver assigned, not yet out              |
| `OUT`         | Driver has left with the order            |
| `DELIVERED`   | Handed to customer, cash/amount settled   |
| `RETURNED`    | Could not be delivered, order returned    |

## InventoryAdjustmentReason (Person 2)

| Value          | Meaning                              |
|----------------|----------------------------------------|
| `RECEIVED`     | Stock brought in                      |
| `SALE_DEDUCT`  | Deducted from a completed sale (only if recipe/BOM linkage exists — see inventory-contract.md) |
| `WASTE`        | Spoilage / breakage                   |
| `CORRECTION`   | Manual count correction               |

## NotificationType (Person 2)

| Value         |
|---------------|
| `ORDER_READY` |
| `LOW_STOCK`   |

## AuditAction (Shared)

| Value               |
|---------------------|
| `LOGIN`             |
| `ORDER_CREATED`     |
| `ORDER_CANCELLED`   |
| `PAYMENT_RECORDED`  |
| `EXPENSE_CREATED`   |
| `INVENTORY_UPDATED` |
| `MENU_ITEM_CHANGED` |
| `PRICE_CHANGED`     |
| `SETTINGS_CHANGED`  |
| `SHIFT_OPENED`      |
| `SHIFT_CLOSED`      |

## PrintTargetFormat (Person 1)

| Value          |
|----------------|
| `THERMAL_58MM` |
| `THERMAL_80MM` |
| `A4`           |

## PrintDocumentType (Person 1)

| Value               |
|---------------------|
| `CUSTOMER_RECEIPT`  |
| `KITCHEN_TICKET`    |
| `DELIVERY_RECEIPT`  |
| `END_OF_DAY_REPORT` |
| `CASHIER_CLOSING`   |

## Locale (Shared)

| Value |
|-------|
| `ar`  |
| `en`  |

`ar` is the default/primary locale per the brief (RTL-first). `en` is supported as
a secondary locale. See `localization-contract.md`.
