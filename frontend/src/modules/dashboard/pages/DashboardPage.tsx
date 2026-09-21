import { useAuth } from "../../../auth/AuthContext";
import { DashboardHeader } from "../components/DashboardHeader";
import { KpiSummary } from "../components/KpiSummary";
import { OrderStatusOverview } from "../components/OrderStatusOverview";
import { SalesTrendSection } from "../components/SalesTrendSection";
import { RecentOrdersTable } from "../components/RecentOrdersTable";
import { OperationalAlerts } from "../components/OperationalAlerts";
import { QuickActions } from "../components/QuickActions";
import "./dashboard.css";

/**
 * The operational home screen after login. Reads the authenticated user
 * from the shared AuthContext (never re-implements session state) purely
 * to know the current role for the role-aware sections below — see
 * hooks/useSalesReport.ts for why that matters (reporting is Owner-only
 * per docs/contracts/reporting-contract.md).
 */
export function DashboardPage() {
  const { session } = useAuth();
  // ProtectedRoute (see ../routes.tsx) guarantees a session exists by the
  // time this renders; the null-check is a type-safety guard, not a real
  // runtime branch.
  const role = session?.user.role ?? "CASHIER";

  return (
    <div className="dashboard-page">
      <DashboardHeader role={role} />
      <KpiSummary role={role} />
      <div className="dashboard-grid">
        <OrderStatusOverview />
        <SalesTrendSection role={role} />
      </div>
      <RecentOrdersTable />
      <div className="dashboard-grid dashboard-grid--lower">
        <OperationalAlerts />
        <QuickActions />
      </div>
    </div>
  );
}
