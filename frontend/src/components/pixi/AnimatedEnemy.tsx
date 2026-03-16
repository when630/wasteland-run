import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Container, Sprite, Text, useTick } from '@pixi/react';
import * as PIXI from 'pixi.js';
import type { Enemy } from '../../types/enemyTypes';
import type { Card } from '../../types/gameTypes';
import { calculatePreviewDamage } from '../../logic/damageCalculation';
import { useBattleStore } from '../../store/useBattleStore';
import { HpBar } from './HpBar';

// 텍스처 캐시 (동일 URL 중복 생성 방지)
const textureCache = new Map<string, PIXI.Texture>();
function getTexture(url: string | undefined, fallback: PIXI.Texture): PIXI.Texture {
  if (!url) return fallback;
  let tex = textureCache.get(url);
  if (!tex) {
    tex = PIXI.Texture.from(url);
    textureCache.set(url, tex);
  }
  return tex;
}

interface AnimatedEnemyProps {
  enemy: Enemy;
  enemies: Enemy[];
  baseX: number;
  baseY: number;
  isTargeting: boolean;
  canBeTargeted?: boolean;
  onPointerDown: () => void;
  defaultTextStyle: PIXI.TextStyle;
  texture: PIXI.Texture;
  isActive?: boolean;
  targetingCard?: Card;
  physicalScalingBonus?: number;
  playerAmmo?: number;
}

export const AnimatedEnemy: React.FC<AnimatedEnemyProps> = ({
  enemy,
  enemies,
  baseX,
  baseY,
  isTargeting,
  onPointerDown,
  defaultTextStyle,
  texture,
  isActive = false,
  canBeTargeted = false,
  targetingCard,
  physicalScalingBonus = 0,
  playerAmmo = 0,
}) => {
  // 애니메이션용 로컬 오프셋 및 색상
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const hasSprite = !!enemy.spriteUrl;
  const [tint, setTint] = useState<number>(hasSprite ? 0xffffff : 0xff0000);
  const [alpha, setAlpha] = useState(1);
  const [scaleModifier, setScaleModifier] = useState(1);
  // DOM 레벨 마우스 추적 기반 호버 (Pixi pointerover 대신)
  const previewTargetEnemyId = useBattleStore(s => s.previewTargetEnemyId);
  const isPreviewHovered = previewTargetEnemyId === enemy.id;

  // 상태이상 예상 데미지 (항상 표시)
  const statusPreviewDamage = useMemo(() => {
    const statuses = enemy.statuses || {};
    let dmg = 0;
    if (statuses.BURN && statuses.BURN > 0) dmg += statuses.BURN * 3;
    if (statuses.POISON && statuses.POISON > 0) dmg += statuses.POISON;
    return dmg;
  }, [enemy.statuses]);

  // 호버 시 카드 예상 데미지 계산 (DOM 레벨 마우스 추적 기반)
  const cardPreviewDamage = useMemo(() => {
    if (!isPreviewHovered || !targetingCard || !canBeTargeted) return 0;
    if (targetingCard.type !== 'PHYSICAL_ATTACK' && targetingCard.type !== 'SPECIAL_ATTACK') return 0;
    return calculatePreviewDamage(targetingCard, enemy, enemies, physicalScalingBonus, playerAmmo);
  }, [isPreviewHovered, targetingCard, canBeTargeted, enemy, enemies, physicalScalingBonus, playerAmmo]);

  // 합산 예상 데미지
  const previewDamage = cardPreviewDamage + statusPreviewDamage;

  const defaultTint = hasSprite ? 0xffffff : 0xff0000;

  // 타겟 가능 해제 시 금색 tint/scale 즉시 초기화
  useEffect(() => {
    if (!canBeTargeted) {
      setTint(defaultTint);
      setScaleModifier(1);
    }
  }, [canBeTargeted, defaultTint]);

  // 활성 상태(공격 모션) 연출용
  const activeTimerRef = React.useRef<number>(0);

  React.useEffect(() => {
    if (isActive && enemy.currentHp > 0) {
      activeTimerRef.current = Date.now();
    } else {
      activeTimerRef.current = 0;
    }
  }, [isActive, enemy.currentHp]);

  // PIXI Ticker 루프 - 컴포넌트 마운트 및 매 프레임마다 실행
  useTick(() => {
    // 스프라이트 페이즈 업데이트 (텍스처 전환용)
    if (hasSprite && enemy.visualEffect) {
      const elapsed = Date.now() - enemy.visualEffect.tick;
      if (enemy.visualEffect.type === 'ATTACKING' && elapsed < 600) {
        if (spritePhaseRef.current !== 'attack') { spritePhaseRef.current = 'attack'; setSpritePhase('attack'); }
      } else if (enemy.visualEffect.type === 'DAMAGE' && elapsed < 300) {
        if (spritePhaseRef.current !== 'hit') { spritePhaseRef.current = 'hit'; setSpritePhase('hit'); }
      } else if (spritePhaseRef.current !== 'idle') {
        spritePhaseRef.current = 'idle'; setSpritePhase('idle');
      }
    } else if (hasSprite && spritePhaseRef.current !== 'idle') {
      spritePhaseRef.current = 'idle'; setSpritePhase('idle');
    }

    // ── 최우선: 사망 페이드아웃 ──
    if (enemy.currentHp <= 0) {
      setAlpha((prev) => Math.max(0, prev - 0.05));
      setTint(0x555555);
      setOffsetX(0);
      setOffsetY(0);
      setScaleModifier(1);
      return;
    }

    // ── visualEffect 처리 (데미지/화상/독/버프 — 최우선 이펙트) ──
    if (enemy.visualEffect) {
      const now = Date.now();
      const elapsed = now - enemy.visualEffect.tick;

      if (enemy.visualEffect.type === 'DAMAGE') {
        if (elapsed < 100) {
          setOffsetX(20 * (1 - elapsed / 100));
          setTint(0xff2222);
        } else if (elapsed < 200) {
          const t = (elapsed - 100) / 100;
          setOffsetX(-8 * (1 - t));
          setTint(0xff6666);
        } else if (elapsed < 300) {
          setOffsetX(0);
          setTint(defaultTint);
        } else {
          setOffsetX(0);
          setTint(defaultTint);
        }
        setScaleModifier(1);
        return;
      }

      if (enemy.visualEffect.type === 'BURN_TICK') {
        if (elapsed < 400) {
          const pulse = Math.sin(elapsed * 0.03) * 0.5 + 0.5;
          const g = Math.floor(0x44 + pulse * 0x44);
          setTint((0xff << 16) | (g << 8) | 0x00);
          setOffsetY(Math.sin(elapsed * 0.08) * 4);
          setOffsetX(0);
        } else {
          setTint(defaultTint);
          setOffsetY(0);
          setOffsetX(0);
        }
        setScaleModifier(1);
        return;
      }

      if (enemy.visualEffect.type === 'POISON_TICK') {
        if (elapsed < 400) {
          const t = elapsed / 400;
          setTint(0x22ff44);
          setScaleModifier(0.92 + 0.08 * t);
          setOffsetX(0);
          setOffsetY(0);
        } else {
          setTint(defaultTint);
          setScaleModifier(1);
        }
        return;
      }

      if (enemy.visualEffect.type === 'BURN_POISON_TICK') {
        if (elapsed < 500) {
          const cycle = Math.floor(elapsed / 80) % 2;
          setTint(cycle === 0 ? 0xff6600 : 0x22ff44);
          setOffsetY(Math.sin(elapsed * 0.08) * 4);
          setScaleModifier(0.94 + 0.06 * (elapsed / 500));
        } else {
          setTint(defaultTint);
          setOffsetY(0);
          setScaleModifier(1);
        }
        return;
      }

      if (enemy.visualEffect.type === 'BUFF') {
        if (elapsed < 500) {
          setTint(0x4444ff);
        } else {
          setTint(defaultTint);
        }
        return;
      }

      if (enemy.visualEffect.type === 'ATTACKING') {
        // ATTACKING은 아래 isActive 로직에서 처리
      }
    }

    // ── 활성 상태: 공격 모션 연출 (색상 변화 없이 진동만) ──
    if (isActive && activeTimerRef.current > 0) {
      const elapsed = Date.now() - activeTimerRef.current;
      const shake = Math.sin(elapsed * 0.05) * 6 * Math.max(0, 1 - elapsed / 600);
      setOffsetX(shake);
      setTint(defaultTint);
      setScaleModifier(1.05);
      setOffsetY(0);
      return;
    }

    // ── 타겟 가능 상태: 금색 맥동 ──
    if (canBeTargeted) {
      const t = Date.now() * 0.004;
      const pulse = Math.sin(t) * 0.5 + 0.5;
      const r = 0xff;
      const g = Math.floor(0x88 + pulse * 0x44);
      const b = Math.floor(0x00 + pulse * 0x33);
      setTint((r << 16) | (g << 8) | b);
      setScaleModifier(1.02 + Math.sin(t) * 0.03);
      setOffsetX(0);
      setOffsetY(0);
      return;
    }

    // ── 기본 상태: 초기화 ──
    setOffsetX(0);
    setOffsetY(0);
    setTint(defaultTint);
    setScaleModifier(1);
  });

  // 보스 분기 처리
  const isBoss = enemy.tier === 'BOSS';
  const isElite = enemy.tier === 'ELITE';
  const targetHeight = isBoss ? 300 : (isElite ? 187 : 153);
  const nameYOffset = isBoss ? -167 : -87;
  const hpYOffset = isBoss ? 173 : 93;

  // 스프라이트 URL이 있으면 상태별 텍스처 전환
  const [spritePhase, setSpritePhase] = useState<'idle' | 'attack' | 'hit'>('idle');
  const spritePhaseRef = useRef(spritePhase);

  const currentTexture = useMemo(() => {
    if (!hasSprite) return texture;
    if (spritePhase === 'attack') return getTexture(enemy.spriteAttackUrl, getTexture(enemy.spriteUrl, texture));
    if (spritePhase === 'hit') return getTexture(enemy.spriteHitUrl, getTexture(enemy.spriteUrl, texture));
    return getTexture(enemy.spriteUrl, texture);
  }, [hasSprite, spritePhase, enemy.spriteUrl, enemy.spriteAttackUrl, enemy.spriteHitUrl, texture]);

  return (
    <Container
      x={baseX + offsetX}
      y={baseY + offsetY}
      alpha={alpha}
      interactive={isTargeting && enemy.currentHp > 0}
      pointerdown={onPointerDown}
    >
      {/* 적 의도/방어/상태이상 → StatusOverlay(React HTML)로 이전됨 */}
      {/* 적 이름 */}
      <Text
        text={enemy.name}
        y={nameYOffset}
        anchor={0.5}
        style={defaultTextStyle}
      />
      <Sprite
        texture={currentTexture}
        scale={hasSprite
          ? (targetHeight / currentTexture.height) * scaleModifier
          : undefined}
        width={hasSprite ? undefined : (isBoss ? 233 : 100) * scaleModifier}
        height={hasSprite ? undefined : (isBoss ? 300 : 133) * scaleModifier}
        anchor={0.5}
        tint={tint}
      />
      {/* 적 체력 바 */}
      <HpBar
        currentHp={enemy.currentHp}
        maxHp={enemy.maxHp}
        width={isBoss ? 160 : 107}
        height={isBoss ? 14 : 12}
        x={isBoss ? -80 : -53}
        y={hpYOffset - 4}
        fillColor={0xff4444}
        previewDamage={previewDamage}
        fontSize={isBoss ? 11 : 10}
        dynamicColor={false}
      />
    </Container>
  );
};
