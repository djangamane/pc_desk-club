import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeCapacitor } from './utils/capacitorWrapper'
import { getPlatformConfig } from './utils/platformUtils'

// Initialize platform-specific features
const initializePlatform = async () => {
  const config = getPlatformConfig();
  
  console.log('🚀 Initializing Planetary Chess...', {
    platform: config.isDesktop ? 'Desktop' : 'Mobile',
    inputMethod: config.preferredInputMethod,
    keyboardSupport: config.supportsKeyboard,
    touchSupport: config.supportsTouch
  });

  // Initialize Capacitor only in mobile mode
  await initializeCapacitor();
  
  // Desktop-specific initialization
  if (config.isDesktop) {
    console.log('🖥️  Desktop mode: Enhanced features enabled');
    
    // Add desktop-specific event listeners
    document.addEventListener('keydown', (e) => {
      // Global keyboard shortcuts can be handled here
      if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        window.location.reload();
      }
    });
  }
};

// Initialize platform and render app
initializePlatform().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}).catch((error) => {
  console.error('Failed to initialize platform:', error);
  
  // Fallback: render app anyway
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
});