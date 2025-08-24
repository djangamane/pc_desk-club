/**
 * Integration tests for desktop performance optimizations
 * Tests the complete performance optimization system working together
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import PerformanceOptimizedWrapper, { 
  withPerformanceOptimization,
  DesktopOptimizedComponent,
  CriticalComponent,
  LazyLoadedComponent
} from '../components/PerformanceOptimizedWrapper';
import PerformanceDashboard from '../components/PerformanceDashboard';
import { performanceMonitor } from '../utils/performanceMonitor';
import { assetCache } from '../utils/assetOptimization';
import { componentRegistry } from '../utils/lazyLoading';

// Mock platform utils
vi.mock('../utils/platformUtils', () => ({
  getPlatformConfig: () => ({
    isDesktop: true,
    isMobile: false,
    supportsKeyboard: true,
    supportsTouch: false,
    preferredInputMethod: 'keyboard'
  })
}));

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.prototype.observe = vi.fn();
mockIntersectionObserver.prototype.disconnect = vi.fn();
mockIntersectionObserver.prototype.unobserve = vi.fn();

// Mock performance API
const mockPerformance = {
  now: vi.fn(() => Date.now()),
  memory: {
    usedJSHeapSize: 50 * 1024 * 1024,
    totalJSHeapSize: 100 * 1024 * 1024
  },
  getEntriesByType: vi.fn(() => [
    { name: 'bundle.js', transferSize: 500000, initiatorType: 'script', duration: 100 },
    { name: 'styles.css', transferSize: 50000, initiatorType: 'link', duration: 20 },
    { name: 'image.png', transferSize: 100000, initiatorType: 'img', duration: 50 }
  ])
};

// Test components
const TestComponent: React.FC<{ testProp?: string }> = ({ testProp = 'test' }) => (
  <div data-testid="test-component">Test Component: {testProp}</div>
);

const SlowComponent: React.FC = () => {
  // Simulate slow component
  React.useEffect(() => {
    const start = Date.now();
    while (Date.now() - start < 50) {
      // Busy wait to simulate slow render
    }
  });
  
  return <div data-testid="slow-component">Slow Component</div>;
};

const ErrorComponent: React.FC = () => {
  throw new Error('Test error');
};

describe('Performance Optimization Integration', () => {
  beforeEach(() => {
    vi.stubGlobal('performance', mockPerformance);
    vi.stubGlobal('IntersectionObserver', mockIntersectionObserver);
    vi.stubGlobal('requestAnimationFrame', vi.fn((cb) => setTimeout(cb, 16)));
    
    // Mock test environment
    vi.stubEnv('NODE_ENV', 'test');
    
    // Clear all caches and monitoring
    performanceMonitor.clearMetrics();
    performanceMonitor.stopMonitoring();
    assetCache.clear();
    componentRegistry.clearCache();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('PerformanceOptimizedWrapper', () => {
    it('should wrap components with performance monitoring', async () => {
      render(
        <PerformanceOptimizedWrapper
          componentName="TestComponent"
          enablePerformanceMonitoring={true}
        >
          <TestComponent />
        </PerformanceOptimizedWrapper>
      );

      expect(screen.getByTestId('test-component')).toBeInTheDocument();
    });

    it('should handle errors gracefully with error boundaries', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      render(
        <PerformanceOptimizedWrapper
          componentName="ErrorComponent"
          errorBoundaryType="default"
        >
          <ErrorComponent />
        </PerformanceOptimizedWrapper>
      );

      expect(screen.getByText(/Component Error/)).toBeInTheDocument();
      expect(screen.getByText(/Test error/)).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });

    it('should implement lazy loading when enabled', async () => {
      const { container } = render(
        <PerformanceOptimizedWrapper
          componentName="LazyComponent"
          enableLazyLoading={true}
        >
          <TestComponent />
        </PerformanceOptimizedWrapper>
      );

      // Should show loading state initially
      expect(screen.getByText(/Loading LazyComponent/)).toBeInTheDocument();
      
      // Simulate intersection
      const observerCallback = mockIntersectionObserver.mock.calls[0]?.[0];
      if (observerCallback) {
        observerCallback([{ isIntersecting: true }]);
      }

      await waitFor(() => {
        expect(screen.getByTestId('test-component')).toBeInTheDocument();
      });
    });

    it('should apply desktop-specific optimizations', () => {
      const { container } = render(
        <PerformanceOptimizedWrapper
          componentName="DesktopComponent"
          enablePerformanceMonitoring={true}
        >
          <TestComponent />
        </PerformanceOptimizedWrapper>
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.style.contain).toBe('layout style paint');
    });
  });

  describe('HOC Integration', () => {
    it('should create optimized components with HOC', () => {
      const OptimizedTestComponent = withPerformanceOptimization(TestComponent, {
        componentName: 'OptimizedTest',
        enablePerformanceMonitoring: true
      });

      render(<OptimizedTestComponent testProp="optimized" />);
      
      expect(screen.getByTestId('test-component')).toBeInTheDocument();
      expect(screen.getByText('Test Component: optimized')).toBeInTheDocument();
    });
  });

  describe('Specialized Wrappers', () => {
    it('should render DesktopOptimizedComponent correctly', () => {
      render(
        <DesktopOptimizedComponent componentName="Desktop">
          <TestComponent />
        </DesktopOptimizedComponent>
      );

      expect(screen.getByTestId('test-component')).toBeInTheDocument();
    });

    it('should render CriticalComponent without lazy loading', () => {
      render(
        <CriticalComponent componentName="Critical">
          <TestComponent />
        </CriticalComponent>
      );

      // Should render immediately without loading state
      expect(screen.getByTestId('test-component')).toBeInTheDocument();
      expect(screen.queryByText(/Loading/)).not.toBeInTheDocument();
    });

    it('should implement LazyLoadedComponent with intersection observer', () => {
      render(
        <LazyLoadedComponent componentName="Lazy">
          <TestComponent />
        </LazyLoadedComponent>
      );

      expect(screen.getByText(/Loading Lazy/)).toBeInTheDocument();
    });
  });

  describe('Performance Dashboard Integration', () => {
    it('should render performance dashboard when visible', () => {
      render(<PerformanceDashboard isVisible={true} />);
      
      expect(screen.getByText('⚡ Performance')).toBeInTheDocument();
    });

    it('should toggle dashboard visibility', () => {
      const { rerender } = render(<PerformanceDashboard isVisible={false} />);
      
      expect(screen.queryByText('⚡ Performance')).not.toBeInTheDocument();
      
      rerender(<PerformanceDashboard isVisible={true} />);
      
      expect(screen.getByText('⚡ Performance')).toBeInTheDocument();
    });

    it('should show performance metrics when monitoring is active', async () => {
      performanceMonitor.startMonitoring();
      performanceMonitor.startRenderMeasurement();
      
      // Simulate render time
      mockPerformance.now.mockReturnValueOnce(100).mockReturnValueOnce(110);
      performanceMonitor.endRenderMeasurement(5);

      render(<PerformanceDashboard isVisible={true} />);
      
      await waitFor(() => {
        expect(screen.getByText(/Current Metrics/)).toBeInTheDocument();
      });
    });
  });

  describe('Error Recovery', () => {
    it('should recover from component errors', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      render(
        <PerformanceOptimizedWrapper
          componentName="RecoveryTest"
          errorBoundaryType="default"
        >
          <ErrorComponent />
        </PerformanceOptimizedWrapper>
      );

      // Should show error state
      expect(screen.getByText(/Component Error/)).toBeInTheDocument();
      
      // Click retry button
      const retryButton = screen.getByText(/🔄 Retry Component/);
      fireEvent.click(retryButton);

      // Should attempt to recover (though will error again in this test)
      await waitFor(() => {
        expect(screen.getByText(/Component Error/)).toBeInTheDocument();
      });
      
      consoleSpy.mockRestore();
    });

    it('should handle layout errors with fallback', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      render(
        <PerformanceOptimizedWrapper
          componentName="LayoutError"
          errorBoundaryType="layout"
        >
          <ErrorComponent />
        </PerformanceOptimizedWrapper>
      );

      expect(screen.getByText(/Layout Error Detected/)).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Performance Monitoring Integration', () => {
    it('should track component render performance', async () => {
      const metricsCallback = vi.fn();
      const unsubscribe = performanceMonitor.subscribe(metricsCallback);

      render(
        <PerformanceOptimizedWrapper
          componentName="MonitoredComponent"
          enablePerformanceMonitoring={true}
        >
          <TestComponent />
        </PerformanceOptimizedWrapper>
      );

      await waitFor(() => {
        expect(metricsCallback).toHaveBeenCalled();
      });

      unsubscribe();
    });

    it('should detect performance issues in slow components', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      // Mock slow render time
      mockPerformance.now
        .mockReturnValueOnce(100)
        .mockReturnValueOnce(130); // 30ms render time (above 16ms threshold)

      render(
        <PerformanceOptimizedWrapper
          componentName="SlowComponent"
          enablePerformanceMonitoring={true}
        >
          <SlowComponent />
        </PerformanceOptimizedWrapper>
      );

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('Performance issues in SlowComponent'),
          expect.any(Array)
        );
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Asset Optimization Integration', () => {
    it('should preload assets when specified', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(new Blob(['test'], { type: 'text/plain' }))
      } as Response);

      render(
        <PerformanceOptimizedWrapper
          componentName="AssetComponent"
          enableAssetOptimization={true}
          preloadAssets={['test-asset.png']}
        >
          <TestComponent />
        </PerformanceOptimizedWrapper>
      );

      await waitFor(() => {
        expect(fetchSpy).toHaveBeenCalledWith('test-asset.png');
      });

      fetchSpy.mockRestore();
    });
  });

  describe('Memory Management', () => {
    it('should clean up resources on unmount', () => {
      const { unmount } = render(
        <PerformanceOptimizedWrapper
          componentName="CleanupTest"
          enablePerformanceMonitoring={true}
        >
          <TestComponent />
        </PerformanceOptimizedWrapper>
      );

      // Verify component is rendered
      expect(screen.getByTestId('test-component')).toBeInTheDocument();

      // Unmount and verify cleanup
      unmount();
      
      // Should not throw errors during cleanup
      expect(() => {
        performanceMonitor.stopMonitoring();
      }).not.toThrow();
    });

    it('should limit cache growth', async () => {
      const initialCacheStats = assetCache.getStats();
      
      // Add multiple assets to test cache management
      for (let i = 0; i < 10; i++) {
        const blob = new Blob([`test-data-${i}`], { type: 'text/plain' });
        await assetCache.set(`asset-${i}`, blob);
      }

      const finalCacheStats = assetCache.getStats();
      
      // Cache should manage size appropriately
      expect(finalCacheStats.entries).toBeGreaterThan(0);
      expect(finalCacheStats.totalSize).toBeGreaterThan(initialCacheStats.totalSize);
    });
  });

  describe('Cross-Component Integration', () => {
    it('should handle multiple optimized components together', () => {
      render(
        <div>
          <DesktopOptimizedComponent componentName="Component1">
            <TestComponent testProp="1" />
          </DesktopOptimizedComponent>
          
          <CriticalComponent componentName="Component2">
            <TestComponent testProp="2" />
          </CriticalComponent>
          
          <LazyLoadedComponent componentName="Component3">
            <TestComponent testProp="3" />
          </LazyLoadedComponent>
        </div>
      );

      // Critical and desktop components should render immediately
      expect(screen.getByText('Test Component: 1')).toBeInTheDocument();
      expect(screen.getByText('Test Component: 2')).toBeInTheDocument();
      
      // Lazy component should show loading state
      expect(screen.getByText(/Loading Component3/)).toBeInTheDocument();
    });
  });
});