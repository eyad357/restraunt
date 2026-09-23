import type { ReactNode } from "react";
import { useOrdersTranslation } from "../hooks/useOrdersTranslation";
import { ApiError } from "../../../api/ApiError";
import type { AsyncStatus } from "../hooks/useAsyncData";

interface SectionStateProps<T> {
  status: AsyncStatus;
  data: T | null;
  error: Error | null;
  retry: () => void;
  isEmpty: (data: T) => boolean;
  renderEmpty: () => ReactNode;
  renderSuccess: (data: T) => ReactNode;
}

export function SectionState<T>({
  status,
  data,
  error,
  retry,
  isEmpty,
  renderEmpty,
  renderSuccess,
}: SectionStateProps<T>) {
  const t = useOrdersTranslation();

  if (status === "loading") {
    return (
      <div className="orders-section-state" role="status" aria-live="polite">
        <span className="orders-section-state__spinner" aria-hidden="true" />
        <span>{t("orders.state.loading")}</span>
      </div>
    );
  }

  if (status === "error") {
    const message = error instanceof ApiError ? error.message : t("orders.state.error.title");
    return (
      <div className="orders-section-state orders-section-state--error" role="alert">
        <p className="orders-section-state__message">{message}</p>
        <button type="button" className="btn btn--secondary" onClick={retry}>
          {t("orders.state.error.retry")}
        </button>
      </div>
    );
  }

  if (data === null || isEmpty(data)) {
    return <div className="orders-section-state">{renderEmpty()}</div>;
  }

  return <>{renderSuccess(data)}</>;
}
