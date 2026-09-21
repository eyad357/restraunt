import type { UserRole } from "../../../../contracts/enums";
import { useLocale } from "../../../i18n/LocaleContext";
import { formatMoney } from "../../../money/formatMoney";
import { useDashboardTranslation } from "../hooks/useDashboardTranslation";
import { useSalesReport } from "../hooks/useSalesReport";
import { SectionState } from "./SectionState";
import type { SalesReportResponse } from "../types/dashboard";

/**
 * Deliberately hand-rolled inline SVG rather than a charting library —
 * package.json has no chart dependency, and seven bars don't justify
 * adding one (see this phase's dependency-discipline rule). This is a
 * genuine visualization of real (or, pre-backend, absent) data, not
 * decoration — see the empty state below for what renders when there's
 * simply nothing to chart yet.
 */
function SalesBarChart({ report, locale }: { report: SalesReportResponse; locale: "ar" | "en" }) {
  const values = report.points.map((p) => Number(p.total) || 0);
  const max = Math.max(1, ...values);
  const width = 560;
  const height = 160;
  const barGap = 12;
  const barWidth = report.points.length > 0 ? (width - barGap * (report.points.length - 1)) / report.points.length : 0;

  return (
    <div className="sales-chart">
      <svg
        viewBox={`0 0 ${width} ${height + 24}`}
        role="img"
        aria-label={report.points.map((p) => `${p.date}: ${formatMoney(p.total, locale)}`).join(", ")}
        preserveAspectRatio="xMidYMid meet"
      >
        {report.points.map((point, index) => {
          const value = values[index] ?? 0;
          const barHeight = max > 0 ? (value / max) * height : 0;
          const x = index * (barWidth + barGap);
          const y = height - barHeight;
          const dayLabel = new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-EG", {
            weekday: "short",
          }).format(new Date(`${point.date}T00:00:00Z`));
          return (
            <g key={point.date}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barHeight, 2)}
                rx={3}
                className="sales-chart__bar"
              />
              <text x={x + barWidth / 2} y={height + 16} textAnchor="middle" className="sales-chart__label">
                {dayLabel}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function SalesTrendSection({ role }: { role: UserRole }) {
  const { locale } = useLocale();
  const t = useDashboardTranslation();
  const result = useSalesReport(role, "weekly");

  return (
    <section className="dashboard-section" aria-labelledby="sales-trend-title">
      <div className="dashboard-section__heading">
        <h2 id="sales-trend-title">{t("dashboard.sales.title")}</h2>
        <p>{t("dashboard.sales.subtitle")}</p>
      </div>

      {result.status === "not-applicable" ? (
        <div className="dashboard-section-state">
          <p className="dashboard-section-state__message">{t("dashboard.sales.notApplicable.title")}</p>
          <p className="dashboard-empty-inline">{t("dashboard.sales.notApplicable.body")}</p>
        </div>
      ) : (
        <SectionState<SalesReportResponse>
          status={result.status}
          data={result.data}
          error={result.error}
          retry={result.retry}
          isEmpty={(data) => data.points.every((p) => Number(p.total) === 0)}
          renderEmpty={() => (
            <div className="dashboard-empty">
              <p className="dashboard-empty__title">{t("dashboard.sales.empty.title")}</p>
              <p className="dashboard-empty__body">{t("dashboard.sales.empty.body")}</p>
            </div>
          )}
          renderSuccess={(data) => (
            <>
              <p className="sales-chart__total money">
                {t("dashboard.sales.title")}: {formatMoney(data.total, locale)}
              </p>
              <SalesBarChart report={data} locale={locale} />
            </>
          )}
        />
      )}
    </section>
  );
}
