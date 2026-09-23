import { OrdersHeader } from "../components/OrdersHeader";
import { OrderFiltersBar } from "../components/OrderFiltersBar";
import { OrdersTable } from "../components/OrdersTable";
import { SectionState } from "../components/SectionState";
import { useOrderFilters, useOrdersList } from "../hooks/useOrdersList";
import { useOrdersTranslation } from "../hooks/useOrdersTranslation";
import type { OrderListResult } from "../services/ordersApi";
import "./orders.css";

export function OrdersListPage() {
  const t = useOrdersTranslation();
  const { filters, updateFilters, clearFilters, page, setPage } = useOrderFilters();
  const result = useOrdersList(filters, page);

  return (
    <div className="orders-page">
      <OrdersHeader />
      <OrderFiltersBar filters={filters} onChange={updateFilters} onClear={clearFilters} />
      <SectionState<OrderListResult>
        status={result.status}
        data={result.data}
        error={result.error}
        retry={result.retry}
        isEmpty={(data) => data.data.length === 0}
        renderEmpty={() => (
          <div className="orders-empty">
            <p className="orders-empty__title">{t("orders.table.empty.title")}</p>
            <p className="orders-empty__body">{t("orders.table.empty.body")}</p>
          </div>
        )}
        renderSuccess={(data) => <OrdersTable result={data} page={page} onPageChange={setPage} />}
      />
    </div>
  );
}
