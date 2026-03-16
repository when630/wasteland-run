import { contextBridge, ipcRenderer } from 'electron';

const electronAPI = {
  saveRun: (data: unknown) => ipcRenderer.invoke('save-run', data),
  loadRun: () => ipcRenderer.invoke('load-run'),
  deleteRun: () => ipcRenderer.invoke('delete-run'),
  saveStats: (data: unknown) => ipcRenderer.invoke('save-stats', data),
  loadStats: () => ipcRenderer.invoke('load-stats'),
  toggleFullscreen: () => ipcRenderer.invoke('toggle-fullscreen'),
  platform: 'electron' as const,
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
