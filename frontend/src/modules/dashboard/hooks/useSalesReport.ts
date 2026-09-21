import { useMemo } from "react";
import type { UserRole } from "../../../../contracts/enums";
import { getSalesReport } from "../services/dashboardApi";
import { useAsyncData, type AsyncDataResult } from "./useAsyncData";
import type { SalesReportResponse } from "../types/dashboard";

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * docs/contracts/reporting-contract.md is explicit: "reporting is
 * Owner-only in MVP" — a CASHIER calling any `/reports/*` endpoint gets
 * `403 FORBIDDEN_ROLE`. Rather than make a request guaranteed to fail and
 * then handle the 403 as a generic error, this hook never issues the
 * request for a non-OWNER role at all, and instead reports a distinct
 * `"not-applicable"` status the UI renders as a role-appropriate notice
 * (see components/SalesTrendSection.tsx), not an error state.
 */
export function useSalesReport(
  role: UserRole,
  period: "daily" | "weekly",
): AsyncDataResult<SalesReportResponse> | { status: "not-applicable" } {
  const isoDate = useMemo(() => todayIsoDate(), []);
  const canView = role === "OWNER";

  const result = useAsyncData(
    () => (canView ? getSalesReport(period, isoDate) : Promise.resolve(null as never)),
    [canView, period, isoDate],
  );

  if (!canView) {
    return { status: "not-applicable" };
  }
  return result;
}
