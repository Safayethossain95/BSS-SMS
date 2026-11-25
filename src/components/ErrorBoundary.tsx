import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Application ErrorBoundary Caught Error]:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen min-h-dvh bg-bg text-ink flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-surface border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-ink">Something went wrong</h2>
              <p className="text-xs text-ink-muted mt-1">
                An unexpected error occurred in the application. Please reload or contact school IT support if the issue persists.
              </p>
            </div>
            {this.state.error && (
              <div className="text-left bg-surface-2 p-3 rounded-xl border border-gray-200 dark:border-zinc-800 text-[11px] font-mono text-red-600 dark:text-red-400 overflow-x-auto max-h-32">
                {this.state.error.message}
              </div>
            )}
            <button
              type="button"
              onClick={this.handleReset}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#1b1e42] hover:bg-[#20224A] dark:bg-accent dark:hover:bg-accent-hover text-white text-xs font-semibold shadow-sm transition cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Application</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
