import { app, BrowserWindow, globalShortcut, ipcMain, screen } from 'electron';
import { join } from 'path';
import { loadWindowState, saveWindowState, saveJson, loadJson, deleteJson } from './storage';

// GPU 블랙리스트 무시 — 모든 GPU에서 WebGL(Pixi.js) 활성화
app.commandLine.appendSwitch('ignore-gpu-blocklist');

const BASE_WIDTH = 1280;

let mainWindow: BrowserWindow | null = null;

/** 창 크기에 맞춰 zoom factor 적용 — 1280x720 기준 디자인을 스케일 */
function applyZoom(): void {
  if (!mainWindow) return;
  const [w] = mainWindow.getContentSize();
  mainWindow.webContents.setZoomFactor(w / BASE_WIDTH);
}

function createWindow(): void {
  const windowState = loadWindowState();
  // settings.json의 해상도를 우선 사용, window-state.json에서는 위치(x, y)만 사용
  const settings = loadJson('settings') as { resolutionWidth?: number; resolutionHeight?: number } | null;
  const width = settings?.resolutionWidth ?? 1280;
  const height = settings?.resolutionHeight ?? 720;

  mainWindow = new BrowserWindow({
    width,
    height,
    x: windowState.x,
    y: windowState.y,
    resizable: false,
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
      // 위치만 저장 — 해상도는 settings.json에서 관리
      saveWindowState({
        x: bounds.x,
        y: bounds.y,
        isFullScreen: mainWindow.isFullScreen(),
      });
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // 콘텐츠 로드 완료 시 zoom 적용
  mainWindow.webContents.on('did-finish-load', applyZoom);

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

ipcMain.handle('save-settings', (_event, data: unknown) => {
  saveJson('settings', data);
  return { success: true };
});

ipcMain.handle('load-settings', () => {
  return loadJson('settings');
});

ipcMain.handle('toggle-fullscreen', () => {
  if (mainWindow) {
    const newState = !mainWindow.isFullScreen();
    mainWindow.setFullScreen(newState);
    return newState;
  }
  return false;
});

ipcMain.handle('set-resolution', (_event, width: number, height: number) => {
  if (mainWindow) {
    // 모니터 작업 영역보다 큰 해상도는 클램핑
    const workArea = screen.getPrimaryDisplay().workAreaSize;
    const clampedWidth = Math.min(width, workArea.width);
    const clampedHeight = Math.min(height, workArea.height);

    if (mainWindow.isFullScreen()) {
      mainWindow.setFullScreen(false);
    }
    mainWindow.setSize(clampedWidth, clampedHeight);
    mainWindow.center();
    applyZoom();
    return { success: true, width: clampedWidth, height: clampedHeight };
  }
  return { success: false };
});

ipcMain.handle('set-fullscreen', (_event, fullscreen: boolean) => {
  if (mainWindow) {
    mainWindow.setFullScreen(fullscreen);
    // setFullScreen은 비동기 전환이므로 요청값을 그대로 반환
    return fullscreen;
  }
  return false;
});

ipcMain.handle('get-fullscreen', () => {
  if (mainWindow) {
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

  // 풀스크린 전환 시 zoom 재적용
  mainWindow!.on('enter-full-screen', applyZoom);
  mainWindow!.on('leave-full-screen', applyZoom);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  globalShortcut.unregisterAll();
  if (process.platform !== 'darwin') app.quit();
});
