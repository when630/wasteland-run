// HP 바 — Pixi.js Graphics 기반 체력 표시 컴포넌트

import React, { useCallback } from 'react';
import { Container, Graphics, Text } from '@pixi/react';
import * as PIXI from 'pixi.js';

interface HpBarProps {
  currentHp: number;
  maxHp: number;
  width: number;
  height: number;
  x?: number;
  y?: number;
  fillColor?: number;
  bgColor?: number;
  borderColor?: number;
  previewDamage?: number;
  showText?: boolean;
  fontSize?: number;
  dynamicColor?: boolean;
}

const hpTextStyleCache = new Map<string, PIXI.TextStyle>();
function getHpTextStyle(fontSize: number): PIXI.TextStyle {
  const key = `${fontSize}`;
  if (!hpTextStyleCache.has(key)) {
    hpTextStyleCache.set(key, new PIXI.TextStyle({
      fill: 0xffffff,
      fontSize,
      fontWeight: 'bold',
      stroke: 0x000000,
      strokeThickness: 2,
    }));
  }
  return hpTextStyleCache.get(key)!;
}

export const HpBar: React.FC<HpBarProps> = ({
  currentHp,
  maxHp,
  width: barWidth,
  height: barHeight,
  x = 0,
  y = 0,
  fillColor = 0x44ff44,
  bgColor = 0x333333,
  borderColor = 0x888888,
  previewDamage = 0,
  showText = true,
  fontSize = 13,
  dynamicColor = true,
}) => {
  const hpRatio = Math.max(0, Math.min(1, currentHp / maxHp));
  const previewRatio = Math.max(0, Math.min(hpRatio, (currentHp - previewDamage) / maxHp));

  // HP 비율에 따른 색상 (녹색 → 노랑 → 빨강)
  const dynamicFillColor = dynamicColor
    ? (hpRatio > 0.5 ? fillColor : hpRatio > 0.25 ? 0xffaa00 : 0xff3333)
    : fillColor;

  const draw = useCallback((g: PIXI.Graphics) => {
    g.clear();

    // 배경
    g.beginFill(bgColor, 0.8);
    g.drawRoundedRect(0, 0, barWidth, barHeight, 3);
    g.endFill();

    // 예상 데미지 미리보기 (현재 HP 부분을 빨간색으로 표시)
    if (previewDamage > 0 && hpRatio > 0) {
      g.beginFill(dynamicFillColor, 0.4);
      g.drawRoundedRect(1, 1, (barWidth - 2) * hpRatio, barHeight - 2, 2);
      g.endFill();

      // 예상 데미지 후 남은 HP
      if (previewRatio > 0) {
        g.beginFill(dynamicFillColor, 1);
        g.drawRoundedRect(1, 1, (barWidth - 2) * previewRatio, barHeight - 2, 2);
        g.endFill();
      }

      // 데미지 영역 노란색 오버레이
      const dmgStart = Math.max(0, previewRatio);
      const dmgEnd = hpRatio;
      if (dmgEnd > dmgStart) {
        g.beginFill(0xffcc00, 0.8);
        g.drawRoundedRect(
          1 + (barWidth - 2) * dmgStart,
          1,
          (barWidth - 2) * (dmgEnd - dmgStart),
          barHeight - 2,
          2,
        );
        g.endFill();
      }
    } else {
      // 일반 HP 바
      if (hpRatio > 0) {
        g.beginFill(dynamicFillColor, 1);
        g.drawRoundedRect(1, 1, (barWidth - 2) * hpRatio, barHeight - 2, 2);
        g.endFill();
      }
    }

    // 테두리
    g.lineStyle(1, borderColor, 0.6);
    g.drawRoundedRect(0, 0, barWidth, barHeight, 3);
  }, [barWidth, barHeight, hpRatio, previewRatio, previewDamage, dynamicFillColor, bgColor, borderColor]);

  const textStyle = getHpTextStyle(fontSize);

  return (
    <Container x={x} y={y}>
      <Graphics draw={draw} />
      {showText && (
        <Text
          text={`${currentHp}/${maxHp}`}
          x={barWidth / 2}
          y={barHeight / 2}
          anchor={0.5}
          style={textStyle}
        />
      )}
    </Container>
  );
};
