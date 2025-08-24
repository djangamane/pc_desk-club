import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import App from './App.tsx'
import { store } from './store/index'
import './index.css'
import 'antd/dist/reset.css'
import './types/antd-react-fix.d.ts' // Import our type fixes

// Check if running in Electron
const isElectron = typeof window !== 'undefined' && window.electronAPI;

// Desktop-only initialization
const initializeDesktop = () => {
  console.log('🚀 Initializing Planetary Chess (Desktop Only)...');
  
  if (isElectron) {
    console.log('🖥️  Electron mode: Enhanced desktop features enabled');
    
    // Listen for menu actions from Electron
    window.electronAPI?.onMenuAction((action: string) => {
      console.log('Menu action received:', action);
      // Handle menu actions here
      switch (action) {
        case 'new-game':
          window.location.hash = '#/game';
          break;
        case 'home':
          window.location.hash = '#/';
          break;
        case 'leaderboard':
          window.location.hash = '#/leaderboard';
          break;
        case 'restart-game':
          window.location.reload();
          break;
      }
    });
  } else {
    console.log('🌐 Web mode: Basic desktop features enabled');
  }
  
  // Add desktop-specific event listeners
  document.addEventListener('keydown', (e) => {
    // Global keyboard shortcuts can be handled here
    if (e.ctrlKey && e.key === 'r') {
      e.preventDefault();
      window.location.reload();
    }
  });
};

// Initialize desktop and render app
initializeDesktop();
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
);