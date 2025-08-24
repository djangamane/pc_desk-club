import { vi } from 'vitest';
import {
  createDesktopHoverEffect,
  createDesktopHoverActiveEffect,
  createAIThinkingAnimation,
  createLayoutTransitionEffect,
  createChessPieceInteractionEffect,
  createComponentScalingEffect,
  createDesktopGlowEffect,
  animationUtils,
  DESKTOP_ANIMATIONS,
  DESKTOP_EFFECTS,
} from '../visualEffects';
import { LayoutMode } from '../../types/responsive';

// Mock window.matchMedia for reduced motion tests
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

describe('Visual Effects System', () => {
  beforeEach(() => {
    // Reset matchMedia mock
    mockMatchMedia(false);
  });

  describe('Desktop Hover Effects', () => {
    it('should create basic hover effect for desktop', () => {
      const effect = createDesktopHoverEffect('desktop', 'moderate');
      
      expect(effect).toHaveProperty('transition');
      expect(effect).toHaveProperty('cursor', 'pointer');
      expect(effect).toHaveProperty('transform', 'translateY(0px) scale(1)');
      expect(effect).toHaveProperty('boxShadow');
      expect(effect.boxShadow).toContain('rgba(0, 195, 255, 0.6)');
    });

    it('should create enhanced hover effect for large desktop', () => {
      const effect = createDesktopHoverEffect('large-desktop', 'intense');
      
      expect(effect).toHaveProperty('transition');
      expect(effect.boxShadow).toContain('rgba(0, 195, 255, 1.0)');
    });

    it('should return empty object for mobile', () => {
      const effect = createDesktopHoverEffect('mobile', 'moderate');
      
      expect(Object.keys(effect)).toHaveLength(0);
    });

    it('should return empty object for tablet', () => {
      const effect = createDesktopHoverEffect('tablet', 'moderate');
      
      expect(Object.keys(effect)).toHaveLength(0);
    });

    it('should create active hover effect with transform and enhanced shadow', () => {
      const effect = createDesktopHoverActiveEffect('desktop', 'moderate');
      
      expect(effect).toHaveProperty('transform', 'translateY(-2px) scale(1.02)');
      expect(effect).toHaveProperty('filter', 'brightness(1.1)');
      expect(effect.boxShadow).toContain('rgba(0, 195, 255, 0.6)');
    });

    it('should vary effect intensity based on parameter', () => {
      const subtleEffect = createDesktopHoverEffect('desktop', 'subtle');
      const intenseEffect = createDesktopHoverEffect('desktop', 'intense');
      
      expect(subtleEffect.boxShadow).toContain('rgba(0, 195, 255, 0.3)');
      expect(intenseEffect.boxShadow).toContain('rgba(0, 195, 255, 1.0)');
    });
  });

  describe('AI Thinking Animation', () => {
    it('should create basic thinking animation', () => {
      const animation = createAIThinkingAnimation('desktop', true);
      
      expect(animation).toHaveProperty('transition');
      expect(animation).toHaveProperty('animation');
      expect(animation.animation).toContain('desktopThinkingGlow');
    });

    it('should create enhanced animation for desktop when thinking', () => {
      const animation = createAIThinkingAnimation('desktop', true);
      
      expect(animation.animation).toContain('desktopThinkingGlow');
      expect(animation).toHaveProperty('boxShadow');
      expect(animation.boxShadow).toContain('rgba(0, 195, 255, 0.8)');
    });

    it('should create standard animation for mobile when thinking', () => {
      const animation = createAIThinkingAnimation('mobile', true);
      
      expect(animation.animation).toContain('glow');
      expect(animation.animation).not.toContain('desktopThinkingGlow');
    });

    it('should return base styles when not thinking', () => {
      const animation = createAIThinkingAnimation('desktop', false);
      
      expect(animation).toHaveProperty('transition');
      expect(animation).not.toHaveProperty('animation');
      expect(animation).not.toHaveProperty('boxShadow');
    });
  });

  describe('Layout Transition Effects', () => {
    it('should create transition effect with proper timing', () => {
      const effect = createLayoutTransitionEffect('mobile', 'desktop');
      
      expect(effect).toHaveProperty('transition');
      expect(effect.transition).toContain('300ms');
      expect(effect.transition).toContain('cubic-bezier(0.25, 0.46, 0.45, 0.94)');
      expect(effect).toHaveProperty('willChange', 'transform, opacity, width, height');
    });

    it('should handle same layout mode transition', () => {
      const effect = createLayoutTransitionEffect('desktop', 'desktop');
      
      expect(effect).toHaveProperty('transition');
      expect(effect).toHaveProperty('willChange');
    });
  });

  describe('Chess Piece Interaction Effects', () => {
    it('should create idle state effect', () => {
      const effect = createChessPieceInteractionEffect('desktop', 'idle');
      
      expect(effect).toHaveProperty('transition');
      expect(effect.transition).toContain('150ms');
      expect(effect.transition).toContain('cubic-bezier(0.68, -0.55, 0.265, 1.55)');
    });

    it('should create hover state effect for desktop', () => {
      const effect = createChessPieceInteractionEffect('desktop', 'hover');
      
      expect(effect).toHaveProperty('transform', 'scale(1.05)');
      expect(effect).toHaveProperty('filter');
      expect(effect.filter).toContain('brightness(1.2)');
      expect(effect.filter).toContain('drop-shadow');
      expect(effect).toHaveProperty('zIndex', 10);
    });

    it('should create dragging state effect for desktop', () => {
      const effect = createChessPieceInteractionEffect('desktop', 'dragging');
      
      expect(effect).toHaveProperty('transform', 'scale(1.1) rotate(2deg)');
      expect(effect).toHaveProperty('filter');
      expect(effect.filter).toContain('brightness(1.3)');
      expect(effect).toHaveProperty('zIndex', 20);
      expect(effect).toHaveProperty('cursor', 'grabbing');
    });

    it('should create dropping state effect for desktop', () => {
      const effect = createChessPieceInteractionEffect('desktop', 'dropping');
      
      expect(effect).toHaveProperty('transform', 'scale(1.02)');
      expect(effect).toHaveProperty('animation', 'chessPieceDrop 300ms ease-out');
    });

    it('should return basic styles for mobile interactions', () => {
      const hoverEffect = createChessPieceInteractionEffect('mobile', 'hover');
      const dragEffect = createChessPieceInteractionEffect('mobile', 'dragging');
      
      expect(hoverEffect).toHaveProperty('transition');
      expect(hoverEffect).not.toHaveProperty('transform');
      expect(dragEffect).toHaveProperty('transition');
      expect(dragEffect).not.toHaveProperty('transform');
    });
  });

  describe('Component Scaling Effects', () => {
    it('should create scaling effect with proper transform', () => {
      const effect = createComponentScalingEffect(400, 600, 'desktop');
      
      expect(effect).toHaveProperty('transform', 'scale(1.5)');
      expect(effect).toHaveProperty('transition');
      expect(effect.transition).toContain('300ms');
      expect(effect).toHaveProperty('transformOrigin', 'center center');
    });

    it('should handle same size scaling', () => {
      const effect = createComponentScalingEffect(500, 500, 'desktop');
      
      expect(effect).toHaveProperty('transform', 'scale(1)');
    });

    it('should handle downscaling', () => {
      const effect = createComponentScalingEffect(800, 400, 'desktop');
      
      expect(effect).toHaveProperty('transform', 'scale(0.5)');
    });
  });

  describe('Desktop Glow Effects', () => {
    it('should create glow effect for desktop', () => {
      const effect = createDesktopGlowEffect('desktop', 'medium');
      
      expect(effect).toHaveProperty('boxShadow');
      expect(effect.boxShadow).toContain('15px 4px');
      expect(effect).toHaveProperty('animation');
      expect(effect.animation).toContain('desktopGlow');
    });

    it('should return empty object for mobile', () => {
      const effect = createDesktopGlowEffect('mobile', 'medium');
      
      expect(Object.keys(effect)).toHaveLength(0);
    });

    it('should vary intensity levels', () => {
      const lowEffect = createDesktopGlowEffect('desktop', 'low');
      const highEffect = createDesktopGlowEffect('desktop', 'high');
      
      expect(lowEffect.boxShadow).toContain('10px 2px');
      expect(highEffect.boxShadow).toContain('25px 8px');
    });

    it('should accept custom color', () => {
      const customColor = 'rgba(255, 0, 0, 0.5)';
      const effect = createDesktopGlowEffect('desktop', 'medium', customColor);
      
      expect(effect.boxShadow).toContain(customColor);
    });
  });

  describe('Animation Utilities', () => {
    it('should detect reduced motion preference', () => {
      mockMatchMedia(true);
      expect(animationUtils.prefersReducedMotion()).toBe(true);
      
      mockMatchMedia(false);
      expect(animationUtils.prefersReducedMotion()).toBe(false);
    });

    it('should return 0 duration when reduced motion is preferred', () => {
      mockMatchMedia(true);
      const duration = animationUtils.getAnimationDuration(1000);
      expect(duration).toBe(0);
    });

    it('should return original duration when reduced motion is not preferred', () => {
      mockMatchMedia(false);
      const duration = animationUtils.getAnimationDuration(1000);
      expect(duration).toBe(1000);
    });

    it('should create optimized animation with performance properties', () => {
      mockMatchMedia(false);
      const animation = animationUtils.createOptimizedAnimation('testAnimation', 1000, 'ease-in');
      
      expect(animation).toHaveProperty('animation', 'testAnimation 1000ms ease-in');
      expect(animation).toHaveProperty('willChange', 'transform, opacity');
      expect(animation).toHaveProperty('backfaceVisibility', 'hidden');
      expect(animation).toHaveProperty('perspective', '1000px');
    });

    it('should create no animation when reduced motion is preferred', () => {
      mockMatchMedia(true);
      const animation = animationUtils.createOptimizedAnimation('testAnimation', 1000);
      
      expect(animation).toHaveProperty('animation', 'none');
    });
  });

  describe('Animation Configuration Constants', () => {
    it('should have proper animation durations', () => {
      expect(DESKTOP_ANIMATIONS.hover.duration).toBe(200);
      expect(DESKTOP_ANIMATIONS.thinking.duration).toBe(1500);
      expect(DESKTOP_ANIMATIONS.layoutTransition.duration).toBe(300);
      expect(DESKTOP_ANIMATIONS.pieceInteraction.duration).toBe(150);
      expect(DESKTOP_ANIMATIONS.glow.duration).toBe(2000);
    });

    it('should have proper easing functions', () => {
      expect(DESKTOP_ANIMATIONS.hover.easing).toBe('cubic-bezier(0.4, 0, 0.2, 1)');
      expect(DESKTOP_ANIMATIONS.thinking.easing).toBe('ease-in-out');
      expect(DESKTOP_ANIMATIONS.layoutTransition.easing).toBe('cubic-bezier(0.25, 0.46, 0.45, 0.94)');
      expect(DESKTOP_ANIMATIONS.pieceInteraction.easing).toBe('cubic-bezier(0.68, -0.55, 0.265, 1.55)');
    });

    it('should have proper effect configurations', () => {
      expect(DESKTOP_EFFECTS.subtle.intensity).toBe(0.3);
      expect(DESKTOP_EFFECTS.moderate.intensity).toBe(0.6);
      expect(DESKTOP_EFFECTS.intense.intensity).toBe(1.0);
      
      expect(DESKTOP_EFFECTS.subtle.shadowBlur).toBe(10);
      expect(DESKTOP_EFFECTS.moderate.shadowBlur).toBe(15);
      expect(DESKTOP_EFFECTS.intense.shadowBlur).toBe(25);
    });
  });
});

describe('Performance and Accessibility', () => {
  it('should respect reduced motion preferences in all animations', () => {
    mockMatchMedia(true);
    
    const hoverEffect = createDesktopHoverEffect('desktop', 'moderate');
    const thinkingAnimation = createAIThinkingAnimation('desktop', true);
    const optimizedAnimation = animationUtils.createOptimizedAnimation('test', 1000);
    
    // Hover effects should still work (they're not motion-heavy)
    expect(hoverEffect).toHaveProperty('transition');
    
    // Optimized animations should be disabled
    expect(optimizedAnimation.animation).toBe('none');
  });

  it('should use performance-optimized properties', () => {
    const layoutTransition = createLayoutTransitionEffect('mobile', 'desktop');
    const optimizedAnimation = animationUtils.createOptimizedAnimation('test', 1000);
    
    expect(layoutTransition).toHaveProperty('willChange');
    expect(optimizedAnimation).toHaveProperty('willChange', 'transform, opacity');
    expect(optimizedAnimation).toHaveProperty('backfaceVisibility', 'hidden');
    expect(optimizedAnimation).toHaveProperty('perspective', '1000px');
  });

  it('should handle edge cases gracefully', () => {
    // Test with undefined/null layout modes
    const nullEffect = createDesktopHoverEffect(null as any, 'moderate');
    expect(Object.keys(nullEffect)).toHaveLength(0);
    
    // Test with zero scaling
    const zeroScale = createComponentScalingEffect(100, 0, 'desktop');
    expect(zeroScale.transform).toBe('scale(0)');
    
    // Test with negative durations
    const negativeDuration = animationUtils.getAnimationDuration(-100);
    expect(negativeDuration).toBe(-100); // Should pass through, let CSS handle it
  });
});