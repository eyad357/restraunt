import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Rendered instead of children when an error is caught. Receives the
   * error so callers can log/display details if they want to. */
  fallback: (error: Error, reset: () => void) => ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface State {
  error: Error | null;
}

/**
 * Basic application error boundary (class component — React requires this,
 * hooks cannot implement `getDerivedStateFromError`/`componentDidCatch`).
 *
 * This only catches render/lifecycle errors in the React tree below it, per
 * React's error boundary semantics — it does not catch errors from event
 * handlers or async code (those should be handled where they occur, e.g.
 * via the API client's typed errors).
 */
export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    this.props.onError?.(error, info);
  }

  reset = (): void => {
    this.setState({ error: null });
  };

  override render(): ReactNode {
    if (this.state.error) {
      return this.props.fallback(this.state.error, this.reset);
    }
    return this.props.children;
  }
}
