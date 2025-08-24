/**
 * Error boundaries for desktop layout components
 * Provides graceful error handling and recovery for desktop-specific features
 */

import React from 'react';

export interface ErrorInfo {
  componentStack: string;
  errorBoundary?: string;
  errorBoundaryStack?: string;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId: string;
  retryCount: number;
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void; errorId: string }>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  maxRetries?: number;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
  isolate?: boolean;
}

// Default error fallback component
const DefaultErrorFallback: React.FC<{
  error: Error;
  retry: () => void;
  errorId: string;
}> = ({ error, retry, errorId }) => (
  <div style={{
    padding: '20px',
    margin: '10px',
    background: 'rgba(255, 107, 107, 0.1)',
    border: '1px solid rgba(255, 107, 107, 0.3)',
    borderRadius: '8px',
    color: '#ff6b6b',
    fontFamily: 'monospace',
    fontSize: '14px'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
      <span style={{ fontSize: '18px', marginRight: '10px' }}>⚠️</span>
      <strong>Component Error</strong>
    </div>
    
    <div style={{ marginBottom: '15px', fontSize: '12px', opacity: 0.8 }}>
      <div>Error ID: {errorId}</div>
      <div>Message: {error.message}</div>
    </div>
    
    <button
      onClick={retry}
      style={{
        background: 'rgba(255, 107, 107, 0.2)',
        border: '1px solid rgba(255, 107, 107, 0.5)',
        color: '#ff6b6b',
        padding: '8px 16px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '12px',
        fontFamily: 'monospace'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.background = 'rgba(255, 107, 107, 0.3)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.background = 'rgba(255, 107, 107, 0.2)';
      }}
    >
      🔄 Retry Component
    </button>
  </div>
);

// Main error boundary component
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    
    this.state = {
      hasError: false,
      errorId: '',
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const enhancedErrorInfo: ErrorInfo = {
      componentStack: errorInfo.componentStack || '',
      errorBoundary: (errorInfo as any).errorBoundary || '',
      errorBoundaryStack: (errorInfo as any).errorBoundaryStack || ''
    };

    this.setState({ errorInfo: enhancedErrorInfo });

    // Log error for debugging
    console.error('ErrorBoundary caught an error:', {
      error,
      errorInfo: enhancedErrorInfo,
      errorId: this.state.errorId,
      retryCount: this.state.retryCount
    });

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, enhancedErrorInfo);
    }

    // Report to error tracking service (if available)
    this.reportError(error, enhancedErrorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetOnPropsChange, resetKeys } = this.props;
    const { hasError } = this.state;

    if (hasError && prevProps.resetOnPropsChange !== resetOnPropsChange) {
      if (resetOnPropsChange) {
        this.resetErrorBoundary();
      }
    }

    if (hasError && resetKeys && prevProps.resetKeys) {
      const hasResetKeyChanged = resetKeys.some(
        (key, index) => key !== prevProps.resetKeys![index]
      );
      
      if (hasResetKeyChanged) {
        this.resetErrorBoundary();
      }
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    // In a real application, you would send this to an error tracking service
    // like Sentry, LogRocket, or Bugsnag
    
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      errorId: this.state.errorId,
      retryCount: this.state.retryCount
    };

    // For now, just log to console
    console.warn('Error report:', errorReport);
    
    // Store in localStorage for debugging
    try {
      const existingErrors = JSON.parse(localStorage.getItem('chess_errors') || '[]');
      existingErrors.push(errorReport);
      
      // Keep only last 10 errors
      if (existingErrors.length > 10) {
        existingErrors.splice(0, existingErrors.length - 10);
      }
      
      localStorage.setItem('chess_errors', JSON.stringify(existingErrors));
    } catch (e) {
      console.warn('Failed to store error report:', e);
    }
  };

  private resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }

    this.setState(prevState => ({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      errorId: '',
      retryCount: prevState.retryCount + 1
    }));
  };

  private handleRetry = () => {
    const { maxRetries = 3 } = this.props;
    
    if (this.state.retryCount >= maxRetries) {
      console.warn(`Max retries (${maxRetries}) reached for error boundary`);
      return;
    }

    // Add a small delay before retry to prevent rapid retry loops
    this.resetTimeoutId = window.setTimeout(() => {
      this.resetErrorBoundary();
    }, 1000);
  };

  render() {
    const { hasError, error, errorId } = this.state;
    const { children, fallback: FallbackComponent, isolate } = this.props;

    if (hasError && error) {
      const FallbackToRender = FallbackComponent || DefaultErrorFallback;
      
      const errorElement = (
        <FallbackToRender
          error={error}
          retry={this.handleRetry}
          errorId={errorId}
        />
      );

      // If isolate is true, wrap in a container to prevent layout issues
      if (isolate) {
        return (
          <div style={{ 
            isolation: 'isolate',
            contain: 'layout style paint'
          }}>
            {errorElement}
          </div>
        );
      }

      return errorElement;
    }

    return children;
  }
}

// Specialized error boundaries for different component types

// Layout error boundary with layout-specific recovery
export const LayoutErrorBoundary: React.FC<{
  children: React.ReactNode;
  fallbackLayout?: 'mobile' | 'safe-desktop';
}> = ({ children, fallbackLayout = 'mobile' }) => {
  const LayoutFallback: React.FC<{ error: Error; retry: () => void }> = ({ retry }) => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '200px',
      padding: '20px',
      background: 'rgba(255, 107, 107, 0.1)',
      border: '1px solid rgba(255, 107, 107, 0.3)',
      borderRadius: '8px',
      color: '#ff6b6b',
      fontFamily: 'monospace'
    }}>
      <div style={{ fontSize: '24px', marginBottom: '15px' }}>⚠️</div>
      <div style={{ marginBottom: '15px', textAlign: 'center' }}>
        <div>Layout Error Detected</div>
        <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '5px' }}>
          Falling back to {fallbackLayout} layout
        </div>
      </div>
      <button
        onClick={retry}
        style={{
          background: 'rgba(255, 107, 107, 0.2)',
          border: '1px solid rgba(255, 107, 107, 0.5)',
          color: '#ff6b6b',
          padding: '8px 16px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px'
        }}
      >
        🔄 Retry Layout
      </button>
    </div>
  );

  return (
    <ErrorBoundary
      fallback={LayoutFallback}
      onError={(error, errorInfo) => {
        console.error('Layout error:', { error, errorInfo, fallbackLayout });
      }}
      isolate
    >
      {children}
    </ErrorBoundary>
  );
};

// Performance-sensitive component error boundary
export const PerformanceErrorBoundary: React.FC<{
  children: React.ReactNode;
  componentName: string;
}> = ({ children, componentName }) => {
  const PerformanceFallback: React.FC<{ error: Error; retry: () => void }> = ({ error, retry }) => (
    <div style={{
      padding: '15px',
      background: 'rgba(255, 193, 7, 0.1)',
      border: '1px solid rgba(255, 193, 7, 0.3)',
      borderRadius: '8px',
      color: '#ffc107',
      fontFamily: 'monospace',
      fontSize: '12px'
    }}>
      <div style={{ marginBottom: '10px' }}>
        ⚡ Performance component error: {componentName}
      </div>
      <div style={{ marginBottom: '10px', opacity: 0.7 }}>
        {error.message}
      </div>
      <button
        onClick={retry}
        style={{
          background: 'rgba(255, 193, 7, 0.2)',
          border: '1px solid rgba(255, 193, 7, 0.5)',
          color: '#ffc107',
          padding: '6px 12px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '11px'
        }}
      >
        🔄 Retry
      </button>
    </div>
  );

  return (
    <ErrorBoundary
      fallback={PerformanceFallback}
      onError={(error, errorInfo) => {
        console.error(`Performance component error in ${componentName}:`, { error, errorInfo });
      }}
      maxRetries={2}
    >
      {children}
    </ErrorBoundary>
  );
};

// Hook for programmatic error boundary control
export const useErrorBoundary = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { captureError, resetError };
};

// Error boundary provider for global error handling
export const ErrorBoundaryProvider: React.FC<{
  children: React.ReactNode;
  onGlobalError?: (error: Error, errorInfo: ErrorInfo) => void;
}> = ({ children, onGlobalError }) => {
  return (
    <ErrorBoundary
      onError={onGlobalError}
      resetOnPropsChange
      maxRetries={1}
    >
      {children}
    </ErrorBoundary>
  );
};