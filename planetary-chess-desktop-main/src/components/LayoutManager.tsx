import React, { ReactNode, useEffect, useState } from 'react';
import { ResponsiveProvider, useResponsive } from '../contexts/ResponsiveContext';

/**
 * Props for LayoutManager component
 */
export interface LayoutManagerProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onLayoutChange?: (layoutMode: string) => void;
}

/**
 * Internal layout container component that applies responsive styles
 */
const LayoutContainer: React.FC<Omit<LayoutManagerProps, 'onLayoutChange'> & { onLayoutChange?: (layoutMode: string) => void }> = ({ 
  children, 
  className = '', 
  style = {},
  onLayoutChange 
}) => {
  const { layoutMode, layoutConfig, viewportInfo } = useResponsive();
  const [previousLayoutMode, setPreviousLayoutMode] = useState<string>(layoutMode);

  // Handle layout mode changes
  useEffect(() => {
    if (layoutMode !== previousLayoutMode) {
      setPreviousLayoutMode(layoutMode);
      onLayoutChange?.(layoutMode);
    }
  }, [layoutMode, previousLayoutMode, onLayoutChange]);

  // Generate responsive styles based on layout config
  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: layoutConfig.direction,
    gap: layoutConfig.spacing.gap,
    padding: layoutConfig.spacing.padding,
    width: '100%',
    minHeight: '100vh',
    boxSizing: 'border-box',
    transition: 'all 0.3s ease-in-out',
    ...style,
  };

  // Add responsive classes
  const responsiveClasses = [
    'layout-manager',
    `layout-${layoutMode}`,
    `viewport-${viewportInfo.width}x${viewportInfo.height}`,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={responsiveClasses}
      style={containerStyles}
      data-layout-mode={layoutMode}
      data-viewport-width={viewportInfo.width}
      data-viewport-height={viewportInfo.height}
    >
      {children}
    </div>
  );
};

/**
 * LayoutManager component that provides responsive context and layout management
 * This is the main component that should wrap your application to enable responsive layouts
 */
export const LayoutManager: React.FC<LayoutManagerProps> = ({ 
  children, 
  className,
  style,
  onLayoutChange 
}) => {
  return (
    <ResponsiveProvider>
      <LayoutContainer 
        className={className}
        style={style}
        onLayoutChange={onLayoutChange}
      >
        {children}
      </LayoutContainer>
    </ResponsiveProvider>
  );
};

/**
 * Higher-order component for adding responsive layout capabilities
 * @param Component - Component to wrap with responsive layout
 * @returns Wrapped component with responsive layout
 */
export const withResponsiveLayout = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P & { layoutManagerProps?: Partial<LayoutManagerProps> }> => {
  return ({ layoutManagerProps, ...props }) => (
    <LayoutManager {...layoutManagerProps}>
      <Component {...(props as P)} />
    </LayoutManager>
  );
};

/**
 * Layout section component for organizing content within the responsive layout
 */
export interface LayoutSectionProps {
  children: ReactNode;
  section: 'chessboard' | 'sidebar' | 'header' | 'footer';
  className?: string;
  style?: React.CSSProperties;
}

export const LayoutSection: React.FC<LayoutSectionProps> = ({ 
  children, 
  section, 
  className = '',
  style = {} 
}) => {
  const { layoutConfig, layoutMode } = useResponsive();
  
  // Get section-specific configuration
  const getSectionStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      boxSizing: 'border-box',
      transition: 'all 0.3s ease-in-out',
    };

    switch (section) {
      case 'chessboard':
        return {
          ...baseStyles,
          width: layoutConfig.chessboardContainer.width,
          maxWidth: layoutConfig.chessboardContainer.maxWidth,
          height: layoutConfig.chessboardContainer.height,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        };
      
      case 'sidebar':
        return {
          ...baseStyles,
          width: layoutConfig.sidebar.width,
          maxWidth: layoutConfig.sidebar.maxWidth,
          display: 'flex',
          flexDirection: 'column',
        };
      
      case 'header':
      case 'footer':
        return {
          ...baseStyles,
          width: '100%',
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
    'layout-section',
    `layout-section-${section}`,
    `layout-section-${section}-${layoutMode}`,
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