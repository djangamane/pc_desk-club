import React, { useState } from 'react';
import { Layout, Menu, Button, Drawer, Typography, Space } from 'antd';
import {
  HomeOutlined,
  ControlOutlined,
  TrophyOutlined,
  UserOutlined,
  SettingOutlined,
  MenuOutlined,
  CloseOutlined,
  BulbOutlined,
} from '@ant-design/icons';
import { customStyles } from '../../styles/antdTheme';

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

interface DesktopLayoutProps {
  children: React.ReactNode;
  currentPage?: string;
  onNavigate?: (page: string) => void;
  user?: {
    username: string;
    isAuthenticated: boolean;
  };
  onLogin?: () => void;
  onLogout?: () => void;
}

export const DesktopLayout: React.FC<DesktopLayoutProps> = ({
  children,
  currentPage = 'home',
  onNavigate,
  user,
  onLogin,
  onLogout,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);

  // Menu items configuration
  const menuItems = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: 'Home',
    },
    {
      key: 'game',
      icon: <ControlOutlined />,
      label: 'Play Chess',
    },
    {
      key: 'puzzles',
      icon: <BulbOutlined />,
      label: 'Puzzles',
    },
    {
      key: 'leaderboard',
      icon: <TrophyOutlined />,
      label: 'Leaderboard',
    },
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      disabled: !user?.isAuthenticated,
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
  ];

  const handleMenuClick = (e: { key: string }) => {
    onNavigate?.(e.key);
    setMobileDrawerVisible(false);
  };

  // Sidebar content
  const sidebarContent = (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo/Title area */}
      <div
        style={{
          padding: '24px 16px',
          textAlign: 'center',
          borderBottom: '1px solid #303030',
        }}
      >
        <Title
          level={3}
          style={{
            color: '#ffffff',
            margin: 0,
            fontSize: collapsed ? 16 : 20,
            transition: 'all 0.3s',
          }}
        >
          {collapsed ? '♔' : '♔ Planetary Chess'}
        </Title>
      </div>

      {/* Navigation Menu */}
      <div style={{ flex: 1, padding: '16px 0' }}>
        <Menu
          theme="dark"
          mode="vertical"
          selectedKeys={[currentPage]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
          }}
        />
      </div>

      {/* User section */}
      <div
        style={{
          padding: '16px',
          borderTop: '1px solid #303030',
          textAlign: 'center',
        }}
      >
        {user?.isAuthenticated ? (
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            {!collapsed && (
              <div style={{ color: '#a0a0a0', fontSize: 12 }}>
                Welcome, {user.username}
              </div>
            )}
            <Button
              type="text"
              size="small"
              onClick={onLogout}
              style={{ color: '#a0a0a0' }}
              block={!collapsed}
            >
              Logout
            </Button>
          </Space>
        ) : (
          <Button
            type="primary"
            size="small"
            onClick={onLogin}
            style={customStyles.primaryButton}
            block={!collapsed}
          >
            {collapsed ? '↗' : 'Login'}
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <Layout style={{ height: '100vh', ...customStyles.gameContainer }}>
      {/* Desktop Sidebar */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={250}
        collapsedWidth={80}
        style={{
          ...customStyles.sidebar,
          display: 'block', // Always visible on desktop
        }}
        trigger={null} // Custom trigger
      >
        {sidebarContent}
        
        {/* Custom collapse trigger */}
        <Button
          type="text"
          icon={collapsed ? <MenuOutlined /> : <CloseOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          style={{
            position: 'absolute',
            bottom: 80,
            left: '50%',
            transform: 'translateX(-50%)',
            color: '#a0a0a0',
            backgroundColor: 'rgba(24, 144, 255, 0.1)',
            border: '1px solid rgba(24, 144, 255, 0.3)',
            borderRadius: '50%',
            width: 32,
            height: 32,
            minWidth: 32,
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        />
      </Sider>

      {/* Mobile Drawer (hidden on desktop but available for future responsiveness) */}
      <Drawer
        title="Planetary Chess"
        placement="left"
        onClose={() => setMobileDrawerVisible(false)}
        open={mobileDrawerVisible}
        bodyStyle={{ padding: 0, backgroundColor: '#001529' }}
        headerStyle={{ backgroundColor: '#001529', borderBottom: '1px solid #303030' }}
        style={{ display: 'none' }} // Hidden for desktop-only app
      >
        {sidebarContent}
      </Drawer>

      {/* Main Content Area */}
      <Layout style={{ backgroundColor: 'transparent' }}>
        {/* Header */}
        <Header
          style={{
            backgroundColor: '#001529',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #303030',
          }}
        >
          {/* Mobile menu trigger (hidden on desktop) */}
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setMobileDrawerVisible(true)}
            style={{
              display: 'none', // Hidden for desktop-only app
              color: '#ffffff',
            }}
          />

          {/* Page title */}
          <Title
            level={4}
            style={{
              color: '#ffffff',
              margin: 0,
              textTransform: 'capitalize',
            }}
          >
            {currentPage === 'home' ? 'Welcome to Planetary Chess' : 
             currentPage === 'game' ? 'Chess Game' :
             currentPage === 'puzzles' ? 'Chess Puzzles' :
             currentPage === 'leaderboard' ? 'Leaderboard' :
             currentPage === 'profile' ? 'User Profile' :
             currentPage === 'settings' ? 'Settings' : 
             currentPage}
          </Title>

          {/* Header actions */}
          <Space>
            {user?.isAuthenticated && (
              <span style={{ color: '#a0a0a0', fontSize: 14 }}>
                {user.username}
              </span>
            )}
          </Space>
        </Header>

        {/* Content */}
        <Content
          style={{
            margin: 0,
            padding: 24,
            backgroundColor: 'transparent',
            overflow: 'auto',
            // Fixed desktop dimensions - no responsive behavior
            minHeight: 'calc(100vh - 64px)', // Account for header height
            width: '100%',
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default DesktopLayout;