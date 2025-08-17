import React, { ReactNode } from 'react';
import { useResponsive } from '../contexts/ResponsiveContext';

/**
 * Props for DesktopLayout component
 */
export interface DesktopLayoutProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Props for layout panels
 */
export interface LayoutPanelProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Left panel component for chessboard area
 */
export const LeftPanel: React.FC<LayoutPanelProps> = ({ 
  children, 
  className = '', 
  style = {} 
}) => {
  const { layoutConfig, layoutMode } = useResponsive();
  
  const panelStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: layoutConfig.chessboardContainer.width,
    maxWidth: layoutConfig.chessboardContainer.maxWidth,
    height: layoutConfig.chessboardContainer.height || 'auto',
    padding: '1rem',
    boxSizing: 'border-box',
    transition: 'all 0.3s ease-in-out',
    ...style,
  };

  const panelClasses = [
    'desktop-layout-left-panel',
    `layout-mode-${layoutMode}`,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={panelClasses}
      style={panelStyles}
      data-panel="left"
      data-layout-mode={layoutMode}
    >
      {children}
    </div>
  );
};

/**
 * Right panel component for sidebar area
 */
export const RightPanel: React.FC<LayoutPanelProps> = ({ 
  children, 
  className = '', 
  style = {} 
}) => {
  const { layoutConfig, layoutMode } = useResponsive();
  
  const panelStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    width: layoutConfig.sidebar.width,
    maxWidth: layoutConfig.sidebar.maxWidth,
    padding: '1rem',
    boxSizing: 'border-box',
    transition: 'all 0.3s ease-in-out',
    overflowY: 'auto',
    ...style,
  };

  const panelClasses = [
    'desktop-layout-right-panel',
    `layout-mode-${layoutMode}`,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={panelClasses}
      style={panelStyles}
      data-panel="right"
      data-layout-mode={layoutMode}
    >
      {children}
    </div>
  );
};

/**
 * Main desktop layout component with CSS Grid system
 */
export const DesktopLayout: React.FC<DesktopLayoutProps> = ({ 
  children, 
  className = '', 
  style = {} 
}) => {
  const { layoutConfig, layoutMode, viewportInfo } = useResponsive();
  
  // Determine if we should use desktop layout
  const isDesktopMode = layoutMode === 'desktop' || layoutMode === 'large-desktop';
  
  const containerStyles: React.CSSProperties = {
    display: isDesktopMode ? 'grid' : 'flex',
    gridTemplateColumns: isDesktopMode ? `${layoutConfig.chessboardContainer.width} ${layoutConfig.sidebar.width}` : 'none',
    gridTemplateRows: isDesktopMode ? '1fr' : 'none',
    flexDirection: isDesktopMode ? 'row' : layoutConfig.direction,
    gap: layoutConfig.spacing.gap,
    padding: layoutConfig.spacing.padding,
    width: '100%',
    minHeight: '100vh',
    maxWidth: isDesktopMode ? '1400px' : layoutConfig.chessboardContainer.maxWidth,
    margin: '0 auto',
    boxSizing: 'border-box',
    transition: 'all 0.3s ease-in-out',
    alignItems: isDesktopMode ? 'stretch' : 'center',
    justifyContent: isDesktopMode ? 'center' : 'flex-start',
    ...style,
  };

  const containerClasses = [
    'desktop-layout-container',
    `layout-mode-${layoutMode}`,
    isDesktopMode ? 'desktop-grid-layout' : 'mobile-flex-layout',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={containerClasses}
      style={containerStyles}
      data-layout-mode={layoutMode}
      data-viewport-width={viewportInfo.width}
      data-is-desktop={isDesktopMode}
    >
      {children}
    </div>
  );
};

/**
 * Responsive layout wrapper that conditionally renders desktop or mobile layout
 */
export interface ResponsiveLayoutWrapperProps {
  leftPanelContent: ReactNode;
  rightPanelContent: ReactNode;
  mobileContent?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const ResponsiveLayoutWrapper: React.FC<ResponsiveLayoutWrapperProps> = ({
  leftPanelContent,
  rightPanelContent,
  mobileContent,
  className = '',
  style = {},
}) => {
  const { layoutMode } = useResponsive();
  
  const isDesktopMode = layoutMode === 'desktop' || layoutMode === 'large-desktop';
  
  if (isDesktopMode) {
    return (
      <DesktopLayout className={className} style={style}>
        <LeftPanel>
          {leftPanelContent}
        </LeftPanel>
        <RightPanel>
          {rightPanelContent}
        </RightPanel>
      </DesktopLayout>
    );
  }
  
  // Mobile/tablet layout - use provided mobile content or default vertical layout
  return (
    <div 
      className={`mobile-layout-wrapper ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        minHeight: '100vh',
        padding: '1rem',
        boxSizing: 'border-box',
        ...style,
      }}
      data-layout-mode={layoutMode}
    >
      {mobileContent || (
        <>
          <div className="mobile-chessboard-section" style={{ marginBottom: '1rem' }}>
            {leftPanelContent}
          </div>
          <div className="mobile-sidebar-section">
            {rightPanelContent}
          </div>
        </>
      )}
    </div>
  );
};