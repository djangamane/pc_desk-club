/**
 * Capacitor wrapper that conditionally loads mobile dependencies
 */

import { isMobileMode, loadCapacitorModule } from './platformUtils';

// Type definitions for Capacitor (without importing the actual modules)
interface CapacitorApp {
  addListener: (eventName: string, callback: (data: any) => void) => void;
  removeAllListeners: () => void;
}

interface CapacitorDevice {
  getInfo: () => Promise<{ platform: string; model: string }>;
}

/**
 * Conditional Capacitor App wrapper
 */
export const CapacitorApp = {
  addListener: async (eventName: string, callback: (data: any) => void) => {
    if (!isMobileMode()) {
      console.log(`Desktop mode: Ignoring Capacitor App listener for ${eventName}`);
      return;
    }
    
    const app = await loadCapacitorModule<CapacitorApp>('@capacitor/app');
    if (app) {
      app.addListener(eventName, callback);
    }
  },
  
  removeAllListeners: async () => {
    if (!isMobileMode()) {
      return;
    }
    
    const app = await loadCapacitorModule<CapacitorApp>('@capacitor/app');
    if (app) {
      app.removeAllListeners();
    }
  }
};

/**
 * Conditional Capacitor Device wrapper
 */
export const CapacitorDevice = {
  getInfo: async () => {
    if (!isMobileMode()) {
      // Return desktop-like device info
      return {
        platform: 'web',
        model: 'Desktop'
      };
    }
    
    const device = await loadCapacitorModule<CapacitorDevice>('@capacitor/device');
    if (device) {
      return device.getInfo();
    }
    
    // Fallback for mobile without Capacitor
    return {
      platform: 'web',
      model: 'Mobile Web'
    };
  }
};

/**
 * Check if Capacitor is available and loaded
 */
export const isCapacitorAvailable = async (): Promise<boolean> => {
  if (!isMobileMode()) {
    return false;
  }
  
  try {
    const core = await loadCapacitorModule('@capacitor/core');
    return core !== null;
  } catch {
    return false;
  }
};

/**
 * Initialize Capacitor only in mobile mode
 */
export const initializeCapacitor = async (): Promise<void> => {
  if (!isMobileMode()) {
    console.log('Desktop mode: Skipping Capacitor initialization');
    return;
  }
  
  try {
    const core = await loadCapacitorModule('@capacitor/core');
    if (core) {
      console.log('Mobile mode: Capacitor initialized');
    }
  } catch (error) {
    console.warn('Failed to initialize Capacitor:', error);
  }
};