import type { ReactNode } from "react";
import { useMenuTranslation } from "../hooks/useMenuTranslation";
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
  const t = useMenuTranslation();

  if (status === "loading") {
    return (
      <div className="menu-section-state" role="status" aria-live="polite">
        <span className="menu-section-state__spinner" aria-hidden="true" />
        <span>{t("menu.state.loading")}</span>
      </div>
    );
  }

  if (status === "error") {
    const message = error instanceof ApiError ? error.message : t("menu.state.error.title");
    return (
      <div className="menu-section-state menu-section-state--error" role="alert">
        <p className="menu-section-state__message">{message}</p>
        <button type="button" className="btn btn--secondary" onClick={retry}>
          {t("menu.state.error.retry")}
        </button>
      </div>
    );
  }

  if (data === null || isEmpty(data)) {
    return <div className="menu-section-state">{renderEmpty()}</div>;
  }

  return <>{renderSuccess(data)}</>;
}
