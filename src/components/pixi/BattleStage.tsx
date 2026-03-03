import React, { useMemo } from 'react';
import { Stage, Container, Sprite, Text } from '@pixi/react';
import * as PIXI from 'pixi.js';
import { useBattleStore } from '../../store/useBattleStore';

export const BattleStage: React.FC = () => {
  const { currentTurn } = useBattleStore();

  // 타입 충돌을 피하기 위해 useMemo로 텍스처와 스타일 인스턴스 생성
  const placeholderTexture = useMemo(() => PIXI.Texture.WHITE, []);

  const defaultTextStyle = useMemo(() => new PIXI.TextStyle({
    fill: 0xffffff,
    fontSize: 18,
  }), []);

  const turnTextStyle = useMemo(() => new PIXI.TextStyle({
    fill: currentTurn === 'PLAYER' ? 0xffff00 : 0xff5555,
    fontSize: 32,
    fontWeight: 'bold',
  }), [currentTurn]);

  // 브라우저 리사이즈 대응 및 16:9 비율 유지를 위한 크기 상태
  const [dimensions, setDimensions] = React.useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    height: typeof window !== 'undefined' ? window.innerHeight : 1080,
    scale: 1,
  });

  React.useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      // 16:9 기준(1920x1080)으로 화면 꽉 차게 비율(scale) 계산
      const targetRatio = 16 / 9;
      const currentRatio = w / h;

      let scale = 1;
      if (currentRatio > targetRatio) {
        // 화면이 기준보다 가로로 넓은 경우: 높이에 맞춤
        scale = h / 1080;
      } else {
        // 화면이 기준보다 세로로 긴 경우: 너비에 맞춤
        scale = w / 1920;
      }

      setDimensions({
        width: w,
        height: h,
        scale,
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // 초기 크기 계산
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { width: screenWidth, height: screenHeight, scale } = dimensions;

  return (
    <Stage
      width={screenWidth}
      height={screenHeight}
      options={{ backgroundColor: 0x1a1a1a }} // 어두운 황무지 테마
    >
      <Container
        scale={scale}
        x={(screenWidth - 1920 * scale) / 2}
        y={(screenHeight - 1080 * scale) / 2}
      >
        {/* 플레이어 (좌측) */}
        <Sprite
          texture={placeholderTexture as any}
          x={1920 * 0.25}
          y={1080 * 0.6}
          width={150}
          height={220}
          anchor={0.5}
          tint={0x00ff00} // 녹색 임시 플레이어
        />
        <Text
          text="Player"
          x={1920 * 0.25}
          y={1080 * 0.6 - 150}
          anchor={0.5}
          style={defaultTextStyle}
        />

        {/* 적 1 (우측) */}
        <Sprite
          texture={placeholderTexture as any}
          x={1920 * 0.75}
          y={1080 * 0.6}
          width={180}
          height={240}
          anchor={0.5}
          tint={0xff0000} // 빨간색 임시 적
        />
        <Text
          text="Enemy: 고철 수집가"
          x={1920 * 0.75}
          y={1080 * 0.6 - 160}
          anchor={0.5}
          style={defaultTextStyle}
        />

        {/* 중앙 상태 텍스트 (피드백용) */}
        <Text
          text={currentTurn === 'PLAYER' ? "Your Turn" : "Enemy Turn"}
          x={1920 * 0.5}
          y={1080 * 0.3}
          anchor={0.5}
          style={turnTextStyle}
        />
      </Container>
    </Stage>
  );
};
