import { ResponsiveConfig } from '../types/responsive';

/**
 * Responsive configuration constants for breakpoints and sizing
 */
export const RESPONSIVE_CONFIG: ResponsiveConfig = {
  breakpoints: {
    mobile: 768,
    tablet: 1024,
    desktop: 1440,
  },
  chessboard: {
    mobile: { min: 320, max: 380 },
    tablet: { min: 450, max: 550 },
    desktop: { min: 600, max: 800 },
    largeDesktop: { min: 700, max: 900 },
  },
  layout: {
    mobile: {
      direction: 'column',
      chessboardContainer: {
        width: '100%',
        maxWidth: '400px',
      },
      sidebar: {
        width: '100%',
        maxWidth: '400px',
        position: 'bottom',
      },
      spacing: {
        padding: '1rem',
        gap: '1rem',
      },
    },
    tablet: {
      direction: 'column',
      chessboardContainer: {
        width: '100%',
        maxWidth: '600px',
      },
      sidebar: {
        width: '100%',
        maxWidth: '600px',
        position: 'bottom',
      },
      spacing: {
        padding: '1.5rem',
        gap: '1.5rem',
      },
    },
    desktop: {
      direction: 'row',
      chessboardContainer: {
        width: '65%',
        maxWidth: '800px',
      },
      sidebar: {
        width: '35%',
        maxWidth: '400px',
        position: 'right',
      },
      spacing: {
        padding: '2rem',
        gap: '2rem',
      },
    },
    largeDesktop: {
      direction: 'row',
      chessboardContainer: {
        width: '70%',
        maxWidth: '900px',
      },
      sidebar: {
        width: '30%',
        maxWidth: '450px',
        position: 'right',
      },
      spacing: {
        padding: '2.5rem',
        gap: '2.5rem',
      },
    },
  },
};

/**
 * Utility function to get layout mode based on viewport width
 */
export const getLayoutMode = (width: number): 'mobile' | 'tablet' | 'desktop' | 'large-desktop' => {
  if (width < RESPONSIVE_CONFIG.breakpoints.mobile) {
    return 'mobile';
  } else if (width < RESPONSIVE_CONFIG.breakpoints.tablet) {
    return 'tablet';
  } else if (width < RESPONSIVE_CONFIG.breakpoints.desktop) {
    return 'desktop';
  } else {
    return 'large-desktop';
  }
};

/**
 * Utility function to calculate chessboard size based on viewport and layout mode
 */
export const calculateChessboardSize = (viewportWidth: number, layoutMode: 'mobile' | 'tablet' | 'desktop' | 'large-desktop'): number => {
  const config = RESPONSIVE_CONFIG.chessboard[layoutMode === 'large-desktop' ? 'largeDesktop' : layoutMode];
  const calculatedSize = layoutMode === 'mobile' || layoutMode === 'tablet' 
    ? viewportWidth * 0.9 
    : viewportWidth * 0.4;
  
  return Math.min(config.max, Math.max(config.min, calculatedSize));
};