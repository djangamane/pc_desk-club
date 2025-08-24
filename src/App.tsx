import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { ErrorBoundaryProvider } from './components/ErrorBoundary';
import { createLazyComponent } from './utils/lazyLoading';
import { performanceMonitor } from './utils/performanceMonitor';
import PerformanceDashboard, { usePerformanceDashboard } from './components/PerformanceDashboard';
import SimpleDesktopLayout from './components/layout/SimpleDesktopLayout';

// Lazy load page components
const GamePage = createLazyComponent(
  () => import('./pages/GamePage'),
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

const UserProfilePage = createLazyComponent(
  () => import('./pages/UserProfilePage'),
  {
    fallback: <div style={{ padding: '20px', textAlign: 'center', color: '#00ffff' }}>Loading Profile...</div>
  }
);

const UserSettings = createLazyComponent(
  () => import('./pages/UserSettings'),
  {
    fallback: <div style={{ padding: '20px', textAlign: 'center', color: '#00ffff' }}>Loading Settings...</div>
  }
);

// App Router Component - handles navigation within the layout
function AppRouter() {
  const navigate = useNavigate();
  const location = useLocation();
  // const dispatch = useAppDispatch();
  // const userState = useAppSelector((state: any) => state.user);
  
  const [currentPage, setCurrentPage] = useState('home');

  // Update current page based on route
  useEffect(() => {
    const path = location.pathname;
    if (path === '/') setCurrentPage('home');
    else if (path === '/game') setCurrentPage('game');
    else if (path === '/leaderboard') setCurrentPage('leaderboard');
    else if (path === '/profile') setCurrentPage('profile');
    else if (path === '/settings') setCurrentPage('settings');
  }, [location.pathname]);

  // Handle navigation
  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    switch (page) {
      case 'home':
        navigate('/');
        break;
      case 'game':
        navigate('/game');
        break;
      case 'leaderboard':
        navigate('/leaderboard');
        break;
      case 'profile':
        navigate('/profile');
        break;
      case 'settings':
        navigate('/settings');
        break;
      default:
        navigate('/');
    }
  };

  // Handle login (placeholder)
  // const handleLogin = () => {
  //   console.log('Login functionality will be implemented in the next phase');
  //   // TODO: Navigate to login modal/page
  // };

  // Handle logout
  // const handleLogout = () => {
  //   dispatch(logout());
  //   console.log('Logged out successfully');
  //   navigate('/');
  // };

  // User data for layout
  // const userData = userState.isAuthenticated && userState.currentUser ? {
  //   username: userState.currentUser.username,
  //   isAuthenticated: true,
  // } : {
  //   username: '',
  //   isAuthenticated: false,
  // };

  return (
    <SimpleDesktopLayout
      currentPage={currentPage}
      onNavigate={handleNavigate}
    >
      <Routes>
        <Route path="/" element={<WelcomeScreen />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/profile" element={<UserProfilePage />} />
        <Route path="/settings" element={<UserSettings />} />
      </Routes>
    </SimpleDesktopLayout>
  );
}

function App() {
  const { isVisible: dashboardVisible } = usePerformanceDashboard();
  
  React.useEffect(() => {
    // Start performance monitoring (desktop only)
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
    }, 30000); // Check every 30 seconds instead of 10
    
    return () => {
      clearInterval(interval);
      performanceMonitor.stopMonitoring();
    };
  }, []);

  const handleGlobalError = React.useCallback((error: Error, errorInfo: any) => {
    console.error('Global application error:', { error, errorInfo });
    
    // In a real application, you would send this to an error tracking service
    // like Sentry, LogRocket, or Bugsnag
  }, []);

  return (
    <ErrorBoundaryProvider onGlobalError={handleGlobalError}>
      <BrowserRouter>
        <AppRouter />
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