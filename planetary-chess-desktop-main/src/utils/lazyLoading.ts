/**
 * Lazy loading utilities for desktop chess components
 * Optimizes component loading and reduces initial bundle size
 */

import React, { Suspense } from 'react';

// Loading fallback component
const LoadingFallback: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => 
  React.createElement('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      color: '#00ffff',
      fontFamily: 'monospace',
      fontSize: '14px',
      background: 'rgba(0, 255, 255, 0.1)',
      border: '1px solid rgba(0, 255, 255, 0.3)',
      borderRadius: '8px',
      minHeight: '100px'
    }
  }, React.createElement('div', {
    style: { textAlign: 'center' }
  }, 
    React.createElement('div', { style: { marginBottom: '10px' } }, '⚡'),
    React.createElement('div', null, message)
  ));

// Error boundary for lazy loaded components
class LazyLoadErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy loading error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || React.createElement('div', {
        style: {
          padding: '20px',
          color: '#ff6b6b',
          fontFamily: 'monospace',
          fontSize: '14px',
          background: 'rgba(255, 107, 107, 0.1)',
          border: '1px solid rgba(255, 107, 107, 0.3)',
          borderRadius: '8px',
          textAlign: 'center'
        }
      }, 
        React.createElement('div', null, '⚠️ Component failed to load'),
        React.createElement('div', {
          style: { fontSize: '12px', marginTop: '10px', opacity: 0.7 }
        }, this.state.error?.message)
      );
    }

    return this.props.children;
  }
}

// Lazy loading wrapper with performance optimization
export const createLazyComponent = <T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: {
    fallback?: React.ReactNode;
    preload?: boolean;
    errorFallback?: React.ReactNode;
  } = {}
) => {
  const LazyComponent = React.lazy(importFn);

  // Preload component if requested
  if (options.preload) {
    importFn().catch(console.error);
  }

  return React.forwardRef<any, React.ComponentProps<T>>((props, ref) => 
    React.createElement(LazyLoadErrorBoundary, { 
      fallback: options.errorFallback, 
      children: React.createElement(Suspense, { fallback: options.fallback || React.createElement(LoadingFallback) },
        React.createElement(LazyComponent as any, { ...props, ref })
      )
    })
  );
};

// Intersection Observer based lazy loading for heavy components
export const useLazyComponentLoading = (
  threshold = 0.1,
  rootMargin = '50px'
) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [hasLoaded, setHasLoaded] = React.useState(false);
  const elementRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const element = elementRef.current;
    if (!element || hasLoaded) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setHasLoaded(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin, hasLoaded]);

  return { elementRef, isVisible, hasLoaded };
};

// Component size-based lazy loading
export const useConditionalLazyLoading = (
  condition: () => boolean,
  dependencies: React.DependencyList = []
) => {
  const [shouldLoad, setShouldLoad] = React.useState(false);

  React.useEffect(() => {
    const checkCondition = () => {
      if (condition()) {
        setShouldLoad(true);
      }
    };

    checkCondition();
    
    // Check on resize for viewport-based conditions
    window.addEventListener('resize', checkCondition);
    return () => window.removeEventListener('resize', checkCondition);
  }, dependencies);

  return shouldLoad;
};

// Preload components based on user interaction patterns
export const useSmartPreloading = () => {
  const [preloadedComponents, setPreloadedComponents] = React.useState<Set<string>>(new Set());

  const preloadComponent = React.useCallback((
    componentName: string,
    importFn: () => Promise<any>
  ) => {
    if (preloadedComponents.has(componentName)) return;

    // Add small delay to avoid blocking main thread
    setTimeout(() => {
      importFn()
        .then(() => {
          setPreloadedComponents(prev => new Set([...prev, componentName]));
          console.log(`📦 Preloaded component: ${componentName}`);
        })
        .catch(error => {
          console.warn(`Failed to preload ${componentName}:`, error);
        });
    }, 100);
  }, [preloadedComponents]);

  const preloadOnHover = React.useCallback((
    componentName: string,
    importFn: () => Promise<any>
  ) => ({
    onMouseEnter: () => preloadComponent(componentName, importFn),
    onFocus: () => preloadComponent(componentName, importFn)
  }), [preloadComponent]);

  return { preloadComponent, preloadOnHover, preloadedComponents };
};

// Memory-efficient component registry
class ComponentRegistry {
  private components = new Map<string, React.ComponentType<any>>();
  private loadingPromises = new Map<string, Promise<React.ComponentType<any>>>();

  async getComponent(
    name: string,
    importFn: () => Promise<{ default: React.ComponentType<any> }>
  ): Promise<React.ComponentType<any>> {
    // Return cached component if available
    if (this.components.has(name)) {
      return this.components.get(name)!;
    }

    // Return existing loading promise if in progress
    if (this.loadingPromises.has(name)) {
      return this.loadingPromises.get(name)!;
    }

    // Start loading component
    const loadingPromise = importFn()
      .then(module => {
        const component = module.default;
        this.components.set(name, component);
        this.loadingPromises.delete(name);
        return component;
      })
      .catch(error => {
        this.loadingPromises.delete(name);
        throw error;
      });

    this.loadingPromises.set(name, loadingPromise);
    return loadingPromise;
  }

  preloadComponent(
    name: string,
    importFn: () => Promise<{ default: React.ComponentType<any> }>
  ): void {
    if (!this.components.has(name) && !this.loadingPromises.has(name)) {
      this.getComponent(name, importFn).catch(console.error);
    }
  }

  clearCache(): void {
    this.components.clear();
    this.loadingPromises.clear();
  }

  getStats() {
    return {
      cached: this.components.size,
      loading: this.loadingPromises.size,
      total: this.components.size + this.loadingPromises.size
    };
  }
}

export const componentRegistry = new ComponentRegistry();

// Hook for using the component registry
export const useComponentRegistry = () => {
  return {
    getComponent: componentRegistry.getComponent.bind(componentRegistry),
    preloadComponent: componentRegistry.preloadComponent.bind(componentRegistry),
    getStats: componentRegistry.getStats.bind(componentRegistry)
  };
};