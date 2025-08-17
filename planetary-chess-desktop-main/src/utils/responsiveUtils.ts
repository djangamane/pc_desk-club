import { LayoutMode, ViewportInfo } from '../types/responsive';
import { RESPONSIVE_CONFIG } from '../config/responsive';

/**
 * Utility functions for responsive calculations and layout management
 */

/**
 * Calculate responsive font size based on layout mode
 * @param baseSize - Base font size in pixels
 * @param layoutMode - Current layout mode
 * @returns Calculated font size in pixels
 */
export const calculateResponsiveFontSize = (baseSize: number, layoutMode: LayoutMode): number => {
  const scalingFactors = {
    mobile: 1,
    tablet: 1.1,
    desktop: 1.2,
    'large-desktop': 1.3,
  };
  
  return Math.round(baseSize * scalingFactors[layoutMode]);
};

/**
 * Calculate responsive spacing based on layout mode
 * @param baseSpacing - Base spacing in pixels
 * @param layoutMode - Current layout mode
 * @returns Calculated spacing in pixels
 */
export const calculateResponsiveSpacing = (baseSpacing: number, layoutMode: LayoutMode): number => {
  const spacingMultipliers = {
    mobile: 1,
    tablet: 1.25,
    desktop: 1.5,
    'large-desktop': 2,
  };
  
  return Math.round(baseSpacing * spacingMultipliers[layoutMode]);
};

/**
 * Calculate component size based on viewport and constraints
 * @param viewportInfo - Current viewport information
 * @param minSize - Minimum size in pixels
 * @param maxSize - Maximum size in pixels
 * @param viewportPercentage - Percentage of viewport to use (0-1)
 * @returns Calculated size in pixels
 */
export const calculateComponentSize = (
  viewportInfo: ViewportInfo,
  minSize: number,
  maxSize: number,
  viewportPercentage: number = 0.9
): number => {
  const calculatedSize = Math.min(viewportInfo.width, viewportInfo.height) * viewportPercentage;
  return Math.min(maxSize, Math.max(minSize, calculatedSize));
};

/**
 * Get optimal grid columns based on viewport width
 * @param viewportWidth - Current viewport width
 * @param itemMinWidth - Minimum width per grid item
 * @param maxColumns - Maximum number of columns
 * @returns Number of columns
 */
export const calculateGridColumns = (
  viewportWidth: number,
  itemMinWidth: number = 300,
  maxColumns: number = 4
): number => {
  const possibleColumns = Math.floor(viewportWidth / itemMinWidth);
  return Math.min(maxColumns, Math.max(1, possibleColumns));
};

/**
 * Calculate sidebar width based on layout mode and viewport
 * @param viewportWidth - Current viewport width
 * @param layoutMode - Current layout mode
 * @returns Sidebar width in pixels
 */
export const calculateSidebarWidth = (viewportWidth: number, layoutMode: LayoutMode): number => {
  const config = RESPONSIVE_CONFIG.layout[layoutMode === 'large-desktop' ? 'largeDesktop' : layoutMode];
  
  if (layoutMode === 'mobile' || layoutMode === 'tablet') {
    return viewportWidth; // Full width on mobile/tablet
  }
  
  // Parse percentage from config (e.g., "35%" -> 0.35)
  const percentage = parseFloat(config.sidebar.width.replace('%', '')) / 100;
  const calculatedWidth = viewportWidth * percentage;
  const maxWidth = parseFloat(config.sidebar.maxWidth.replace('px', ''));
  
  return Math.min(maxWidth, calculatedWidth);
};

/**
 * Calculate chessboard container dimensions
 * @param viewportInfo - Current viewport information
 * @param layoutMode - Current layout mode
 * @returns Object with width and height
 */
export const calculateChessboardContainerSize = (
  viewportInfo: ViewportInfo,
  layoutMode: LayoutMode
): { width: number; height: number } => {
  const config = RESPONSIVE_CONFIG.layout[layoutMode === 'large-desktop' ? 'largeDesktop' : layoutMode];
  
  let width: number;
  let height: number;
  
  if (layoutMode === 'mobile' || layoutMode === 'tablet') {
    // Mobile/tablet: use most of viewport width
    width = Math.min(
      viewportInfo.width * 0.9,
      parseFloat(config.chessboardContainer.maxWidth.replace('px', ''))
    );
    height = width; // Square aspect ratio
  } else {
    // Desktop: calculate based on percentage and constraints
    const percentage = parseFloat(config.chessboardContainer.width.replace('%', '')) / 100;
    width = Math.min(
      viewportInfo.width * percentage,
      parseFloat(config.chessboardContainer.maxWidth.replace('px', ''))
    );
    height = Math.min(width, viewportInfo.height * 0.8); // Ensure it fits in viewport
  }
  
  return { width: Math.round(width), height: Math.round(height) };
};

/**
 * Calculate responsive chessboard size with proper constraints
 * @param viewportWidth - Current viewport width
 * @param layoutMode - Current layout mode
 * @param customConstraints - Optional custom min/max constraints
 * @returns Calculated chessboard size in pixels
 */
export const calculateResponsiveChessboardSize = (
  viewportWidth: number,
  layoutMode: LayoutMode,
  customConstraints?: { min?: number; max?: number }
): number => {
  // Get size constraints from config
  const configKey = layoutMode === 'large-desktop' ? 'largeDesktop' : layoutMode;
  const sizeConfig = RESPONSIVE_CONFIG.chessboard[configKey];
  
  // Use custom constraints if provided, otherwise use config
  const minSize = customConstraints?.min ?? sizeConfig.min;
  const maxSize = customConstraints?.max ?? sizeConfig.max;
  
  // Fallback for test environment or invalid viewport
  if (!viewportWidth || viewportWidth <= 0) {
    // Return default size based on layout mode
    const defaultSizes = {
      mobile: 380,
      tablet: 500,
      desktop: 600,
      'large-desktop': 800,
    };
    return defaultSizes[layoutMode];
  }
  
  // Calculate size based on viewport and layout mode
  let calculatedSize: number;
  
  if (layoutMode === 'mobile') {
    calculatedSize = viewportWidth * 0.85; // 85% of viewport width for mobile
  } else if (layoutMode === 'tablet') {
    calculatedSize = viewportWidth * 0.7; // 70% of viewport width for tablet
  } else {
    calculatedSize = viewportWidth * 0.4; // 40% of viewport width for desktop
  }
  
  // Apply constraints
  return Math.min(maxSize, Math.max(minSize, Math.round(calculatedSize)));
};

/**
 * Generate responsive CSS custom properties
 * @param layoutMode - Current layout mode
 * @param viewportInfo - Current viewport information
 * @returns Object with CSS custom properties
 */
export const generateResponsiveCSSProperties = (
  layoutMode: LayoutMode,
  viewportInfo: ViewportInfo
): Record<string, string> => {
  const config = RESPONSIVE_CONFIG.layout[layoutMode === 'large-desktop' ? 'largeDesktop' : layoutMode];
  
  return {
    '--layout-direction': config.direction,
    '--layout-gap': config.spacing.gap,
    '--layout-padding': config.spacing.padding,
    '--chessboard-width': config.chessboardContainer.width,
    '--chessboard-max-width': config.chessboardContainer.maxWidth,
    '--sidebar-width': config.sidebar.width,
    '--sidebar-max-width': config.sidebar.maxWidth,
    '--viewport-width': `${viewportInfo.width}px`,
    '--viewport-height': `${viewportInfo.height}px`,
    '--layout-mode': layoutMode,
  };
};

/**
 * Check if viewport is in landscape orientation
 * @param viewportInfo - Current viewport information
 * @returns True if landscape, false if portrait
 */
export const isLandscapeOrientation = (viewportInfo: ViewportInfo): boolean => {
  return viewportInfo.width > viewportInfo.height;
};

/**
 * Calculate optimal aspect ratio for components
 * @param viewportInfo - Current viewport information
 * @param preferredRatio - Preferred aspect ratio (width/height)
 * @returns Calculated aspect ratio
 */
export const calculateOptimalAspectRatio = (
  viewportInfo: ViewportInfo,
  preferredRatio: number = 1
): number => {
  const viewportRatio = viewportInfo.width / viewportInfo.height;
  
  // Adjust preferred ratio based on viewport constraints
  if (viewportRatio < 1 && preferredRatio > 1) {
    // Portrait viewport with landscape preference - adjust
    return Math.min(preferredRatio, viewportRatio * 1.5);
  } else if (viewportRatio > 2 && preferredRatio < 1.5) {
    // Very wide viewport - allow wider ratios
    return Math.max(preferredRatio, 1.5);
  }
  
  return preferredRatio;
};