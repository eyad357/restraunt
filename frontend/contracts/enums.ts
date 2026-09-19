/**
 * Canonical enum definitions for the frontend.
 *
 * SOURCE OF TRUTH: docs/contracts/enums/enums.md
 * Do not edit values here without updating that file and backend/contracts/enums.py
 * in the same change. See docs/contracts/testing-conventions.md for the
 * cross-language contract test that guards this.
 */

export type UserRole = "OWNER" | "CASHIER";

export type OrderSource = "CASHIER" | "PHONE" | "ONLINE";

export type OrderType = "TAKEAWAY" | "PICKUP" | "DELIVERY" | "PRE_ORDER";

export type OrderStatus =
  | "DRAFT"
  | "PLACED"
  | "PREPARING"
  | "READY"
  | "COMPLETED"
  | "CANCELLED";

export type KitchenStatus = "RECEIVED" | "PREPARING" | "READY" | "COMPLETED";

export type PaymentMethod = "CASH" | "CARD" | "WALLET" | "INSTAPAY" | "MIXED";

export type PaymentStatus = "PENDING" | "PARTIAL" | "PAID" | "REFUNDED" | "VOID";

export type CashierShiftStatus = "OPEN" | "ACTIVE" | "CLOSING" | "CLOSED";

export type DeliveryStatus =
  | "UNASSIGNED"
  | "ASSIGNED"
  | "OUT"
  | "DELIVERED"
  | "RETURNED";

export type InventoryAdjustmentReason =
  | "RECEIVED"
  | "SALE_DEDUCT"
  | "WASTE"
  | "CORRECTION";

export type NotificationType = "ORDER_READY" | "LOW_STOCK";

export type AuditAction =
  | "LOGIN"
  | "ORDER_CREATED"
  | "ORDER_CANCELLED"
  | "PAYMENT_RECORDED"
  | "EXPENSE_CREATED"
  | "INVENTORY_UPDATED"
  | "MENU_ITEM_CHANGED"
  | "PRICE_CHANGED"
  | "SETTINGS_CHANGED"
  | "SHIFT_OPENED"
  | "SHIFT_CLOSED";

export type PrintTargetFormat = "THERMAL_58MM" | "THERMAL_80MM" | "A4";

export type PrintDocumentType =
  | "CUSTOMER_RECEIPT"
  | "KITCHEN_TICKET"
  | "DELIVERY_RECEIPT"
  | "END_OF_DAY_REPORT"
  | "CASHIER_CLOSING";

export type Locale = "ar" | "en";
