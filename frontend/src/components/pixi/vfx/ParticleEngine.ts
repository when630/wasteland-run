// 핵심 파티클 시스템 — PIXI.Graphics 명령적(imperative) 렌더링
// 오브젝트 풀로 GC 압력 방지

import * as PIXI from 'pixi.js';
import type { Particle, Shockwave, LineTrace } from './types';
import { triggerShake, triggerHitStop, triggerFlash } from './vfxDispatcher';
import type { VfxProfile } from './types';

const POOL_SIZE = 200;

export class ParticleEngine {
  private particles: Particle[];
  private shockwaves: Shockwave[] = [];
  private lineTraces: LineTrace[] = [];
  private graphics: PIXI.Graphics | null = null;

  constructor() {
    // 사전 할당 오브젝트 풀
    this.particles = Array.from({ length: POOL_SIZE }, () => this.createInactiveParticle());
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
    for (const p of this.particles) {
      if (!p.active) return p;
    }
    return null;
  }

  // === 카테고리별 스폰 메서드 ===

  spawnHeavyKinetic(x: number, y: number, profile: VfxProfile) {
    const count = 8 + Math.floor(Math.random() * 8); // 8~15
    for (let i = 0; i < count; i++) {
      const p = this.acquire();
      if (!p) break;
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3;
      p.active = true;
      p.x = x + (Math.random() - 0.5) * 20;
      p.y = y + (Math.random() - 0.5) * 20;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed - 1; // 약간 위로
      p.life = 0;
      p.maxLife = 400 + Math.random() * 300;
      p.size = 3 + Math.random() * 5;
      p.color = this.darken(profile.color, 0.5 + Math.random() * 0.5);
      p.alpha = 0.9;
      p.rotation = Math.random() * Math.PI * 2;
      p.rotationSpeed = (Math.random() - 0.5) * 0.15;
      p.friction = 0.96;
      p.gravity = 0.12;
      p.shape = 'RECT';
      p.width = 3 + Math.random() * 6;
      p.height = 2 + Math.random() * 4;
    }

    // 쉐이크 + 힛스탑
    const sp = profile.shakeProfile;
    triggerShake(sp.intensity, sp.axis, sp.durationMs, sp.decayRate);
    triggerHitStop(profile.hitStopMs);
  }

  spawnFrictionSparks(x: number, y: number, profile: VfxProfile) {
    const count = 15 + Math.floor(Math.random() * 11); // 15~25
    for (let i = 0; i < count; i++) {
      const p = this.acquire();
      if (!p) break;
      // 부채꼴 방사 (좌측 방향, -150도 ~ -30도)
      const angle = (-150 + Math.random() * 120) * Math.PI / 180;
      const speed = 3 + Math.random() * 6;
      p.active = true;
      p.x = x + (Math.random() - 0.5) * 10;
      p.y = y + (Math.random() - 0.5) * 10;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;
      p.life = 0;
      p.maxLife = 200 + Math.random() * 200;
      p.size = 2;
      p.color = this.brighten(profile.color, 0.8 + Math.random() * 0.2);
      p.alpha = 1;
      p.rotation = angle;
      p.rotationSpeed = 0;
      p.friction = 0.92;
      p.gravity = 0.03;
      p.shape = 'LINE';
      p.width = 8 + Math.random() * 12; // 선분 길이
      p.height = 1.5;
    }

    const sp = profile.shakeProfile;
    triggerShake(sp.intensity, sp.axis, sp.durationMs, sp.decayRate);
    triggerHitStop(profile.hitStopMs);
  }

  spawnThermalAoe(x: number, y: number, profile: VfxProfile) {
    // 팽창 충격파 원
    this.shockwaves.push({
      x, y,
      radius: 10,
      maxRadius: 120 + Math.random() * 40,
      alpha: 0.7,
      color: profile.color,
      elapsed: 0,
      duration: 500,
    });

    // 잔류 파티클 (아지랑이 상승)
    const count = 20 + Math.floor(Math.random() * 11); // 20~30
    for (let i = 0; i < count; i++) {
      const p = this.acquire();
      if (!p) break;
      p.active = true;
      p.x = x + (Math.random() - 0.5) * 80;
      p.y = y + (Math.random() - 0.5) * 40;
      p.vx = (Math.random() - 0.5) * 0.8;
      p.vy = -0.5 - Math.random() * 1.5; // 상승
      p.life = 0;
      p.maxLife = 600 + Math.random() * 500;
      p.size = 2 + Math.random() * 4;
      p.color = profile.color;
      p.alpha = 0.6;
      p.rotation = 0;
      p.rotationSpeed = 0;
      p.friction = 0.99;
      p.gravity = -0.01; // 약간 위로 가속 (아지랑이)
      p.shape = 'CIRCLE';
      p.width = p.size;
      p.height = p.size;
    }

    const sp = profile.shakeProfile;
    triggerShake(sp.intensity, sp.axis, sp.durationMs, sp.decayRate);
    triggerHitStop(profile.hitStopMs);
  }

  spawnElectromagnetic(fromX: number, fromY: number, toX: number, toY: number, profile: VfxProfile) {
    // 즉발 선 궤적
    this.lineTraces.push({
      fromX, fromY, toX, toY,
      width: 4 + Math.random() * 3,
      maxWidth: 6,
      alpha: 1,
      color: profile.color,
      elapsed: 0,
      duration: 120,
    });

    // 충돌 스파크 (타격 지점)
    const sparkCount = 5 + Math.floor(Math.random() * 4); // 5~8
    for (let i = 0; i < sparkCount; i++) {
      const p = this.acquire();
      if (!p) break;
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 4;
      p.active = true;
      p.x = toX;
      p.y = toY;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;
      p.life = 0;
      p.maxLife = 150 + Math.random() * 100;
      p.size = 2 + Math.random() * 2;
      p.color = this.brighten(profile.color, 0.9);
      p.alpha = 1;
      p.rotation = 0;
      p.rotationSpeed = 0;
      p.friction = 0.95;
      p.gravity = 0.05;
      p.shape = 'CIRCLE';
      p.width = p.size;
      p.height = p.size;
    }

    // 1프레임 화면 플래시
    triggerFlash(profile.color);

    const sp = profile.shakeProfile;
    triggerShake(sp.intensity, sp.axis, sp.durationMs, sp.decayRate);
    triggerHitStop(profile.hitStopMs);
  }

  // === 방어 카드 스폰 메서드 ===

  spawnShieldBarrier(x: number, y: number, profile: VfxProfile) {
    // 육각형 배리어 파편 — 플레이어 앞에 위로 퍼지는 파란 사각 파편
    const count = 10 + Math.floor(Math.random() * 6); // 10~15
    for (let i = 0; i < count; i++) {
      const p = this.acquire();
      if (!p) break;
      // 플레이어 앞쪽(우측) 부채꼴로 퍼짐
      const angle = (-60 + Math.random() * 120) * Math.PI / 180;
      const speed = 1.5 + Math.random() * 2.5;
      p.active = true;
      p.x = x + 30 + (Math.random() - 0.5) * 40;
      p.y = y + (Math.random() - 0.5) * 80;
      p.vx = Math.cos(angle) * speed * 0.5;
      p.vy = -speed * 0.8 - Math.random() * 1; // 위로 상승
      p.life = 0;
      p.maxLife = 400 + Math.random() * 300;
      p.size = 4 + Math.random() * 4;
      p.color = profile.color;
      p.alpha = 0.8;
      p.rotation = Math.random() * Math.PI;
      p.rotationSpeed = (Math.random() - 0.5) * 0.05;
      p.friction = 0.97;
      p.gravity = 0.02;
      p.shape = 'RECT';
      p.width = 6 + Math.random() * 6;
      p.height = 3 + Math.random() * 3;
    }

    // 배리어 충격파 (작은 반원)
    this.shockwaves.push({
      x: x + 40, y,
      radius: 5,
      maxRadius: 60 + Math.random() * 20,
      alpha: 0.5,
      color: profile.color,
      elapsed: 0,
      duration: 350,
    });
  }

  spawnResistWard(x: number, y: number, profile: VfxProfile) {
    // 에너지 워드 — 플레이어 주변으로 원형 에너지 입자 상승
    const count = 12 + Math.floor(Math.random() * 8); // 12~19
    for (let i = 0; i < count; i++) {
      const p = this.acquire();
      if (!p) break;
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.3;
      const radius = 30 + Math.random() * 40;
      p.active = true;
      p.x = x + Math.cos(angle) * radius;
      p.y = y + Math.sin(angle) * radius * 0.5; // 타원형
      p.vx = Math.cos(angle) * 0.3;
      p.vy = -1.2 - Math.random() * 1.5; // 상승
      p.life = 0;
      p.maxLife = 500 + Math.random() * 400;
      p.size = 2 + Math.random() * 3;
      p.color = profile.color;
      p.alpha = 0.7;
      p.rotation = 0;
      p.rotationSpeed = 0;
      p.friction = 0.99;
      p.gravity = -0.005; // 미세 상승 가속
      p.shape = 'CIRCLE';
      p.width = p.size;
      p.height = p.size;
    }

    // 워드 원 이펙트
    this.shockwaves.push({
      x, y,
      radius: 20,
      maxRadius: 50 + Math.random() * 15,
      alpha: 0.4,
      color: profile.color,
      elapsed: 0,
      duration: 400,
    });
  }

  spawnBuffAura(x: number, y: number, profile: VfxProfile) {
    // 금빛 스파클 — 플레이어 주변에서 위로 상승하는 반짝임
    const count = 8 + Math.floor(Math.random() * 6); // 8~13
    for (let i = 0; i < count; i++) {
      const p = this.acquire();
      if (!p) break;
      p.active = true;
      p.x = x + (Math.random() - 0.5) * 60;
      p.y = y + (Math.random() - 0.5) * 40 + 20;
      p.vx = (Math.random() - 0.5) * 0.5;
      p.vy = -1 - Math.random() * 2;
      p.life = 0;
      p.maxLife = 500 + Math.random() * 500;
      p.size = 2 + Math.random() * 3;
      p.color = profile.color;
      p.alpha = 0.9;
      p.rotation = 0;
      p.rotationSpeed = 0;
      p.friction = 0.99;
      p.gravity = -0.01;
      p.shape = 'CIRCLE';
      p.width = p.size;
      p.height = p.size;
    }
  }

  // === 적 공격 스폰 메서드 ===

  spawnEnemyMelee(x: number, y: number, profile: VfxProfile) {
    // 임팩트 슬래시 — 대각선 줄무늬 + 충돌 파편
    const slashCount = 2 + Math.floor(Math.random() * 2); // 2~3 줄
    for (let i = 0; i < slashCount; i++) {
      const p = this.acquire();
      if (!p) break;
      // 대각선 슬래시 (우상 → 좌하)
      const angle = (-135 + Math.random() * 30 + i * 40) * Math.PI / 180;
      p.active = true;
      p.x = x + (Math.random() - 0.5) * 30;
      p.y = y + (Math.random() - 0.5) * 30;
      p.vx = Math.cos(angle) * 2;
      p.vy = Math.sin(angle) * 2;
      p.life = 0;
      p.maxLife = 200 + Math.random() * 100;
      p.size = 2;
      p.color = 0xffffff;
      p.alpha = 0.9;
      p.rotation = angle;
      p.rotationSpeed = 0;
      p.friction = 0.96;
      p.gravity = 0;
      p.shape = 'LINE';
      p.width = 20 + Math.random() * 15;
      p.height = 2.5;
    }

    // 충돌 파편
    const debrisCount = 5 + Math.floor(Math.random() * 4);
    for (let i = 0; i < debrisCount; i++) {
      const p = this.acquire();
      if (!p) break;
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3;
      p.active = true;
      p.x = x + (Math.random() - 0.5) * 20;
      p.y = y + (Math.random() - 0.5) * 20;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;
      p.life = 0;
      p.maxLife = 250 + Math.random() * 150;
      p.size = 2 + Math.random() * 3;
      p.color = profile.color;
      p.alpha = 0.8;
      p.rotation = Math.random() * Math.PI * 2;
      p.rotationSpeed = (Math.random() - 0.5) * 0.2;
      p.friction = 0.95;
      p.gravity = 0.08;
      p.shape = 'RECT';
      p.width = 2 + Math.random() * 4;
      p.height = 2 + Math.random() * 3;
    }

    const sp = profile.shakeProfile;
    triggerShake(sp.intensity, sp.axis, sp.durationMs, sp.decayRate);
    triggerHitStop(profile.hitStopMs);
  }

  spawnEnemyRanged(fromX: number, fromY: number, toX: number, toY: number, profile: VfxProfile) {
    // 에너지 탄환 궤적 선
    this.lineTraces.push({
      fromX, fromY, toX, toY,
      width: 3 + Math.random() * 2,
      maxWidth: 5,
      alpha: 0.9,
      color: profile.color,
      elapsed: 0,
      duration: 150,
    });

    // 충돌 스파크 (플레이어 위치)
    const sparkCount = 4 + Math.floor(Math.random() * 3);
    for (let i = 0; i < sparkCount; i++) {
      const p = this.acquire();
      if (!p) break;
      const angle = Math.PI * 0.5 + (Math.random() - 0.5) * Math.PI; // 좌측 방향으로 퍼짐
      const speed = 2 + Math.random() * 3;
      p.active = true;
      p.x = toX;
      p.y = toY;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;
      p.life = 0;
      p.maxLife = 120 + Math.random() * 80;
      p.size = 2 + Math.random() * 2;
      p.color = profile.color;
      p.alpha = 1;
      p.rotation = 0;
      p.rotationSpeed = 0;
      p.friction = 0.94;
      p.gravity = 0.04;
      p.shape = 'CIRCLE';
      p.width = p.size;
      p.height = p.size;
    }

    const sp = profile.shakeProfile;
    triggerShake(sp.intensity, sp.axis, sp.durationMs, sp.decayRate);
    triggerHitStop(profile.hitStopMs);
  }

  spawnEnemyBuff(x: number, y: number, profile: VfxProfile) {
    // 적 버프 오라 — 위로 상승하는 파란 입자 + 작은 충격파
    const count = 6 + Math.floor(Math.random() * 4);
    for (let i = 0; i < count; i++) {
      const p = this.acquire();
      if (!p) break;
      p.active = true;
      p.x = x + (Math.random() - 0.5) * 50;
      p.y = y + (Math.random() - 0.5) * 30 + 10;
      p.vx = (Math.random() - 0.5) * 0.4;
      p.vy = -0.8 - Math.random() * 1.2;
      p.life = 0;
      p.maxLife = 400 + Math.random() * 300;
      p.size = 2 + Math.random() * 3;
      p.color = profile.color;
      p.alpha = 0.7;
      p.rotation = 0;
      p.rotationSpeed = 0;
      p.friction = 0.99;
      p.gravity = -0.008;
      p.shape = 'CIRCLE';
      p.width = p.size;
      p.height = p.size;
    }

    this.shockwaves.push({
      x, y,
      radius: 10,
      maxRadius: 45 + Math.random() * 15,
      alpha: 0.35,
      color: profile.color,
      elapsed: 0,
      duration: 350,
    });
  }

  // === 상태이상 / 사망 / 반사 스폰 메서드 ===

  spawnBurnTick(x: number, y: number, profile: VfxProfile) {
    // 불꽃 파티클 — 위로 흔들리며 상승하는 주황/빨강 원
    const count = 6 + Math.floor(Math.random() * 5); // 6~10
    for (let i = 0; i < count; i++) {
      const p = this.acquire();
      if (!p) break;
      p.active = true;
      p.x = x + (Math.random() - 0.5) * 40;
      p.y = y + (Math.random() - 0.5) * 30;
      p.vx = (Math.random() - 0.5) * 1.2;
      p.vy = -1.5 - Math.random() * 2;
      p.life = 0;
      p.maxLife = 300 + Math.random() * 250;
      p.size = 2 + Math.random() * 3;
      p.color = Math.random() > 0.5 ? profile.color : 0xff3300;
      p.alpha = 0.9;
      p.rotation = 0;
      p.rotationSpeed = 0;
      p.friction = 0.98;
      p.gravity = -0.02;
      p.shape = 'CIRCLE';
      p.width = p.size;
      p.height = p.size;
    }

    const sp = profile.shakeProfile;
    if (sp.intensity > 0) triggerShake(sp.intensity, sp.axis, sp.durationMs, sp.decayRate);
  }

  spawnPoisonTick(x: number, y: number, profile: VfxProfile) {
    // 독 거품 — 위로 떠오르는 녹색 원 (버블)
    const count = 5 + Math.floor(Math.random() * 4); // 5~8
    for (let i = 0; i < count; i++) {
      const p = this.acquire();
      if (!p) break;
      p.active = true;
      p.x = x + (Math.random() - 0.5) * 35;
      p.y = y + Math.random() * 20;
      p.vx = (Math.random() - 0.5) * 0.6;
      p.vy = -0.8 - Math.random() * 1.5;
      p.life = 0;
      p.maxLife = 400 + Math.random() * 300;
      p.size = 3 + Math.random() * 4;
      p.color = Math.random() > 0.4 ? profile.color : 0x44ff88;
      p.alpha = 0.7;
      p.rotation = 0;
      p.rotationSpeed = 0;
      p.friction = 0.99;
      p.gravity = -0.015;
      p.shape = 'CIRCLE';
      p.width = p.size;
      p.height = p.size;
    }

    const sp = profile.shakeProfile;
    if (sp.intensity > 0) triggerShake(sp.intensity, sp.axis, sp.durationMs, sp.decayRate);
  }

  spawnEnemyDeath(x: number, y: number, profile: VfxProfile) {
    // 파편 파괴 — 사방으로 흩어지는 흰/회색 사각형 파편 + 충격파
    const count = 12 + Math.floor(Math.random() * 8); // 12~19
    for (let i = 0; i < count; i++) {
      const p = this.acquire();
      if (!p) break;
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 5;
      p.active = true;
      p.x = x + (Math.random() - 0.5) * 30;
      p.y = y + (Math.random() - 0.5) * 30;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed - 1;
      p.life = 0;
      p.maxLife = 500 + Math.random() * 400;
      p.size = 3 + Math.random() * 5;
      p.color = this.darken(profile.color, 0.4 + Math.random() * 0.6);
      p.alpha = 0.9;
      p.rotation = Math.random() * Math.PI * 2;
      p.rotationSpeed = (Math.random() - 0.5) * 0.2;
      p.friction = 0.96;
      p.gravity = 0.1;
      p.shape = 'RECT';
      p.width = 3 + Math.random() * 7;
      p.height = 2 + Math.random() * 5;
    }

    // 사망 충격파
    this.shockwaves.push({
      x, y,
      radius: 5,
      maxRadius: 80 + Math.random() * 30,
      alpha: 0.6,
      color: 0xffffff,
      elapsed: 0,
      duration: 400,
    });

    triggerFlash(0xffffff);
    const sp = profile.shakeProfile;
    triggerShake(sp.intensity, sp.axis, sp.durationMs, sp.decayRate);
    triggerHitStop(profile.hitStopMs);
  }

  spawnReflect(fromX: number, fromY: number, toX: number, toY: number, profile: VfxProfile) {
    // 반사 — 플레이어→적 방향 짧은 선 궤적 + 주황 스파크
    this.lineTraces.push({
      fromX, fromY, toX, toY,
      width: 3,
      maxWidth: 4,
      alpha: 0.8,
      color: profile.color,
      elapsed: 0,
      duration: 100,
    });

    // 반사 스파크 (적 위치)
    const sparkCount = 4 + Math.floor(Math.random() * 3);
    for (let i = 0; i < sparkCount; i++) {
      const p = this.acquire();
      if (!p) break;
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 3;
      p.active = true;
      p.x = toX;
      p.y = toY;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;
      p.life = 0;
      p.maxLife = 150 + Math.random() * 100;
      p.size = 2 + Math.random() * 2;
      p.color = profile.color;
      p.alpha = 1;
      p.rotation = 0;
      p.rotationSpeed = 0;
      p.friction = 0.94;
      p.gravity = 0.04;
      p.shape = 'CIRCLE';
      p.width = p.size;
      p.height = p.size;
    }

    const sp = profile.shakeProfile;
    triggerShake(sp.intensity, sp.axis, sp.durationMs, sp.decayRate);
    triggerHitStop(profile.hitStopMs);
  }

  // === 물리 업데이트 ===

  tick(deltaMs: number) {
    // 파티클 물리
    for (const p of this.particles) {
      if (!p.active) continue;
      p.life += deltaMs;
      if (p.life >= p.maxLife) {
        p.active = false;
        continue;
      }
      p.vx *= p.friction;
      p.vy *= p.friction;
      p.vy += p.gravity;
      p.x += p.vx * (deltaMs / 16);
      p.y += p.vy * (deltaMs / 16);
      p.rotation += p.rotationSpeed;
      p.alpha = Math.max(0, 1 - p.life / p.maxLife);

      // 아지랑이 sin파 흔들림
      if (p.shape === 'CIRCLE' && p.gravity < 0) {
        p.x += Math.sin(p.life * 0.008 + p.y * 0.01) * 0.3;
      }
    }

    // 충격파 진행
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.elapsed += deltaMs;
      const t = sw.elapsed / sw.duration;
      if (t >= 1) {
        this.shockwaves.splice(i, 1);
        continue;
      }
      sw.radius = sw.maxRadius * this.easeOutQuad(t);
      sw.alpha = 0.7 * (1 - t);
    }

    // 라인트레이스 진행
    for (let i = this.lineTraces.length - 1; i >= 0; i--) {
      const lt = this.lineTraces[i];
      lt.elapsed += deltaMs;
      const t = lt.elapsed / lt.duration;
      if (t >= 1) {
        this.lineTraces.splice(i, 1);
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

    // 충격파 (뒤에 먼저 그림)
    for (const sw of this.shockwaves) {
      g.lineStyle(2.5, sw.color, sw.alpha);
      g.drawCircle(sw.x, sw.y, sw.radius);
      // 내부 원 (더 밝게)
      if (sw.radius > 20) {
        g.lineStyle(1.5, sw.color, sw.alpha * 0.5);
        g.drawCircle(sw.x, sw.y, sw.radius * 0.6);
      }
    }

    // 라인트레이스
    for (const lt of this.lineTraces) {
      g.lineStyle(lt.width, lt.color, lt.alpha);
      g.moveTo(lt.fromX, lt.fromY);
      g.lineTo(lt.toX, lt.toY);
      // 잔상 (약간 어긋난 선)
      g.lineStyle(lt.width * 0.4, lt.color, lt.alpha * 0.3);
      g.moveTo(lt.fromX, lt.fromY + 3);
      g.lineTo(lt.toX, lt.toY + 3);
    }

    // 파티클
    for (const p of this.particles) {
      if (!p.active || p.alpha <= 0) continue;

      if (p.shape === 'RECT') {
        g.lineStyle(0);
        g.beginFill(p.color, p.alpha);
        // 회전을 적용한 사각형 (간이 구현: pivot 기준으로 4점 변환)
        const cos = Math.cos(p.rotation);
        const sin = Math.sin(p.rotation);
        const hw = p.width / 2;
        const hh = p.height / 2;
        const corners = [
          { x: -hw, y: -hh }, { x: hw, y: -hh },
          { x: hw, y: hh }, { x: -hw, y: hh },
        ];
        g.moveTo(
          p.x + corners[0].x * cos - corners[0].y * sin,
          p.y + corners[0].x * sin + corners[0].y * cos,
        );
        for (let j = 1; j < 4; j++) {
          g.lineTo(
            p.x + corners[j].x * cos - corners[j].y * sin,
            p.y + corners[j].x * sin + corners[j].y * cos,
          );
        }
        g.closePath();
        g.endFill();
      } else if (p.shape === 'CIRCLE') {
        g.lineStyle(0);
        g.beginFill(p.color, p.alpha);
        g.drawCircle(p.x, p.y, p.size);
        g.endFill();
      } else if (p.shape === 'LINE') {
        // 선분 파티클 (스파크)
        const cos = Math.cos(p.rotation);
        const sin = Math.sin(p.rotation);
        g.lineStyle(p.height, p.color, p.alpha);
        g.moveTo(p.x, p.y);
        g.lineTo(p.x + cos * p.width, p.y + sin * p.width);
      }
    }

    g.lineStyle(0);
  }

  // === 전체 초기화 ===
  reset() {
    for (const p of this.particles) {
      p.active = false;
    }
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
