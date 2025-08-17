import React, { createContext, useContext, ReactNode } from 'react';
import { ViewportInfo, LayoutMode, LayoutConfig } from '../types/responsive';
import { useViewport } from '../hooks/useViewport';
import { RESPONSIVE_CONFIG, getLayoutMode, calculateChessboardSize } from '../config/responsive';

/**
 * Responsive layout context interface
 */
export interface ResponsiveContextValue {
  viewportInfo: ViewportInfo;
  layoutMode: LayoutMode;
  layoutConfig: LayoutConfig;
  chessboardSize: number;
  calculateDynamicSize: (baseSize: number, scaleFactor?: number) => number;
  isLayoutMode: (mode: LayoutMode) => boolean;
}

/**
 * Responsive context for layout state management
 */
const ResponsiveContext = createContext<ResponsiveContextValue | undefined>(undefined);

/**
 * Props for ResponsiveProvider component
 */
export interface ResponsiveProviderProps {
  children: ReactNode;
}

/**
 * Responsive context provider component
 * Provides responsive layout state and utilities to child components
 */
export const ResponsiveProvider: React.FC<ResponsiveProviderProps> = ({ children }) => {
  const viewportInfo = useViewport();
  const layoutMode = getLayoutMode(viewportInfo.width);
  const layoutConfig = RESPONSIVE_CONFIG.layout[layoutMode === 'large-desktop' ? 'largeDesktop' : layoutMode];
  const chessboardSize = calculateChessboardSize(viewportInfo.width, layoutMode);

  /**
   * Calculate dynamic size based on viewport and layout mode
   * @param baseSize - Base size in pixels
   * @param scaleFactor - Optional scale factor (default: 1)
   * @returns Calculated size in pixels
   */
  const calculateDynamicSize = (baseSize: number, scaleFactor: number = 1): number => {
    const modeMultipliers = {
      mobile: 1,
      tablet: 1.2,
      desktop: 1.5,
      'large-desktop': 1.8,
    };
    
    const multiplier = modeMultipliers[layoutMode] * scaleFactor;
    return Math.round(baseSize * multiplier);
  };

  /**
   * Check if current layout matches the specified mode
   * @param mode - Layout mode to check
   * @returns True if current layout matches the mode
   */
  const isLayoutMode = (mode: LayoutMode): boolean => {
    return layoutMode === mode;
  };

  const contextValue: ResponsiveContextValue = {
    viewportInfo,
    layoutMode,
    layoutConfig,
    chessboardSize,
    calculateDynamicSize,
    isLayoutMode,
  };

  return (
    <ResponsiveContext.Provider value={contextValue}>
      {children}
    </ResponsiveContext.Provider>
  );
};

/**
 * Hook to access responsive context
 * @returns ResponsiveContextValue
 * @throws Error if used outside ResponsiveProvider
 */
export const useResponsive = (): ResponsiveContextValue => {
  const context = useContext(ResponsiveContext);
  
  if (context === undefined) {
    throw new Error('useResponsive must be used within a ResponsiveProvider');
  }
  
  return context;
};

/**
 * Hook to get only the layout mode (lighter alternative to useResponsive)
 * @returns Current layout mode
 */
export const useCurrentLayoutMode = (): LayoutMode => {
  const { layoutMode } = useResponsive();
  return layoutMode;
};

/**
 * Hook to get responsive utilities without full context
 * @returns Object with utility functions
 */
export const useResponsiveUtils = () => {
  const { calculateDynamicSize, isLayoutMode, layoutMode } = useResponsive();
  
  return {
    calculateDynamicSize,
    isLayoutMode,
    layoutMode,
  };
};