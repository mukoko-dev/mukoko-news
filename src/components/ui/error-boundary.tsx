"use client";

import { Component, type ReactNode, type ErrorInfo } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error with context for debugging
    console.error("[ErrorBoundary] Caught error:", error.message);
    console.error("[ErrorBoundary] Component stack:", errorInfo.componentStack);

    // TODO: In production, integrate with error tracking service (e.g., Sentry, LogRocket)
    // or send to backend ObservabilityService via API endpoint:
    // fetch('/api/errors', { method: 'POST', body: JSON.stringify({ error: error.message, stack: error.stack, componentStack: errorInfo.componentStack }) })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="p-4 rounded-lg bg-surface text-text-secondary text-center">
          <p>Something went wrong loading this content.</p>
        </div>
      );
    }

    return this.props.children;
  }
}
