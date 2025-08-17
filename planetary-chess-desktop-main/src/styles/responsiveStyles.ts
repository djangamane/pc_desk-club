import { LayoutMode, ViewportInfo } from '../types/responsive';
import { RESPONSIVE_CONFIG } from '../config/responsive';

/**
 * Responsive styling system for dynamic CSS generation
 * Provides utilities for creating responsive styles that adapt to different screen sizes
 */

/**
 * Base theme colors and effects for the futuristic design
 */
export const FUTURISTIC_THEME = {
  colors: {
    primary: '#00c3ff',
    primaryDark: '#054487',
    primaryLight: '#7cbdff',
    secondary: '#4aa8ff',
    background: {
      primary: '#061224',
      secondary: '#0a1c34',
      tertiary: '#193f6e',
      overlay: 'rgba(0, 30, 60, 0.8)',
    },
    text: {
      primary: '#e8f4ff',
      secondary: '#7cb3e8',
      accent: '#ffffff',
    },
    border: 'rgba(0, 195, 255, 0.3)',
    shadow: 'rgba(0, 195, 255, 0.2)',
    glow: 'rgba(0, 195, 255, 0.5)',
  },
  gradients: {
    background: 'linear-gradient(135deg, #061224 0%, #0a1c34 100%)',
    button: 'linear-gradient(135deg, #054487 0%, #0A67B3 100%)',
    buttonHover: 'linear-gradient(135deg, #0A67B3 0%, #00c3ff 100%)',
    text: 'linear-gradient(180deg, #ffffff 0%, #7cbdff 100%)',
    panel: 'linear-gradient(135deg, #081b33 0%, #0e2a4c 100%)',
  },
  effects: {
    boxShadow: {
      subtle: '0 0 10px rgba(0, 195, 255, 0.1)',
      moderate: '0 0 15px rgba(0, 195, 255, 0.2)',
      strong: '0 0 25px rgba(0, 195, 255, 0.3)',
      inset: '0 0 10px rgba(0, 0, 0, 0.5) inset',
    },
    glow: {
      subtle: '0 0 5px rgba(0, 195, 255, 0.3)',
      moderate: '0 0 10px rgba(0, 195, 255, 0.5)',
      strong: '0 0 20px rgba(0, 195, 255, 0.7)',
    },
    textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(5px)',
  },
} as const;

/**
 * Typography scale that adapts to different layout modes
 */
export const RESPONSIVE_TYPOGRAPHY = {
  fontSizes: {
    xs: { mobile: 10, tablet: 11, desktop: 12, 'large-desktop': 13 },
    sm: { mobile: 12, tablet: 13, desktop: 14, 'large-desktop': 15 },
    base: { mobile: 14, tablet: 15, desktop: 16, 'large-desktop': 18 },
    lg: { mobile: 16, tablet: 18, desktop: 20, 'large-desktop': 22 },
    xl: { mobile: 18, tablet: 20, desktop: 24, 'large-desktop': 28 },
    '2xl': { mobile: 24, tablet: 28, desktop: 32, 'large-desktop': 36 },
    '3xl': { mobile: 28, tablet: 32, desktop: 36, 'large-desktop': 42 },
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
  letterSpacing: {
    tight: '-0.5px',
    normal: '0px',
    wide: '1px',
    wider: '2px',
  },
} as const;

/**
 * Spacing scale that adapts to different layout modes
 */
export const RESPONSIVE_SPACING = {
  xs: { mobile: 4, tablet: 6, desktop: 8, 'large-desktop': 10 },
  sm: { mobile: 8, tablet: 10, desktop: 12, 'large-desktop': 16 },
  base: { mobile: 12, tablet: 15, desktop: 20, 'large-desktop': 24 },
  lg: { mobile: 16, tablet: 20, desktop: 24, 'large-desktop': 32 },
  xl: { mobile: 20, tablet: 25, desktop: 32, 'large-desktop': 40 },
  '2xl': { mobile: 24, tablet: 32, desktop: 40, 'large-desktop': 48 },
  '3xl': { mobile: 32, tablet: 40, desktop: 48, 'large-desktop': 64 },
} as const;

/**
 * Get responsive font size for a given size key and layout mode
 */
export const getResponsiveFontSize = (
  sizeKey: keyof typeof RESPONSIVE_TYPOGRAPHY.fontSizes,
  layoutMode: LayoutMode
): number => {
  return RESPONSIVE_TYPOGRAPHY.fontSizes[sizeKey][layoutMode];
};

/**
 * Get responsive spacing for a given spacing key and layout mode
 */
export const getResponsiveSpacing = (
  spacingKey: keyof typeof RESPONSIVE_SPACING,
  layoutMode: LayoutMode
): number => {
  return RESPONSIVE_SPACING[spacingKey][layoutMode];
};

/**
 * Generate responsive CSS properties for a component
 */
export const createResponsiveStyles = (
  layoutMode: LayoutMode,
  viewportInfo: ViewportInfo
): Record<string, string | number> => {
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
    '--base-font-size': `${getResponsiveFontSize('base', layoutMode)}px`,
    '--base-spacing': `${getResponsiveSpacing('base', layoutMode)}px`,
  };
};

/**
 * Create responsive button styles with futuristic theme
 */
export const createResponsiveButtonStyles = (
  layoutMode: LayoutMode,
  variant: 'primary' | 'secondary' | 'subtle' = 'primary',
  size: 'sm' | 'base' | 'lg' = 'base'
): React.CSSProperties => {
  const fontSize = getResponsiveFontSize(size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'base', layoutMode);
  const padding = getResponsiveSpacing(size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'base', layoutMode);
  
  const baseStyles: React.CSSProperties = {
    fontSize: `${fontSize}px`,
    padding: `${padding}px ${padding * 1.5}px`,
    borderRadius: layoutMode === 'mobile' ? '6px' : '8px',
    border: `1px solid ${FUTURISTIC_THEME.colors.border}`,
    fontFamily: '"Orbitron", sans-serif',
    fontWeight: 'bold',
    letterSpacing: RESPONSIVE_TYPOGRAPHY.letterSpacing.wide,
    textTransform: 'uppercase' as const,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    position: 'relative' as const,
    overflow: 'hidden' as const,
  };

  const variantStyles = {
    primary: {
      background: FUTURISTIC_THEME.gradients.button,
      color: FUTURISTIC_THEME.colors.text.primary,
      boxShadow: `${FUTURISTIC_THEME.effects.boxShadow.moderate}, ${FUTURISTIC_THEME.effects.boxShadow.inset}`,
    },
    secondary: {
      background: `linear-gradient(135deg, ${FUTURISTIC_THEME.colors.background.tertiary} 0%, #2b4f8a 100%)`,
      color: FUTURISTIC_THEME.colors.text.primary,
      boxShadow: FUTURISTIC_THEME.effects.boxShadow.subtle,
    },
    subtle: {
      background: `rgba(${FUTURISTIC_THEME.colors.primaryDark.slice(1)}, 0.3)`,
      color: FUTURISTIC_THEME.colors.text.secondary,
      boxShadow: FUTURISTIC_THEME.effects.boxShadow.subtle,
    },
  };

  return { ...baseStyles, ...variantStyles[variant] };
};

/**
 * Create responsive panel/container styles with futuristic theme
 */
export const createResponsivePanelStyles = (
  layoutMode: LayoutMode,
  variant: 'primary' | 'secondary' | 'overlay' = 'primary',
  withGlow: boolean = true
): React.CSSProperties => {
  const padding = getResponsiveSpacing('lg', layoutMode);
  const borderRadius = layoutMode === 'mobile' ? '8px' : layoutMode === 'tablet' ? '10px' : '12px';
  
  const baseStyles: React.CSSProperties = {
    padding: `${padding}px`,
    borderRadius,
    border: `1px solid ${FUTURISTIC_THEME.colors.border}`,
    backdropFilter: FUTURISTIC_THEME.effects.backdropFilter,
    position: 'relative' as const,
  };

  const variantStyles = {
    primary: {
      background: FUTURISTIC_THEME.colors.background.overlay,
      boxShadow: withGlow 
        ? `${FUTURISTIC_THEME.effects.boxShadow.moderate}, ${FUTURISTIC_THEME.effects.boxShadow.inset}`
        : FUTURISTIC_THEME.effects.boxShadow.subtle,
    },
    secondary: {
      background: 'rgba(0, 20, 40, 0.9)',
      boxShadow: withGlow 
        ? `${FUTURISTIC_THEME.effects.boxShadow.strong}, ${FUTURISTIC_THEME.effects.boxShadow.inset}`
        : FUTURISTIC_THEME.effects.boxShadow.moderate,
    },
    overlay: {
      background: 'rgba(0, 15, 30, 0.7)',
      boxShadow: FUTURISTIC_THEME.effects.boxShadow.subtle,
    },
  };

  return { ...baseStyles, ...variantStyles[variant] };
};

/**
 * Create responsive text styles with futuristic theme
 */
export const createResponsiveTextStyles = (
  layoutMode: LayoutMode,
  variant: 'heading' | 'body' | 'caption' | 'accent' = 'body',
  size: keyof typeof RESPONSIVE_TYPOGRAPHY.fontSizes = 'base'
): React.CSSProperties => {
  const fontSize = getResponsiveFontSize(size, layoutMode);
  
  const baseStyles: React.CSSProperties = {
    fontSize: `${fontSize}px`,
    color: FUTURISTIC_THEME.colors.text.primary,
    textShadow: FUTURISTIC_THEME.effects.textShadow,
  };

  const variantStyles = {
    heading: {
      fontFamily: '"Orbitron", sans-serif',
      fontWeight: '800',
      background: FUTURISTIC_THEME.gradients.text,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      letterSpacing: RESPONSIVE_TYPOGRAPHY.letterSpacing.wider,
      lineHeight: RESPONSIVE_TYPOGRAPHY.lineHeights.tight,
    },
    body: {
      fontFamily: 'system-ui, sans-serif',
      fontWeight: 'normal',
      lineHeight: RESPONSIVE_TYPOGRAPHY.lineHeights.normal,
      letterSpacing: RESPONSIVE_TYPOGRAPHY.letterSpacing.normal,
    },
    caption: {
      fontFamily: '"Orbitron", sans-serif',
      fontWeight: '600',
      color: FUTURISTIC_THEME.colors.text.secondary,
      letterSpacing: RESPONSIVE_TYPOGRAPHY.letterSpacing.wide,
      lineHeight: RESPONSIVE_TYPOGRAPHY.lineHeights.normal,
    },
    accent: {
      fontFamily: '"Orbitron", sans-serif',
      fontWeight: 'bold',
      color: FUTURISTIC_THEME.colors.secondary,
      letterSpacing: RESPONSIVE_TYPOGRAPHY.letterSpacing.wide,
      lineHeight: RESPONSIVE_TYPOGRAPHY.lineHeights.normal,
    },
  };

  return { ...baseStyles, ...variantStyles[variant] };
};

/**
 * Create responsive avatar/image container styles
 */
export const createResponsiveAvatarStyles = (
  layoutMode: LayoutMode,
  size: number,
  withGlow: boolean = true
): React.CSSProperties => {
  const glowIntensity = layoutMode === 'mobile' ? 'subtle' : 'moderate';
  
  return {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '50%',
    overflow: 'hidden' as const,
    border: `2px solid ${FUTURISTIC_THEME.colors.border}`,
    boxShadow: withGlow 
      ? `${FUTURISTIC_THEME.effects.glow[glowIntensity]}, ${FUTURISTIC_THEME.effects.boxShadow.inset}`
      : FUTURISTIC_THEME.effects.boxShadow.subtle,
    background: `radial-gradient(circle at center, ${FUTURISTIC_THEME.colors.background.primary} 0%, ${FUTURISTIC_THEME.colors.background.secondary} 90%)`,
    position: 'relative' as const,
  };
};

/**
 * Create responsive chessboard container styles
 */
export const createResponsiveChessboardStyles = (
  layoutMode: LayoutMode,
  size: number
): React.CSSProperties => {
  const padding = getResponsiveSpacing(layoutMode === 'mobile' ? 'sm' : 'base', layoutMode);
  const borderRadius = layoutMode === 'mobile' ? '8px' : '10px';
  const glowIntensity = layoutMode === 'desktop' || layoutMode === 'large-desktop' ? 'strong' : 'moderate';
  
  return {
    width: '100%',
    maxWidth: `${size}px`,
    margin: '0 auto',
    position: 'relative' as const,
    borderRadius,
    padding: `${padding}px`,
    background: FUTURISTIC_THEME.gradients.panel,
    boxShadow: `${FUTURISTIC_THEME.effects.glow[glowIntensity]}, ${FUTURISTIC_THEME.effects.boxShadow.inset}`,
    border: `1px solid ${FUTURISTIC_THEME.colors.border}`,
    transition: 'all 0.3s ease',
  };
};

/**
 * Create responsive layout container styles
 */
export const createResponsiveLayoutStyles = (
  layoutMode: LayoutMode,
  viewportInfo: ViewportInfo
): React.CSSProperties => {
  const config = RESPONSIVE_CONFIG.layout[layoutMode === 'large-desktop' ? 'largeDesktop' : layoutMode];
  const gap = getResponsiveSpacing('lg', layoutMode);
  const padding = getResponsiveSpacing('base', layoutMode);
  
  return {
    display: 'flex',
    flexDirection: config.direction as 'row' | 'column',
    gap: `${gap}px`,
    padding: `${padding}px`,
    minHeight: '100vh',
    background: FUTURISTIC_THEME.gradients.background,
    position: 'relative' as const,
    overflow: 'hidden' as const,
  };
};

/**
 * Create CSS animation keyframes for futuristic effects
 */
export const RESPONSIVE_ANIMATIONS = {
  glow: `
    @keyframes responsiveGlow {
      0% { box-shadow: 0 0 15px rgba(0, 195, 255, 0.5), 0 0 5px rgba(0, 195, 255, 0.8) inset; }
      50% { box-shadow: 0 0 25px rgba(0, 195, 255, 0.8), 0 0 8px rgba(0, 195, 255, 0.9) inset; }
      100% { box-shadow: 0 0 15px rgba(0, 195, 255, 0.5), 0 0 5px rgba(0, 195, 255, 0.8) inset; }
    }
  `,
  pulse: `
    @keyframes responsivePulse {
      0% { opacity: 0.6; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.05); }
      100% { opacity: 0.6; transform: scale(1); }
    }
  `,
  thinkingBar: `
    @keyframes responsiveThinkingBar {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(300%); }
    }
  `,
  blink: `
    @keyframes responsiveBlink {
      0% { opacity: 0.3; }
      50% { opacity: 1; }
      100% { opacity: 0.3; }
    }
  `,
  slideIn: `
    @keyframes responsiveSlideIn {
      0% { transform: translateY(20px); opacity: 0; }
      100% { transform: translateY(0); opacity: 1; }
    }
  `,
  fadeIn: `
    @keyframes responsiveFadeIn {
      0% { opacity: 0; }
      100% { opacity: 1; }
    }
  `,
} as const;

/**
 * Generate all CSS animations as a single string for injection
 */
export const generateResponsiveAnimationCSS = (): string => {
  return Object.values(RESPONSIVE_ANIMATIONS).join('\n');
};