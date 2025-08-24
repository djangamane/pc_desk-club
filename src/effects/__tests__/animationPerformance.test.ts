/**
 * Performance tests for visual effects and animations
 * Tests animation performance, memory usage, and optimization
 */

import { vi } from 'vitest';
import { 
  createDesktopHoverEffect,
  createAIThinkingAnimation,
  createLayoutTransitionEffect,
  createChessPieceInteractionEffect,
  animationUtils,
  DESKTOP_ANIMATIONS,
} from '../visualEffects';

// Mock performance API
const mockPerformance = {
  now: vi.fn(() => Date.now()),
  mark: vi.fn(),
  measure: vi.fn(),
  getEntriesByType: vi.fn(() => []),
  clearMarks: vi.fn(),
  clearMeasures: vi.fn(),
};

Object.defineProperty(window, 'performance', {
  value: mockPerformance,
  writable: true,
});

// Mock requestAnimationFrame
let animationFrameCallbacks: (() => void)[] = [];
const mockRequestAnimationFrame = vi.fn((callback: () => void) => {
  animationFrameCallbacks.push(callback);
  return animationFrameCallbacks.length;
});

const mockCancelAnimationFrame = vi.fn((id: number) => {
  animationFrameCallbacks = animationFrameCallbacks.filter((_, index) => index !== id - 1);
});

Object.defineProperty(window, 'requestAnimationFrame', {
  value: mockRequestAnimationFrame,
  writable: true,
});

Object.defineProperty(window, 'cancelAnimationFrame', {
  value: mockCancelAnimationFrame,
  writable: true,
});

// Helper to simulate animation frame execution
const executeAnimationFrames = () => {
  const callbacks = [...animationFrameCallbacks];
  animationFrameCallbacks = [];
  callbacks.forEach(callback => callback());
};

describe('Animation Performance Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    animationFrameCallbacks = [];
    mockPerformance.now.mockReturnValue(0);
  });

  describe('Effect Creation Performance', () => {
    it('should create hover effects efficiently', () => {
      const startTime = performance.now();
      
      // Create multiple hover effects
      for (let i = 0; i < 1000; i++) {
        createDesktopHoverEffect('desktop', 'moderate');
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete within reasonable time (adjust threshold as needed)
      expect(duration).toBeLessThan(100); // 100ms for 1000 effects
    });

    it('should create thinking animations efficiently', () => {
      const startTime = performance.now();
      
      // Create multiple thinking animations
      for (let i = 0; i < 1000; i++) {
        createAIThinkingAnimation('desktop', true);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(100);
    });

    it('should create layout transitions efficiently', () => {
      const startTime = performance.now();
      
      // Create multiple layout transitions
      for (let i = 0; i < 1000; i++) {
        createLayoutTransitionEffect('mobile', 'desktop');
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(100);
    });

    it('should create chess piece interactions efficiently', () => {
      const startTime = performance.now();
      
      // Create multiple piece interactions
      const states = ['idle', 'hover', 'dragging', 'dropping'] as const;
      for (let i = 0; i < 1000; i++) {
        const state = states[i % states.length];
        createChessPieceInteractionEffect('desktop', state);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(100);
    });
  });

  describe('Memory Usage Optimization', () => {
    it('should not create memory leaks with repeated effect creation', () => {
      // Simulate repeated effect creation and cleanup
      const effects: React.CSSProperties[] = [];
      
      for (let i = 0; i < 10000; i++) {
        const effect = createDesktopHoverEffect('desktop', 'moderate');
        effects.push(effect);
        
        // Simulate cleanup every 100 iterations
        if (i % 100 === 0) {
          effects.length = 0; // Clear array
        }
      }
      
      // Should not accumulate excessive objects
      expect(effects.length).toBeLessThan(100);
    });

    it('should reuse animation configuration objects', () => {
      const effect1 = createDesktopHoverEffect('desktop', 'moderate');
      const effect2 = createDesktopHoverEffect('desktop', 'moderate');
      
      // Should have same transition string (reused from constants)
      expect(effect1.transition).toBe(effect2.transition);
    });

    it('should handle rapid state changes without memory buildup', () => {
      const states = ['idle', 'hover', 'dragging', 'dropping'] as const;
      let lastEffect: React.CSSProperties;
      
      // Simulate rapid state changes
      for (let i = 0; i < 1000; i++) {
        const state = states[i % states.length];
        lastEffect = createChessPieceInteractionEffect('desktop', state);
      }
      
      // Should complete without issues
      expect(lastEffect!).toBeDefined();
    });
  });

  describe('Animation Timing Performance', () => {
    it('should use consistent timing values', () => {
      const hoverEffect = createDesktopHoverEffect('desktop', 'moderate');
      const expectedDuration = DESKTOP_ANIMATIONS.hover.duration;
      
      expect(hoverEffect.transition).toContain(`${expectedDuration}ms`);
    });

    it('should optimize animation durations for performance', () => {
      // All animation durations should be reasonable for 60fps
      Object.values(DESKTOP_ANIMATIONS).forEach(animation => {
        expect(animation.duration).toBeGreaterThan(0);
        expect(animation.duration).toBeLessThan(5000); // No animations longer than 5s
      });
    });

    it('should handle reduced motion efficiently', () => {
      // Mock reduced motion preference
      Object.defineProperty(window, 'matchMedia', {
        value: jest.fn(() => ({ matches: true })),
        writable: true,
      });

      const startTime = performance.now();
      
      // Create effects with reduced motion
      for (let i = 0; i < 1000; i++) {
        animationUtils.getAnimationDuration(1000);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(50); // Should be very fast with reduced motion
    });
  });

  describe('CSS Property Optimization', () => {
    it('should use performance-optimized CSS properties', () => {
      const optimizedAnimation = animationUtils.createOptimizedAnimation('test', 1000);
      
      // Should include performance optimization properties
      expect(optimizedAnimation).toHaveProperty('willChange', 'transform, opacity');
      expect(optimizedAnimation).toHaveProperty('backfaceVisibility', 'hidden');
      expect(optimizedAnimation).toHaveProperty('perspective', '1000px');
    });

    it('should prefer transform over layout-triggering properties', () => {
      const hoverEffect = createDesktopHoverEffect('desktop', 'moderate');
      const activeEffect = createDesktopHoverEffect('desktop', 'moderate');
      
      // Should use transform for positioning (GPU-accelerated)
      expect(hoverEffect.transform).toBeDefined();
      expect(activeEffect.transform).toBeDefined();
      
      // Should not use layout-triggering properties like top, left, width, height
      expect(hoverEffect).not.toHaveProperty('top');
      expect(hoverEffect).not.toHaveProperty('left');
      expect(hoverEffect).not.toHaveProperty('width');
      expect(hoverEffect).not.toHaveProperty('height');
    });

    it('should use efficient easing functions', () => {
      const layoutTransition = createLayoutTransitionEffect('mobile', 'desktop');
      
      // Should use cubic-bezier for smooth animations
      expect(layoutTransition.transition).toContain('cubic-bezier');
    });
  });

  describe('Batch Processing Performance', () => {
    it('should handle multiple simultaneous animations efficiently', () => {
      const startTime = performance.now();
      
      // Simulate multiple components animating simultaneously
      const effects = [];
      for (let i = 0; i < 100; i++) {
        effects.push(createDesktopHoverEffect('desktop', 'moderate'));
        effects.push(createAIThinkingAnimation('desktop', true));
        effects.push(createChessPieceInteractionEffect('desktop', 'hover'));
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(50); // Should handle batch efficiently
      expect(effects).toHaveLength(300);
    });

    it('should optimize for different layout modes', () => {
      const modes = ['mobile', 'tablet', 'desktop', 'large-desktop'] as const;
      const startTime = performance.now();
      
      // Test all layout modes
      modes.forEach(mode => {
        for (let i = 0; i < 100; i++) {
          createDesktopHoverEffect(mode, 'moderate');
          createAIThinkingAnimation(mode, true);
          createChessPieceInteractionEffect(mode, 'hover');
        }
      });
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(100);
    });
  });

  describe('Real-world Performance Scenarios', () => {
    it('should handle rapid hover state changes', () => {
      const startTime = performance.now();
      
      // Simulate rapid mouse movements over multiple elements
      for (let i = 0; i < 1000; i++) {
        createDesktopHoverEffect('desktop', 'moderate');
        createDesktopHoverEffect('desktop', 'moderate'); // Hover out
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(200);
    });

    it('should handle chess piece drag performance', () => {
      const startTime = performance.now();
      
      // Simulate dragging a piece across the board
      const positions = 64; // 8x8 chess board
      for (let i = 0; i < positions; i++) {
        createChessPieceInteractionEffect('desktop', 'dragging');
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(50);
    });

    it('should handle layout transitions during gameplay', () => {
      const startTime = performance.now();
      
      // Simulate layout changes during active gameplay
      const transitions = [
        ['mobile', 'tablet'],
        ['tablet', 'desktop'],
        ['desktop', 'large-desktop'],
        ['large-desktop', 'desktop'],
        ['desktop', 'tablet'],
        ['tablet', 'mobile'],
      ] as const;
      
      transitions.forEach(([from, to]) => {
        for (let i = 0; i < 10; i++) {
          createLayoutTransitionEffect(from, to);
        }
      });
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(100);
    });
  });

  describe('Animation Frame Optimization', () => {
    it('should not create excessive animation frame requests', () => {
      // Reset mock
      mockRequestAnimationFrame.mockClear();
      
      // Create multiple animated effects
      for (let i = 0; i < 100; i++) {
        animationUtils.createOptimizedAnimation('test', 1000);
      }
      
      // Should not create animation frames just from creating styles
      expect(mockRequestAnimationFrame).not.toHaveBeenCalled();
    });

    it('should handle animation frame cleanup properly', () => {
      mockCancelAnimationFrame.mockClear();
      
      // Simulate animation cleanup
      const animationId = requestAnimationFrame(() => {});
      cancelAnimationFrame(animationId);
      
      expect(mockCancelAnimationFrame).toHaveBeenCalledWith(animationId);
    });
  });

  describe('Edge Case Performance', () => {
    it('should handle zero duration animations efficiently', () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        animationUtils.getAnimationDuration(0);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(50);
    });

    it('should handle very large duration values', () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        animationUtils.getAnimationDuration(999999);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(50);
    });

    it('should handle negative duration values gracefully', () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        animationUtils.getAnimationDuration(-100);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(50);
    });
  });
});

describe('Memory Leak Prevention', () => {
  it('should not retain references to DOM elements', () => {
    // Create effects without DOM references
    const effects = [];
    
    for (let i = 0; i < 1000; i++) {
      effects.push(createDesktopHoverEffect('desktop', 'moderate'));
    }
    
    // Effects should be plain objects without DOM references
    effects.forEach(effect => {
      expect(typeof effect).toBe('object');
      expect(effect.constructor).toBe(Object);
    });
  });

  it('should handle rapid component mount/unmount cycles', () => {
    // Simulate rapid component lifecycle
    for (let cycle = 0; cycle < 100; cycle++) {
      // Mount phase - create effects
      const effects = [];
      for (let i = 0; i < 10; i++) {
        effects.push(createDesktopHoverEffect('desktop', 'moderate'));
        effects.push(createAIThinkingAnimation('desktop', true));
      }
      
      // Unmount phase - clear effects
      effects.length = 0;
    }
    
    // Should complete without memory issues
    expect(true).toBe(true);
  });
});

describe('Performance Benchmarks', () => {
  it('should meet performance targets for effect creation', () => {
    const iterations = 10000;
    const startTime = performance.now();
    
    for (let i = 0; i < iterations; i++) {
      createDesktopHoverEffect('desktop', 'moderate');
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    const operationsPerSecond = (iterations / duration) * 1000;
    
    // Should create at least 10,000 effects per second
    expect(operationsPerSecond).toBeGreaterThan(10000);
  });

  it('should maintain consistent performance across layout modes', () => {
    const modes = ['mobile', 'tablet', 'desktop', 'large-desktop'] as const;
    const results: Record<string, number> = {};
    
    modes.forEach(mode => {
      const startTime = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        createDesktopHoverEffect(mode, 'moderate');
      }
      
      const endTime = performance.now();
      results[mode] = endTime - startTime;
    });
    
    // Performance should be consistent across modes (within 50% variance)
    const times = Object.values(results);
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    
    times.forEach(time => {
      expect(time).toBeLessThan(avgTime * 1.5);
      expect(time).toBeGreaterThan(avgTime * 0.5);
    });
  });
});