import React, { useState, useMemo } from 'react';
import { Text, useTick } from '@pixi/react';
import * as PIXI from 'pixi.js';

interface DamageNumberProps {
  amount: number;
  x: number;
  y: number;
  color: number;
  createdAt: number;
  delay: number;
}

export const DamageNumber: React.FC<DamageNumberProps> = ({ amount, x, y, color, createdAt, delay }) => {
  const [offsetY, setOffsetY] = useState(0);
  const [alpha, setAlpha] = useState(0);

  const textStyle = useMemo(() => new PIXI.TextStyle({
    fill: color,
    fontSize: 28,
    fontWeight: 'bold',
    stroke: 0x000000,
    strokeThickness: 3,
  }), [color]);

  useTick(() => {
    const elapsed = Date.now() - createdAt - delay;
    if (elapsed < 0) {
      setAlpha(0);
      return;
    }
    const progress = Math.min(elapsed / 800, 1);
    setOffsetY(-60 * progress);
    setAlpha(progress < 0.6 ? 1 : 1 - (progress - 0.6) / 0.4);
  });

  return (
    <Text
      text={`${amount}`}
      x={x}
      y={y + offsetY}
      alpha={alpha}
      anchor={0.5}
      style={textStyle}
    />
  );
};
