import React, { useState } from 'react';
import { Container, Sprite, Text, useTick } from '@pixi/react';
import * as PIXI from 'pixi.js';
import type { Enemy } from '../../types/enemyTypes';

interface AnimatedEnemyProps {
  enemy: Enemy;
  baseX: number;
  baseY: number;
  isTargeting: boolean;
  onPointerDown: () => void;
  defaultTextStyle: PIXI.TextStyle;
  hpTextStyle: PIXI.TextStyle;
  intentTextStyle: PIXI.TextStyle;
  texture: PIXI.Texture;
}

export const AnimatedEnemy: React.FC<AnimatedEnemyProps> = ({
  enemy,
  baseX,
  baseY,
  isTargeting,
  onPointerDown,
  defaultTextStyle,
  hpTextStyle,
  intentTextStyle,
  texture
}) => {
  // 애니메이션용 로컬 오프셋 및 색상
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0); // 🌟 Y축 떨림용
  const [tint, setTint] = useState<number>(0xff0000); // 기본 몬스터 색상 (빨간색)
  const [alpha, setAlpha] = useState(1); // 사망 시 페이드아웃을 위한 투명도 상태
  const [scaleModifier, setScaleModifier] = useState(1); // 🌟 독 수축 효과용

  // PIXI Ticker 루프 - 컴포넌트 마운트 및 매 프레임마다 실행
  useTick(() => {
    if (!enemy.visualEffect) {
      // 이펙트가 없으면 초기화
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
  const isBoss = enemy.baseId === 'brutus';
  const width = isBoss ? 350 : 150;
  const height = isBoss ? 450 : 200;
  const intentYOffset = isBoss ? -290 : -170;
  const nameYOffset = isBoss ? -250 : -130;
  const hpYOffset = isBoss ? 260 : 140;
  const statYOffset = isBoss ? 290 : 170;

  return (
    <Container
      x={baseX + offsetX}
      y={baseY + offsetY}
      alpha={alpha}
      interactive={isTargeting && enemy.currentHp > 0}
      pointerdown={onPointerDown}
    >
      {/* 적 의도(Intent) */}
      {enemy.currentIntent && (
        <Text
          text={`의도: ${enemy.currentIntent.description}`}
          y={intentYOffset}
          anchor={0.5}
          style={intentTextStyle}
        />
      )}
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
      {/* 적 체력 */}
      <Text
        text={`HP: ${enemy.currentHp} / ${enemy.maxHp}`}
        y={hpYOffset}
        anchor={0.5}
        style={hpTextStyle}
      />
      {/* 적 방어력 */}
      {(enemy.shield > 0 || enemy.resist > 0) && (
        <Text
          text={`🛡️ ${enemy.shield}  |  💠 ${enemy.resist}`}
          y={statYOffset}
          anchor={0.5}
          style={defaultTextStyle}
        />
      )}
      {/* 상태이상 (디버프/버프) 표시 */}
      {enemy.statuses && Object.keys(enemy.statuses).length > 0 && (
        <Text
          text={Object.entries(enemy.statuses)
            .filter(([, val]) => val > 0)
            .map(([key, val]) => {
              if (key === 'BURN') return `🔥${val}`;
              if (key === 'POISON') return `☣️${val}`;
              if (key === 'VULNERABLE') return `💔${val}`;
              if (key === 'WEAK') return `⏬${val}`;
              return `${key}:${val}`;
            }).join(' ')}
          y={statYOffset + 30}
          anchor={0.5}
          style={new PIXI.TextStyle({ ...defaultTextStyle, fontSize: 16 })}
        />
      )}
    </Container>
  );
};
