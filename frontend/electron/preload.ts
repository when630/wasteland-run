import { contextBridge, ipcRenderer } from 'electron';

const electronAPI = {
  saveRun: (data: unknown) => ipcRenderer.invoke('save-run', data),
  loadRun: () => ipcRenderer.invoke('load-run'),
  deleteRun: () => ipcRenderer.invoke('delete-run'),
  saveStats: (data: unknown) => ipcRenderer.invoke('save-stats', data),
  loadStats: () => ipcRenderer.invoke('load-stats'),
  saveSettings: (data: unknown) => ipcRenderer.invoke('save-settings', data),
  loadSettings: () => ipcRenderer.invoke('load-settings'),
  toggleFullscreen: () => ipcRenderer.invoke('toggle-fullscreen'),
  setFullscreen: (fullscreen: boolean) => ipcRenderer.invoke('set-fullscreen', fullscreen),
  getFullscreen: () => ipcRenderer.invoke('get-fullscreen'),
  setResolution: (width: number, height: number) => ipcRenderer.invoke('set-resolution', width, height),
  platform: 'electron' as const,
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
