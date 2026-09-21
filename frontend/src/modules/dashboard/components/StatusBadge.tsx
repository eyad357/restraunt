import type { OrderStatus, PaymentStatus } from "../../../../contracts/enums";

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

interface StatusBadgeProps {
  label: string;
  tone: string;
}

function Badge({ label, tone }: StatusBadgeProps) {
  return <span className={`status-badge status-badge--${tone}`}>{label}</span>;
}

export function OrderStatusBadge({ status, label }: { status: OrderStatus; label: string }) {
  return <Badge label={label} tone={ORDER_STATUS_TONE[status]} />;
}

export function PaymentStatusBadge({ status, label }: { status: PaymentStatus; label: string }) {
  return <Badge label={label} tone={PAYMENT_STATUS_TONE[status]} />;
}
