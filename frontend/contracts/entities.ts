/**
 * Implementation-neutral domain contracts for the frontend.
 *
 * SOURCE OF TRUTH: docs/contracts/domain-entities.md
 * These are NOT copies of backend ORM models (see docs/contracts/api/api-contract.md
 * and docs/contracts/database-map.md) — they are the wire shape returned by the API.
 *
 * Money fields are typed `string` deliberately — see docs/contracts/money-contract.md.
 * Never coerce a money field to `number` outside the shared formatMoney/parseMoney
 * utilities.
 */

import type {
  UserRole,
  OrderSource,
  OrderType,
  OrderStatus,
  KitchenStatus,
  PaymentMethod,
  PaymentStatus,
  CashierShiftStatus,
  DeliveryStatus,
  InventoryAdjustmentReason,
  NotificationType,
  AuditAction,
} from "./enums";

export type UUID = string;
export type ISODateTime = string; // UTC, "Z" suffix
export type Money = string; // decimal string, e.g. "45.50" — see money-contract.md

export interface LocalizedString {
  ar: string;
  en: string | null;
}

export interface Branch {
  id: UUID;
  name: string;
  is_active: boolean;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

export interface User {
  id: UUID;
  full_name: string;
  role: UserRole;
  branch_id: UUID | null; // null only for OWNER
  is_active: boolean;
  created_at: ISODateTime;
  updated_at: ISODateTime;
  // pin_hash is never sent to the frontend
}

export interface Category {
  id: UUID;
  name: LocalizedString;
  sort_order: number;
  is_active: boolean;
}

export interface Product {
  id: UUID;
  category_id: UUID;
  name: LocalizedString;
  base_price: Money;
  is_active: boolean;
}

export interface Variant {
  id: UUID;
  product_id: UUID;
  name: LocalizedString;
  price: Money;
  is_default: boolean;
}

export interface Modifier {
  id: UUID;
  product_id: UUID;
  name: LocalizedString;
  price_delta: Money;
  is_active: boolean;
}

export interface OrderItemModifier {
  id: UUID;
  order_item_id: UUID;
  modifier_id: UUID;
  name_snapshot: string;
  price_delta_snapshot: Money;
}

export interface OrderItem {
  id: UUID;
  order_id: UUID;
  product_id: UUID;
  variant_id: UUID | null;
  quantity: number;
  unit_price: Money;
  notes: string | null;
  line_total: Money;
  modifiers: OrderItemModifier[];
}

export interface PaymentComponent {
  id: UUID;
  order_id: UUID;
  method: Exclude<PaymentMethod, "MIXED">;
  amount: Money;
  /** Null only when the parent order's source is "ONLINE" and this component
   * was recorded automatically by a payment-gateway callback rather than a
   * human. See docs/contracts/payment-contract.md. */
  recorded_by: UUID | null;
  recorded_at: ISODateTime;
}

export interface KitchenTicket {
  id: UUID;
  order_id: UUID;
  status: KitchenStatus;
  received_at: ISODateTime;
  preparing_at: ISODateTime | null;
  ready_at: ISODateTime | null;
  completed_at: ISODateTime | null;
}

export interface DeliveryInfo {
  id: UUID;
  order_id: UUID;
  driver_name: string;
  status: DeliveryStatus;
  amount_expected_from_driver: Money;
  assigned_at: ISODateTime | null;
  delivered_at: ISODateTime | null;
}

export interface Order {
  id: UUID;
  branch_id: UUID;
  source: OrderSource;
  type: OrderType;
  status: OrderStatus;
  /** Null only when source === "ONLINE" — see
   * docs/contracts/order-lifecycle-contract.md. Required for CASHIER/PHONE. */
  operator_id: UUID | null;
  notes: string | null;
  subtotal: Money;
  total: Money;
  scheduled_for: ISODateTime | null; // required when type === "PRE_ORDER"
  created_at: ISODateTime;
  updated_at: ISODateTime;
  completed_at: ISODateTime | null;
  cancelled_at: ISODateTime | null;
  items: OrderItem[];
  payments: PaymentComponent[];
  delivery: DeliveryInfo | null; // present only when type === "DELIVERY"
  kitchen_state: KitchenTicket;
  // Derived, not stored independently — see payment-contract.md
  payment_status: PaymentStatus;
  payment_method_display: PaymentMethod | null;
}

export interface CashierShift {
  id: UUID;
  branch_id: UUID;
  cashier_id: UUID;
  status: CashierShiftStatus;
  opening_cash: Money;
  counted_cash: Money | null;
  expected_cash: Money | null;
  cash_difference: Money | null;
  opened_at: ISODateTime;
  closed_at: ISODateTime | null;
}

export interface Expense {
  id: UUID;
  branch_id: UUID;
  shift_id: UUID | null;
  description: string;
  amount: Money;
  recorded_by: UUID;
  recorded_at: ISODateTime;
}

export interface InventoryItem {
  id: UUID;
  branch_id: UUID;
  name: LocalizedString;
  unit: string;
  current_quantity: string; // decimal string, same convention as Money
  low_stock_threshold: string;
  unit_cost: Money | null;
  is_low_stock: boolean; // derived — see inventory-contract.md
}

export interface InventoryAdjustment {
  id: UUID;
  item_id: UUID;
  reason: InventoryAdjustmentReason;
  quantity_delta: string;
  recorded_by: UUID;
  recorded_at: ISODateTime;
}

export interface Notification {
  id: UUID;
  branch_id: UUID;
  type: NotificationType;
  payload: Record<string, unknown>;
  is_read: boolean;
  created_at: ISODateTime;
}

export interface AuditLogEntry {
  id: UUID;
  /** Null only for system-initiated actions with no human actor — in Phase 00
   * the sole case is ORDER_CREATED for an ONLINE order. See
   * docs/contracts/audit-contract.md. */
  actor_id: UUID | null;
  branch_id: UUID | null;
  action: AuditAction;
  entity_type: string;
  entity_id: UUID;
  metadata: Record<string, unknown>;
  created_at: ISODateTime;
}
