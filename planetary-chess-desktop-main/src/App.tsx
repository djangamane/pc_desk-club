import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ErrorBoundaryProvider } from './components/ErrorBoundary';
import { createLazyComponent } from './utils/lazyLoading';
import { performanceMonitor } from './utils/performanceMonitor';
import { getPlatformConfig } from './utils/platformUtils';
import PerformanceDashboard, { usePerformanceDashboard } from './components/PerformanceDashboard';
import React from 'react';

// Lazy load components for better performance
const Game = createLazyComponent(
  () => import('./components/Game'),
  { 
    fallback: <div style={{ padding: '20px', textAlign: 'center', color: '#00ffff' }}>Loading Game...</div>,
    preload: true 
  }
);

const WelcomeScreen = createLazyComponent(
  () => import('./components/WelcomeScreen'),
  { 
    fallback: <div style={{ padding: '20px', textAlign: 'center', color: '#00ffff' }}>Loading Welcome Screen...</div>,
    preload: true 
  }
);

const Leaderboard = createLazyComponent(
  () => import('./components/Leaderboard'),
  { 
    fallback: <div style={{ padding: '20px', textAlign: 'center', color: '#00ffff' }}>Loading Leaderboard...</div>
  }
);

function App() {
  const { isVisible: dashboardVisible } = usePerformanceDashboard();
  
  React.useEffect(() => {
    const config = getPlatformConfig();
    
    // Start performance monitoring on desktop
    if (config.isDesktop) {
      performanceMonitor.startMonitoring();
      
      // Log performance metrics periodically
      const interval = setInterval(() => {
        const metrics = performanceMonitor.getAverageMetrics();
        if (metrics) {
          const warnings = performanceMonitor.checkPerformanceThresholds(metrics);
          if (warnings.length > 0) {
            console.warn('🚨 Performance issues detected:', warnings);
          }
        }
      }, 10000); // Check every 10 seconds
      
      return () => {
        clearInterval(interval);
        performanceMonitor.stopMonitoring();
      };
    }
  }, []);

  const handleGlobalError = React.useCallback((error: Error, errorInfo: any) => {
    console.error('Global application error:', { error, errorInfo });
    
    // In a real application, you would send this to an error tracking service
    // like Sentry, LogRocket, or Bugsnag
  }, []);

  return (
    <ErrorBoundaryProvider onGlobalError={handleGlobalError}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<WelcomeScreen />} />
          <Route path="/game" element={<Game />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Routes>
      </BrowserRouter>
      
      {/* Performance Dashboard - Toggle with Ctrl+Shift+P */}
      <PerformanceDashboard 
        isVisible={dashboardVisible}
        position="top-right"
        compact={false}
      />
    </ErrorBoundaryProvider>
  );
}

export default App;