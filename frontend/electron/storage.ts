import { app } from 'electron';
import { join } from 'path';
import { readFileSync, writeFileSync, mkdirSync, existsSync, unlinkSync } from 'fs';

interface WindowState {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  isFullScreen?: boolean;
}

function getDataPath(): string {
  const dataPath = join(app.getPath('userData'), 'game-data');
  if (!existsSync(dataPath)) {
    mkdirSync(dataPath, { recursive: true });
  }
  return dataPath;
}

export function saveWindowState(state: WindowState): void {
  try {
    const filePath = join(getDataPath(), 'window-state.json');
    writeFileSync(filePath, JSON.stringify(state, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save window state:', e);
  }
}

export function loadWindowState(): WindowState {
  try {
    const filePath = join(getDataPath(), 'window-state.json');
    if (existsSync(filePath)) {
      return JSON.parse(readFileSync(filePath, 'utf-8'));
    }
  } catch (e) {
    console.error('Failed to load window state:', e);
  }
  return {};
}

export function saveJson(key: string, data: unknown): void {
  try {
    const filePath = join(getDataPath(), `${key}.json`);
    writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error(`Failed to save ${key}:`, e);
  }
}

export function loadJson(key: string): unknown | null {
  try {
    const filePath = join(getDataPath(), `${key}.json`);
    if (existsSync(filePath)) {
      return JSON.parse(readFileSync(filePath, 'utf-8'));
    }
  } catch (e) {
    console.error(`Failed to load ${key}:`, e);
  }
  return null;
}

export function deleteJson(key: string): void {
  try {
    const filePath = join(getDataPath(), `${key}.json`);
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }
  } catch (e) {
    console.error(`Failed to delete ${key}:`, e);
  }
}
