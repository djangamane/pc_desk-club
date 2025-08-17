import React, { ReactNode } from 'react';
import { useResponsive } from '../contexts/ResponsiveContext';

/**
 * Grid area definitions for different layout sections
 */
export type GridArea = 
  | 'header' 
  | 'chessboard' 
  | 'sidebar' 
  | 'footer' 
  | 'main' 
  | 'nav';

/**
 * Grid template configurations for different layout modes
 */
interface GridTemplate {
  columns: string;
  rows: string;
  areas: string;
}

/**
 * Props for GridLayout component
 */
export interface GridLayoutProps {
  children: ReactNode;
  template?: 'default' | 'with-header' | 'with-footer' | 'full-layout';
  className?: string;
  style?: React.CSSProperties;
  customTemplate?: GridTemplate;
}

/**
 * Props for GridItem component
 */
export interface GridItemProps {
  children: ReactNode;
  area: GridArea;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Predefined grid templates for different layout configurations
 */
const GRID_TEMPLATES: Record<string, Record<string, GridTemplate>> = {
  mobile: {
    default: {
      columns: '1fr',
      rows: 'auto 1fr auto',
      areas: `
        "chessboard"
        "sidebar"
        "footer"
      `,
    },
    'with-header': {
      columns: '1fr',
      rows: 'auto auto 1fr auto',
      areas: `
        "header"
        "chessboard"
        "sidebar"
        "footer"
      `,
    },
  },
  tablet: {
    default: {
      columns: '1fr',
      rows: 'auto 1fr auto',
      areas: `
        "chessboard"
        "sidebar"
        "footer"
      `,
    },
    'with-header': {
      columns: '1fr',
      rows: 'auto auto 1fr auto',
      areas: `
        "header"
        "chessboard"
        "sidebar"
        "footer"
      `,
    },
  },
  desktop: {
    default: {
      columns: '2fr 1fr',
      rows: '1fr',
      areas: `
        "chessboard sidebar"
      `,
    },
    'with-header': {
      columns: '2fr 1fr',
      rows: 'auto 1fr',
      areas: `
        "header header"
        "chessboard sidebar"
      `,
    },
    'with-footer': {
      columns: '2fr 1fr',
      rows: '1fr auto',
      areas: `
        "chessboard sidebar"
        "footer footer"
      `,
    },
    'full-layout': {
      columns: '2fr 1fr',
      rows: 'auto 1fr auto',
      areas: `
        "header header"
        "chessboard sidebar"
        "footer footer"
      `,
    },
  },
  'large-desktop': {
    default: {
      columns: '3fr 2fr',
      rows: '1fr',
      areas: `
        "chessboard sidebar"
      `,
    },
    'with-header': {
      columns: '3fr 2fr',
      rows: 'auto 1fr',
      areas: `
        "header header"
        "chessboard sidebar"
      `,
    },
    'with-footer': {
      columns: '3fr 2fr',
      rows: '1fr auto',
      areas: `
        "chessboard sidebar"
        "footer footer"
      `,
    },
    'full-layout': {
      columns: '3fr 2fr',
      rows: 'auto 1fr auto',
      areas: `
        "header header"
        "chessboard sidebar"
        "footer footer"
      `,
    },
  },
};

/**
 * GridItem component for positioning content in grid areas
 */
export const GridItem: React.FC<GridItemProps> = ({ 
  children, 
  area, 
  className = '', 
  style = {} 
}) => {
  const { layoutMode } = useResponsive();
  
  const itemStyles: React.CSSProperties = {
    gridArea: area,
    display: 'flex',
    flexDirection: area === 'sidebar' ? 'column' : 'row',
    alignItems: area === 'chessboard' ? 'center' : 'stretch',
    justifyContent: area === 'chessboard' ? 'center' : 'flex-start',
    padding: area === 'header' || area === 'footer' ? '0.5rem' : '1rem',
    boxSizing: 'border-box',
    transition: 'all 0.3s ease-in-out',
    ...style,
  };

  const itemClasses = [
    'grid-item',
    `grid-item-${area}`,
    `layout-mode-${layoutMode}`,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={itemClasses}
      style={itemStyles}
      data-grid-area={area}
      data-layout-mode={layoutMode}
    >
      {children}
    </div>
  );
};

/**
 * Main GridLayout component with responsive CSS Grid system
 */
export const GridLayout: React.FC<GridLayoutProps> = ({ 
  children, 
  template = 'default',
  className = '', 
  style = {},
  customTemplate,
}) => {
  const { layoutMode, layoutConfig, viewportInfo } = useResponsive();
  
  // Get the appropriate grid template
  const gridTemplate = customTemplate || 
    GRID_TEMPLATES[layoutMode]?.[template] || 
    GRID_TEMPLATES.mobile.default;
  
  const containerStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: gridTemplate.columns,
    gridTemplateRows: gridTemplate.rows,
    gridTemplateAreas: gridTemplate.areas,
    gap: layoutConfig.spacing.gap,
    padding: layoutConfig.spacing.padding,
    width: '100%',
    minHeight: '100vh',
    maxWidth: layoutMode === 'desktop' || layoutMode === 'large-desktop' ? '1400px' : '100%',
    margin: '0 auto',
    boxSizing: 'border-box',
    transition: 'all 0.3s ease-in-out',
    ...style,
  };

  const containerClasses = [
    'grid-layout-container',
    `grid-template-${template}`,
    `layout-mode-${layoutMode}`,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={containerClasses}
      style={containerStyles}
      data-layout-mode={layoutMode}
      data-template={template}
      data-viewport-width={viewportInfo.width}
    >
      {children}
    </div>
  );
};

/**
 * Utility hook for getting grid template information
 */
export const useGridTemplate = (template: string = 'default') => {
  const { layoutMode } = useResponsive();
  
  const gridTemplate = GRID_TEMPLATES[layoutMode]?.[template] || 
    GRID_TEMPLATES.mobile.default;
  
  return {
    template: gridTemplate,
    layoutMode,
    isDesktopGrid: layoutMode === 'desktop' || layoutMode === 'large-desktop',
  };
};

/**
 * Higher-order component for wrapping components with grid layout
 */
export const withGridLayout = <P extends object>(
  Component: React.ComponentType<P>,
  gridProps?: Partial<GridLayoutProps>
): React.FC<P & { gridLayoutProps?: Partial<GridLayoutProps> }> => {
  return ({ gridLayoutProps, ...props }) => (
    <GridLayout {...gridProps} {...gridLayoutProps}>
      <Component {...(props as P)} />
    </GridLayout>
  );
};