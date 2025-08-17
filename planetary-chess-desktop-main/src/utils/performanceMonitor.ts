/**
 * Performance monitoring utilities for desktop chess application
 * Tracks rendering performance, memory usage, and frame rates
 */

export interface PerformanceMetrics {
  renderTime: number;
  frameRate: number;
  memoryUsage: number;
  componentCount: number;
  timestamp: number;
}

export interface PerformanceThresholds {
  maxRenderTime: number; // ms
  minFrameRate: number; // fps
  maxMemoryUsage: number; // MB
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private observers: ((metrics: PerformanceMetrics) => void)[] = [];
  private frameCount = 0;
  private lastFrameTime = 0;
  private renderStartTime = 0;
  private isMonitoring = false;

  private readonly thresholds: PerformanceThresholds = {
    maxRenderTime: 16, // 60fps target
    minFrameRate: 30,
    maxMemoryUsage: 100 // MB
  };

  startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.frameCount = 0;
    this.lastFrameTime = performance.now();
    
    // Start frame rate monitoring
    this.monitorFrameRate();
    
    console.log('🔍 Performance monitoring started');
  }

  stopMonitoring(): void {
    this.isMonitoring = false;
    console.log('🔍 Performance monitoring stopped');
  }

  startRenderMeasurement(): void {
    this.renderStartTime = performance.now();
  }

  endRenderMeasurement(componentCount = 0): PerformanceMetrics {
    const renderTime = performance.now() - this.renderStartTime;
    const memoryUsage = this.getMemoryUsage();
    const frameRate = this.getCurrentFrameRate();
    
    const metrics: PerformanceMetrics = {
      renderTime,
      frameRate,
      memoryUsage,
      componentCount,
      timestamp: Date.now()
    };

    this.metrics.push(metrics);
    this.notifyObservers(metrics);
    
    // Keep only last 100 measurements
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }

    return metrics;
  }

  private monitorFrameRate(): void {
    if (!this.isMonitoring) return;

    const now = performance.now();
    this.frameCount++;
    
    // Calculate FPS every second
    if (now - this.lastFrameTime >= 1000) {
      const fps = (this.frameCount * 1000) / (now - this.lastFrameTime);
      this.frameCount = 0;
      this.lastFrameTime = now;
      
      // Check for performance issues
      if (fps < this.thresholds.minFrameRate) {
        console.warn(`⚠️ Low frame rate detected: ${fps.toFixed(1)} FPS`);
      }
    }

    requestAnimationFrame(() => this.monitorFrameRate());
  }

  private getCurrentFrameRate(): number {
    const recentMetrics = this.metrics.slice(-10);
    if (recentMetrics.length === 0) return 60;
    
    const avgRenderTime = recentMetrics.reduce((sum, m) => sum + m.renderTime, 0) / recentMetrics.length;
    return Math.min(60, 1000 / avgRenderTime);
  }

  private getMemoryUsage(): number {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize / (1024 * 1024); // Convert to MB
    }
    return 0;
  }

  getAverageMetrics(timeWindow = 5000): PerformanceMetrics | null {
    const now = Date.now();
    const recentMetrics = this.metrics.filter(m => now - m.timestamp <= timeWindow);
    
    if (recentMetrics.length === 0) return null;

    return {
      renderTime: recentMetrics.reduce((sum, m) => sum + m.renderTime, 0) / recentMetrics.length,
      frameRate: recentMetrics.reduce((sum, m) => sum + m.frameRate, 0) / recentMetrics.length,
      memoryUsage: recentMetrics.reduce((sum, m) => sum + m.memoryUsage, 0) / recentMetrics.length,
      componentCount: recentMetrics.reduce((sum, m) => sum + m.componentCount, 0) / recentMetrics.length,
      timestamp: now
    };
  }

  checkPerformanceThresholds(metrics: PerformanceMetrics): string[] {
    const warnings: string[] = [];

    if (metrics.renderTime > this.thresholds.maxRenderTime) {
      warnings.push(`Slow render: ${metrics.renderTime.toFixed(2)}ms (target: ${this.thresholds.maxRenderTime}ms)`);
    }

    if (metrics.frameRate < this.thresholds.minFrameRate) {
      warnings.push(`Low FPS: ${metrics.frameRate.toFixed(1)} (target: ${this.thresholds.minFrameRate}+)`);
    }

    if (metrics.memoryUsage > this.thresholds.maxMemoryUsage) {
      warnings.push(`High memory usage: ${metrics.memoryUsage.toFixed(1)}MB (target: <${this.thresholds.maxMemoryUsage}MB)`);
    }

    return warnings;
  }

  subscribe(callback: (metrics: PerformanceMetrics) => void): () => void {
    this.observers.push(callback);
    return () => {
      const index = this.observers.indexOf(callback);
      if (index > -1) {
        this.observers.splice(index, 1);
      }
    };
  }

  private notifyObservers(metrics: PerformanceMetrics): void {
    this.observers.forEach(callback => callback(metrics));
  }

  getMetricsHistory(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  clearMetrics(): void {
    this.metrics = [];
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for performance monitoring
export const usePerformanceMonitoring = () => {
  const [currentMetrics, setCurrentMetrics] = React.useState<PerformanceMetrics | null>(null);
  const [isMonitoring, setIsMonitoring] = React.useState(false);

  React.useEffect(() => {
    const unsubscribe = performanceMonitor.subscribe(setCurrentMetrics);
    return unsubscribe;
  }, []);

  const startMonitoring = React.useCallback(() => {
    performanceMonitor.startMonitoring();
    setIsMonitoring(true);
  }, []);

  const stopMonitoring = React.useCallback(() => {
    performanceMonitor.stopMonitoring();
    setIsMonitoring(false);
  }, []);

  return {
    currentMetrics,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    getAverageMetrics: performanceMonitor.getAverageMetrics.bind(performanceMonitor),
    checkThresholds: performanceMonitor.checkPerformanceThresholds.bind(performanceMonitor)
  };
};

import React from 'react';

// Performance measurement decorator for React components
export const withPerformanceMonitoring = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) => {
  return React.memo((props: P) => {
    React.useEffect(() => {
      performanceMonitor.startRenderMeasurement();
      return () => {
        const metrics = performanceMonitor.endRenderMeasurement(1);
        const warnings = performanceMonitor.checkPerformanceThresholds(metrics);
        
        if (warnings.length > 0) {
          console.warn(`Performance issues in ${componentName}:`, warnings);
        }
      };
    });

    return React.createElement(WrappedComponent, props);
  });
};