import { contextBridge, ipcRenderer } from 'electron';

// Define the API that will be exposed to the renderer process
export interface ElectronAPI {
  // App info
  getVersion: () => Promise<string>;
  getPlatform: () => Promise<string>;
  
  // Database operations (to be implemented with SQLite)
  database: {
    getUser: (userId: number) => Promise<any>;
    updateScore: (data: { userId: number; puzzleId: number; solved: boolean; attempts: number; scoreEarned: number }) => Promise<any>;
    // More database methods will be added here
    createUser: (userData: { username: string; email: string; password: string }) => Promise<any>;
    authenticateUser: (username: string, password: string) => Promise<any>;
    getUserScores: (userId: number) => Promise<any>;
    getUserStats: (userId: number) => Promise<any>;
    getLeaderboard: (limit?: number) => Promise<any>;
    getAllPuzzles: () => Promise<any>;
    getPuzzlesByDifficulty: (difficulty: number) => Promise<any>;
    getPuzzlesByTheme: (theme: string) => Promise<any>;
  };
  
  // Menu events listener
  onMenuAction: (callback: (action: string) => void) => void;
  
  // Window controls
  window: {
    minimize: () => void;
    maximize: () => void;
    close: () => void;
  };
}

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
const electronAPI: ElectronAPI = {
  // App info
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
  getPlatform: () => ipcRenderer.invoke('app:getPlatform'),
  
  // Database operations
  database: {
    // User management
    createUser: (userData: { username: string; email: string; password: string }) => 
      ipcRenderer.invoke('db:createUser', userData),
    authenticateUser: (username: string, password: string) => 
      ipcRenderer.invoke('db:authenticateUser', username, password),
    getUser: (userId: number) => 
      ipcRenderer.invoke('db:getUser', userId),
    
    // Scoring
    updateScore: (data: { userId: number; puzzleId: number; solved: boolean; attempts: number; scoreEarned: number }) => 
      ipcRenderer.invoke('db:updateScore', data),
    getUserScores: (userId: number) => 
      ipcRenderer.invoke('db:getUserScores', userId),
    getUserStats: (userId: number) => 
      ipcRenderer.invoke('db:getUserStats', userId),
    getLeaderboard: (limit?: number) => 
      ipcRenderer.invoke('db:getLeaderboard', limit),
    
    // Puzzles
    getAllPuzzles: () => 
      ipcRenderer.invoke('db:getAllPuzzles'),
    getPuzzlesByDifficulty: (difficulty: number) => 
      ipcRenderer.invoke('db:getPuzzlesByDifficulty', difficulty),
    getPuzzlesByTheme: (theme: string) => 
      ipcRenderer.invoke('db:getPuzzlesByTheme', theme),
  },
  
  // Menu events
  onMenuAction: (callback: (action: string) => void) => {
    ipcRenderer.on('menu:new-game', () => callback('new-game'));
    ipcRenderer.on('menu:restart-game', () => callback('restart-game'));
    ipcRenderer.on('menu:home', () => callback('home'));
    ipcRenderer.on('menu:leaderboard', () => callback('leaderboard'));
  },
  
  // Window controls (for custom title bar if needed in future)
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
  }
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electronAPI', electronAPI);
  } catch (error) {
    console.error('Failed to expose electronAPI:', error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electronAPI = electronAPI;
}
