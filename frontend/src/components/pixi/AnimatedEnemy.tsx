import React, { useMemo, useRef, useEffect, useCallback } from 'react';
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
  const hasSprite = !!enemy.spriteUrl;
  const defaultTint = hasSprite ? 0xffffff : 0xff0000;

  // 애니메이션 값을 ref로 관리 (매 프레임 React 렌더 방지)
  const offsetXRef = useRef(0);
  const offsetYRef = useRef(0);
  const tintRef = useRef<number>(defaultTint);
  const alphaRef = useRef(1);
  const scaleModifierRef = useRef(1);

  // Pixi 디스플레이 오브젝트 직접 참조
  const containerRef = useRef<PIXI.Container>(null);
  const spriteRef = useRef<PIXI.Sprite>(null);

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

  // 타겟 가능 해제 시 금색 tint/scale 즉시 초기화
  useEffect(() => {
    if (!canBeTargeted) {
      tintRef.current = defaultTint;
      scaleModifierRef.current = 1;
      applyToPixi();
    }
  }, [canBeTargeted, defaultTint]);

  // 활성 상태(공격 모션) 연출용
  const activeTimerRef = useRef<number>(0);

  useEffect(() => {
    if (isActive && enemy.currentHp > 0) {
      activeTimerRef.current = Date.now();
    } else {
      activeTimerRef.current = 0;
    }
  }, [isActive, enemy.currentHp]);

  // 스프라이트 페이즈 (텍스처 전환은 React 렌더 필요하므로 useState 유지)
  const [spritePhase, setSpritePhase] = React.useState<'idle' | 'attack' | 'hit'>('idle');
  const spritePhaseRef = useRef(spritePhase);

  // ref 값을 Pixi 오브젝트에 직접 적용
  const applyToPixi = useCallback(() => {
    const container = containerRef.current;
    const sprite = spriteRef.current;
    if (container) {
      container.x = baseX + offsetXRef.current;
      container.y = baseY + offsetYRef.current;
      container.alpha = alphaRef.current;
    }
    if (sprite) {
      sprite.tint = tintRef.current;
      // scaleModifier는 텍스처 높이 기반 계산이 필요하므로 직접 설정
      if (hasSprite) {
        const tex = sprite.texture;
        const targetHeight = enemy.tier === 'BOSS' ? 300 : (enemy.tier === 'ELITE' ? 187 : 153);
        const s = (targetHeight / tex.height) * scaleModifierRef.current;
        sprite.scale.set(s, s);
      } else {
        const isBoss = enemy.tier === 'BOSS';
        const w = (isBoss ? 233 : 100) * scaleModifierRef.current;
        const h = (isBoss ? 300 : 133) * scaleModifierRef.current;
        sprite.width = w;
        sprite.height = h;
      }
    }
  }, [baseX, baseY, hasSprite, enemy.tier]);

  // PIXI Ticker 루프 - 매 프레임마다 실행, ref만 변경하고 Pixi에 직접 적용
  useTick(() => {
    // 스프라이트 페이즈 업데이트 (텍스처 전환용 — 실제 텍스처 변경은 React 필요)
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
      alphaRef.current = Math.max(0, alphaRef.current - 0.05);
      tintRef.current = 0x555555;
      offsetXRef.current = 0;
      offsetYRef.current = 0;
      scaleModifierRef.current = 1;
      applyToPixi();
      return;
    }

    // ── visualEffect 처리 (데미지/화상/독/버프 — 최우선 이펙트) ──
    if (enemy.visualEffect) {
      const now = Date.now();
      const elapsed = now - enemy.visualEffect.tick;

      if (enemy.visualEffect.type === 'DAMAGE') {
        if (elapsed < 100) {
          offsetXRef.current = 20 * (1 - elapsed / 100);
          tintRef.current = 0xff2222;
        } else if (elapsed < 200) {
          const t = (elapsed - 100) / 100;
          offsetXRef.current = -8 * (1 - t);
          tintRef.current = 0xff6666;
        } else {
          offsetXRef.current = 0;
          tintRef.current = defaultTint;
        }
        scaleModifierRef.current = 1;
        applyToPixi();
        return;
      }

      if (enemy.visualEffect.type === 'BURN_TICK') {
        if (elapsed < 400) {
          const pulse = Math.sin(elapsed * 0.03) * 0.5 + 0.5;
          const g = Math.floor(0x44 + pulse * 0x44);
          tintRef.current = (0xff << 16) | (g << 8) | 0x00;
          offsetYRef.current = Math.sin(elapsed * 0.08) * 4;
          offsetXRef.current = 0;
        } else {
          tintRef.current = defaultTint;
          offsetYRef.current = 0;
          offsetXRef.current = 0;
        }
        scaleModifierRef.current = 1;
        applyToPixi();
        return;
      }

      if (enemy.visualEffect.type === 'POISON_TICK') {
        if (elapsed < 400) {
          const t = elapsed / 400;
          tintRef.current = 0x22ff44;
          scaleModifierRef.current = 0.92 + 0.08 * t;
          offsetXRef.current = 0;
          offsetYRef.current = 0;
        } else {
          tintRef.current = defaultTint;
          scaleModifierRef.current = 1;
        }
        applyToPixi();
        return;
      }

      if (enemy.visualEffect.type === 'BURN_POISON_TICK') {
        if (elapsed < 500) {
          const cycle = Math.floor(elapsed / 80) % 2;
          tintRef.current = cycle === 0 ? 0xff6600 : 0x22ff44;
          offsetYRef.current = Math.sin(elapsed * 0.08) * 4;
          scaleModifierRef.current = 0.94 + 0.06 * (elapsed / 500);
        } else {
          tintRef.current = defaultTint;
          offsetYRef.current = 0;
          scaleModifierRef.current = 1;
        }
        applyToPixi();
        return;
      }

      if (enemy.visualEffect.type === 'BUFF') {
        if (elapsed < 500) {
          tintRef.current = 0x4444ff;
        } else {
          tintRef.current = defaultTint;
        }
        applyToPixi();
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
      offsetXRef.current = shake;
      tintRef.current = defaultTint;
      scaleModifierRef.current = 1.05;
      offsetYRef.current = 0;
      applyToPixi();
      return;
    }

    // ── 타겟 가능 상태: 금색 맥동 ──
    if (canBeTargeted) {
      const t = Date.now() * 0.004;
      const pulse = Math.sin(t) * 0.5 + 0.5;
      const r = 0xff;
      const g = Math.floor(0x88 + pulse * 0x44);
      const b = Math.floor(0x00 + pulse * 0x33);
      tintRef.current = (r << 16) | (g << 8) | b;
      scaleModifierRef.current = 1.02 + Math.sin(t) * 0.03;
      offsetXRef.current = 0;
      offsetYRef.current = 0;
      applyToPixi();
      return;
    }

    // ── 기본 상태: 초기화 (값이 다를 때만 적용) ──
    if (offsetXRef.current !== 0 || offsetYRef.current !== 0 ||
        tintRef.current !== defaultTint || scaleModifierRef.current !== 1) {
      offsetXRef.current = 0;
      offsetYRef.current = 0;
      tintRef.current = defaultTint;
      scaleModifierRef.current = 1;
      applyToPixi();
    }
  });

  // 적 크기 — 실제 텍스처 높이 기반 동적 계산
  const isBoss = enemy.tier === 'BOSS';
  const isElite = enemy.tier === 'ELITE';
  const defaultHeight = isBoss ? 300 : (isElite ? 187 : 153);
  const targetHeight = hasSprite
    ? Math.min(isBoss ? 350 : (isElite ? 220 : 180), Math.max(100, defaultHeight))
    : defaultHeight;
  // 이름: 스프라이트 상단에서 약간 위
  const nameYOffset = -(targetHeight / 2) - 14;
  // HP바: 스프라이트 하단에서 약간 아래
  const hpYOffset = (targetHeight / 2) + 8;

  const currentTexture = useMemo(() => {
    if (!hasSprite) return texture;
    if (spritePhase === 'attack') return getTexture(enemy.spriteAttackUrl, getTexture(enemy.spriteUrl, texture));
    if (spritePhase === 'hit') return getTexture(enemy.spriteHitUrl, getTexture(enemy.spriteUrl, texture));
    return getTexture(enemy.spriteUrl, texture);
  }, [hasSprite, spritePhase, enemy.spriteUrl, enemy.spriteAttackUrl, enemy.spriteHitUrl, texture]);

  return (
    <Container
      ref={containerRef}
      x={baseX + offsetXRef.current}
      y={baseY + offsetYRef.current}
      alpha={alphaRef.current}
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
        ref={spriteRef}
        texture={currentTexture}
        scale={hasSprite
          ? (targetHeight / currentTexture.height) * scaleModifierRef.current
          : undefined}
        width={hasSprite ? undefined : (isBoss ? 233 : 100) * scaleModifierRef.current}
        height={hasSprite ? undefined : (isBoss ? 300 : 133) * scaleModifierRef.current}
        anchor={0.5}
        tint={tintRef.current}
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
