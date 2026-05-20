import React, { type ReactNode, type ErrorInfo } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, message: '' };
    this.handleRetry = this.handleRetry.bind(this);
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error?.message || 'Something went wrong.' };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Application error captured by ErrorBoundary:', error, info);
  }

  handleRetry(): void {
    this.setState({ hasError: false, message: '' });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#080c10] text-slate-100 px-4" role="alert">
          <div className="max-w-lg w-full bg-[#0a1015] border border-red-300/25 rounded-lg p-8 shadow-[0_30px_120px_rgba(0,0,0,0.55)]">
            <h1 className="text-2xl font-bold text-red-300 mb-3">Something went wrong</h1>
            <p className="text-sm text-slate-300 mb-6">
              An unexpected error occurred while rendering the application. You can try reloading the interface or resetting the current session.
            </p>
            {this.state.message && (
              <p className="text-xs text-red-100 bg-red-300/[0.08] border border-red-300/20 rounded-lg p-3 mb-6">
                {this.state.message}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={this.handleRetry}
                className="flex-1 px-4 py-2 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] text-slate-200 rounded-lg transition-colors"
              >
                Reset Session
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-400 text-white rounded-lg transition-colors"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
