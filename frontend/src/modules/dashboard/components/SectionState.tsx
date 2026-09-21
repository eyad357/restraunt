import type { ReactNode } from "react";
import { useDashboardTranslation } from "../hooks/useDashboardTranslation";
import { ApiError } from "../../../api/ApiError";
import type { AsyncStatus } from "../hooks/useAsyncData";

interface SectionStateProps<T> {
  status: AsyncStatus;
  data: T | null;
  error: Error | null;
  retry: () => void;
  /** Returns true when `data` should be treated as empty (e.g. an empty
   * array) — lets each section define what "no data" means for its own
   * shape rather than this component guessing. */
  isEmpty: (data: T) => boolean;
  renderEmpty: () => ReactNode;
  renderSuccess: (data: T) => ReactNode;
}

/**
 * Every dashboard section renders through this so loading/error/empty
 * look and behave consistently, and so one section's failure never blanks
 * the rest of the page — each `SectionState` instance is independent.
 */
export function SectionState<T>({
  status,
  data,
  error,
  retry,
  isEmpty,
  renderEmpty,
  renderSuccess,
}: SectionStateProps<T>) {
  const t = useDashboardTranslation();

  if (status === "loading") {
    return (
      <div className="dashboard-section-state" role="status" aria-live="polite">
        <span className="dashboard-section-state__spinner" aria-hidden="true" />
        <span>{t("dashboard.state.loading")}</span>
      </div>
    );
  }

  if (status === "error") {
    const message = error instanceof ApiError ? error.message : t("dashboard.state.error.title");
    return (
      <div className="dashboard-section-state dashboard-section-state--error" role="alert">
        <p className="dashboard-section-state__message">{message}</p>
        <button type="button" className="btn btn--secondary" onClick={retry}>
          {t("dashboard.state.error.retry")}
        </button>
      </div>
    );
  }

  if (data === null || isEmpty(data)) {
    return <div className="dashboard-section-state">{renderEmpty()}</div>;
  }

  return <>{renderSuccess(data)}</>;
}
