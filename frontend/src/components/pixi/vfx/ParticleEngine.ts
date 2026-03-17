// 핵심 파티클 시스템 — PIXI.Graphics 명령적(imperative) 렌더링
// 오브젝트 풀로 GC 압력 방지

import * as PIXI from 'pixi.js';
import type { Particle, Shockwave, LineTrace } from './types';
import { triggerShake, triggerHitStop, triggerFlash } from './vfxDispatcher';
import type { VfxProfile } from './types';

const POOL_SIZE = 150;
/** 전체 파티클/이펙트 시각 배율 — 1.0이 기본, 높을수록 크고 굵게 */
const VFX_SCALE = 1.8;

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

  // === 카테고리별 스폰 메서드 ===

  spawnHeavyKinetic(x: number, y: number, profile: VfxProfile) {
    const count = 6 + Math.floor(Math.random() * 5); // 6~10
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
    const count = 10 + Math.floor(Math.random() * 8); // 10~17
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
    const count = 12 + Math.floor(Math.random() * 8); // 12~19
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

    const sp = profile.shakeProfile;
    triggerShake(sp.intensity, sp.axis, sp.durationMs, sp.decayRate);
    triggerHitStop(profile.hitStopMs);
  }

  // === 방어 카드 스폰 메서드 ===

  spawnShieldBarrier(x: number, y: number, profile: VfxProfile) {
    // 육각형 배리어 파편 — 플레이어 앞에 위로 퍼지는 파란 사각 파편
    const count = 7 + Math.floor(Math.random() * 4); // 7~10
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
    const count = 8 + Math.floor(Math.random() * 5); // 8~12
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

  // === 새 카테고리 스폰 메서드 ===

  spawnBladeSlash(x: number, y: number, profile: VfxProfile) {
    // 대각선 슬래시 아크 — 빠른 백색 선 2~3줄
    const slashCount = 2 + Math.floor(Math.random() * 2); // 2~3
    for (let i = 0; i < slashCount; i++) {
      const p = this.acquire();
      if (!p) break;
      const baseAngle = (-120 + i * 35 + Math.random() * 20) * Math.PI / 180;
      p.active = true;
      p.x = x + (Math.random() - 0.5) * 20;
      p.y = y + (Math.random() - 0.5) * 20;
      p.vx = Math.cos(baseAngle) * 3;
      p.vy = Math.sin(baseAngle) * 3;
      p.life = 0;
      p.maxLife = 150 + Math.random() * 100;
      p.size = 2;
      p.color = 0xffffff;
      p.alpha = 0.95;
      p.rotation = baseAngle;
      p.rotationSpeed = 0;
      p.friction = 0.94;
      p.gravity = 0;
      p.shape = 'LINE';
      p.width = 25 + Math.random() * 20;
      p.height = 2.5;
    }

    // 미세 파편
    const debrisCount = 4 + Math.floor(Math.random() * 4);
    for (let i = 0; i < debrisCount; i++) {
      const p = this.acquire();
      if (!p) break;
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 2.5;
      p.active = true;
      p.x = x + (Math.random() - 0.5) * 15;
      p.y = y + (Math.random() - 0.5) * 15;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;
      p.life = 0;
      p.maxLife = 250 + Math.random() * 200;
      p.size = 2 + Math.random() * 3;
      p.color = this.darken(profile.color, 0.6 + Math.random() * 0.4);
      p.alpha = 0.8;
      p.rotation = Math.random() * Math.PI * 2;
      p.rotationSpeed = (Math.random() - 0.5) * 0.15;
      p.friction = 0.95;
      p.gravity = 0.08;
      p.shape = 'RECT';
      p.width = 2 + Math.random() * 3;
      p.height = 1 + Math.random() * 2;
    }

    const sp = profile.shakeProfile;
    triggerShake(sp.intensity, sp.axis, sp.durationMs, sp.decayRate);
    triggerHitStop(profile.hitStopMs);
  }

  spawnGroundPound(x: number, y: number, profile: VfxProfile) {
    // 수평 충격파 — 지면 레벨에서 확산
    this.shockwaves.push({
      x, y: y + 30,
      radius: 8,
      maxRadius: 100 + Math.random() * 40,
      alpha: 0.6,
      color: profile.color,
      elapsed: 0,
      duration: 450,
    });

    // 갈색 먼지 파티클 — 아래에서 위로 상승
    const count = 10 + Math.floor(Math.random() * 6); // 10~15
    for (let i = 0; i < count; i++) {
      const p = this.acquire();
      if (!p) break;
      p.active = true;
      p.x = x + (Math.random() - 0.5) * 100;
      p.y = y + 20 + Math.random() * 20;
      p.vx = (Math.random() - 0.5) * 2;
      p.vy = -1.5 - Math.random() * 3;
      p.life = 0;
      p.maxLife = 500 + Math.random() * 400;
      p.size = 3 + Math.random() * 4;
      p.color = this.darken(profile.color, 0.5 + Math.random() * 0.5);
      p.alpha = 0.7;
      p.rotation = 0;
      p.rotationSpeed = 0;
      p.friction = 0.97;
      p.gravity = 0.02;
      p.shape = 'CIRCLE';
      p.width = p.size;
      p.height = p.size;
    }

    // 지면 파편 — 좌우로 튀는 돌 조각
    const debrisCount = 4 + Math.floor(Math.random() * 3);
    for (let i = 0; i < debrisCount; i++) {
      const p = this.acquire();
      if (!p) break;
      const angle = (-30 + Math.random() * 60 - 90) * Math.PI / 180;
      const speed = 2 + Math.random() * 4;
      p.active = true;
      p.x = x + (Math.random() - 0.5) * 40;
      p.y = y + 20;
      p.vx = Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1);
      p.vy = Math.sin(angle) * speed;
      p.life = 0;
      p.maxLife = 350 + Math.random() * 250;
      p.size = 3 + Math.random() * 4;
      p.color = profile.color;
      p.alpha = 0.85;
      p.rotation = Math.random() * Math.PI * 2;
      p.rotationSpeed = (Math.random() - 0.5) * 0.2;
      p.friction = 0.95;
      p.gravity = 0.15;
      p.shape = 'RECT';
      p.width = 3 + Math.random() * 5;
      p.height = 2 + Math.random() * 3;
    }

    const sp = profile.shakeProfile;
    triggerShake(sp.intensity, sp.axis, sp.durationMs, sp.decayRate);
    triggerHitStop(profile.hitStopMs);
  }

  spawnBerserk(x: number, y: number, profile: VfxProfile) {
    // 붉은 에너지 파티클 — 중심에서 바깥으로 폭발
    const count = 10 + Math.floor(Math.random() * 5); // 10~14
    for (let i = 0; i < count; i++) {
      const p = this.acquire();
      if (!p) break;
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 5;
      p.active = true;
      p.x = x + (Math.random() - 0.5) * 15;
      p.y = y + (Math.random() - 0.5) * 15;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed - 1;
      p.life = 0;
      p.maxLife = 350 + Math.random() * 300;
      p.size = 3 + Math.random() * 4;
      p.color = Math.random() > 0.3 ? profile.color : 0xff6600;
      p.alpha = 0.95;
      p.rotation = Math.random() * Math.PI * 2;
      p.rotationSpeed = (Math.random() - 0.5) * 0.2;
      p.friction = 0.94;
      p.gravity = 0.05;
      p.shape = Math.random() > 0.5 ? 'CIRCLE' : 'RECT';
      p.width = p.size;
      p.height = p.size * 0.7;
    }

    // 분노 충격파
    this.shockwaves.push({
      x, y,
      radius: 8,
      maxRadius: 90 + Math.random() * 30,
      alpha: 0.7,
      color: profile.color,
      elapsed: 0,
      duration: 350,
    });

    triggerFlash(profile.color);
    const sp = profile.shakeProfile;
    triggerShake(sp.intensity, sp.axis, sp.durationMs, sp.decayRate);
    triggerHitStop(profile.hitStopMs);
  }

  spawnScatterShot(fromX: number, fromY: number, targets: { x: number; y: number }[], profile: VfxProfile) {
    // 부채꼴 다중 탄환 궤적 — 각 타겟에 선 궤적
    for (const target of targets) {
      this.lineTraces.push({
        fromX, fromY,
        toX: target.x + (Math.random() - 0.5) * 30,
        toY: target.y + (Math.random() - 0.5) * 20,
        width: 2.5 + Math.random() * 2,
        maxWidth: 4,
        alpha: 0.9,
        color: profile.color,
        elapsed: 0,
        duration: 130,
      });

      // 타격 스파크
      const sparkCount = 3 + Math.floor(Math.random() * 3);
      for (let i = 0; i < sparkCount; i++) {
        const p = this.acquire();
        if (!p) break;
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.5 + Math.random() * 3;
        p.active = true;
        p.x = target.x + (Math.random() - 0.5) * 15;
        p.y = target.y + (Math.random() - 0.5) * 15;
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed;
        p.life = 0;
        p.maxLife = 120 + Math.random() * 80;
        p.size = 2 + Math.random() * 2;
        p.color = this.brighten(profile.color, 0.9);
        p.alpha = 1;
        p.rotation = 0;
        p.rotationSpeed = 0;
        p.friction = 0.93;
        p.gravity = 0.05;
        p.shape = 'CIRCLE';
        p.width = p.size;
        p.height = p.size;
      }
    }

    // 추가 산탄 궤적 (빗나간 탄) — 분위기 연출
    const extraCount = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < extraCount; i++) {
      const avgX = targets.reduce((s, t) => s + t.x, 0) / targets.length;
      const avgY = targets.reduce((s, t) => s + t.y, 0) / targets.length;
      this.lineTraces.push({
        fromX, fromY,
        toX: avgX + (Math.random() - 0.5) * 120,
        toY: avgY + (Math.random() - 0.5) * 80,
        width: 1.5 + Math.random() * 1.5,
        maxWidth: 3,
        alpha: 0.5,
        color: this.darken(profile.color, 0.7),
        elapsed: 0,
        duration: 100,
      });
    }

    const sp = profile.shakeProfile;
    triggerShake(sp.intensity, sp.axis, sp.durationMs, sp.decayRate);
    triggerHitStop(profile.hitStopMs);
  }

  spawnHealPulse(x: number, y: number, profile: VfxProfile) {
    // 녹색 힐링 파티클 — 부드럽게 위로 상승
    const count = 10 + Math.floor(Math.random() * 6); // 10~15
    for (let i = 0; i < count; i++) {
      const p = this.acquire();
      if (!p) break;
      p.active = true;
      p.x = x + (Math.random() - 0.5) * 50;
      p.y = y + (Math.random() - 0.5) * 30 + 10;
      p.vx = (Math.random() - 0.5) * 0.4;
      p.vy = -0.8 - Math.random() * 1.8;
      p.life = 0;
      p.maxLife = 600 + Math.random() * 400;
      p.size = 2 + Math.random() * 3;
      p.color = Math.random() > 0.4 ? profile.color : 0x88ffcc;
      p.alpha = 0.8;
      p.rotation = 0;
      p.rotationSpeed = 0;
      p.friction = 0.99;
      p.gravity = -0.008;
      p.shape = 'CIRCLE';
      p.width = p.size;
      p.height = p.size;
    }

    // 힐 펄스 링
    this.shockwaves.push({
      x, y,
      radius: 10,
      maxRadius: 55 + Math.random() * 20,
      alpha: 0.4,
      color: profile.color,
      elapsed: 0,
      duration: 500,
    });
  }

  spawnBloodSacrifice(x: number, y: number, profile: VfxProfile) {
    // 붉은 방울 — 위에서 아래로 떨어지는 혈흔
    const dropCount = 8 + Math.floor(Math.random() * 5); // 8~12
    for (let i = 0; i < dropCount; i++) {
      const p = this.acquire();
      if (!p) break;
      p.active = true;
      p.x = x + (Math.random() - 0.5) * 40;
      p.y = y + (Math.random() - 0.5) * 20 - 10;
      p.vx = (Math.random() - 0.5) * 1.5;
      p.vy = 0.5 + Math.random() * 2;
      p.life = 0;
      p.maxLife = 350 + Math.random() * 250;
      p.size = 2 + Math.random() * 3;
      p.color = Math.random() > 0.3 ? profile.color : 0xcc0000;
      p.alpha = 0.9;
      p.rotation = 0;
      p.rotationSpeed = 0;
      p.friction = 0.98;
      p.gravity = 0.12;
      p.shape = 'CIRCLE';
      p.width = p.size;
      p.height = p.size;
    }

    // 금빛 스파클 — 대가로 얻는 이득 표현
    const sparkCount = 6 + Math.floor(Math.random() * 4);
    for (let i = 0; i < sparkCount; i++) {
      const p = this.acquire();
      if (!p) break;
      p.active = true;
      p.x = x + (Math.random() - 0.5) * 50;
      p.y = y + (Math.random() - 0.5) * 30;
      p.vx = (Math.random() - 0.5) * 0.6;
      p.vy = -1 - Math.random() * 1.5;
      p.life = 100 + Math.random() * 100; // 붉은 방울 후 지연 시작
      p.maxLife = 700;
      p.size = 2 + Math.random() * 2;
      p.color = 0xffcc44;
      p.alpha = 0.9;
      p.rotation = 0;
      p.rotationSpeed = 0;
      p.friction = 0.99;
      p.gravity = -0.01;
      p.shape = 'CIRCLE';
      p.width = p.size;
      p.height = p.size;
    }

    triggerFlash(0xff2222);
  }

  spawnPowerSurge(x: number, y: number, profile: VfxProfile) {
    // 나선형 에너지 파티클 — 중심에서 회전하며 상승
    const count = 12 + Math.floor(Math.random() * 6); // 12~17
    for (let i = 0; i < count; i++) {
      const p = this.acquire();
      if (!p) break;
      const angle = (i / count) * Math.PI * 2;
      const radius = 15 + Math.random() * 25;
      p.active = true;
      p.x = x + Math.cos(angle) * radius;
      p.y = y + Math.sin(angle) * radius * 0.4;
      p.vx = Math.cos(angle + Math.PI / 2) * 1.5; // 접선 방향 → 나선
      p.vy = -1.5 - Math.random() * 2;
      p.life = 0;
      p.maxLife = 500 + Math.random() * 400;
      p.size = 2 + Math.random() * 3;
      p.color = Math.random() > 0.3 ? profile.color : this.brighten(profile.color, 0.85);
      p.alpha = 0.85;
      p.rotation = 0;
      p.rotationSpeed = 0;
      p.friction = 0.98;
      p.gravity = -0.015;
      p.shape = 'CIRCLE';
      p.width = p.size;
      p.height = p.size;
    }

    // 파워업 팽창 링
    this.shockwaves.push({
      x, y,
      radius: 8,
      maxRadius: 65 + Math.random() * 20,
      alpha: 0.5,
      color: profile.color,
      elapsed: 0,
      duration: 450,
    });

    // 두 번째 작은 링 (겹침 효과)
    this.shockwaves.push({
      x, y,
      radius: 5,
      maxRadius: 40 + Math.random() * 15,
      alpha: 0.35,
      color: this.brighten(profile.color, 0.85),
      elapsed: 0,
      duration: 350,
    });
  }

  spawnPurifyBurst(x: number, y: number, profile: VfxProfile) {
    // 백색 방사형 폭발 — 정화 이펙트
    const count = 10 + Math.floor(Math.random() * 6); // 10~15
    for (let i = 0; i < count; i++) {
      const p = this.acquire();
      if (!p) break;
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.2;
      const speed = 2 + Math.random() * 4;
      p.active = true;
      p.x = x;
      p.y = y;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;
      p.life = 0;
      p.maxLife = 300 + Math.random() * 250;
      p.size = 2 + Math.random() * 3;
      p.color = Math.random() > 0.5 ? 0xffffff : profile.color;
      p.alpha = 0.95;
      p.rotation = 0;
      p.rotationSpeed = 0;
      p.friction = 0.95;
      p.gravity = 0;
      p.shape = 'CIRCLE';
      p.width = p.size;
      p.height = p.size;
    }

    // 정화 충격파
    this.shockwaves.push({
      x, y,
      radius: 5,
      maxRadius: 80 + Math.random() * 25,
      alpha: 0.6,
      color: 0xffffff,
      elapsed: 0,
      duration: 400,
    });

    triggerFlash(0xffffff);
  }

  spawnFortress(x: number, y: number, profile: VfxProfile) {
    // 다층 육각 배리어 — 여러 겹의 방어막 파편
    const count = 10 + Math.floor(Math.random() * 5); // 10~14
    for (let i = 0; i < count; i++) {
      const p = this.acquire();
      if (!p) break;
      const layer = Math.floor(Math.random() * 3); // 0,1,2 레이어
      const angle = (i / count) * Math.PI * 2 + layer * 0.3;
      const radius = 20 + layer * 15 + Math.random() * 10;
      p.active = true;
      p.x = x + 30 + Math.cos(angle) * radius * 0.6;
      p.y = y + Math.sin(angle) * radius;
      p.vx = Math.cos(angle) * 0.3;
      p.vy = -0.5 - Math.random() * 1.5;
      p.life = layer * 60; // 레이어별 시차
      p.maxLife = 600 + Math.random() * 300;
      p.size = 5 + Math.random() * 5;
      p.color = this.brighten(profile.color, 0.85 + layer * 0.05);
      p.alpha = 0.75;
      p.rotation = angle;
      p.rotationSpeed = (Math.random() - 0.5) * 0.03;
      p.friction = 0.98;
      p.gravity = 0.01;
      p.shape = 'RECT';
      p.width = 7 + Math.random() * 6;
      p.height = 4 + Math.random() * 4;
    }

    // 다중 충격파 (겹침)
    this.shockwaves.push({
      x: x + 40, y,
      radius: 8,
      maxRadius: 70 + Math.random() * 20,
      alpha: 0.55,
      color: profile.color,
      elapsed: 0,
      duration: 400,
    });
    this.shockwaves.push({
      x: x + 40, y,
      radius: 5,
      maxRadius: 50 + Math.random() * 15,
      alpha: 0.4,
      color: this.brighten(profile.color, 0.85),
      elapsed: 80,
      duration: 350,
    });
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
    const debrisCount = 3 + Math.floor(Math.random() * 3);
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
    const count = 8 + Math.floor(Math.random() * 5); // 8~12
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
      } else { // LINE — 뾰족한 테이퍼 형태 (날카로운 시작 → 넓은 끝)
        const cos = Math.cos(p.rotation);
        const sin = Math.sin(p.rotation);
        const len = p.width * S;
        const half = p.height * S * 0.6;
        const px = -sin * half;
        const py = cos * half;
        const endX = p.x + cos * len;
        const endY = p.y + sin * len;
        g.beginFill(p.color, p.alpha);
        g.moveTo(p.x, p.y);              // 뾰족한 시작점
        g.lineTo(endX + px, endY + py);  // 끝 좌
        g.lineTo(endX - px, endY - py);  // 끝 우
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
