import type { DeliveryStatus, OrderStatus, PaymentStatus } from "../../../../contracts/enums";

const ORDER_STATUS_TONE: Record<OrderStatus, string> = {
  DRAFT: "neutral",
  PLACED: "info",
  PREPARING: "warning",
  READY: "ready",
  COMPLETED: "success",
  CANCELLED: "danger",
};

const PAYMENT_STATUS_TONE: Record<PaymentStatus, string> = {
  PENDING: "neutral",
  PARTIAL: "warning",
  PAID: "success",
  REFUNDED: "info",
  VOID: "danger",
};

const DELIVERY_STATUS_TONE: Record<DeliveryStatus, string> = {
  UNASSIGNED: "neutral",
  ASSIGNED: "info",
  OUT: "warning",
  DELIVERED: "success",
  RETURNED: "danger",
};

function Badge({ label, tone }: { label: string; tone: string }) {
  return <span className={`status-badge status-badge--${tone}`}>{label}</span>;
}

export function OrderStatusBadge({ status, label }: { status: OrderStatus; label: string }) {
  return <Badge label={label} tone={ORDER_STATUS_TONE[status]} />;
}

export function PaymentStatusBadge({ status, label }: { status: PaymentStatus; label: string }) {
  return <Badge label={label} tone={PAYMENT_STATUS_TONE[status]} />;
}

export function DeliveryStatusBadge({ status, label }: { status: DeliveryStatus; label: string }) {
  return <Badge label={label} tone={DELIVERY_STATUS_TONE[status]} />;
}
