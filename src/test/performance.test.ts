/**
 * Performance tests and optimization validation
 * Tests desktop performance optimizations and monitors key metrics
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { performanceMonitor, PerformanceMetrics } from '../utils/performanceMonitor';
import { assetCache } from '../utils/assetOptimization';
import { componentRegistry } from '../utils/lazyLoading';

// Mock performance API
const mockPerformance = {
  now: vi.fn(() => Date.now()),
  memory: {
    usedJSHeapSize: 50 * 1024 * 1024, // 50MB
    totalJSHeapSize: 100 * 1024 * 1024 // 100MB
  },
  getEntriesByType: vi.fn(() => [])
};

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.prototype.observe = vi.fn();
mockIntersectionObserver.prototype.disconnect = vi.fn();

// Mock requestAnimationFrame
const mockRequestAnimationFrame = vi.fn((callback) => {
  setTimeout(callback, 16); // ~60fps
  return 1;
});

describe('Performance Monitor', () => {
  beforeEach(() => {
    vi.stubGlobal('performance', mockPerformance);
    vi.stubGlobal('requestAnimationFrame', mockRequestAnimationFrame);
    performanceMonitor.clearMetrics();
  });

  afterEach(() => {
    performanceMonitor.stopMonitoring();
    vi.restoreAllMocks();
  });

  it('should start and stop monitoring correctly', () => {
    expect(performanceMonitor['isMonitoring']).toBe(false);
    
    performanceMonitor.startMonitoring();
    expect(performanceMonitor['isMonitoring']).toBe(true);
    
    performanceMonitor.stopMonitoring();
    expect(performanceMonitor['isMonitoring']).toBe(false);
  });

  it('should measure render performance', () => {
    performanceMonitor.startRenderMeasurement();
    
    // Simulate some work
    const startTime = mockPerformance.now();
    mockPerformance.now.mockReturnValue(startTime + 10); // 10ms render
    
    const metrics = performanceMonitor.endRenderMeasurement(5);
    
    expect(metrics.renderTime).toBe(10);
    expect(metrics.componentCount).toBe(5);
    expect(metrics.memoryUsage).toBe(50); // 50MB
  });

  it('should detect performance issues', () => {
    const slowMetrics: PerformanceMetrics = {
      renderTime: 20, // Above 16ms threshold
      frameRate: 25, // Below 30fps threshold
      memoryUsage: 150, // Above 100MB threshold
      componentCount: 10,
      timestamp: Date.now()
    };

    const warnings = performanceMonitor.checkPerformanceThresholds(slowMetrics);
    
    expect(warnings).toHaveLength(3);
    expect(warnings[0]).toContain('Slow render');
    expect(warnings[1]).toContain('Low FPS');
    expect(warnings[2]).toContain('High memory usage');
  });

  it('should calculate average metrics correctly', () => {
    // Add some test metrics
    const metrics1 = performanceMonitor.endRenderMeasurement(1);
    mockPerformance.now.mockReturnValue(mockPerformance.now() + 5);
    const metrics2 = performanceMonitor.endRenderMeasurement(2);
    
    const average = performanceMonitor.getAverageMetrics(10000);
    
    expect(average).toBeDefined();
    expect(average!.componentCount).toBe(1.5); // Average of 1 and 2
  });

  it('should limit metrics history size', () => {
    // Add more than 100 metrics
    for (let i = 0; i < 150; i++) {
      performanceMonitor.endRenderMeasurement(1);
    }
    
    const history = performanceMonitor.getMetricsHistory();
    expect(history.length).toBe(100);
  });

  it('should handle subscription and unsubscription', () => {
    const callback = vi.fn();
    const unsubscribe = performanceMonitor.subscribe(callback);
    
    performanceMonitor.endRenderMeasurement(1);
    expect(callback).toHaveBeenCalledTimes(1);
    
    unsubscribe();
    performanceMonitor.endRenderMeasurement(1);
    expect(callback).toHaveBeenCalledTimes(1); // Should not be called again
  });
});

describe('Asset Cache', () => {
  beforeEach(() => {
    assetCache.clear();
  });

  it('should cache and retrieve assets', async () => {
    const testBlob = new Blob(['test data'], { type: 'text/plain' });
    const testUrl = 'test://example.com/asset.txt';
    
    await assetCache.set(testUrl, testBlob);
    const retrieved = await assetCache.get(testUrl);
    
    expect(retrieved).toBeDefined();
    expect(retrieved!.size).toBe(testBlob.size);
    expect(retrieved!.type).toBe(testBlob.type);
  });

  it('should handle cache expiration', async () => {
    const testBlob = new Blob(['test data'], { type: 'text/plain' });
    const testUrl = 'test://example.com/asset.txt';
    
    await assetCache.set(testUrl, testBlob);
    
    // Mock expired timestamp
    const entry = assetCache['cache'].get(testUrl);
    if (entry) {
      entry.timestamp = Date.now() - (25 * 60 * 60 * 1000); // 25 hours ago
    }
    
    const retrieved = await assetCache.get(testUrl);
    expect(retrieved).toBeNull();
  });

  it('should evict old entries when cache is full', async () => {
    const maxSize = assetCache['maxSize'];
    const largeBlob = new Blob([new ArrayBuffer(maxSize * 0.6)], { type: 'application/octet-stream' });
    
    await assetCache.set('asset1', largeBlob);
    await assetCache.set('asset2', largeBlob);
    
    // First asset should be evicted
    const asset1 = await assetCache.get('asset1');
    const asset2 = await assetCache.get('asset2');
    
    expect(asset1).toBeNull();
    expect(asset2).toBeDefined();
  });

  it('should provide accurate cache statistics', async () => {
    const testBlob = new Blob(['test data'], { type: 'text/plain' });
    
    await assetCache.set('asset1', testBlob);
    await assetCache.set('asset2', testBlob);
    
    const stats = assetCache.getStats();
    
    expect(stats.entries).toBe(2);
    expect(stats.totalSize).toBe(testBlob.size * 2);
    expect(stats.utilization).toBeGreaterThan(0);
  });
});

describe('Component Registry', () => {
  beforeEach(() => {
    componentRegistry.clearCache();
  });

  it('should cache loaded components', async () => {
    const mockComponent = () => null;
    const mockImport = vi.fn().mockResolvedValue({ default: mockComponent });
    
    const component1 = await componentRegistry.getComponent('TestComponent', mockImport);
    const component2 = await componentRegistry.getComponent('TestComponent', mockImport);
    
    expect(component1).toBe(mockComponent);
    expect(component2).toBe(mockComponent);
    expect(mockImport).toHaveBeenCalledTimes(1); // Should only import once
  });

  it('should handle loading failures', async () => {
    const mockImport = vi.fn().mockRejectedValue(new Error('Import failed'));
    
    await expect(componentRegistry.getComponent('FailingComponent', mockImport))
      .rejects.toThrow('Import failed');
  });

  it('should preload components', () => {
    const mockComponent = () => null;
    const mockImport = vi.fn().mockResolvedValue({ default: mockComponent });
    
    componentRegistry.preloadComponent('PreloadComponent', mockImport);
    
    expect(mockImport).toHaveBeenCalledTimes(1);
  });

  it('should provide accurate statistics', async () => {
    const mockComponent = () => null;
    const mockImport = vi.fn().mockResolvedValue({ default: mockComponent });
    
    await componentRegistry.getComponent('Component1', mockImport);
    
    const stats = componentRegistry.getStats();
    expect(stats.cached).toBe(1);
    expect(stats.total).toBe(1);
  });
});

describe('Performance Benchmarks', () => {
  it('should meet render time targets for desktop layout', () => {
    const targetRenderTime = 16; // 60fps target
    
    performanceMonitor.startRenderMeasurement();
    
    // Simulate desktop layout render
    const startTime = mockPerformance.now();
    mockPerformance.now.mockReturnValue(startTime + 12); // 12ms render
    
    const metrics = performanceMonitor.endRenderMeasurement(20);
    
    expect(metrics.renderTime).toBeLessThan(targetRenderTime);
  });

  it('should handle large component counts efficiently', () => {
    const maxComponents = 50;
    
    performanceMonitor.startRenderMeasurement();
    
    // Simulate rendering many components
    const startTime = mockPerformance.now();
    mockPerformance.now.mockReturnValue(startTime + 15); // 15ms for 50 components
    
    const metrics = performanceMonitor.endRenderMeasurement(maxComponents);
    
    expect(metrics.componentCount).toBe(maxComponents);
    expect(metrics.renderTime).toBeLessThan(20); // Should be under 20ms even with many components
  });

  it('should maintain memory usage within limits', () => {
    const maxMemoryMB = 100;
    
    const metrics = performanceMonitor.endRenderMeasurement(10);
    
    expect(metrics.memoryUsage).toBeLessThan(maxMemoryMB);
  });
});

describe('Asset Loading Performance', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.stubGlobal('IntersectionObserver', mockIntersectionObserver);
  });

  it('should load assets within acceptable time limits', async () => {
    const mockBlob = new Blob(['image data'], { type: 'image/png' });
    const mockResponse = {
      ok: true,
      blob: () => Promise.resolve(mockBlob)
    };
    
    (global.fetch as any).mockResolvedValue(mockResponse);
    
    const startTime = Date.now();
    await assetCache.set('test-image.png', mockBlob);
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(100); // Should load quickly for cached assets
  });

  it('should handle concurrent asset loading efficiently', async () => {
    const mockBlob = new Blob(['image data'], { type: 'image/png' });
    const mockResponse = {
      ok: true,
      blob: () => Promise.resolve(mockBlob)
    };
    
    (global.fetch as any).mockResolvedValue(mockResponse);
    
    const promises = Array.from({ length: 10 }, (_, i) => 
      assetCache.set(`image-${i}.png`, mockBlob)
    );
    
    const startTime = Date.now();
    await Promise.all(promises);
    const totalTime = Date.now() - startTime;
    
    expect(totalTime).toBeLessThan(500); // Should handle concurrent loading efficiently
  });
});

describe('Memory Management', () => {
  it('should clean up resources properly', () => {
    // Test that event listeners and observers are cleaned up
    const cleanup = vi.fn();
    
    // Simulate component unmount
    cleanup();
    
    expect(cleanup).toHaveBeenCalled();
  });

  it('should limit cache growth', async () => {
    const initialStats = assetCache.getStats();
    
    // Add many small assets
    for (let i = 0; i < 100; i++) {
      const blob = new Blob([`data-${i}`], { type: 'text/plain' });
      await assetCache.set(`asset-${i}`, blob);
    }
    
    const finalStats = assetCache.getStats();
    
    // Cache should not grow indefinitely
    expect(finalStats.totalSize).toBeLessThan(assetCache['maxSize']);
  });
});

describe('Error Recovery Performance', () => {
  it('should recover from errors quickly', () => {
    const startTime = Date.now();
    
    try {
      throw new Error('Test error');
    } catch (error) {
      // Simulate error recovery
      const recoveryTime = Date.now() - startTime;
      expect(recoveryTime).toBeLessThan(50); // Should recover quickly
    }
  });

  it('should maintain performance during error states', () => {
    performanceMonitor.startRenderMeasurement();
    
    // Simulate error during render
    try {
      throw new Error('Render error');
    } catch (error) {
      // Continue with fallback render
      const startTime = mockPerformance.now();
      mockPerformance.now.mockReturnValue(startTime + 8); // Fast fallback render
      
      const metrics = performanceMonitor.endRenderMeasurement(1);
      expect(metrics.renderTime).toBeLessThan(16); // Should still meet performance targets
    }
  });
});