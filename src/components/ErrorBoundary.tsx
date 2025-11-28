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
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-gray-100 px-4" role="alert">
          <div className="max-w-lg w-full bg-gray-900 border border-red-500/40 rounded-2xl p-8 shadow-2xl">
            <h1 className="text-2xl font-bold text-red-300 mb-3">Something went wrong</h1>
            <p className="text-sm text-gray-300 mb-6">
              An unexpected error occurred while rendering the application. You can try reloading the interface or resetting the current session.
            </p>
            {this.state.message && (
              <p className="text-xs text-red-200 bg-red-900/30 border border-red-700/40 rounded-lg p-3 mb-6">
                {this.state.message}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={this.handleRetry}
                className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg transition-colors"
              >
                Reset Session
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
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
