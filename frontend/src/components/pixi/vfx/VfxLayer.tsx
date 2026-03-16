// VFX 렌더 레이어 — @pixi/react Graphics + useTick으로 명령적 렌더링

import React, { useRef, useCallback } from 'react';
import { Graphics, useTick } from '@pixi/react';
import * as PIXI from 'pixi.js';
import { ParticleEngine } from './ParticleEngine';
import { VFX_PROFILES, ENEMY_VFX } from './vfxProfiles';
import {
  consumeVfxCommands,
  tickShake,
  getVfxShake,
  tickHitStop,
  tickFlash,
  getFlash,
} from './vfxDispatcher';

interface VfxLayerProps {
  onShakeUpdate: (x: number, y: number) => void;
}

export const VfxLayer: React.FC<VfxLayerProps> = ({ onShakeUpdate }) => {
  const engineRef = useRef<ParticleEngine>(new ParticleEngine());
  const lastTimeRef = useRef<number>(Date.now());
  const flashGraphicsRef = useRef<PIXI.Graphics | null>(null);

  const drawMain = useCallback((g: PIXI.Graphics) => {
    engineRef.current.setGraphics(g);
  }, []);

  const drawFlash = useCallback((g: PIXI.Graphics) => {
    flashGraphicsRef.current = g;
  }, []);

  useTick(() => {
    try {
      const now = Date.now();
      const deltaMs = Math.min(now - lastTimeRef.current, 50);
      lastTimeRef.current = now;

      const stopped = tickHitStop(deltaMs);

      // 커맨드 소비 → 스폰
      const commands = consumeVfxCommands();
      for (const cmd of commands) {
        let profile = VFX_PROFILES[cmd.cardBaseId];
        if (!profile && cmd.cardBaseId.startsWith('__enemy_')) {
          const key = cmd.cardBaseId.replace(/__/g, '').replace('enemy_', '').toUpperCase();
          profile = ENEMY_VFX[key];
        }
        if (!profile) continue;

        for (const target of cmd.targetPositions) {
          switch (profile.category) {
            case 'HEAVY_KINETIC':
              engineRef.current.spawnHeavyKinetic(target.x, target.y, profile);
              break;
            case 'HIGH_RPM_FRICTION':
              engineRef.current.spawnFrictionSparks(target.x, target.y, profile);
              break;
            case 'THERMAL_AOE':
              engineRef.current.spawnThermalAoe(target.x, target.y, profile);
              break;
            case 'ELECTROMAGNETIC':
              // 총알은 발사 높이와 동일한 수평 직선으로 날아감
              engineRef.current.spawnElectromagnetic(cmd.sourceX, cmd.sourceY, target.x, cmd.sourceY, profile);
              break;
            case 'SHIELD_BARRIER':
              engineRef.current.spawnShieldBarrier(target.x, target.y, profile);
              break;
            case 'RESIST_WARD':
              engineRef.current.spawnResistWard(target.x, target.y, profile);
              break;
            case 'BUFF_AURA':
              engineRef.current.spawnBuffAura(target.x, target.y, profile);
              break;
            case 'ENEMY_MELEE':
              engineRef.current.spawnEnemyMelee(target.x, target.y, profile);
              break;
            case 'ENEMY_RANGED':
              engineRef.current.spawnEnemyRanged(cmd.sourceX, cmd.sourceY, target.x, target.y, profile);
              break;
            case 'ENEMY_BUFF':
              engineRef.current.spawnEnemyBuff(target.x, target.y, profile);
              break;
            case 'STATUS_BURN':
              engineRef.current.spawnBurnTick(target.x, target.y, profile);
              break;
            case 'STATUS_POISON':
              engineRef.current.spawnPoisonTick(target.x, target.y, profile);
              break;
            case 'ENEMY_DEATH':
              engineRef.current.spawnEnemyDeath(target.x, target.y, profile);
              break;
            case 'REFLECT':
              engineRef.current.spawnReflect(cmd.sourceX, cmd.sourceY, target.x, target.y, profile);
              break;
          }
        }
      }

      if (!stopped) {
        engineRef.current.tick(deltaMs);
        tickShake(deltaMs);
      }

      engineRef.current.draw();

      const shake = getVfxShake();
      onShakeUpdate(shake.x, shake.y);

      tickFlash(deltaMs);
      const flash = getFlash();
      if (flashGraphicsRef.current) {
        flashGraphicsRef.current.clear();
        if (flash.alpha > 0.01) {
          flashGraphicsRef.current.beginFill(flash.color, flash.alpha);
          flashGraphicsRef.current.drawRect(0, 0, 1280, 720);
          flashGraphicsRef.current.endFill();
        }
      }
    } catch (e) {
      console.error('[VFX] tick error:', e);
    }
  });

  return (
    <>
      <Graphics draw={drawMain} />
      <Graphics draw={drawFlash} />
    </>
  );
};
