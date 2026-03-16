import { app, BrowserWindow, globalShortcut, ipcMain } from 'electron';
import { join } from 'path';
import { loadWindowState, saveWindowState, saveJson, loadJson, deleteJson } from './storage';

// GPU 블랙리스트 무시 — 모든 GPU에서 WebGL(Pixi.js) 활성화
app.commandLine.appendSwitch('ignore-gpu-blocklist');

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  const windowState = loadWindowState();

  mainWindow = new BrowserWindow({
    width: windowState.width ?? 1280,
    height: windowState.height ?? 720,
    x: windowState.x,
    y: windowState.y,
    minWidth: 960,
    minHeight: 540,
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    title: 'Wasteland Run',
    autoHideMenuBar: true,
  });

  mainWindow.on('close', () => {
    if (mainWindow) {
      const bounds = mainWindow.getBounds();
      saveWindowState({
        width: bounds.width,
        height: bounds.height,
        x: bounds.x,
        y: bounds.y,
        isFullScreen: mainWindow.isFullScreen(),
      });
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // electron-vite: dev 모드에서는 ELECTRON_RENDERER_URL 환경변수로 Vite dev server 접속
  if (process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

// ── IPC 핸들러: 게임 데이터 로컬 저장/로드 ──

ipcMain.handle('save-run', (_event, data: unknown) => {
  saveJson('run-save', data);
  return { success: true };
});

ipcMain.handle('load-run', () => {
  return loadJson('run-save');
});

ipcMain.handle('delete-run', () => {
  deleteJson('run-save');
  return { success: true };
});

ipcMain.handle('save-stats', (_event, data: unknown) => {
  saveJson('stats', data);
  return { success: true };
});

ipcMain.handle('load-stats', () => {
  return loadJson('stats');
});

ipcMain.handle('toggle-fullscreen', () => {
  if (mainWindow) {
    mainWindow.setFullScreen(!mainWindow.isFullScreen());
    return mainWindow.isFullScreen();
  }
  return false;
});

// ── 앱 라이프사이클 ──

app.whenReady().then(() => {
  createWindow();

  // F11 풀스크린 토글
  globalShortcut.register('F11', () => {
    if (mainWindow) {
      mainWindow.setFullScreen(!mainWindow.isFullScreen());
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  globalShortcut.unregisterAll();
  if (process.platform !== 'darwin') app.quit();
});
