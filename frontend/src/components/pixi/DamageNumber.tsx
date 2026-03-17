import React, { useRef, useMemo, useCallback } from 'react';
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
  const textRef = useRef<PIXI.Text>(null);
  const offsetYRef = useRef(0);
  const alphaRef = useRef(0);

  const textStyle = useMemo(() => new PIXI.TextStyle({
    fontFamily: 'Galmuri11',
    fill: color,
    fontSize: 28,
    fontWeight: 'bold',
    stroke: 0x000000,
    strokeThickness: 3,
  }), [color]);

  useTick(() => {
    const elapsed = Date.now() - createdAt - delay;
    if (elapsed < 0) {
      if (textRef.current) textRef.current.alpha = 0;
      return;
    }
    const progress = Math.min(elapsed / 800, 1);
    offsetYRef.current = -60 * progress;
    alphaRef.current = progress < 0.6 ? 1 : 1 - (progress - 0.6) / 0.4;

    if (textRef.current) {
      textRef.current.y = y + offsetYRef.current;
      textRef.current.alpha = alphaRef.current;
    }
  });

  const setRef = useCallback((node: PIXI.Text) => {
    (textRef as React.MutableRefObject<PIXI.Text | null>).current = node;
  }, []);

  return (
    <Text
      ref={setRef}
      text={`${amount}`}
      x={x}
      y={y}
      alpha={0}
      anchor={0.5}
      style={textStyle}
    />
  );
};
