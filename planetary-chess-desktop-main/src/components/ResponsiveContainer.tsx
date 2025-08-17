import React, { ReactNode } from 'react';
import { useResponsive } from '../contexts/ResponsiveContext';
import { DesktopLayout, LeftPanel, RightPanel } from './DesktopLayout';
import { GridLayout, GridItem } from './GridLayout';

/**
 * Layout strategy types
 */
export type LayoutStrategy = 'flexbox' | 'grid' | 'auto';

/**
 * Props for ResponsiveContainer component
 */
export interface ResponsiveContainerProps {
  children: ReactNode;
  strategy?: LayoutStrategy;
  className?: string;
  style?: React.CSSProperties;
  fallbackToMobile?: boolean;
}

/**
 * Props for content sections
 */
export interface ContentSectionProps {
  chessboard?: ReactNode;
  sidebar?: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  mobileLayout?: ReactNode;
}

/**
 * Props for ResponsiveGameContainer
 */
export interface ResponsiveGameContainerProps extends ContentSectionProps {
  strategy?: LayoutStrategy;
  className?: string;
  style?: React.CSSProperties;
  onLayoutChange?: (layoutMode: string) => void;
}

/**
 * Responsive container that automatically chooses the best layout strategy
 */
export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  strategy = 'auto',
  className = '',
  style = {},
  fallbackToMobile = true,
}) => {
  const { layoutMode, layoutConfig, viewportInfo } = useResponsive();
  
  const isDesktopMode = layoutMode === 'desktop' || layoutMode === 'large-desktop';
  const isMobileMode = layoutMode === 'mobile';
  
  // Auto-select strategy based on layout mode
  const selectedStrategy = strategy === 'auto' 
    ? (isDesktopMode ? 'grid' : 'flexbox')
    : strategy;
  
  const containerStyles: React.CSSProperties = {
    width: '100%',
    minHeight: '100vh',
    boxSizing: 'border-box',
    transition: 'all 0.3s ease-in-out',
    ...style,
  };

  const containerClasses = [
    'responsive-container',
    `strategy-${selectedStrategy}`,
    `layout-mode-${layoutMode}`,
    isDesktopMode ? 'desktop-mode' : 'mobile-mode',
    className,
  ].filter(Boolean).join(' ');

  // Apply different layout strategies
  if (selectedStrategy === 'grid' && isDesktopMode) {
    return (
      <div 
        className={containerClasses}
        style={containerStyles}
        data-layout-mode={layoutMode}
        data-strategy={selectedStrategy}
      >
        {children}
      </div>
    );
  }
  
  if (selectedStrategy === 'flexbox' || !isDesktopMode) {
    return (
      <div 
        className={containerClasses}
        style={{
          ...containerStyles,
          display: 'flex',
          flexDirection: layoutConfig.direction,
          alignItems: isMobileMode ? 'center' : 'stretch',
          justifyContent: 'flex-start',
          gap: layoutConfig.spacing.gap,
          padding: layoutConfig.spacing.padding,
        }}
        data-layout-mode={layoutMode}
        data-strategy={selectedStrategy}
      >
        {children}
      </div>
    );
  }
  
  // Default fallback
  return (
    <div 
      className={containerClasses}
      style={containerStyles}
      data-layout-mode={layoutMode}
      data-strategy="fallback"
    >
      {children}
    </div>
  );
};

/**
 * Specialized responsive container for game layout with predefined sections
 */
export const ResponsiveGameContainer: React.FC<ResponsiveGameContainerProps> = ({
  chessboard,
  sidebar,
  header,
  footer,
  mobileLayout,
  strategy = 'auto',
  className = '',
  style = {},
  onLayoutChange,
}) => {
  const { layoutMode } = useResponsive();
  
  const isDesktopMode = layoutMode === 'desktop' || layoutMode === 'large-desktop';
  
  // Notify parent of layout changes
  React.useEffect(() => {
    onLayoutChange?.(layoutMode);
  }, [layoutMode, onLayoutChange]);
  
  // Desktop layout with grid or flexbox
  if (isDesktopMode) {
    const selectedStrategy = strategy === 'auto' ? 'grid' : strategy;
    
    if (selectedStrategy === 'grid') {
      const template = header && footer ? 'full-layout' : 
                     header ? 'with-header' : 
                     footer ? 'with-footer' : 'default';
      
      return (
        <GridLayout 
          template={template}
          className={className}
          style={style}
        >
          {header && (
            <GridItem area="header">
              {header}
            </GridItem>
          )}
          <GridItem area="chessboard">
            {chessboard}
          </GridItem>
          <GridItem area="sidebar">
            {sidebar}
          </GridItem>
          {footer && (
            <GridItem area="footer">
              {footer}
            </GridItem>
          )}
        </GridLayout>
      );
    } else {
      return (
        <DesktopLayout className={className} style={style}>
          <LeftPanel>
            {header && <div className="header-section">{header}</div>}
            {chessboard}
            {footer && <div className="footer-section">{footer}</div>}
          </LeftPanel>
          <RightPanel>
            {sidebar}
          </RightPanel>
        </DesktopLayout>
      );
    }
  }
  
  // Mobile/tablet layout
  return (
    <ResponsiveContainer 
      strategy="flexbox"
      className={className}
      style={style}
    >
      {mobileLayout || (
        <>
          {header && (
            <div className="mobile-header-section" style={{ width: '100%', marginBottom: '1rem' }}>
              {header}
            </div>
          )}
          <div className="mobile-chessboard-section" style={{ marginBottom: '1rem' }}>
            {chessboard}
          </div>
          <div className="mobile-sidebar-section" style={{ width: '100%' }}>
            {sidebar}
          </div>
          {footer && (
            <div className="mobile-footer-section" style={{ width: '100%', marginTop: '1rem' }}>
              {footer}
            </div>
          )}
        </>
      )}
    </ResponsiveContainer>
  );
};

/**
 * Layout section wrapper for consistent styling across different strategies
 */
export interface LayoutSectionWrapperProps {
  children: ReactNode;
  section: 'chessboard' | 'sidebar' | 'header' | 'footer';
  className?: string;
  style?: React.CSSProperties;
}

export const LayoutSectionWrapper: React.FC<LayoutSectionWrapperProps> = ({
  children,
  section,
  className = '',
  style = {},
}) => {
  const { layoutMode, layoutConfig } = useResponsive();
  
  const getSectionStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      boxSizing: 'border-box',
      transition: 'all 0.3s ease-in-out',
    };

    switch (section) {
      case 'chessboard':
        return {
          ...baseStyles,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '1rem',
        };
      
      case 'sidebar':
        return {
          ...baseStyles,
          display: 'flex',
          flexDirection: 'column',
          padding: '1rem',
          overflowY: 'auto',
        };
      
      case 'header':
      case 'footer':
        return {
          ...baseStyles,
          width: '100%',
          padding: '0.5rem 1rem',
          flexShrink: 0,
        };
      
      default:
        return baseStyles;
    }
  };

  const sectionStyles = {
    ...getSectionStyles(),
    ...style,
  };

  const sectionClasses = [
    'layout-section-wrapper',
    `section-${section}`,
    `layout-mode-${layoutMode}`,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={sectionClasses}
      style={sectionStyles}
      data-section={section}
      data-layout-mode={layoutMode}
    >
      {children}
    </div>
  );
};