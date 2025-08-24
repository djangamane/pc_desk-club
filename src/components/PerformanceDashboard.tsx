/**
 * Performance dashboard component for monitoring desktop performance
 * Provides real-time performance metrics and optimization insights
 */

import React from 'react';
import { usePerformanceMonitoring } from '../utils/performanceMonitor';
import { assetCache, analyzeBundleSize } from '../utils/assetOptimization';
import { componentRegistry } from '../utils/lazyLoading';
import { getPlatformConfig } from '../utils/platformUtils';

interface PerformanceDashboardProps {
  isVisible?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  compact?: boolean;
}

const PerformanceDashboard: React.FC<PerformanceDashboardProps> = React.memo(({
  isVisible = false,
  position = 'top-right',
  compact = false
}) => {
  const {
    currentMetrics,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    getAverageMetrics,
    checkThresholds
  } = usePerformanceMonitoring();

  const [bundleStats, setBundleStats] = React.useState<any>(null);
  const [cacheStats, setCacheStats] = React.useState<any>(null);
  const [componentStats, setComponentStats] = React.useState<any>(null);
  const [expanded, setExpanded] = React.useState(!compact);

  const config = React.useMemo(() => getPlatformConfig(), []);

  // Update stats periodically
  React.useEffect(() => {
    if (!isVisible) return;

    const updateStats = () => {
      const analyzer = analyzeBundleSize();
      setBundleStats({
        totalSize: analyzer.getTotalBundleSize(),
        resources: analyzer.getResourceSizes().slice(0, 5), // Top 5
        images: analyzer.getImageSizes().slice(0, 3) // Top 3 images
      });
      
      setCacheStats(assetCache.getStats());
      setComponentStats(componentRegistry.getStats());
    };

    updateStats();
    const interval = setInterval(updateStats, 2000);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible || !config.isDesktop) return null;

  const positionStyles: Record<string, React.CSSProperties> = {
    'top-left': { top: '10px', left: '10px' },
    'top-right': { top: '10px', right: '10px' },
    'bottom-left': { bottom: '10px', left: '10px' },
    'bottom-right': { bottom: '10px', right: '10px' }
  };

  const getPerformanceColor = React.useCallback((value: number, threshold: number, inverse = false) => {
    const isGood = inverse ? value < threshold : value > threshold;
    // Desktop-specific color coding with more stringent standards
    if (isGood) return '#00ff88'; // Green for good performance
    if (inverse ? value > threshold * 2 : value < threshold * 0.5) return '#ff4444'; // Red for poor performance
    return '#ffaa00'; // Yellow for moderate performance
  }, []);

  const formatBytes = React.useCallback((bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }, []);

  const dashboardStyle: React.CSSProperties = {
    position: 'fixed',
    ...positionStyles[position],
    background: 'rgba(0, 20, 40, 0.95)',
    border: '1px solid rgba(0, 255, 255, 0.3)',
    borderRadius: '8px',
    padding: expanded ? '12px' : '8px',
    fontFamily: 'monospace',
    fontSize: '11px',
    color: '#00ffff',
    zIndex: 9999,
    minWidth: expanded ? '280px' : '120px',
    maxWidth: '350px',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 4px 12px rgba(0, 255, 255, 0.1)'
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: expanded ? '8px' : '4px',
    paddingBottom: '4px',
    borderBottom: '1px solid rgba(0, 255, 255, 0.2)'
  };

  const metricStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '3px',
    fontSize: '10px'
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: '8px',
    paddingBottom: '6px',
    borderBottom: '1px solid rgba(0, 255, 255, 0.1)'
  };

  return (
    <div style={dashboardStyle}>
      <div style={headerStyle}>
        <span style={{ fontWeight: 'bold', fontSize: '12px' }}>
          ⚡ Performance
        </span>
        <div>
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              background: 'none',
              border: 'none',
              color: '#00ffff',
              cursor: 'pointer',
              fontSize: '10px',
              marginRight: '4px'
            }}
          >
            {expanded ? '−' : '+'}
          </button>
          <button
            onClick={isMonitoring ? stopMonitoring : startMonitoring}
            style={{
              background: 'none',
              border: 'none',
              color: isMonitoring ? '#00ff88' : '#ffaa00',
              cursor: 'pointer',
              fontSize: '10px'
            }}
          >
            {isMonitoring ? '⏸' : '▶'}
          </button>
        </div>
      </div>

      {expanded && (
        <>
          {/* Current Performance Metrics */}
          {currentMetrics && (
            <div style={sectionStyle}>
              <div style={{ fontSize: '11px', marginBottom: '4px', color: '#88ddff' }}>
                Current Metrics
              </div>
              <div style={metricStyle}>
                <span>Render:</span>
                <span style={{ color: getPerformanceColor(currentMetrics.renderTime, config.performance.maxRenderTime, true) }}>
                  {currentMetrics.renderTime.toFixed(1)}ms
                </span>
              </div>
              <div style={metricStyle}>
                <span>FPS:</span>
                <span style={{ color: getPerformanceColor(currentMetrics.frameRate, config.performance.minFPS) }}>
                  {currentMetrics.frameRate.toFixed(1)}
                </span>
              </div>
              <div style={metricStyle}>
                <span>Memory:</span>
                <span style={{ color: getPerformanceColor(currentMetrics.memoryUsage, config.performance.memoryLimit, true) }}>
                  {currentMetrics.memoryUsage.toFixed(1)}MB
                </span>
              </div>
              <div style={metricStyle}>
                <span>Components:</span>
                <span>{currentMetrics.componentCount}</span>
              </div>
            </div>
          )}

          {/* Average Performance */}
          {(() => {
            const avgMetrics = getAverageMetrics(5000);
            if (!avgMetrics) return null;

            const warnings = checkThresholds(avgMetrics);
            
            return (
              <div style={sectionStyle}>
                <div style={{ fontSize: '11px', marginBottom: '4px', color: '#88ddff' }}>
                  5s Average {warnings.length > 0 && <span style={{ color: '#ff4444' }}>⚠</span>}
                </div>
                <div style={metricStyle}>
                  <span>Render:</span>
                  <span style={{ color: getPerformanceColor(avgMetrics.renderTime, 16, true) }}>
                    {avgMetrics.renderTime.toFixed(1)}ms
                  </span>
                </div>
                <div style={metricStyle}>
                  <span>FPS:</span>
                  <span style={{ color: getPerformanceColor(avgMetrics.frameRate, 30) }}>
                    {avgMetrics.frameRate.toFixed(1)}
                  </span>
                </div>
                {warnings.length > 0 && (
                  <div style={{ fontSize: '9px', color: '#ff4444', marginTop: '2px' }}>
                    {warnings[0]}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Asset Cache Stats */}
          {cacheStats && (
            <div style={sectionStyle}>
              <div style={{ fontSize: '11px', marginBottom: '4px', color: '#88ddff' }}>
                Asset Cache
              </div>
              <div style={metricStyle}>
                <span>Entries:</span>
                <span>{cacheStats.entries}</span>
              </div>
              <div style={metricStyle}>
                <span>Size:</span>
                <span>{formatBytes(cacheStats.totalSize)}</span>
              </div>
              <div style={metricStyle}>
                <span>Usage:</span>
                <span style={{ color: getPerformanceColor(cacheStats.utilization, 80, true) }}>
                  {cacheStats.utilization.toFixed(1)}%
                </span>
              </div>
            </div>
          )}

          {/* Component Registry Stats */}
          {componentStats && (
            <div style={sectionStyle}>
              <div style={{ fontSize: '11px', marginBottom: '4px', color: '#88ddff' }}>
                Components
              </div>
              <div style={metricStyle}>
                <span>Cached:</span>
                <span>{componentStats.cached}</span>
              </div>
              <div style={metricStyle}>
                <span>Loading:</span>
                <span>{componentStats.loading}</span>
              </div>
            </div>
          )}

          {/* Bundle Stats */}
          {bundleStats && (
            <div style={sectionStyle}>
              <div style={{ fontSize: '11px', marginBottom: '4px', color: '#88ddff' }}>
                Bundle
              </div>
              <div style={metricStyle}>
                <span>Total:</span>
                <span>{formatBytes(bundleStats.totalSize)}</span>
              </div>
              {bundleStats.resources.length > 0 && (
                <div style={{ fontSize: '9px', marginTop: '2px', opacity: 0.8 }}>
                  Largest: {formatBytes(bundleStats.resources[0].size)}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {!expanded && currentMetrics && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '10px' }}>
            {currentMetrics.renderTime.toFixed(1)}ms
          </div>
          <div style={{ fontSize: '10px' }}>
            {currentMetrics.frameRate.toFixed(0)} FPS
          </div>
        </div>
      )}
    </div>
  );
});

// Hook for toggling performance dashboard
export const usePerformanceDashboard = () => {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Toggle with Ctrl+Shift+P
      if (event.ctrlKey && event.shiftKey && event.key === 'P') {
        event.preventDefault();
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return { isVisible, setIsVisible, toggleDashboard: () => setIsVisible(prev => !prev) };
};

export default PerformanceDashboard;