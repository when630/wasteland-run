// 모듈 레벨 커맨드 큐 — Zustand 스토어를 거치지 않는 명령적(imperative) VFX 관리

import type { VfxCommand } from './types';

// --- 커맨드 큐 ---
const commandQueue: VfxCommand[] = [];

export function dispatchVfx(cmd: VfxCommand) {
  commandQueue.push(cmd);
}

export function consumeVfxCommands(): VfxCommand[] {
  if (commandQueue.length === 0) return [];
  return commandQueue.splice(0, commandQueue.length);
}

// --- VFX 전용 쉐이크 ---
let shakeX = 0;
let shakeY = 0;
let shakeIntensity = 0;
let shakeAxis: 'X' | 'Y' | 'XY' = 'XY';
let shakeDuration = 0;
let shakeElapsed = 0;
let shakeDecay = 0.9;

export function triggerShake(intensity: number, axis: 'X' | 'Y' | 'XY', durationMs: number, decayRate: number) {
  shakeIntensity = intensity;
  shakeAxis = axis;
  shakeDuration = durationMs;
  shakeElapsed = 0;
  shakeDecay = decayRate;
}

export function tickShake(deltaMs: number) {
  if (shakeIntensity < 0.3) {
    shakeX = 0;
    shakeY = 0;
    return;
  }

  shakeElapsed += deltaMs;
  if (shakeElapsed >= shakeDuration) {
    shakeIntensity = 0;
    shakeX = 0;
    shakeY = 0;
    return;
  }

  shakeIntensity *= shakeDecay;

  const rx = (Math.random() - 0.5) * 2 * shakeIntensity;
  const ry = (Math.random() - 0.5) * 2 * shakeIntensity;

  shakeX = (shakeAxis === 'Y') ? 0 : rx;
  shakeY = (shakeAxis === 'X') ? 0 : ry;
}

export function getVfxShake() {
  return { x: shakeX, y: shakeY };
}

// --- 힛스탑 ---
let hitStopRemaining = 0;

export function triggerHitStop(ms: number) {
  hitStopRemaining = Math.max(hitStopRemaining, ms);
}

export function tickHitStop(deltaMs: number): boolean {
  if (hitStopRemaining <= 0) return false;
  hitStopRemaining -= deltaMs;
  if (hitStopRemaining < 0) hitStopRemaining = 0;
  return true;
}

export function isHitStopped(): boolean {
  return hitStopRemaining > 0;
}

// --- 화면 플래시 ---
let flashAlpha = 0;
let flashColor = 0xffffff;

export function triggerFlash(color: number) {
  flashAlpha = 0.6;
  flashColor = color;
}

export function getFlash() {
  return { alpha: flashAlpha, color: flashColor };
}

export function tickFlash(deltaMs: number) {
  if (flashAlpha > 0) {
    flashAlpha -= deltaMs / 80;
    if (flashAlpha < 0) flashAlpha = 0;
  }
}

// --- 전체 초기화 ---
export function resetVfx() {
  commandQueue.length = 0;
  shakeX = 0;
  shakeY = 0;
  shakeIntensity = 0;
  hitStopRemaining = 0;
  flashAlpha = 0;
}
