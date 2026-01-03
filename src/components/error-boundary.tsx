'use client';

/**
 * Error Boundary Component
 *
 * Catches React rendering errors and displays a fallback UI
 * instead of crashing the entire application.
 */

import React, { Component, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="m-4 border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive">Something went wrong</CardTitle>
            <CardDescription>
              An error occurred while rendering this component.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-32">
              {this.state.error?.message || 'Unknown error'}
            </pre>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" onClick={this.handleRetry}>
              Try Again
            </Button>
          </CardFooter>
        </Card>
      );
    }

    return this.props.children;
  }
}

/**
 * Chart-specific error boundary with compact fallback
 */
export function ChartErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="flex items-center justify-center h-64 bg-muted/30 rounded-lg border border-border">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Chart failed to load</p>
            <Button
              variant="link"
              size="sm"
              onClick={() => window.location.reload()}
              className="mt-2"
            >
              Reload page
            </Button>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * View-specific error boundary with more context
 */
export function ViewErrorBoundary({
  children,
  viewName,
}: {
  children: ReactNode;
  viewName: string;
}) {
  return (
    <ErrorBoundary
      fallback={
        <Card className="m-4">
          <CardHeader>
            <CardTitle>Unable to load {viewName}</CardTitle>
            <CardDescription>
              There was a problem loading this view. Please try refreshing the page.
            </CardDescription>
          </CardHeader>
          <CardFooter className="gap-2">
            <Button variant="default" size="sm" onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </CardFooter>
        </Card>
      }
    >
      {children}
    </ErrorBoundary>
  );
}
