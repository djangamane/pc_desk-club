/**
 * Performance optimized wrapper component
 * Integrates all performance optimizations for desktop components
 */

import React from 'react';
import { ErrorBoundary, LayoutErrorBoundary, PerformanceErrorBoundary } from './ErrorBoundary';
import { withPerformanceMonitoring, performanceMonitor } from '../utils/performanceMonitor';
import { useLazyComponentLoading, useSmartPreloading } from '../utils/lazyLoading';
import { useAssetPreloader, usePerformantAssetLoading } from '../utils/assetOptimization';
import { getPlatformConfig } from '../utils/platformUtils';

export interface PerformanceOptimizedWrapperProps {
  children: React.ReactNode;
  componentName: string;
  errorBoundaryType?: 'default' | 'layout' | 'performance';
  enableLazyLoading?: boolean;
  enableAssetOptimization?: boolean;
  enablePerformanceMonitoring?: boolean;
  preloadAssets?: string[];
  className?: string;
  style?: React.CSSProperties;
}

const PerformanceOptimizedWrapper: React.FC<PerformanceOptimizedWrapperProps> = ({
  children,
  componentName,
  errorBoundaryType = 'default',
  enableLazyLoading = true,
  enableAssetOptimization = true,
  enablePerformanceMonitoring = true,
  preloadAssets = [],
  className,
  style
}) => {
  const config = getPlatformConfig();
  const isDesktop = config.isDesktop;

  // Performance monitoring
  React.useEffect(() => {
    if (!enablePerformanceMonitoring || !isDesktop) return;

    performanceMonitor.startRenderMeasurement();
    
    return () => {
      const metrics = performanceMonitor.endRenderMeasurement(1);
      const warnings = performanceMonitor.checkPerformanceThresholds(metrics);
      
      if (warnings.length > 0) {
        console.warn(`Performance issues in ${componentName}:`, warnings);
      }
    };
  });

  // Lazy loading setup (disabled in test environment)
  const isTestEnvironment = typeof process !== 'undefined' && process.env.NODE_ENV === 'test';
  const shouldUseLazyLoading = enableLazyLoading && !isTestEnvironment;
  const { elementRef, isVisible } = useLazyComponentLoading(0.1, '50px');
  const { preloadOnHover } = useSmartPreloading();

  // Asset optimization
  const { preloadAssets: preloadAssetsFn } = useAssetPreloader();
  const { shouldPreloadImages } = usePerformantAssetLoading();

  // Preload assets when component becomes visible or on hover
  React.useEffect(() => {
    if (preloadAssets.length > 0 && shouldPreloadImages() && (isVisible || !shouldUseLazyLoading)) {
      preloadAssetsFn(preloadAssets);
    }
  }, [preloadAssets, preloadAssetsFn, shouldPreloadImages, isVisible, shouldUseLazyLoading]);

  // Render wrapper based on error boundary type
  const renderWithErrorBoundary = (content: React.ReactNode) => {
    switch (errorBoundaryType) {
      case 'layout':
        return (
          <LayoutErrorBoundary>
            {content}
          </LayoutErrorBoundary>
        );
      case 'performance':
        return (
          <PerformanceErrorBoundary componentName={componentName}>
            {content}
          </PerformanceErrorBoundary>
        );
      default:
        return (
          <ErrorBoundary
            onError={(error, errorInfo) => {
              console.error(`Error in ${componentName}:`, { error, errorInfo });
            }}
            isolate
          >
            {content}
          </ErrorBoundary>
        );
    }
  };

  // Main content with optimizations
  const content = (
    <div
      ref={shouldUseLazyLoading ? elementRef : undefined}
      className={className}
      style={{
        ...style,
        // Performance optimizations for desktop
        ...(isDesktop && {
          contain: 'layout style paint',
          willChange: 'auto'
        })
      }}
      {...(preloadAssets.length > 0 && preloadOnHover(componentName, async () => {
        // Preload component-specific assets on hover
        return Promise.resolve();
      }))}
    >
      {(!shouldUseLazyLoading || isVisible) ? children : (
        <div style={{
          minHeight: '100px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#00ffff',
          fontFamily: 'monospace',
          fontSize: '12px'
        }}>
          Loading {componentName}...
        </div>
      )}
    </div>
  );

  return renderWithErrorBoundary(content);
};

// HOC version for easier integration
export const withPerformanceOptimization = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: Omit<PerformanceOptimizedWrapperProps, 'children'> = { componentName: 'Unknown' }
) => {
  const OptimizedComponent = React.forwardRef<any, P>((props, ref) => (
    <PerformanceOptimizedWrapper {...options}>
      <WrappedComponent {...(props as any)} ref={ref} />
    </PerformanceOptimizedWrapper>
  ));

  OptimizedComponent.displayName = `withPerformanceOptimization(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return OptimizedComponent;
};

// Specialized wrappers for common use cases

export const DesktopOptimizedComponent: React.FC<{
  children: React.ReactNode;
  componentName: string;
  className?: string;
  style?: React.CSSProperties;
}> = ({ children, componentName, className, style }) => (
  <PerformanceOptimizedWrapper
    componentName={componentName}
    errorBoundaryType="layout"
    enableLazyLoading={true}
    enableAssetOptimization={true}
    enablePerformanceMonitoring={true}
    className={className}
    style={style}
  >
    {children}
  </PerformanceOptimizedWrapper>
);

export const CriticalComponent: React.FC<{
  children: React.ReactNode;
  componentName: string;
  preloadAssets?: string[];
}> = ({ children, componentName, preloadAssets }) => (
  <PerformanceOptimizedWrapper
    componentName={componentName}
    errorBoundaryType="performance"
    enableLazyLoading={false} // Critical components load immediately
    enableAssetOptimization={true}
    enablePerformanceMonitoring={true}
    preloadAssets={preloadAssets}
  >
    {children}
  </PerformanceOptimizedWrapper>
);

export const LazyLoadedComponent: React.FC<{
  children: React.ReactNode;
  componentName: string;
  threshold?: number;
}> = ({ children, componentName, threshold = 0.1 }) => {
  const { elementRef, isVisible } = useLazyComponentLoading(threshold);
  
  return (
    <PerformanceOptimizedWrapper
      componentName={componentName}
      enableLazyLoading={true}
      enableAssetOptimization={true}
      enablePerformanceMonitoring={false} // Reduce overhead for lazy components
    >
      <div ref={elementRef}>
        {isVisible ? children : (
          <div style={{
            minHeight: '200px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#00ffff',
            fontFamily: 'monospace'
          }}>
            ⚡ Loading {componentName}...
          </div>
        )}
      </div>
    </PerformanceOptimizedWrapper>
  );
};

export default PerformanceOptimizedWrapper;