import type { OrderSource, OrderStatus, OrderType, PaymentStatus } from "../../../../contracts/enums";
import { useOrdersTranslation } from "../hooks/useOrdersTranslation";
import type { OrderFilters } from "../types/order";

const STATUSES: OrderStatus[] = ["PLACED", "PREPARING", "READY", "COMPLETED", "CANCELLED", "DRAFT"];
const TYPES: OrderType[] = ["TAKEAWAY", "PICKUP", "DELIVERY", "PRE_ORDER"];
const SOURCES: OrderSource[] = ["CASHIER", "PHONE", "ONLINE"];
const PAYMENT_STATUSES: PaymentStatus[] = ["PENDING", "PARTIAL", "PAID", "REFUNDED", "VOID"];

interface OrderFiltersBarProps {
  filters: OrderFilters;
  onChange: (next: Partial<OrderFilters>) => void;
  onClear: () => void;
}

export function OrderFiltersBar({ filters, onChange, onClear }: OrderFiltersBarProps) {
  const t = useOrdersTranslation();

  return (
    <div className="orders-filters">
      <div className="orders-filters__field orders-filters__field--search">
        <label htmlFor="orders-search">{t("orders.filters.search")}</label>
        <input
          id="orders-search"
          type="text"
          value={filters.search ?? ""}
          placeholder={t("orders.filters.searchPlaceholder")}
          onChange={(e) => onChange({ search: e.target.value })}
        />
      </div>

      <div className="orders-filters__field">
        <label htmlFor="orders-filter-status">{t("orders.filters.status")}</label>
        <select
          id="orders-filter-status"
          value={filters.status ?? ""}
          onChange={(e) => onChange({ status: (e.target.value || undefined) as OrderStatus | undefined })}
        >
          <option value="">{t("orders.filters.all")}</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {t(`orders.status.${s}`)}
            </option>
          ))}
        </select>
      </div>

      <div className="orders-filters__field">
        <label htmlFor="orders-filter-type">{t("orders.filters.type")}</label>
        <select
          id="orders-filter-type"
          value={filters.type ?? ""}
          onChange={(e) => onChange({ type: (e.target.value || undefined) as OrderType | undefined })}
        >
          <option value="">{t("orders.filters.all")}</option>
          {TYPES.map((ty) => (
            <option key={ty} value={ty}>
              {t(`orders.type.${ty}`)}
            </option>
          ))}
        </select>
      </div>

      <div className="orders-filters__field">
        <label htmlFor="orders-filter-source">{t("orders.filters.source")}</label>
        <select
          id="orders-filter-source"
          value={filters.source ?? ""}
          onChange={(e) => onChange({ source: (e.target.value || undefined) as OrderSource | undefined })}
        >
          <option value="">{t("orders.filters.all")}</option>
          {SOURCES.map((src) => (
            <option key={src} value={src}>
              {t(`orders.source.${src}`)}
            </option>
          ))}
        </select>
      </div>

      <div className="orders-filters__field">
        <label htmlFor="orders-filter-payment">{t("orders.filters.paymentStatus")}</label>
        <select
          id="orders-filter-payment"
          value={filters.payment_status ?? ""}
          onChange={(e) =>
            onChange({ payment_status: (e.target.value || undefined) as PaymentStatus | undefined })
          }
        >
          <option value="">{t("orders.filters.all")}</option>
          {PAYMENT_STATUSES.map((ps) => (
            <option key={ps} value={ps}>
              {t(`orders.paymentStatus.${ps}`)}
            </option>
          ))}
        </select>
      </div>

      <div className="orders-filters__field">
        <label htmlFor="orders-filter-from">{t("orders.filters.dateFrom")}</label>
        <input
          id="orders-filter-from"
          type="date"
          value={filters.created_at_from?.slice(0, 10) ?? ""}
          onChange={(e) =>
            onChange({
              created_at_from: e.target.value ? `${e.target.value}T00:00:00Z` : undefined,
            })
          }
        />
      </div>

      <div className="orders-filters__field">
        <label htmlFor="orders-filter-to">{t("orders.filters.dateTo")}</label>
        <input
          id="orders-filter-to"
          type="date"
          value={filters.created_at_to?.slice(0, 10) ?? ""}
          onChange={(e) =>
            onChange({
              created_at_to: e.target.value ? `${e.target.value}T23:59:59Z` : undefined,
            })
          }
        />
      </div>

      <button type="button" className="btn btn--secondary orders-filters__clear" onClick={onClear}>
        {t("orders.filters.clear")}
      </button>
    </div>
  );
}
