import { app, BrowserWindow, Menu, ipcMain, dialog } from 'electron';
import { fileURLToPath } from 'url';
import path from 'path';
import { getDatabase, closeDatabase, CreateUserData, UpdateScoreData } from './database.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.js
// │
process.env.APP_ROOT = path.join(__dirname, '..');

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron');
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist');

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST;

let win: BrowserWindow | null;

function createWindow() {
  // Handle the case where VITE_PUBLIC might be undefined
  const vitePublic = process.env.VITE_PUBLIC || __dirname;
  
  win = new BrowserWindow({
    icon: path.join(vitePublic, 'icon.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
    },
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    frame: true,
    titleBarStyle: 'default',
    show: false, // Don't show until ready
    autoHideMenuBar: false,
    title: 'Planetary Chess - Desktop',
  });

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.postMessage('main-process-message', new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'));
  }

  // Show window when ready to prevent visual flash
  win.once('ready-to-show', () => {
    win?.show();
    
    // Focus the window
    if (win) {
      win.focus();
    }
  });

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) {
      import('electron').then(({ shell }) => {
        shell.openExternal(url);
      });
    }
    return { action: 'deny' };
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  // Close database connection
  closeDatabase();
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('web-contents-created', (_, contents) => {
  contents.on('new-window', (navigationEvent) => {
    navigationEvent.preventDefault();
  });
});

// Security: Prevent navigation to external websites
app.on('web-contents-created', (_, contents) => {
  contents.on('will-navigate' as any, (navigationEvent: any, url) => {
    const parsedUrl = new URL(url);
    
    if (parsedUrl.origin !== VITE_DEV_SERVER_URL) {
      navigationEvent.preventDefault();
    }
  });
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

// IPC handlers for future database operations
ipcMain.handle('app:getVersion', () => {
  return app.getVersion();
});

ipcMain.handle('app:getPlatform', () => {
  return process.platform;
});

// Database operations handlers
ipcMain.handle('db:createUser', async (_, userData: CreateUserData) => {
  const db = getDatabase();
  return await db.createUser(userData);
});

ipcMain.handle('db:authenticateUser', async (_, username: string, password: string) => {
  const db = getDatabase();
  return await db.authenticateUser(username, password);
});

ipcMain.handle('db:getUser', async (_, userId: number) => {
  const db = getDatabase();
  return db.getUser(userId);
});

ipcMain.handle('db:updateScore', async (_, data: UpdateScoreData) => {
  const db = getDatabase();
  return db.updateScore(data);
});

ipcMain.handle('db:getUserScores', async (_, userId: number) => {
  const db = getDatabase();
  return db.getUserScores(userId);
});

ipcMain.handle('db:getUserStats', async (_, userId: number) => {
  const db = getDatabase();
  return db.getUserStats(userId);
});

ipcMain.handle('db:getLeaderboard', async (_, limit?: number) => {
  const db = getDatabase();
  return db.getLeaderboard(limit);
});

ipcMain.handle('db:getAllPuzzles', async (_) => {
  const db = getDatabase();
  return db.getAllPuzzles();
});

ipcMain.handle('db:getPuzzlesByDifficulty', async (_, difficulty: number) => {
  const db = getDatabase();
  return db.getPuzzlesByDifficulty(difficulty);
});

ipcMain.handle('db:getPuzzlesByTheme', async (_, theme: string) => {
  const db = getDatabase();
  return db.getPuzzlesByTheme(theme);
});

// Menu setup for desktop
const createMenu = () => {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Game',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            win?.webContents.send('menu:new-game');
          }
        },
        {
          label: 'Restart Game',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            win?.webContents.send('menu:restart-game');
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Toggle Developer Tools',
          accelerator: process.platform === 'darwin' ? 'Alt+Cmd+I' : 'Ctrl+Shift+I',
          click: () => {
            win?.webContents.toggleDevTools();
          }
        },
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            win?.reload();
          }
        },
        {
          label: 'Force Reload',
          accelerator: 'CmdOrCtrl+Shift+R',
          click: () => {
            win?.webContents.reloadIgnoringCache();
          }
        },
        { type: 'separator' },
        {
          label: 'Actual Size',
          accelerator: 'CmdOrCtrl+0',
          click: () => {
            win?.webContents.setZoomLevel(0);
          }
        },
        {
          label: 'Zoom In',
          accelerator: 'CmdOrCtrl+Plus',
          click: () => {
            const currentZoom = win?.webContents.getZoomLevel() || 0;
            win?.webContents.setZoomLevel(currentZoom + 0.5);
          }
        },
        {
          label: 'Zoom Out',
          accelerator: 'CmdOrCtrl+-',
          click: () => {
            const currentZoom = win?.webContents.getZoomLevel() || 0;
            win?.webContents.setZoomLevel(currentZoom - 0.5);
          }
        },
        { type: 'separator' },
        {
          label: 'Toggle Fullscreen',
          accelerator: process.platform === 'darwin' ? 'Ctrl+Cmd+F' : 'F11',
          click: () => {
            const isFullScreen = win?.isFullScreen();
            win?.setFullScreen(!isFullScreen);
          }
        }
      ]
    },
    {
      label: 'Game',
      submenu: [
        {
          label: 'Home',
          accelerator: 'CmdOrCtrl+H',
          click: () => {
            win?.webContents.send('menu:home');
          }
        },
        {
          label: 'Leaderboard',
          accelerator: 'CmdOrCtrl+L',
          click: () => {
            win?.webContents.send('menu:leaderboard');
          }
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About',
          click: () => {
            dialog.showMessageBox(win!, {
              type: 'info',
              title: 'About Planetary Chess',
              message: 'Planetary Chess Desktop',
              detail: 'A strategic chess game with AI Cyber Stewie\\nVersion: ' + app.getVersion()
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
};

// Create menu when app is ready
app.whenReady().then(() => {
  createMenu();
});