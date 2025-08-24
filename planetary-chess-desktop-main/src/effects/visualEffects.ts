/**
 * Desktop visual effects and animations for the chess application
 * Optimized for desktop-only deployment
 */

import React from 'react';

// Desktop-only layout mode type
type LayoutMode = 'desktop';

export interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
}

// Desktop-optimized animation configurations
export const DESKTOP_ANIMATIONS = {
  hover: { duration: 200, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
  click: { duration: 150, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
  pieceInteraction: { duration: 250, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' },
  thinking: { duration: 2000, easing: 'ease-in-out' },
  layoutTransition: { duration: 400, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' },
  glow: { duration: 3000, easing: 'ease-in-out' },
};

// Desktop effect intensities
export const DESKTOP_EFFECTS = {
  subtle: {
    shadowBlur: 8,
    glowRadius: 4,
    color: 'rgba(0, 195, 255, 0.3)',
  },
  moderate: {
    shadowBlur: 12,
    glowRadius: 8,
    color: 'rgba(0, 195, 255, 0.5)',
  },
  intense: {
    shadowBlur: 20,
    glowRadius: 15,
    color: 'rgba(0, 195, 255, 0.7)',
  },
};

/**
 * Enhanced hover effect styles for desktop
 */
export const createDesktopHoverEffect = (
  layoutMode: LayoutMode = 'desktop',
  effectIntensity: 'subtle' | 'moderate' | 'intense' = 'moderate'
): React.CSSProperties => {
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
  layoutMode: LayoutMode = 'desktop',
  effectIntensity: 'subtle' | 'moderate' | 'intense' = 'moderate'
): React.CSSProperties => {
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
  layoutMode: LayoutMode = 'desktop',
  isThinking: boolean
): React.CSSProperties => {
  const baseStyles: React.CSSProperties = {
    transition: `all ${DESKTOP_ANIMATIONS.thinking.duration}ms ${DESKTOP_ANIMATIONS.thinking.easing}`,
  };

  if (!isThinking) {
    return baseStyles;
  }

  return {
    ...baseStyles,
    animation: `desktopThinkingGlow ${DESKTOP_ANIMATIONS.thinking.duration}ms infinite ${DESKTOP_ANIMATIONS.thinking.easing}`,
    boxShadow: '0 0 25px rgba(0, 195, 255, 0.8), 0 0 8px rgba(0, 195, 255, 0.9) inset',
  };
};

/**
 * Layout transition animation styles
 */
export const createLayoutTransitionEffect = (
  fromMode: LayoutMode = 'desktop',
  toMode: LayoutMode = 'desktop'
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
  layoutMode: LayoutMode = 'desktop',
  interactionState: 'idle' | 'hover' | 'dragging' | 'dropping'
): React.CSSProperties => {
  const baseStyles: React.CSSProperties = {
    transition: `all ${DESKTOP_ANIMATIONS.pieceInteraction.duration}ms ${DESKTOP_ANIMATIONS.pieceInteraction.easing}`,
  };

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
  layoutMode: LayoutMode = 'desktop'
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
  layoutMode: LayoutMode = 'desktop',
  intensity: 'low' | 'medium' | 'high' = 'medium',
  color: string = 'rgba(0, 195, 255, 0.6)'
): React.CSSProperties => {
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
    easing: string = 'ease-in-out'
  ): React.CSSProperties => ({
    animation: `${animationName} ${animationUtils.getAnimationDuration(duration)}ms ${easing}`,
    willChange: 'transform, opacity',
  }),
};

export default {
  DESKTOP_ANIMATIONS,
  DESKTOP_EFFECTS,
  createDesktopHoverEffect,
  createDesktopHoverActiveEffect,
  createAIThinkingAnimation,
  createLayoutTransitionEffect,
  createChessPieceInteractionEffect,
  createComponentScalingEffect,
  createDesktopGlowEffect,
  animationUtils,
};