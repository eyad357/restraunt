import { useMemo } from "react";
import { useLocale } from "../../../i18n/LocaleContext";
import { useDashboardTranslation } from "../hooks/useDashboardTranslation";
import type { UserRole } from "../../../../contracts/enums";

interface DashboardHeaderProps {
  role: UserRole;
}

/**
 * Branch context: per docs/contracts/branch-context-contract.md, a CASHIER
 * is bound to exactly one branch and an OWNER sees "all branches" unless
 * they explicitly filter. There is no documented endpoint to resolve a
 * branch id to a display name (no `GET /branches` — see
 * INTEGRATION_REQUEST.md), so this deliberately does NOT show a branch
 * name. It shows the role-appropriate scope description the contract
 * itself defines, which is honest and requires inventing nothing.
 */
export function DashboardHeader({ role }: DashboardHeaderProps) {
  const { locale } = useLocale();
  const t = useDashboardTranslation();

  const formattedDate = useMemo(() => {
    return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-EG", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date());
  }, [locale]);

  const branchLabel =
    role === "OWNER" ? t("dashboard.header.branch.owner") : t("dashboard.header.branch.cashier");
  const roleLabel = role === "OWNER" ? t("dashboard.header.role.owner") : t("dashboard.header.role.cashier");

  return (
    <header className="dashboard-header">
      <div>
        <h1 className="dashboard-header__title">{t("dashboard.header.title")}</h1>
        <p className="dashboard-header__subtitle">{t("dashboard.header.subtitle")}</p>
      </div>
      <div className="dashboard-header__meta">
        <span className="dashboard-header__date">{formattedDate}</span>
        <span className="dashboard-header__chip">{roleLabel}</span>
        <span className="dashboard-header__chip">{branchLabel}</span>
      </div>
    </header>
  );
}
