import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createDesktopHoverEffect,
  createDesktopHoverActiveEffect,
  createAIThinkingAnimation,
  createLayoutTransitionEffect,
  createChessPieceInteractionEffect,
  animationUtils,
  DESKTOP_ANIMATIONS,
  DESKTOP_EFFECTS,
} from '../visualEffects';

// Mock window.matchMedia
const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
      matches,
      media: '(prefers-reduced-motion: reduce)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

describe('Visual Effects Basic Tests', () => {
  beforeEach(() => {
    mockMatchMedia(false);
  });

  describe('Desktop Hover Effects', () => {
    it('should create hover effect for desktop', () => {
      const effect = createDesktopHoverEffect('desktop', 'moderate');
      
      expect(effect).toHaveProperty('transition');
      expect(effect).toHaveProperty('cursor', 'pointer');
      expect(effect).toHaveProperty('transform');
      expect(effect).toHaveProperty('boxShadow');
    });

    it('should return empty object for mobile', () => {
      const effect = createDesktopHoverEffect('mobile', 'moderate');
      
      expect(Object.keys(effect)).toHaveLength(0);
    });

    it('should create active hover effect', () => {
      const effect = createDesktopHoverActiveEffect('desktop', 'moderate');
      
      expect(effect).toHaveProperty('transform');
      expect(effect).toHaveProperty('filter');
      expect(effect).toHaveProperty('boxShadow');
    });
  });

  describe('AI Thinking Animation', () => {
    it('should create thinking animation for desktop', () => {
      const animation = createAIThinkingAnimation('desktop', true);
      
      expect(animation).toHaveProperty('transition');
      expect(animation).toHaveProperty('animation');
      expect(animation).toHaveProperty('boxShadow');
    });

    it('should return base styles when not thinking', () => {
      const animation = createAIThinkingAnimation('desktop', false);
      
      expect(animation).toHaveProperty('transition');
      expect(animation).not.toHaveProperty('animation');
    });
  });

  describe('Layout Transition Effects', () => {
    it('should create transition effect', () => {
      const effect = createLayoutTransitionEffect('mobile', 'desktop');
      
      expect(effect).toHaveProperty('transition');
      expect(effect).toHaveProperty('willChange');
    });
  });

  describe('Chess Piece Interaction Effects', () => {
    it('should create idle state effect', () => {
      const effect = createChessPieceInteractionEffect('desktop', 'idle');
      
      expect(effect).toHaveProperty('transition');
    });

    it('should create hover state effect for desktop', () => {
      const effect = createChessPieceInteractionEffect('desktop', 'hover');
      
      expect(effect).toHaveProperty('transform');
      expect(effect).toHaveProperty('filter');
      expect(effect).toHaveProperty('zIndex');
    });
  });

  describe('Animation Utilities', () => {
    it('should detect reduced motion preference', () => {
      mockMatchMedia(true);
      expect(animationUtils.prefersReducedMotion()).toBe(true);
      
      mockMatchMedia(false);
      expect(animationUtils.prefersReducedMotion()).toBe(false);
    });

    it('should return correct animation duration', () => {
      mockMatchMedia(false);
      expect(animationUtils.getAnimationDuration(1000)).toBe(1000);
      
      mockMatchMedia(true);
      expect(animationUtils.getAnimationDuration(1000)).toBe(0);
    });

    it('should create optimized animation', () => {
      mockMatchMedia(false);
      const animation = animationUtils.createOptimizedAnimation('test', 1000);
      
      expect(animation).toHaveProperty('animation');
      expect(animation).toHaveProperty('willChange');
      expect(animation).toHaveProperty('backfaceVisibility');
    });
  });

  describe('Configuration Constants', () => {
    it('should have proper animation durations', () => {
      expect(DESKTOP_ANIMATIONS.hover.duration).toBe(200);
      expect(DESKTOP_ANIMATIONS.thinking.duration).toBe(1500);
      expect(DESKTOP_ANIMATIONS.layoutTransition.duration).toBe(300);
    });

    it('should have proper effect configurations', () => {
      expect(DESKTOP_EFFECTS.subtle.intensity).toBe(0.3);
      expect(DESKTOP_EFFECTS.moderate.intensity).toBe(0.6);
      expect(DESKTOP_EFFECTS.intense.intensity).toBe(1.0);
    });
  });
});