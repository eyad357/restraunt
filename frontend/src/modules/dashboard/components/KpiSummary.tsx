import type { UserRole } from "../../../../contracts/enums";
import { useLocale } from "../../../i18n/LocaleContext";
import { formatMoney } from "../../../money/formatMoney";
import { useDashboardTranslation } from "../hooks/useDashboardTranslation";
import { useOrderStatusCounts } from "../hooks/useOrderStatusCounts";
import { useTodayOrdersCount } from "../hooks/useTodayOrdersCount";
import { useActiveDeliveries } from "../hooks/useActiveDeliveries";
import { useLowStockItems } from "../hooks/useLowStockItems";
import { useSalesReport } from "../hooks/useSalesReport";
import { KpiCard } from "./KpiCard";
import {
  SalesIcon,
  OrdersIcon,
  PendingIcon,
  CompletedIcon,
  CancelledIcon,
  DeliveryIcon,
  LowStockIcon,
} from "./icons";

/**
 * Each KPI is backed by its own hook/request, so one failing call (e.g. a
 * 403 on /reports/sales for a CASHIER, handled separately below) never
 * blanks the other six cards. A card in "loading"/"error" state shows a
 * minimal in-card placeholder rather than the full SectionState treatment,
 * since seven simultaneous full loading blocks would be noisier than
 * useful for a KPI strip specifically.
 */
export function KpiSummary({ role }: { role: UserRole }) {
  const { locale } = useLocale();
  const t = useDashboardTranslation();

  const statusCounts = useOrderStatusCounts();
  const todayOrders = useTodayOrdersCount();
  const activeDeliveries = useActiveDeliveries();
  const lowStock = useLowStockItems();
  const salesToday = useSalesReport(role, "daily");

  function renderValue(status: "loading" | "success" | "error", value: string) {
    if (status === "loading") return "—";
    if (status === "error") return "!";
    return value;
  }

  return (
    <section className="dashboard-section" aria-labelledby="kpi-summary-title">
      <h2 className="visually-hidden" id="kpi-summary-title">
        {t("dashboard.header.title")}
      </h2>
      <div className="kpi-grid">
        {salesToday.status === "not-applicable" ? (
          <KpiCard
            label={t("dashboard.kpi.todaySales")}
            value="—"
            secondary={t("dashboard.kpi.todaySales.ownerOnly")}
            icon={<SalesIcon />}
          />
        ) : (
          <KpiCard
            label={t("dashboard.kpi.todaySales")}
            value={renderValue(
              salesToday.status,
              salesToday.data ? formatMoney(salesToday.data.total, locale) : "—",
            )}
            icon={<SalesIcon />}
          />
        )}

        <KpiCard
          label={t("dashboard.kpi.todayOrders")}
          value={renderValue(todayOrders.status, String(todayOrders.data ?? 0))}
          icon={<OrdersIcon />}
        />

        <KpiCard
          label={t("dashboard.kpi.pendingOrders")}
          value={renderValue(statusCounts.status, String(statusCounts.data?.PLACED ?? 0))}
          icon={<PendingIcon />}
          tone="warning"
        />

        <KpiCard
          label={t("dashboard.kpi.completedOrders")}
          value={renderValue(statusCounts.status, String(statusCounts.data?.COMPLETED ?? 0))}
          icon={<CompletedIcon />}
        />

        <KpiCard
          label={t("dashboard.kpi.cancelledOrders")}
          value={renderValue(statusCounts.status, String(statusCounts.data?.CANCELLED ?? 0))}
          icon={<CancelledIcon />}
          tone="danger"
        />

        <KpiCard
          label={t("dashboard.kpi.activeDeliveries")}
          value={renderValue(
            activeDeliveries.status,
            activeDeliveries.data
              ? activeDeliveries.data.possiblyIncomplete
                ? t("dashboard.kpi.atLeast", { count: activeDeliveries.data.count })
                : String(activeDeliveries.data.count)
              : "0",
          )}
          icon={<DeliveryIcon />}
        />

        <KpiCard
          label={t("dashboard.kpi.lowStock")}
          value={renderValue(
            lowStock.status,
            lowStock.data
              ? lowStock.data.possiblyIncomplete
                ? t("dashboard.kpi.atLeast", { count: lowStock.data.items.length })
                : String(lowStock.data.items.length)
              : "0",
          )}
          icon={<LowStockIcon />}
          tone={lowStock.data && lowStock.data.items.length > 0 ? "warning" : "neutral"}
        />
      </div>
    </section>
  );
}
