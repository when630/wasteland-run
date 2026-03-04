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
  const [tint, setTint] = useState<number>(0xff0000); // 기본 몬스터 색상 (빨간색)
  const [alpha, setAlpha] = useState(1); // 🌟 사망 시 페이드아웃을 위한 투명도 상태

  // PIXI Ticker 루프 - 컴포넌트 마운트 및 매 프레임마다 실행
  useTick(() => {
    if (!enemy.visualEffect) {
      // 이펙트가 없으면 초기화
      setOffsetX(0);
      setTint(0xff0000);
      return;
    }

    const now = Date.now();
    const elapsed = now - enemy.visualEffect.tick;

    if (enemy.visualEffect.type === 'DAMAGE') {
      // 0.3초 한정 셰이크 & 틴트 효과
      if (elapsed < 300) {
        // 좌우 흔들기 (사인파 활용)
        setOffsetX(Math.sin(elapsed * 0.1) * 10);
        // 번쩍이는 흰색
        setTint(0xffffff);
      } else {
        setOffsetX(0);
        setTint(0xff0000);
      }
    } else if (enemy.visualEffect.type === 'BUFF') {
      // 0.5초 한정 쉴드/버프 푸른색 빛 연출
      if (elapsed < 500) {
        setTint(0x4444ff); // 파란-보라 계열
      } else {
        setTint(0xff0000);
      }
    }

    // 사망 페이드아웃 연출
    if (enemy.currentHp <= 0) {
      setAlpha((prev) => Math.max(0, prev - 0.05)); // 프레임당 투명도 감소
      setTint(0x555555); // 죽어가는 잿빛
      return;
    }
  });

  // 보스 분기 처리
  const isBoss = enemy.baseId === 'brutus';
  const width = isBoss ? 350 : 150;
  const height = isBoss ? 450 : 200;
  const nameYOffset = isBoss ? -260 : -140;
  const hpYOffset = isBoss ? -230 : -110;
  const statYOffset = isBoss ? -200 : -80;
  const intentYOffset = isBoss ? -290 : -170;

  return (
    <Container
      x={baseX + offsetX}
      y={baseY}
      alpha={alpha} // 상태 기반 투명도 적용
      interactive={isTargeting && enemy.currentHp > 0} // 죽은 적은 타겟 불가능
      pointerdown={onPointerDown}
      cursor={isTargeting && enemy.currentHp > 0 ? 'crosshair' : 'default'}
    >
      <Sprite
        texture={texture}
        width={width}
        height={height}
        anchor={0.5}
        tint={tint}
      />
      {/* 적 이름 */}
      <Text
        text={enemy.name}
        y={nameYOffset}
        anchor={0.5}
        style={defaultTextStyle}
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
          text={`[S: ${enemy.shield} | R: ${enemy.resist}]`}
          y={statYOffset}
          anchor={0.5}
          style={defaultTextStyle}
        />
      )}
      {/* 적 의도(Intent) */}
      {enemy.currentIntent && (
        <Text
          text={`의도: ${enemy.currentIntent.description}`} // 향후 이모지 부착 작업 연계
          y={intentYOffset}
          anchor={0.5}
          style={intentTextStyle}
        />
      )}
    </Container>
  );
};
