import type { ReactNode } from "react";

interface KpiCardProps {
  label: string;
  value: ReactNode;
  secondary?: ReactNode;
  icon: ReactNode;
  /** Visual emphasis only — never carries the only signal (see RTL/a11y
   * notes in pages/dashboard.css `.kpi-card--*`). */
  tone?: "neutral" | "warning" | "danger";
}

export function KpiCard({ label, value, secondary, icon, tone = "neutral" }: KpiCardProps) {
  return (
    <div className={`kpi-card kpi-card--${tone}`}>
      <div className="kpi-card__icon" aria-hidden="true">
        {icon}
      </div>
      <div className="kpi-card__body">
        <span className="kpi-card__label">{label}</span>
        <span className="kpi-card__value">{value}</span>
        {secondary ? <span className="kpi-card__secondary">{secondary}</span> : null}
      </div>
    </div>
  );
}
