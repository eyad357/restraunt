"""
Canonical enum definitions for the backend.

SOURCE OF TRUTH: docs/contracts/enums/enums.md
Do not edit values here without updating that file and
frontend/contracts/enums.ts in the same change. See
docs/contracts/testing-conventions.md for the cross-language contract test
that guards this file against drifting from the markdown source of truth.

Values are plain strings (str, Enum) so they serialize identically to the
frontend's TypeScript string literal unions and store as readable text in
PostgreSQL — never IntEnum. See docs/contracts/enums/enums.md, "Rules".
"""

from enum import Enum


class UserRole(str, Enum):
    OWNER = "OWNER"
    CASHIER = "CASHIER"


class OrderSource(str, Enum):
    CASHIER = "CASHIER"
    PHONE = "PHONE"
    ONLINE = "ONLINE"


class OrderType(str, Enum):
    TAKEAWAY = "TAKEAWAY"
    PICKUP = "PICKUP"
    DELIVERY = "DELIVERY"
    PRE_ORDER = "PRE_ORDER"


class OrderStatus(str, Enum):
    DRAFT = "DRAFT"
    PLACED = "PLACED"
    PREPARING = "PREPARING"
    READY = "READY"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class KitchenStatus(str, Enum):
    RECEIVED = "RECEIVED"
    PREPARING = "PREPARING"
    READY = "READY"
    COMPLETED = "COMPLETED"


class PaymentMethod(str, Enum):
    CASH = "CASH"
    CARD = "CARD"
    WALLET = "WALLET"
    INSTAPAY = "INSTAPAY"
    MIXED = "MIXED"  # derived/display-only on Order; never set on a PaymentComponent


class PaymentStatus(str, Enum):
    PENDING = "PENDING"
    PARTIAL = "PARTIAL"
    PAID = "PAID"
    REFUNDED = "REFUNDED"
    VOID = "VOID"


class CashierShiftStatus(str, Enum):
    OPEN = "OPEN"
    ACTIVE = "ACTIVE"
    CLOSING = "CLOSING"
    CLOSED = "CLOSED"


class DeliveryStatus(str, Enum):
    UNASSIGNED = "UNASSIGNED"
    ASSIGNED = "ASSIGNED"
    OUT = "OUT"
    DELIVERED = "DELIVERED"
    RETURNED = "RETURNED"


class InventoryAdjustmentReason(str, Enum):
    RECEIVED = "RECEIVED"
    SALE_DEDUCT = "SALE_DEDUCT"  # reserved; not written automatically in Phase 00
    WASTE = "WASTE"
    CORRECTION = "CORRECTION"


class NotificationType(str, Enum):
    ORDER_READY = "ORDER_READY"
    LOW_STOCK = "LOW_STOCK"


class AuditAction(str, Enum):
    LOGIN = "LOGIN"
    ORDER_CREATED = "ORDER_CREATED"
    ORDER_CANCELLED = "ORDER_CANCELLED"
    PAYMENT_RECORDED = "PAYMENT_RECORDED"
    EXPENSE_CREATED = "EXPENSE_CREATED"
    INVENTORY_UPDATED = "INVENTORY_UPDATED"
    MENU_ITEM_CHANGED = "MENU_ITEM_CHANGED"
    PRICE_CHANGED = "PRICE_CHANGED"
    SETTINGS_CHANGED = "SETTINGS_CHANGED"
    SHIFT_OPENED = "SHIFT_OPENED"
    SHIFT_CLOSED = "SHIFT_CLOSED"


class PrintTargetFormat(str, Enum):
    THERMAL_58MM = "THERMAL_58MM"
    THERMAL_80MM = "THERMAL_80MM"
    A4 = "A4"


class PrintDocumentType(str, Enum):
    CUSTOMER_RECEIPT = "CUSTOMER_RECEIPT"
    KITCHEN_TICKET = "KITCHEN_TICKET"
    DELIVERY_RECEIPT = "DELIVERY_RECEIPT"
    END_OF_DAY_REPORT = "END_OF_DAY_REPORT"
    CASHIER_CLOSING = "CASHIER_CLOSING"


class Locale(str, Enum):
    AR = "ar"
    EN = "en"
