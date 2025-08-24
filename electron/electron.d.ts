// Electron API types for renderer process

export interface ElectronAPI {
  // App info
  getVersion: () => Promise<string>;
  getPlatform: () => Promise<string>;
  
  // Database operations
  database: {
    // User management
    createUser: (userData: { username: string; email: string; password: string }) => Promise<{ success: boolean; user?: any; error?: string }>;
    authenticateUser: (username: string, password: string) => Promise<{ success: boolean; user?: any; error?: string }>;
    getUser: (userId: number) => Promise<any>;
    
    // Scoring
    updateScore: (data: { userId: number; puzzleId: number; solved: boolean; attempts: number; scoreEarned: number }) => Promise<{ success: boolean; error?: string }>;
    getUserScores: (userId: number) => Promise<any[]>;
    getUserStats: (userId: number) => Promise<{ totalSolved: number; totalAttempts: number; totalScore: number; avgScore: number }>;
    getLeaderboard: (limit?: number) => Promise<Array<{ username: string; totalScore: number; totalSolved: number }>>;
    
    // Puzzles
    getAllPuzzles: () => Promise<any[]>;
    getPuzzlesByDifficulty: (difficulty: number) => Promise<any[]>;
    getPuzzlesByTheme: (theme: string) => Promise<any[]>;
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

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};