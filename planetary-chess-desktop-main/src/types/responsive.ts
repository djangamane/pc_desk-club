/**
 * Viewport information interface for responsive layout detection
 */
export interface ViewportInfo {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
}

/**
 * Layout configuration for different screen sizes
 */
export interface LayoutConfig {
  direction: 'column' | 'row';
  chessboardContainer: {
    width: string;
    maxWidth: string;
    height?: string;
  };
  sidebar: {
    width: string;
    maxWidth: string;
    position: 'bottom' | 'right';
  };
  spacing: {
    padding: string;
    gap: string;
  };
}

/**
 * Responsive configuration constants
 */
export interface ResponsiveConfig {
  breakpoints: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  chessboard: {
    mobile: { min: number; max: number };
    tablet: { min: number; max: number };
    desktop: { min: number; max: number };
    largeDesktop: { min: number; max: number };
  };
  layout: {
    mobile: LayoutConfig;
    tablet: LayoutConfig;
    desktop: LayoutConfig;
    largeDesktop: LayoutConfig;
  };
}

/**
 * Layout mode types
 */
export type LayoutMode = 'mobile' | 'tablet' | 'desktop' | 'large-desktop';

/**
 * Breakpoint names
 */
export type BreakpointName = 'mobile' | 'tablet' | 'desktop' | 'largeDesktop';