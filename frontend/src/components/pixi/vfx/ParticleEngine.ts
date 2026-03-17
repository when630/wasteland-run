// 핵심 파티클 시스템 — PIXI.Graphics 명령적(imperative) 렌더링
// 오브젝트 풀로 GC 압력 방지

import * as PIXI from 'pixi.js';
import type { Particle, Shockwave, LineTrace } from './types';
import { triggerShake, triggerHitStop, triggerFlash } from './vfxDispatcher';
import type { VfxProfile } from './types';

const POOL_SIZE = 150;
/** 전체 파티클/이펙트 시각 배율 — 1.0이 기본, 높을수록 크고 굵게 */
const VFX_SCALE = 2.0;

export class ParticleEngine {
  private particles: Particle[];
  private freeList: number[] = []; // O(1) 파티클 할당용 스택
  private activeCount = 0;
  private shockwaves: Shockwave[] = [];
  private lineTraces: LineTrace[] = [];
  private graphics: PIXI.Graphics | null = null;

  constructor() {
    // 사전 할당 오브젝트 풀 + free list 초기화
    this.particles = Array.from({ length: POOL_SIZE }, () => this.createInactiveParticle());
    this.freeList = Array.from({ length: POOL_SIZE }, (_, i) => POOL_SIZE - 1 - i); // 역순 스택
  }

  setGraphics(g: PIXI.Graphics) {
    this.graphics = g;
  }

  private createInactiveParticle(): Particle {
    return {
      active: false,
      x: 0, y: 0, vx: 0, vy: 0,
      life: 0, maxLife: 0, size: 0,
      color: 0xffffff, alpha: 1,
      rotation: 0, rotationSpeed: 0,
      friction: 0.98, gravity: 0,
      shape: 'RECT', width: 4, height: 4,
    };
  }

  private acquire(): Particle | null {
    if (this.freeList.length === 0) return null;
    const idx = this.freeList.pop()!;
    this.activeCount++;
    return this.particles[idx];
  }

  private release(index: number) {
    this.freeList.push(index);
    this.activeCount--;
  }

  // === 헬퍼: 중심 관통 LINE 파티클 ===
  private spawnCenteredLine(x: number, y: number, angleDeg: number, len: number, thickness: number, color: number, maxLife: number) {
    const p = this.acquire();
    if (!p) return;
    const angle = (angleDeg + (Math.random() - 0.5) * 20) * Math.PI / 180;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    p.active = true;
    p.x = x - cos * len / 2;
    p.y = y - sin * len / 2;
    p.vx = 0; p.vy = 0;
    p.life = 0; p.maxLife = maxLife;
    p.size = 2; p.color = color; p.alpha = 1;
    p.rotation = angle; p.rotationSpeed = 0;
    p.friction = 1; p.gravity = 0;
    p.shape = 'LINE'; p.width = len; p.height = thickness;
  }

  // === 플레이어 공격 카테고리 ===

  spawnBladeSlash(x: number, y: number, profile: VfxProfile) {
    // 단일 대각선 베기
    this.spawnCenteredLine(x, y, -135, 80, 5, 0xffffff, 450);
    const sp = profile.shakeProfile;
    triggerShake(sp.intensity, sp.axis, sp.durationMs, sp.decayRate);
    triggerHitStop(profile.hitStopMs);
  }

  spawnHeavyKinetic(x: number, y: number, profile: VfxProfile) {
    // 굵은 수평 임팩트 + 충격파
    this.spawnCenteredLine(x, y, -10, 70, 6, profile.color, 400);
    this.shockwaves.push({ x, y, radius: 5, maxRadius: 60, alpha: 0.6, color: profile.color, elapsed: 0, duration: 350 });
    const sp = profile.shakeProfile;
    triggerShake(sp.intensity, sp.axis, sp.durationMs, sp.decayRate);
    triggerHitStop(profile.hitStopMs);
  }

  spawnFrictionSparks(x: number, y: number, profile: VfxProfile) {
    // 3연타 짧은 슬래시 (시차)
    for (let i = 0; i < 3; i++) {
      const p = this.acquire();
      if (!p) break;
      const angle = (-150 + i * 25 + Math.random() * 15) * Math.PI / 180;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const len = 50;
      p.active = true;
      p.x = x - cos * len / 2;
      p.y = y - sin * len / 2;
      p.vx = 0; p.vy = 0;
      p.life = -i * 80; // 시차 (음수 life → draw에서 growFactor가 0)
      p.maxLife = 350;
      p.size = 2; p.color = this.brighten(profile.color, 0.85); p.alpha = 1;
      p.rotation = angle; p.rotationSpeed = 0;
      p.friction = 1; p.gravity = 0;
      p.shape = 'LINE'; p.width = len; p.height = 3.5;
    }
    const sp = profile.shakeProfile;
    triggerShake(sp.intensity, sp.axis, sp.durationMs, sp.decayRate);
    triggerHitStop(profile.hitStopMs);
  }

  spawnGroundPound(x: number, y: number, profile: VfxProfile) {
    // 수평 넓은 임팩트 + 지면 충격파
    this.spawnCenteredLine(x, y + 20, 0, 100, 5, profile.color, 400);
    this.shockwaves.push({ x, y: y + 30, radius: 8, maxRadius: 100, alpha: 0.7, color: profile.color, elapsed: 0, duration: 450 });
    const sp = profile.shakeProfile;
    triggerShake(sp.intensity, sp.axis, sp.durationMs, sp.decayRate);
    triggerHitStop(profile.hitStopMs);
  }

  spawnBerserk(x: number, y: number, profile: VfxProfile) {
    // X자 이중 베기 + 붉은 플래시
    this.spawnCenteredLine(x, y, -135, 90, 5, profile.color, 400);
    this.spawnCenteredLine(x, y, -45, 90, 5, 0xff6600, 400);
    this.shockwaves.push({ x, y, radius: 8, maxRadius: 80, alpha: 0.7, color: profile.color, elapsed: 0, duration: 350 });
    triggerFlash(profile.color);
    const sp = profile.shakeProfile;
    triggerShake(sp.intensity, sp.axis, sp.durationMs, sp.decayRate);
    triggerHitStop(profile.hitStopMs);
  }

  spawnThermalAoe(x: number, y: number, profile: VfxProfile) {
    // 큰 충격파 + 4개 큰 원 파티클
    this.shockwaves.push({ x, y, radius: 10, maxRadius: 120, alpha: 0.8, color: profile.color, elapsed: 0, duration: 500 });
    for (let i = 0; i < 4; i++) {
      const p = this.acquire();
      if (!p) break;
      const angle = Math.random() * Math.PI * 2;
      p.active = true;
      p.x = x + (Math.random() - 0.5) * 40;
      p.y = y + (Math.random() - 0.5) * 30;
      p.vx = Math.cos(angle) * 0.5; p.vy = -1 - Math.random() * 1.5;
      p.life = 0; p.maxLife = 600;
      p.size = 5 + Math.random() * 4; p.color = profile.color; p.alpha = 0.7;
      p.rotation = 0; p.rotationSpeed = 0; p.friction = 0.99; p.gravity = -0.01;
      p.shape = 'CIRCLE'; p.width = p.size; p.height = p.size;
    }
    const sp = profile.shakeProfile;
    triggerShake(sp.intensity, sp.axis, sp.durationMs, sp.decayRate);
    triggerHitStop(profile.hitStopMs);
  }

  spawnElectromagnetic(fromX: number, fromY: number, toX: number, toY: number, profile: VfxProfile) {
    // 굵은 탄환 궤적 + 임팩트 충격파
    this.lineTraces.push({ fromX, fromY, toX, toY, width: 5, maxWidth: 7, alpha: 1, color: profile.color, elapsed: 0, duration: 180 });
    this.shockwaves.push({ x: toX, y: toY, radius: 3, maxRadius: 30, alpha: 0.5, color: profile.color, elapsed: 0, duration: 200 });
    const sp = profile.shakeProfile;
    triggerShake(sp.intensity, sp.axis, sp.durationMs, sp.decayRate);
    triggerHitStop(profile.hitStopMs);
  }

  spawnScatterShot(fromX: number, fromY: number, targets: { x: number; y: number }[], profile: VfxProfile) {
    // 타겟별 굵은 궤적 + 임팩트 링
    for (const target of targets) {
      this.lineTraces.push({ fromX, fromY, toX: target.x + (Math.random() - 0.5) * 20, toY: target.y + (Math.random() - 0.5) * 15, width: 4, maxWidth: 5, alpha: 0.9, color: profile.color, elapsed: 0, duration: 150 });
      this.shockwaves.push({ x: target.x, y: target.y, radius: 3, maxRadius: 25, alpha: 0.4, color: profile.color, elapsed: 0, duration: 200 });
    }
    const sp = profile.shakeProfile;
    triggerShake(sp.intensity, sp.axis, sp.durationMs, sp.decayRate);
    triggerHitStop(profile.hitStopMs);
  }

  // === 방어/유틸 카테고리 ===

  spawnShieldBarrier(x: number, y: number, profile: VfxProfile) {
    // 배리어 충격파 링 + 3개 큰 사각 파편
    this.shockwaves.push({ x: x + 30, y, radius: 5, maxRadius: 65, alpha: 0.6, color: profile.color, elapsed: 0, duration: 400 });
    for (let i = 0; i < 3; i++) {
      const p = this.acquire();
      if (!p) break;
      p.active = true;
      p.x = x + 20 + (Math.random() - 0.5) * 30;
      p.y = y + (Math.random() - 0.5) * 60;
      p.vx = 0.3; p.vy = -1 - Math.random();
      p.life = 0; p.maxLife = 500;
      p.size = 6; p.color = profile.color; p.alpha = 0.8;
      p.rotation = Math.random() * Math.PI; p.rotationSpeed = 0.02;
      p.friction = 0.97; p.gravity = 0.02;
      p.shape = 'RECT'; p.width = 10 + Math.random() * 6; p.height = 6 + Math.random() * 4;
    }
  }

  spawnResistWard(x: number, y: number, profile: VfxProfile) {
    // 에너지 링 + 4개 큰 원 상승
    this.shockwaves.push({ x, y, radius: 15, maxRadius: 55, alpha: 0.5, color: profile.color, elapsed: 0, duration: 450 });
    for (let i = 0; i < 4; i++) {
      const p = this.acquire();
      if (!p) break;
      const angle = (i / 4) * Math.PI * 2;
      p.active = true;
      p.x = x + Math.cos(angle) * 30;
      p.y = y + Math.sin(angle) * 20;
      p.vx = Math.cos(angle) * 0.2; p.vy = -1.2 - Math.random();
      p.life = 0; p.maxLife = 500;
      p.size = 4 + Math.random() * 3; p.color = profile.color; p.alpha = 0.8;
      p.rotation = 0; p.rotationSpeed = 0; p.friction = 0.99; p.gravity = -0.005;
      p.shape = 'CIRCLE'; p.width = p.size; p.height = p.size;
    }
  }

  spawnBuffAura(x: number, y: number, profile: VfxProfile) {
    // 링 + 4개 큰 스파클 상승
    this.shockwaves.push({ x, y, radius: 10, maxRadius: 50, alpha: 0.4, color: profile.color, elapsed: 0, duration: 400 });
    for (let i = 0; i < 4; i++) {
      const p = this.acquire();
      if (!p) break;
      p.active = true;
      p.x = x + (Math.random() - 0.5) * 40;
      p.y = y + 10;
      p.vx = (Math.random() - 0.5) * 0.3; p.vy = -1.2 - Math.random();
      p.life = 0; p.maxLife = 600;
      p.size = 4 + Math.random() * 3; p.color = profile.color; p.alpha = 0.9;
      p.rotation = 0; p.rotationSpeed = 0; p.friction = 0.99; p.gravity = -0.008;
      p.shape = 'CIRCLE'; p.width = p.size; p.height = p.size;
    }
  }

  spawnHealPulse(x: number, y: number, profile: VfxProfile) {
    // 힐 링 + 4개 큰 초록 원 상승
    this.shockwaves.push({ x, y, radius: 10, maxRadius: 55, alpha: 0.5, color: profile.color, elapsed: 0, duration: 500 });
    for (let i = 0; i < 4; i++) {
      const p = this.acquire();
      if (!p) break;
      p.active = true;
      p.x = x + (Math.random() - 0.5) * 40;
      p.y = y + 10;
      p.vx = (Math.random() - 0.5) * 0.3; p.vy = -1 - Math.random() * 1.5;
      p.life = 0; p.maxLife = 650;
      p.size = 5 + Math.random() * 3; p.color = Math.random() > 0.4 ? profile.color : 0x88ffcc; p.alpha = 0.85;
      p.rotation = 0; p.rotationSpeed = 0; p.friction = 0.99; p.gravity = -0.008;
      p.shape = 'CIRCLE'; p.width = p.size; p.height = p.size;
    }
  }

  spawnBloodSacrifice(x: number, y: number, profile: VfxProfile) {
    // 3개 큰 붉은 방울 + 2개 금빛 스파클
    for (let i = 0; i < 3; i++) {
      const p = this.acquire();
      if (!p) break;
      p.active = true;
      p.x = x + (Math.random() - 0.5) * 30;
      p.y = y - 10;
      p.vx = (Math.random() - 0.5) * 1; p.vy = 1 + Math.random() * 2;
      p.life = 0; p.maxLife = 400;
      p.size = 4 + Math.random() * 3; p.color = profile.color; p.alpha = 0.95;
      p.rotation = 0; p.rotationSpeed = 0; p.friction = 0.98; p.gravity = 0.15;
      p.shape = 'CIRCLE'; p.width = p.size; p.height = p.size;
    }
    for (let i = 0; i < 2; i++) {
      const p = this.acquire();
      if (!p) break;
      p.active = true;
      p.x = x + (Math.random() - 0.5) * 30;
      p.y = y;
      p.vx = (Math.random() - 0.5) * 0.4; p.vy = -1.5 - Math.random();
      p.life = 150; p.maxLife = 700;
      p.size = 4 + Math.random() * 2; p.color = 0xffcc44; p.alpha = 0.9;
      p.rotation = 0; p.rotationSpeed = 0; p.friction = 0.99; p.gravity = -0.01;
      p.shape = 'CIRCLE'; p.width = p.size; p.height = p.size;
    }
    triggerFlash(0xff2222);
  }

  spawnPowerSurge(x: number, y: number, profile: VfxProfile) {
    // 이중 링 + 4개 큰 나선 원
    this.shockwaves.push({ x, y, radius: 8, maxRadius: 65, alpha: 0.5, color: profile.color, elapsed: 0, duration: 450 });
    this.shockwaves.push({ x, y, radius: 5, maxRadius: 40, alpha: 0.35, color: this.brighten(profile.color, 0.85), elapsed: 0, duration: 350 });
    for (let i = 0; i < 4; i++) {
      const p = this.acquire();
      if (!p) break;
      const angle = (i / 4) * Math.PI * 2;
      p.active = true;
      p.x = x + Math.cos(angle) * 20;
      p.y = y + Math.sin(angle) * 12;
      p.vx = Math.cos(angle + Math.PI / 2) * 1.2; p.vy = -1.5 - Math.random();
      p.life = 0; p.maxLife = 550;
      p.size = 4 + Math.random() * 3; p.color = profile.color; p.alpha = 0.85;
      p.rotation = 0; p.rotationSpeed = 0; p.friction = 0.98; p.gravity = -0.012;
      p.shape = 'CIRCLE'; p.width = p.size; p.height = p.size;
    }
  }

  spawnPurifyBurst(x: number, y: number, _profile: VfxProfile) {
    // 큰 백색 충격파 + 플래시
    this.shockwaves.push({ x, y, radius: 5, maxRadius: 90, alpha: 0.7, color: 0xffffff, elapsed: 0, duration: 400 });
    triggerFlash(0xffffff);
  }

  spawnFortress(x: number, y: number, profile: VfxProfile) {
    // 이중 배리어 링 + 4개 큰 사각 파편
    this.shockwaves.push({ x: x + 30, y, radius: 8, maxRadius: 75, alpha: 0.6, color: profile.color, elapsed: 0, duration: 400 });
    this.shockwaves.push({ x: x + 30, y, radius: 5, maxRadius: 50, alpha: 0.4, color: this.brighten(profile.color, 0.85), elapsed: 80, duration: 350 });
    for (let i = 0; i < 4; i++) {
      const p = this.acquire();
      if (!p) break;
      const angle = (i / 4) * Math.PI * 2;
      p.active = true;
      p.x = x + 30 + Math.cos(angle) * 25;
      p.y = y + Math.sin(angle) * 35;
      p.vx = Math.cos(angle) * 0.2; p.vy = -0.5 - Math.random();
      p.life = i * 40; p.maxLife = 600;
      p.size = 7; p.color = profile.color; p.alpha = 0.8;
      p.rotation = angle; p.rotationSpeed = 0.02;
      p.friction = 0.98; p.gravity = 0.01;
      p.shape = 'RECT'; p.width = 12; p.height = 7;
    }
  }

  // === 적 공격 ===

  spawnEnemyMelee(x: number, y: number, profile: VfxProfile) {
    // 단일 굵은 슬래시 (플레이어에게)
    this.spawnCenteredLine(x, y, -135, 70, 5, 0xffffff, 350);
    const sp = profile.shakeProfile;
    triggerShake(sp.intensity, sp.axis, sp.durationMs, sp.decayRate);
    triggerHitStop(profile.hitStopMs);
  }

  spawnEnemyRanged(fromX: number, fromY: number, toX: number, toY: number, profile: VfxProfile) {
    // 굵은 탄환 궤적 + 임팩트 링
    this.lineTraces.push({ fromX, fromY, toX, toY, width: 4, maxWidth: 6, alpha: 0.9, color: profile.color, elapsed: 0, duration: 180 });
    this.shockwaves.push({ x: toX, y: toY, radius: 3, maxRadius: 25, alpha: 0.4, color: profile.color, elapsed: 0, duration: 200 });
    const sp = profile.shakeProfile;
    triggerShake(sp.intensity, sp.axis, sp.durationMs, sp.decayRate);
    triggerHitStop(profile.hitStopMs);
  }

  spawnEnemyBuff(x: number, y: number, profile: VfxProfile) {
    // 링 + 3개 원 상승
    this.shockwaves.push({ x, y, radius: 10, maxRadius: 45, alpha: 0.4, color: profile.color, elapsed: 0, duration: 350 });
    for (let i = 0; i < 3; i++) {
      const p = this.acquire();
      if (!p) break;
      p.active = true;
      p.x = x + (Math.random() - 0.5) * 30;
      p.y = y + 10;
      p.vx = (Math.random() - 0.5) * 0.3; p.vy = -1 - Math.random();
      p.life = 0; p.maxLife = 450;
      p.size = 4 + Math.random() * 2; p.color = profile.color; p.alpha = 0.7;
      p.rotation = 0; p.rotationSpeed = 0; p.friction = 0.99; p.gravity = -0.008;
      p.shape = 'CIRCLE'; p.width = p.size; p.height = p.size;
    }
  }

  // === 상태이상 / 사망 / 반사 ===

  spawnBurnTick(x: number, y: number, profile: VfxProfile) {
    // 3개 큰 불꽃 원
    for (let i = 0; i < 3; i++) {
      const p = this.acquire();
      if (!p) break;
      p.active = true;
      p.x = x + (Math.random() - 0.5) * 30;
      p.y = y + (Math.random() - 0.5) * 20;
      p.vx = (Math.random() - 0.5) * 0.8; p.vy = -1.5 - Math.random();
      p.life = 0; p.maxLife = 350;
      p.size = 4 + Math.random() * 3; p.color = Math.random() > 0.5 ? profile.color : 0xff3300; p.alpha = 0.9;
      p.rotation = 0; p.rotationSpeed = 0; p.friction = 0.98; p.gravity = -0.02;
      p.shape = 'CIRCLE'; p.width = p.size; p.height = p.size;
    }
    const sp = profile.shakeProfile;
    if (sp.intensity > 0) triggerShake(sp.intensity, sp.axis, sp.durationMs, sp.decayRate);
  }

  spawnPoisonTick(x: number, y: number, profile: VfxProfile) {
    // 3개 큰 독 거품
    for (let i = 0; i < 3; i++) {
      const p = this.acquire();
      if (!p) break;
      p.active = true;
      p.x = x + (Math.random() - 0.5) * 25;
      p.y = y + Math.random() * 15;
      p.vx = (Math.random() - 0.5) * 0.4; p.vy = -1 - Math.random();
      p.life = 0; p.maxLife = 450;
      p.size = 5 + Math.random() * 3; p.color = Math.random() > 0.4 ? profile.color : 0x44ff88; p.alpha = 0.7;
      p.rotation = 0; p.rotationSpeed = 0; p.friction = 0.99; p.gravity = -0.012;
      p.shape = 'CIRCLE'; p.width = p.size; p.height = p.size;
    }
    const sp = profile.shakeProfile;
    if (sp.intensity > 0) triggerShake(sp.intensity, sp.axis, sp.durationMs, sp.decayRate);
  }

  spawnEnemyDeath(x: number, y: number, profile: VfxProfile) {
    // 큰 충격파 + 플래시 + 4개 큰 파편
    this.shockwaves.push({ x, y, radius: 5, maxRadius: 90, alpha: 0.7, color: 0xffffff, elapsed: 0, duration: 400 });
    for (let i = 0; i < 4; i++) {
      const p = this.acquire();
      if (!p) break;
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 4;
      p.active = true;
      p.x = x; p.y = y;
      p.vx = Math.cos(angle) * speed; p.vy = Math.sin(angle) * speed - 1;
      p.life = 0; p.maxLife = 500;
      p.size = 5 + Math.random() * 4; p.color = this.darken(0xffffff, 0.5 + Math.random() * 0.5); p.alpha = 0.9;
      p.rotation = Math.random() * Math.PI * 2; p.rotationSpeed = (Math.random() - 0.5) * 0.15;
      p.friction = 0.96; p.gravity = 0.1;
      p.shape = 'RECT'; p.width = 6 + Math.random() * 5; p.height = 4 + Math.random() * 4;
    }
    triggerFlash(0xffffff);
    const sp = profile.shakeProfile;
    triggerShake(sp.intensity, sp.axis, sp.durationMs, sp.decayRate);
    triggerHitStop(profile.hitStopMs);
  }

  spawnReflect(fromX: number, fromY: number, toX: number, toY: number, profile: VfxProfile) {
    // 굵은 반사 궤적 + 임팩트 링
    this.lineTraces.push({ fromX, fromY, toX, toY, width: 4, maxWidth: 5, alpha: 0.8, color: profile.color, elapsed: 0, duration: 150 });
    this.shockwaves.push({ x: toX, y: toY, radius: 3, maxRadius: 25, alpha: 0.4, color: profile.color, elapsed: 0, duration: 200 });
    const sp = profile.shakeProfile;
    triggerShake(sp.intensity, sp.axis, sp.durationMs, sp.decayRate);
    triggerHitStop(profile.hitStopMs);
  }

  // === 물리 업데이트 ===

  tick(deltaMs: number) {
    if (this.activeCount === 0 && this.shockwaves.length === 0 && this.lineTraces.length === 0) return;

    const dt = deltaMs / 16;

    // 파티클 물리
    for (let i = 0; i < POOL_SIZE; i++) {
      const p = this.particles[i];
      if (!p.active) continue;
      p.life += deltaMs;
      if (p.life >= p.maxLife) {
        p.active = false;
        this.release(i);
        continue;
      }
      p.vx *= p.friction;
      p.vy *= p.friction;
      p.vy += p.gravity;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rotation += p.rotationSpeed;
      p.alpha = 1 - p.life / p.maxLife;

      // 아지랑이 sin파 흔들림 (상승하는 CIRCLE만)
      if (p.shape === 'CIRCLE' && p.gravity < 0) {
        p.x += Math.sin(p.life * 0.008 + p.y * 0.01) * 0.3;
      }
    }

    // 충격파 진행 — swap-and-pop으로 splice 제거
    let swLen = this.shockwaves.length;
    for (let i = swLen - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.elapsed += deltaMs;
      const t = sw.elapsed / sw.duration;
      if (t >= 1) {
        this.shockwaves[i] = this.shockwaves[--swLen];
        this.shockwaves.length = swLen;
        continue;
      }
      sw.radius = sw.maxRadius * this.easeOutQuad(t);
      sw.alpha = 0.7 * (1 - t);
    }

    // 라인트레이스 진행 — swap-and-pop
    let ltLen = this.lineTraces.length;
    for (let i = ltLen - 1; i >= 0; i--) {
      const lt = this.lineTraces[i];
      lt.elapsed += deltaMs;
      const t = lt.elapsed / lt.duration;
      if (t >= 1) {
        this.lineTraces[i] = this.lineTraces[--ltLen];
        this.lineTraces.length = ltLen;
        continue;
      }
      lt.alpha = 1 - t;
      lt.width = lt.maxWidth * (1 - t * 0.5);
    }
  }

  // === Graphics 렌더링 ===

  draw() {
    const g = this.graphics;
    if (!g) return;
    g.clear();

    if (this.activeCount === 0 && this.shockwaves.length === 0 && this.lineTraces.length === 0) return;

    const S = VFX_SCALE;

    // 충격파
    for (const sw of this.shockwaves) {
      g.lineStyle(3 * S, sw.color, sw.alpha);
      g.drawCircle(sw.x, sw.y, sw.radius * S);
    }

    // 라인트레이스
    for (const lt of this.lineTraces) {
      g.lineStyle(lt.width * S, lt.color, lt.alpha);
      g.moveTo(lt.fromX, lt.fromY);
      g.lineTo(lt.toX, lt.toY);
    }

    // 파티클
    g.lineStyle(0);

    for (let i = 0; i < POOL_SIZE; i++) {
      const p = this.particles[i];
      if (!p.active || p.alpha <= 0.01) continue;

      if (p.shape === 'CIRCLE') {
        g.beginFill(p.color, p.alpha);
        g.drawCircle(p.x, p.y, p.size * S);
        g.endFill();
      } else if (p.shape === 'RECT') {
        g.beginFill(p.color, p.alpha);
        const w = p.width * S;
        const h = p.height * S;
        if (w < 10 && h < 10) {
          g.drawRect(p.x - w / 2, p.y - h / 2, w, h);
        } else {
          const cos = Math.cos(p.rotation);
          const sin = Math.sin(p.rotation);
          const hw = w / 2;
          const hh = h / 2;
          g.moveTo(p.x - hw * cos + hh * sin, p.y - hw * sin - hh * cos);
          g.lineTo(p.x + hw * cos + hh * sin, p.y + hw * sin - hh * cos);
          g.lineTo(p.x + hw * cos - hh * sin, p.y + hw * sin + hh * cos);
          g.lineTo(p.x - hw * cos - hh * sin, p.y - hw * sin + hh * cos);
          g.closePath();
        }
        g.endFill();
      } else { // LINE — 뾰족한 테이퍼 형태 (날카로운 시작 → 넓은 끝) + 성장 애니메이션
        const cos = Math.cos(p.rotation);
        const sin = Math.sin(p.rotation);
        // 처음 35% 동안 길이가 0→100%로 성장 (긋는 느낌)
        const progress = p.life / p.maxLife;
        const growFactor = progress < 0.35 ? progress / 0.35 : 1.0;
        const len = p.width * S * growFactor;
        const half = p.height * S * 0.6;
        const px = -sin * half;
        const py = cos * half;
        const endX = p.x + cos * len;
        const endY = p.y + sin * len;
        g.beginFill(p.color, p.alpha);
        g.moveTo(p.x, p.y);              // 시작 (뾰족)
        g.lineTo(endX + px, endY + py);  // 끝 좌 (넓음)
        g.lineTo(endX - px, endY - py);  // 끝 우 (넓음)
        g.closePath();
        g.endFill();
      }
    }
  }

  // === 전체 초기화 ===
  reset() {
    for (const p of this.particles) {
      p.active = false;
    }
    this.freeList = Array.from({ length: POOL_SIZE }, (_, i) => POOL_SIZE - 1 - i);
    this.activeCount = 0;
    this.shockwaves.length = 0;
    this.lineTraces.length = 0;
    if (this.graphics) this.graphics.clear();
  }

  // === 유틸 ===
  private darken(color: number, factor: number): number {
    const r = Math.floor(((color >> 16) & 0xff) * factor);
    const g = Math.floor(((color >> 8) & 0xff) * factor);
    const b = Math.floor((color & 0xff) * factor);
    return (r << 16) | (g << 8) | b;
  }

  private brighten(color: number, factor: number): number {
    const r = Math.min(255, Math.floor(((color >> 16) & 0xff) / factor));
    const g = Math.min(255, Math.floor(((color >> 8) & 0xff) / factor));
    const b = Math.min(255, Math.floor((color & 0xff) / factor));
    return (r << 16) | (g << 8) | b;
  }

  private easeOutQuad(t: number): number {
    return 1 - (1 - t) * (1 - t);
  }
}
