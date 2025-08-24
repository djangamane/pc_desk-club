import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../store';
import { logout } from '../../store/slices/userSlice';
import AuthModal from '../auth/AuthModal';

interface SimpleDesktopLayoutProps {
  children: React.ReactNode;
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

export const SimpleDesktopLayout: React.FC<SimpleDesktopLayoutProps> = ({
  children,
  currentPage = 'home',
  onNavigate,
}) => {
  const dispatch = useAppDispatch();
  const { currentUser, isAuthenticated, stats } = useAppSelector(state => state.user);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const navigationItems = [
    { key: 'home', label: 'Home', icon: '🏠' },
    { key: 'game', label: 'Play Chess', icon: '♔' },
    { key: 'leaderboard', label: 'Leaderboard', icon: '🏆' },
    { key: 'profile', label: 'Profile', icon: '👤', disabled: !isAuthenticated },
    { key: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  const handleNavigation = (page: string) => {
    if (navigationItems.find(item => item.key === page)?.disabled) return;
    onNavigate?.(page);
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const getPageTitle = () => {
    switch (currentPage) {
      case 'home': return 'Welcome to Planetary Chess';
      case 'game': return 'Chess Game';
      case 'leaderboard': return 'Leaderboard';
      case 'profile': return 'User Profile';
      case 'settings': return 'Settings';
      default: return currentPage;
    }
  };

  return (
    <div style={containerStyle}>
      {/* Sidebar */}
      <div style={{
        ...sidebarStyle,
        width: sidebarCollapsed ? '60px' : '250px',
      }}>
        {/* Logo/Title */}
        <div style={logoSectionStyle}>
          <h2 style={{
            ...logoTextStyle,
            fontSize: sidebarCollapsed ? '24px' : '20px',
          }}>
            {sidebarCollapsed ? '♔' : '♔ Planetary Chess'}
          </h2>
        </div>

        {/* Navigation Menu */}
        <nav style={navStyle}>
          {navigationItems.map((item) => (
            <button
              key={item.key}
              onClick={() => handleNavigation(item.key)}
              disabled={item.disabled}
              style={{
                ...navItemStyle,
                backgroundColor: currentPage === item.key ? '#1890ff' : 'transparent',
                opacity: item.disabled ? 0.5 : 1,
                cursor: item.disabled ? 'not-allowed' : 'pointer',
                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
              }}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <span style={iconStyle}>{item.icon}</span>
              {!sidebarCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* User Section */}
        <div style={userSectionStyle}>
          {isAuthenticated && currentUser ? (
            <div style={userInfoStyle}>
              {!sidebarCollapsed && (
                <>
                  <div style={userNameStyle}>
                    Welcome, {currentUser.username}
                  </div>
                  {stats && (
                    <div style={userStatsStyle}>
                      Score: {stats.totalScore} | Solved: {stats.totalSolved}
                    </div>
                  )}
                </>
              )}
              <button
                onClick={handleLogout}
                style={logoutButtonStyle}
                title={sidebarCollapsed ? 'Logout' : undefined}
              >
                {sidebarCollapsed ? '↗' : 'Logout'}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              style={loginButtonStyle}
              title={sidebarCollapsed ? 'Login' : undefined}
            >
              {sidebarCollapsed ? '↗' : 'Sign In'}
            </button>
          )}
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          style={collapseButtonStyle}
        >
          {sidebarCollapsed ? '→' : '←'}
        </button>
      </div>

      {/* Main Content */}
      <div style={mainContentStyle}>
        {/* Content Area */}
        <main style={contentStyle}>
          {children}
        </main>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
};

// Styles
const containerStyle: React.CSSProperties = {
  display: 'flex',
  height: '100vh',
  width: '100vw',
  background: 'linear-gradient(135deg, #000000 0%, #1a1a2e 50%, #16213e 100%)',
  color: '#ffffff',
  fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
};

const sidebarStyle: React.CSSProperties = {
  background: 'linear-gradient(180deg, #001529 0%, #002140 100%)',
  borderRight: '1px solid #303030',
  display: 'flex',
  flexDirection: 'column',
  transition: 'width 0.3s ease',
  position: 'relative',
  flexShrink: 0,
};

const logoSectionStyle: React.CSSProperties = {
  padding: '24px 16px',
  textAlign: 'center',
  borderBottom: '1px solid #303030',
};

const logoTextStyle: React.CSSProperties = {
  color: '#ffffff',
  margin: 0,
  transition: 'all 0.3s',
  fontWeight: 'bold',
};

const navStyle: React.CSSProperties = {
  flex: 1,
  padding: '16px 8px',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
};

const navItemStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: '#a0a0a0',
  padding: '12px 16px',
  borderRadius: '6px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  fontSize: '14px',
  transition: 'all 0.2s ease',
  textAlign: 'left',
};

const iconStyle: React.CSSProperties = {
  fontSize: '16px',
  minWidth: '20px',
  textAlign: 'center',
};

const userSectionStyle: React.CSSProperties = {
  padding: '16px',
  borderTop: '1px solid #303030',
};

const userInfoStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const userNameStyle: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '500',
};

const userStatsStyle: React.CSSProperties = {
  color: '#a0a0a0',
  fontSize: '12px',
};

const logoutButtonStyle: React.CSSProperties = {
  background: 'transparent',
  border: '1px solid #404040',
  color: '#a0a0a0',
  padding: '8px 16px',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '12px',
  transition: 'all 0.2s ease',
  width: '100%',
};

const loginButtonStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
  border: 'none',
  color: '#ffffff',
  padding: '12px 16px',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500',
  width: '100%',
  boxShadow: '0 4px 12px rgba(24, 144, 255, 0.3)',
};

const collapseButtonStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: '80px',
  left: '50%',
  transform: 'translateX(-50%)',
  background: 'rgba(24, 144, 255, 0.1)',
  border: '1px solid rgba(24, 144, 255, 0.3)',
  color: '#a0a0a0',
  borderRadius: '50%',
  width: '32px',
  height: '32px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '12px',
};

const mainContentStyle: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  background: 'linear-gradient(135deg, #000000 0%, #1a1a2e 50%, #16213e 100%)',
};

const headerStyle: React.CSSProperties = {
  backgroundColor: '#001529',
  padding: '16px 24px',
  borderBottom: '1px solid #303030',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexShrink: 0,
};

const headerTitleStyle: React.CSSProperties = {
  color: '#ffffff',
  margin: 0,
  fontSize: '24px',
  fontWeight: '600',
};

const headerUserStyle: React.CSSProperties = {
  color: '#a0a0a0',
  fontSize: '14px',
};

const contentStyle: React.CSSProperties = {
  flex: 1,
  padding: '24px',
  overflow: 'auto',
  backgroundColor: 'transparent',
};

export default SimpleDesktopLayout;