import type { ReactNode } from "react";
import { useKitchenTranslation } from "../hooks/useKitchenTranslation";
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

export function SectionState<T>({ status, data, error, retry, isEmpty, renderEmpty, renderSuccess }: SectionStateProps<T>) {
  const t = useKitchenTranslation();

  if (status === "loading") {
    return (
      <div className="kitchen-section-state" role="status" aria-live="polite">
        <span className="kitchen-section-state__spinner" aria-hidden="true" />
        <span>{t("kitchen.state.loading")}</span>
      </div>
    );
  }

  if (status === "error") {
    const message = error instanceof ApiError ? error.message : t("kitchen.state.error.title");
    return (
      <div className="kitchen-section-state kitchen-section-state--error" role="alert">
        <p className="kitchen-section-state__message">{message}</p>
        <button type="button" className="btn btn--secondary" onClick={retry}>
          {t("kitchen.state.error.retry")}
        </button>
      </div>
    );
  }

  if (data === null || isEmpty(data)) {
    return <div className="kitchen-section-state">{renderEmpty()}</div>;
  }

  return <>{renderSuccess(data)}</>;
}
