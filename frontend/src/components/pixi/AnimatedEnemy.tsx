import React, { useState, useMemo } from 'react';
import { Container, Sprite, Text, useTick } from '@pixi/react';
import * as PIXI from 'pixi.js';
import type { Enemy } from '../../types/enemyTypes';
import type { Card } from '../../types/gameTypes';
import { calculatePreviewDamage } from '../../logic/damageCalculation';
import { HpBar } from './HpBar';

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
  const [tint, setTint] = useState<number>(0xff0000);
  const [alpha, setAlpha] = useState(1);
  const [scaleModifier, setScaleModifier] = useState(1);
  const [isHovered, setIsHovered] = useState(false);

  // 상태이상 예상 데미지 (항상 표시)
  const statusPreviewDamage = useMemo(() => {
    const statuses = enemy.statuses || {};
    let dmg = 0;
    if (statuses.BURN && statuses.BURN > 0) dmg += statuses.BURN * 3;
    if (statuses.POISON && statuses.POISON > 0) dmg += statuses.POISON;
    return dmg;
  }, [enemy.statuses]);

  // 호버 시 카드 예상 데미지 계산
  const cardPreviewDamage = useMemo(() => {
    if (!isHovered || !targetingCard || !canBeTargeted) return 0;
    if (targetingCard.type !== 'PHYSICAL_ATTACK' && targetingCard.type !== 'SPECIAL_ATTACK') return 0;
    return calculatePreviewDamage(targetingCard, enemy, enemies, physicalScalingBonus, playerAmmo);
  }, [isHovered, targetingCard, canBeTargeted, enemy, enemies, physicalScalingBonus, playerAmmo]);

  // 합산 예상 데미지
  const previewDamage = cardPreviewDamage + statusPreviewDamage;

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
    // 활성 상태: 제자리 진동 + 밝은 색상으로 공격 모션 연출
    if (isActive && enemy.currentHp > 0 && activeTimerRef.current > 0) {
      const elapsed = Date.now() - activeTimerRef.current;
      // 빠른 좌우 진동 (공격 준비 → 공격)
      const shake = Math.sin(elapsed * 0.05) * 6 * Math.max(0, 1 - elapsed / 600);
      setOffsetX(shake);
      setTint(0xff4444); // 밝은 붉은색
      setScaleModifier(1.05); // 약간 커지는 위압감
      if (!enemy.visualEffect) {
        setOffsetY(0);
        return;
      }
    }

    // 타겟 가능 상태: 금색 맥동 (visualEffect보다 우선)
    if (canBeTargeted && enemy.currentHp > 0) {
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

    if (!enemy.visualEffect) {
      // 이펙트 없고 타겟 불가 → 초기화
      setOffsetX(0);
      setOffsetY(0);
      setTint(0xff0000);
      setScaleModifier(1);
      return;
    }

    const now = Date.now();
    const elapsed = now - enemy.visualEffect.tick;

    if (enemy.visualEffect.type === 'DAMAGE') {
      // 🌟 개선: 넉백(뒤로 밀림) + 붉은 번쩍임
      if (elapsed < 100) {
        // Phase 1: 넉백 (우측으로 밀림)
        setOffsetX(20 * (1 - elapsed / 100));
        setTint(0xff2222); // 붉은 번쩍
      } else if (elapsed < 200) {
        // Phase 2: 반동 (살짝 앞으로)
        const t = (elapsed - 100) / 100;
        setOffsetX(-8 * (1 - t));
        setTint(0xff6666);
      } else if (elapsed < 300) {
        // Phase 3: 원위치 복귀
        setOffsetX(0);
        setTint(0xff0000);
      } else {
        setOffsetX(0);
        setTint(0xff0000);
      }
    } else if (enemy.visualEffect.type === 'BURN_TICK') {
      // 🌟 화상 틱: 오렌지 펄스 + Y축 떨림
      if (elapsed < 400) {
        const pulse = Math.sin(elapsed * 0.03) * 0.5 + 0.5; // 0~1 맥동
        const r = Math.floor(0xff);
        const g = Math.floor(0x44 + pulse * 0x44);
        const b = Math.floor(0x00);
        setTint((r << 16) | (g << 8) | b); // 오렌지~빨강 맥동
        setOffsetY(Math.sin(elapsed * 0.08) * 4); // 작은 Y 떨림 (불에 타는 느낌)
        setOffsetX(0);
      } else {
        setTint(0xff0000);
        setOffsetY(0);
        setOffsetX(0);
      }
    } else if (enemy.visualEffect.type === 'POISON_TICK') {
      // 🌟 맹독 틱: 녹색 펄스 + 수축 효과
      if (elapsed < 400) {
        const t = elapsed / 400;
        setTint(0x22ff44);
        setScaleModifier(0.92 + 0.08 * t);
        setOffsetX(0);
        setOffsetY(0);
      } else {
        setTint(0xff0000);
        setScaleModifier(1);
      }
    } else if (enemy.visualEffect.type === 'BURN_POISON_TICK') {
      // 🌟 화상+맹독 복합 틱: 오렌지↔녹색 교차 + Y떨림 + 수축
      if (elapsed < 500) {
        const cycle = Math.floor(elapsed / 80) % 2; // 80ms마다 색상 교차
        setTint(cycle === 0 ? 0xff6600 : 0x22ff44); // 오렌지 ↔ 녹색
        setOffsetY(Math.sin(elapsed * 0.08) * 4);
        setScaleModifier(0.94 + 0.06 * (elapsed / 500));
      } else {
        setTint(0xff0000);
        setOffsetY(0);
        setScaleModifier(1);
      }
    } else if (enemy.visualEffect.type === 'BUFF') {
      // 버프 푸른색 빛 연출 (기존)
      if (elapsed < 500) {
        setTint(0x4444ff);
      } else {
        setTint(0xff0000);
      }
    }

    // 사망 페이드아웃 연출
    if (enemy.currentHp <= 0) {
      setAlpha((prev) => Math.max(0, prev - 0.05));
      setTint(0x555555);
      return;
    }
  });

  // 보스 분기 처리
  const isBoss = enemy.tier === 'BOSS';
  const width = isBoss ? 350 : 150;
  const height = isBoss ? 450 : 200;
  const nameYOffset = isBoss ? -250 : -130;
  const hpYOffset = isBoss ? 260 : 140;

  return (
    <Container
      x={baseX + offsetX}
      y={baseY + offsetY}
      alpha={alpha}
      interactive={isTargeting && enemy.currentHp > 0}
      pointerdown={onPointerDown}
      pointerover={() => setIsHovered(true)}
      pointerout={() => setIsHovered(false)}
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
        texture={texture}
        width={width * scaleModifier}
        height={height * scaleModifier}
        anchor={0.5}
        tint={tint}
      />
      {/* 적 체력 바 */}
      <HpBar
        currentHp={enemy.currentHp}
        maxHp={enemy.maxHp}
        width={isBoss ? 200 : 120}
        height={isBoss ? 16 : 12}
        x={isBoss ? -100 : -60}
        y={hpYOffset - 6}
        fillColor={0xff4444}
        previewDamage={previewDamage}
        fontSize={isBoss ? 14 : 11}
        dynamicColor={false}
      />
    </Container>
  );
};
