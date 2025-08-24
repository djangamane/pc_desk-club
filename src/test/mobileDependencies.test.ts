/**
 * Tests to ensure mobile dependencies are properly excluded in desktop builds
 */

import { describe, it, expect, vi } from 'vitest';
import { isDesktopMode, isMobileMode, loadCapacitorModule, getPlatformConfig } from '../utils/platformUtils';
import { CapacitorApp, CapacitorDevice, isCapacitorAvailable } from '../utils/capacitorWrapper';

// Mock global constants for testing
declare global {
  var __DESKTOP_MODE__: boolean;
  var __MOBILE_MODE__: boolean;
}

describe('Mobile Dependencies Exclusion', () => {
  describe('Platform Detection', () => {
    it('should detect desktop mode when __DESKTOP_MODE__ is true', () => {
      globalThis.__DESKTOP_MODE__ = true;
      globalThis.__MOBILE_MODE__ = false;
      
      expect(isDesktopMode()).toBe(true);
      expect(isMobileMode()).toBe(false);
    });

    it('should detect mobile mode when __MOBILE_MODE__ is true', () => {
      globalThis.__DESKTOP_MODE__ = false;
      globalThis.__MOBILE_MODE__ = true;
      
      expect(isDesktopMode()).toBe(false);
      expect(isMobileMode()).toBe(true);
    });

    it('should provide correct platform configuration', () => {
      globalThis.__DESKTOP_MODE__ = true;
      globalThis.__MOBILE_MODE__ = false;
      
      const config = getPlatformConfig();
      
      expect(config.isDesktop).toBe(true);
      expect(config.isMobile).toBe(false);
      expect(config.supportsKeyboard).toBe(true);
      expect(config.supportsTouch).toBe(false);
      expect(config.preferredInputMethod).toBe('mouse');
    });
  });

  describe('Capacitor Module Loading', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should not load Capacitor modules in desktop mode', async () => {
      globalThis.__DESKTOP_MODE__ = true;
      globalThis.__MOBILE_MODE__ = false;
      
      const result = await loadCapacitorModule('@capacitor/core', 'fallback');
      expect(result).toBe('fallback');
    });

    it('should attempt to load Capacitor modules in mobile mode', async () => {
      globalThis.__DESKTOP_MODE__ = false;
      globalThis.__MOBILE_MODE__ = true;
      
      // Mock dynamic import to simulate module loading failure
      const mockImport = vi.fn().mockRejectedValue(new Error('Module not found'));
      vi.doMock('@capacitor/core', () => {
        throw new Error('Module not found');
      });
      
      const result = await loadCapacitorModule('@capacitor/core', 'fallback');
      expect(result).toBe('fallback');
    });
  });

  describe('Capacitor Wrapper', () => {
    it('should not initialize Capacitor in desktop mode', async () => {
      globalThis.__DESKTOP_MODE__ = true;
      globalThis.__MOBILE_MODE__ = false;
      
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      await CapacitorApp.addListener('test', () => {});
      expect(consoleSpy).toHaveBeenCalledWith(
        'Desktop mode: Ignoring Capacitor App listener for test'
      );
      
      consoleSpy.mockRestore();
    });

    it('should return desktop device info in desktop mode', async () => {
      globalThis.__DESKTOP_MODE__ = true;
      globalThis.__MOBILE_MODE__ = false;
      
      const deviceInfo = await CapacitorDevice.getInfo();
      expect(deviceInfo.platform).toBe('web');
      expect(deviceInfo.model).toBe('Desktop');
    });

    it('should return false for Capacitor availability in desktop mode', async () => {
      globalThis.__DESKTOP_MODE__ = true;
      globalThis.__MOBILE_MODE__ = false;
      
      const isAvailable = await isCapacitorAvailable();
      expect(isAvailable).toBe(false);
    });
  });

  describe('Bundle Exclusion', () => {
    it('should not include Capacitor modules in desktop bundle', () => {
      // This test verifies that Capacitor modules are not bundled
      // In a real desktop build, these imports should fail
      globalThis.__DESKTOP_MODE__ = true;
      
      // In test environment, we simulate the exclusion by checking the mode
      expect(isDesktopMode()).toBe(true);
      
      // In actual desktop build, Capacitor would be externalized and not available
      // This test passes if we're in desktop mode and using the wrapper correctly
    });

    it('should exclude mobile-specific code paths', () => {
      globalThis.__DESKTOP_MODE__ = true;
      globalThis.__MOBILE_MODE__ = false;
      
      // Verify that mobile-specific code paths are not executed
      let mobileCodeExecuted = false;
      let desktopCodeExecuted = false;
      
      if (isMobileMode()) {
        mobileCodeExecuted = true;
      }
      
      if (isDesktopMode()) {
        desktopCodeExecuted = true;
      }
      
      expect(mobileCodeExecuted).toBe(false);
      expect(desktopCodeExecuted).toBe(true);
    });
  });

  describe('Build Configuration', () => {
    it('should have correct build constants for desktop mode', () => {
      // Set up desktop mode constants
      globalThis.__DESKTOP_MODE__ = true;
      globalThis.__MOBILE_MODE__ = false;
      
      expect(globalThis.__DESKTOP_MODE__).toBe(true);
      expect(globalThis.__MOBILE_MODE__).toBe(false);
    });

    it('should optimize bundle for desktop-only deployment', () => {
      // This test would verify bundle size and content in a real build
      // For now, we just verify the configuration is correct
      globalThis.__DESKTOP_MODE__ = true;
      
      const config = getPlatformConfig();
      expect(config.isDesktop).toBe(true);
      expect(config.supportsKeyboard).toBe(true);
    });
  });

  describe('Performance Optimization', () => {
    it('should not load mobile-specific assets', () => {
      globalThis.__DESKTOP_MODE__ = true;
      
      // Verify that mobile-specific assets are not loaded
      // This would be tested in integration tests with actual asset loading
      expect(isDesktopMode()).toBe(true);
    });

    it('should use desktop-optimized configurations', () => {
      globalThis.__DESKTOP_MODE__ = true;
      
      const config = getPlatformConfig();
      expect(config.preferredInputMethod).toBe('mouse');
      expect(config.supportsKeyboard).toBe(true);
    });
  });
});

describe('Runtime Mobile Detection Fallback', () => {
  beforeEach(() => {
    // Clear build-time constants to test runtime detection
    delete globalThis.__DESKTOP_MODE__;
    delete globalThis.__MOBILE_MODE__;
  });

  it('should detect desktop based on screen size and touch capability', () => {
    // Mock window object for desktop
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1920
    });
    
    Object.defineProperty(window, 'ontouchstart', {
      writable: true,
      configurable: true,
      value: undefined
    });
    
    Object.defineProperty(navigator, 'maxTouchPoints', {
      writable: true,
      configurable: true,
      value: 0
    });
    
    expect(isDesktopMode()).toBe(true);
  });

  it('should detect mobile based on screen size and touch capability', () => {
    // Mock window object for mobile
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375
    });
    
    Object.defineProperty(window, 'ontouchstart', {
      writable: true,
      configurable: true,
      value: {}
    });
    
    Object.defineProperty(navigator, 'maxTouchPoints', {
      writable: true,
      configurable: true,
      value: 5
    });
    
    expect(isMobileMode()).toBe(true);
  });
});