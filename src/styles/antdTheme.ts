import { ThemeConfig } from 'antd';

// Custom theme configuration for Planetary Chess desktop app
export const antdTheme: ThemeConfig = {
  token: {
    // Primary colors - Space/planetary theme
    colorPrimary: '#1890ff', // Blue for primary actions
    colorSuccess: '#52c41a', // Green for success states
    colorWarning: '#faad14', // Orange for warnings
    colorError: '#ff4d4f', // Red for errors
    colorInfo: '#13c2c2', // Cyan for info
    
    // Background colors - Dark space theme
    colorBgBase: '#001529', // Dark navy background
    colorBgContainer: '#141414', // Slightly lighter container background
    colorBgElevated: '#1f1f1f', // Elevated surfaces
    colorBgLayout: '#000000', // Layout background (pure black)
    colorBgSpotlight: '#1890ff1a', // Spotlight effect
    
    // Text colors
    colorText: '#ffffff', // Primary text (white)
    colorTextSecondary: '#a0a0a0', // Secondary text (light gray)
    colorTextTertiary: '#606060', // Tertiary text (medium gray)
    colorTextQuaternary: '#404040', // Quaternary text (dark gray)
    
    // Border colors
    colorBorder: '#303030', // Default border
    colorBorderSecondary: '#1f1f1f', // Secondary border
    
    // Component specific
    colorFillAlter: '#1f1f1f', // Alternative fill
    colorFillContent: '#141414', // Content fill
    colorFillContentHover: '#262626', // Content fill on hover
    colorFillSecondary: '#262626', // Secondary fill
    colorFillTertiary: '#1f1f1f', // Tertiary fill
    colorFillQuaternary: '#141414', // Quaternary fill
    
    // Typography
    fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
    fontSize: 14,
    fontSizeHeading1: 32,
    fontSizeHeading2: 24,
    fontSizeHeading3: 20,
    fontSizeHeading4: 16,
    fontSizeHeading5: 14,
    fontSizeLG: 16,
    fontSizeSM: 12,
    fontSizeXL: 20,
    
    // Layout
    borderRadius: 6,
    borderRadiusLG: 8,
    borderRadiusSM: 4,
    borderRadiusXS: 2,
    
    // Control heights
    controlHeight: 36,
    controlHeightLG: 42,
    controlHeightSM: 30,
    controlHeightXS: 24,
    
    // Spacing
    padding: 16,
    paddingLG: 24,
    paddingSM: 12,
    paddingXS: 8,
    paddingXXS: 4,
    
    // Line height
    lineHeight: 1.5715,
    lineHeightLG: 1.5,
    lineHeightSM: 1.66,
    
    // Box shadow for depth
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
    boxShadowSecondary: '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
  },
  components: {
    // Layout components
    Layout: {
      headerBg: '#001529',
      siderBg: '#001529',
      bodyBg: '#141414',
      footerBg: '#001529',
      headerHeight: 64,
      headerPadding: '0 24px',
      // ... existing properties ...
      triggerBg: '#1890ff',
      triggerColor: '#ffffff',
    },
    
    // Menu
    Menu: {
      darkItemBg: 'transparent',
      darkItemColor: '#a0a0a0',
      darkItemHoverBg: '#1890ff1a',
      darkItemHoverColor: '#ffffff',
      darkItemSelectedBg: '#1890ff',
      darkItemSelectedColor: '#ffffff',
      darkSubMenuItemBg: '#001529',
      darkGroupTitleColor: '#606060',
    },
    
    // Button
    Button: {
      primaryColor: '#ffffff',
      defaultBg: '#262626',
      defaultBorderColor: '#404040',
      defaultColor: '#ffffff',
      defaultHoverBg: '#303030',
      defaultHoverBorderColor: '#1890ff',
      defaultHoverColor: '#1890ff',
      defaultActiveBg: '#1f1f1f',
      defaultActiveBorderColor: '#096dd9',
      defaultActiveColor: '#096dd9',
      ghostBg: 'transparent',
      // ... existing properties ...
      // ... existing properties ...
      linkHoverBg: 'transparent',
      textHoverBg: '#262626',
      dangerColor: '#ffffff',
      borderRadius: 6,
      controlHeight: 36,
    },
    
    // Input
    Input: {
      colorBgContainer: '#262626',
      colorBorder: '#404040',
      colorText: '#ffffff',
      colorTextPlaceholder: '#606060',
      colorBgContainerDisabled: '#1f1f1f',
      colorTextDisabled: '#404040',
      borderRadius: 6,
      controlHeight: 36,
      paddingInline: 12,
    },
    
    // Card
    Card: {
      colorBgContainer: '#1f1f1f',
      colorBorderSecondary: '#303030',
      borderRadiusLG: 8,
      paddingLG: 24,
    },
    
    // Modal
    Modal: {
      colorBgElevated: '#262626',
      colorBgMask: 'rgba(0, 0, 0, 0.75)',
      borderRadiusLG: 8,
    },
    
    // Table
    Table: {
      colorBgContainer: '#1f1f1f',
      colorFillAlter: '#262626',
      colorBorderSecondary: '#303030',
      colorText: '#ffffff',
      colorTextHeading: '#ffffff',
      borderRadius: 6,
    },
    
    // Notification
    Notification: {
      colorBgElevated: '#262626',
      colorText: '#ffffff',
      colorIcon: '#1890ff',
      borderRadiusLG: 8,
    },
    
    // Message
    Message: {
      colorBgElevated: '#262626',
      colorText: '#ffffff',
      borderRadiusLG: 8,
    },
    
    // Drawer
    Drawer: {
      colorBgElevated: '#262626',
      colorBgMask: 'rgba(0, 0, 0, 0.75)',
    },
    
    // Form
    Form: {
      itemMarginBottom: 16,
      labelColor: '#a0a0a0',
      labelRequiredMarkColor: '#ff4d4f',
    },
    
    // Typography
    Typography: {
      colorText: '#ffffff',
      colorTextSecondary: '#a0a0a0',
      colorTextDescription: '#606060',
      titleMarginBottom: 16,
      titleMarginTop: 24,
    },
    
    // Progress
    Progress: {
      circleTextColor: '#ffffff',
      remainingColor: '#303030',
    },
    
    // Spin
    Spin: {
      colorPrimary: '#1890ff',
      colorWhite: '#ffffff',
    },
    
    // Tag
    Tag: {
      colorText: '#ffffff',
      colorBorder: '#404040',
      borderRadiusSM: 4,
    },
    
    // Steps
    Steps: {
      colorText: '#a0a0a0',
      colorTextDescription: '#606060',
      colorPrimary: '#1890ff',
    },
  },
  algorithm: 'darkAlgorithm' as any, // Enable dark algorithm
};

// Component style overrides for better desktop integration
export const customStyles = {
  // Global chess-specific styling
  chessBoard: {
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  
  // Game layout specific
  gameContainer: {
    background: 'linear-gradient(135deg, #000000 0%, #1a1a2e 50%, #16213e 100%)',
    minHeight: '100vh',
    color: '#ffffff',
  },
  
  // Sidebar styling
  sidebar: {
    background: 'linear-gradient(180deg, #001529 0%, #002140 100%)',
    borderRadius: '0 8px 8px 0',
    boxShadow: '2px 0 8px rgba(0, 0, 0, 0.15)',
  },
  
  // Card enhancements
  glassCard: {
    background: 'rgba(31, 31, 31, 0.8)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(64, 64, 64, 0.3)',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  },
  
  // Button enhancements
  primaryButton: {
    background: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
    border: 'none',
    boxShadow: '0 4px 12px rgba(24, 144, 255, 0.3)',
    transition: 'all 0.3s ease',
  },
  
  // Success states
  successButton: {
    background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
    border: 'none',
    boxShadow: '0 4px 12px rgba(82, 196, 26, 0.3)',
  },
  
  // Error states
  dangerButton: {
    background: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)',
    border: 'none',
    boxShadow: '0 4px 12px rgba(255, 77, 79, 0.3)',
  },
};