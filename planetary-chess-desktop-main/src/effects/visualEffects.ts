/**
 * Desktop-enhanced visual effects and animations system
 * Provides enhanced hover effects, animations, and visual feedback for desktop interactions
 */

import { LayoutMode } from '../types/responsive';

/**
 * Animation configuration interface
 */
export interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
}

/**
 * Visual effect configuration interface
 */
export interface VisualEffectConfig {
  intensity: number;
  color: string;
  shadowBlur: number;
  glowRadius: number;
}

/**
 * Desktop-specific animation configurations
 */
export const DESKTOP_ANIMATIONS = {
  hover: {
    duration: 200,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  thinking: {
    duration: 1500,
    easing: 'ease-in-out',
  },
  layoutTransition: {
    duration: 300,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },
  pieceInteraction: {
    duration: 150,
    easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  glow: {
    duration: 2000,
    easing: 'ease-in-out',
  },
} as const;

/**
 * Desktop visual effect configurations
 */
export const DESKTOP_EFFECTS = {
  subtle: {
    intensity: 0.3,
    color: 'rgba(0, 195, 255, 0.3)',
    shadowBlur: 10,
    glowRadius: 5,
  },
  moderate: {
    intensity: 0.6,
    color: 'rgba(0, 195, 255, 0.6)',
    shadowBlur: 15,
    glowRadius: 10,
  },
  intense: {
    intensity: 1.0,
    color: 'rgba(0, 195, 255, 1.0)',
    shadowBlur: 25,
    glowRadius: 20,
  },
} as const;

/**
 * Enhanced hover effect styles for desktop interactions
 */
export const createDesktopHoverEffect = (
  layoutMode: LayoutMode,
  effectIntensity: 'subtle' | 'moderate' | 'intense' = 'moderate'
): React.CSSProperties => {
  // Only apply enhanced effects on desktop
  if (layoutMode === 'mobile' || layoutMode === 'tablet') {
    return {};
  }

  const effect = DESKTOP_EFFECTS[effectIntensity];
  const animation = DESKTOP_ANIMATIONS.hover;

  return {
    transition: `all ${animation.duration}ms ${animation.easing}`,
    cursor: 'pointer',
    transform: 'translateY(0px) scale(1)',
    boxShadow: `0 0 ${effect.shadowBlur}px ${effect.color}`,
    filter: 'brightness(1)',
  };
};

/**
 * Enhanced hover effect styles for active state
 */
export const createDesktopHoverActiveEffect = (
  layoutMode: LayoutMode,
  effectIntensity: 'subtle' | 'moderate' | 'intense' = 'moderate'
): React.CSSProperties => {
  // Only apply enhanced effects on desktop
  if (layoutMode === 'mobile' || layoutMode === 'tablet') {
    return {};
  }

  const effect = DESKTOP_EFFECTS[effectIntensity];

  return {
    transform: 'translateY(-2px) scale(1.02)',
    boxShadow: `0 4px ${effect.shadowBlur * 1.5}px ${effect.color}, 0 0 ${effect.glowRadius}px ${effect.color}`,
    filter: 'brightness(1.1)',
  };
};

/**
 * Desktop-optimized AI thinking animation styles
 */
export const createAIThinkingAnimation = (
  layoutMode: LayoutMode,
  isThinking: boolean
): React.CSSProperties => {
  const baseStyles: React.CSSProperties = {
    transition: `all ${DESKTOP_ANIMATIONS.thinking.duration}ms ${DESKTOP_ANIMATIONS.thinking.easing}`,
  };

  if (!isThinking) {
    return baseStyles;
  }

  // Enhanced thinking animation for desktop
  if (layoutMode === 'desktop' || layoutMode === 'large-desktop') {
    return {
      ...baseStyles,
      animation: `desktopThinkingGlow ${DESKTOP_ANIMATIONS.thinking.duration}ms infinite ${DESKTOP_ANIMATIONS.thinking.easing}`,
      boxShadow: '0 0 25px rgba(0, 195, 255, 0.8), 0 0 8px rgba(0, 195, 255, 0.9) inset',
    };
  }

  // Standard thinking animation for mobile/tablet
  return {
    ...baseStyles,
    animation: `glow ${DESKTOP_ANIMATIONS.thinking.duration}ms infinite ${DESKTOP_ANIMATIONS.thinking.easing}`,
  };
};

/**
 * Layout transition animation styles
 */
export const createLayoutTransitionEffect = (
  fromMode: LayoutMode,
  toMode: LayoutMode
): React.CSSProperties => {
  const animation = DESKTOP_ANIMATIONS.layoutTransition;

  return {
    transition: `all ${animation.duration}ms ${animation.easing}`,
    willChange: 'transform, opacity, width, height',
  };
};

/**
 * Chess piece interaction visual feedback
 */
export const createChessPieceInteractionEffect = (
  layoutMode: LayoutMode,
  interactionState: 'idle' | 'hover' | 'dragging' | 'dropping'
): React.CSSProperties => {
  const baseStyles: React.CSSProperties = {
    transition: `all ${DESKTOP_ANIMATIONS.pieceInteraction.duration}ms ${DESKTOP_ANIMATIONS.pieceInteraction.easing}`,
  };

  // Enhanced effects only on desktop
  if (layoutMode === 'mobile' || layoutMode === 'tablet') {
    return baseStyles;
  }

  switch (interactionState) {
    case 'hover':
      return {
        ...baseStyles,
        transform: 'scale(1.05)',
        filter: 'brightness(1.2) drop-shadow(0 0 8px rgba(0, 195, 255, 0.6))',
        zIndex: 10,
      };
    case 'dragging':
      return {
        ...baseStyles,
        transform: 'scale(1.1) rotate(2deg)',
        filter: 'brightness(1.3) drop-shadow(0 4px 12px rgba(0, 195, 255, 0.8))',
        zIndex: 20,
        cursor: 'grabbing',
      };
    case 'dropping':
      return {
        ...baseStyles,
        transform: 'scale(1.02)',
        filter: 'brightness(1.1) drop-shadow(0 2px 6px rgba(0, 195, 255, 0.4))',
        animation: 'chessPieceDrop 300ms ease-out',
      };
    default:
      return baseStyles;
  }
};

/**
 * Component scaling animation for responsive transitions
 */
export const createComponentScalingEffect = (
  currentSize: number,
  targetSize: number,
  layoutMode: LayoutMode
): React.CSSProperties => {
  const scaleFactor = targetSize / currentSize;
  const animation = DESKTOP_ANIMATIONS.layoutTransition;

  return {
    transform: `scale(${scaleFactor})`,
    transition: `transform ${animation.duration}ms ${animation.easing}`,
    transformOrigin: 'center center',
  };
};

/**
 * Enhanced glow effect for desktop components
 */
export const createDesktopGlowEffect = (
  layoutMode: LayoutMode,
  intensity: 'low' | 'medium' | 'high' = 'medium',
  color: string = 'rgba(0, 195, 255, 0.6)'
): React.CSSProperties => {
  if (layoutMode === 'mobile' || layoutMode === 'tablet') {
    return {};
  }

  const intensityMap = {
    low: { blur: 10, spread: 2 },
    medium: { blur: 15, spread: 4 },
    high: { blur: 25, spread: 8 },
  };

  const { blur, spread } = intensityMap[intensity];

  return {
    boxShadow: `0 0 ${blur}px ${spread}px ${color}`,
    animation: `desktopGlow ${DESKTOP_ANIMATIONS.glow.duration}ms infinite ease-in-out`,
  };
};

/**
 * Performance-optimized animation utilities
 */
export const animationUtils = {
  /**
   * Check if reduced motion is preferred
   */
  prefersReducedMotion: (): boolean => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return false;
    }
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  /**
   * Get animation duration based on user preferences
   */
  getAnimationDuration: (baseDuration: number): number => {
    return animationUtils.prefersReducedMotion() ? 0 : baseDuration;
  },

  /**
   * Create performance-optimized animation styles
   */
  createOptimizedAnimation: (
    animationName: string,
    duration: number,
    easing: string = 'ease'
  ): React.CSSProperties => {
    const actualDuration = animationUtils.getAnimationDuration(duration);
    
    return {
      animation: actualDuration > 0 ? `${animationName} ${actualDuration}ms ${easing}` : 'none',
      willChange: 'transform, opacity',
      backfaceVisibility: 'hidden',
      perspective: '1000px',
    };
  },
};

/**
 * CSS keyframes for desktop animations
 */
export const DESKTOP_KEYFRAMES = `
  @keyframes desktopThinkingGlow {
    0% { 
      box-shadow: 0 0 15px rgba(0, 195, 255, 0.5), 0 0 5px rgba(0, 195, 255, 0.8) inset;
      transform: scale(1);
    }
    50% { 
      box-shadow: 0 0 30px rgba(0, 195, 255, 0.9), 0 0 12px rgba(0, 195, 255, 1) inset;
      transform: scale(1.02);
    }
    100% { 
      box-shadow: 0 0 15px rgba(0, 195, 255, 0.5), 0 0 5px rgba(0, 195, 255, 0.8) inset;
      transform: scale(1);
    }
  }

  @keyframes desktopGlow {
    0% { 
      box-shadow: 0 0 10px 2px rgba(0, 195, 255, 0.4);
    }
    50% { 
      box-shadow: 0 0 20px 4px rgba(0, 195, 255, 0.8);
    }
    100% { 
      box-shadow: 0 0 10px 2px rgba(0, 195, 255, 0.4);
    }
  }

  @keyframes chessPieceDrop {
    0% { 
      transform: scale(1.1) translateY(-4px);
    }
    50% { 
      transform: scale(1.05) translateY(2px);
    }
    100% { 
      transform: scale(1) translateY(0);
    }
  }

  @keyframes desktopHoverPulse {
    0% { 
      transform: scale(1);
      box-shadow: 0 0 10px rgba(0, 195, 255, 0.3);
    }
    50% { 
      transform: scale(1.02);
      box-shadow: 0 0 20px rgba(0, 195, 255, 0.6);
    }
    100% { 
      transform: scale(1);
      box-shadow: 0 0 10px rgba(0, 195, 255, 0.3);
    }
  }

  @keyframes layoutTransitionFade {
    0% { 
      opacity: 0;
      transform: translateY(10px);
    }
    100% { 
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes thinkingPulse {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(300%); }
  }

  @keyframes blink {
    0% { opacity: 0.3; }
    50% { opacity: 1; }
    100% { opacity: 0.3; }
  }

  @keyframes glow {
    0% { box-shadow: 0 0 15px rgba(0, 195, 255, 0.5), 0 0 5px rgba(0, 195, 255, 0.8) inset; }
    50% { box-shadow: 0 0 25px rgba(0, 195, 255, 0.8), 0 0 8px rgba(0, 195, 255, 0.9) inset; }
    100% { box-shadow: 0 0 15px rgba(0, 195, 255, 0.5), 0 0 5px rgba(0, 195, 255, 0.8) inset; }
  }
`;