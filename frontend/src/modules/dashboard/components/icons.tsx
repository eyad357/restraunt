/**
 * Minimal hand-rolled line icons, `currentColor`-based so they inherit the
 * KPI card's tone color via CSS. Deliberately not pulling in an icon
 * library — package.json currently has no icon dependency, and a handful
 * of static outlines don't justify adding one (see this phase's
 * "don't add a dependency for a small aesthetic improvement" rule).
 */
import type { SVGProps } from "react";

function Icon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    />
  );
}

export function SalesIcon() {
  return (
    <Icon>
      <path d="M12 3v18M8 6.5h5.5a2.5 2.5 0 0 1 0 5H9a2.5 2.5 0 0 0 0 5h6" />
    </Icon>
  );
}

export function OrdersIcon() {
  return (
    <Icon>
      <path d="M6 3h9l3 3v15H6z" />
      <path d="M9 9h6M9 13h6M9 17h4" />
    </Icon>
  );
}

export function PendingIcon() {
  return (
    <Icon>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </Icon>
  );
}

export function CompletedIcon() {
  return (
    <Icon>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5l2.5 2.5L16 9.5" />
    </Icon>
  );
}

export function CancelledIcon() {
  return (
    <Icon>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 9l6 6M15 9l-6 6" />
    </Icon>
  );
}

export function DeliveryIcon() {
  return (
    <Icon>
      <path d="M3 7h11v8H3zM14 10h4l3 3v2h-7z" />
      <circle cx="7" cy="18" r="1.6" />
      <circle cx="17.5" cy="18" r="1.6" />
    </Icon>
  );
}

export function LowStockIcon() {
  return (
    <Icon>
      <path d="M4 8l8-4 8 4v8l-8 4-8-4z" />
      <path d="M4 8l8 4 8-4M12 12v8" />
    </Icon>
  );
}

export function AlertIcon() {
  return (
    <Icon>
      <path d="M12 3l9 16H3z" />
      <path d="M12 10v4M12 17h.01" />
    </Icon>
  );
}

export function KitchenIcon() {
  return (
    <Icon>
      <path d="M5 4v6a4 4 0 0 0 4 4v6M9 4v6" />
      <path d="M15 4v16M19 4v6a2 2 0 0 1-2 2" />
    </Icon>
  );
}

export function CashierIcon() {
  return (
    <Icon>
      <rect x="3" y="7" width="18" height="12" rx="1.5" />
      <path d="M3 11h18M8 15h.01M12 15h.01" />
    </Icon>
  );
}

export function InventoryIcon() {
  return (
    <Icon>
      <path d="M3 7l9-4 9 4-9 4z" />
      <path d="M3 7v10l9 4 9-4V7M12 11v10" />
    </Icon>
  );
}

export function PlusIcon() {
  return (
    <Icon>
      <path d="M12 5v14M5 12h14" />
    </Icon>
  );
}
