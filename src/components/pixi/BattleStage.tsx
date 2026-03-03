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

  // 브라우저 리사이즈 대응용 크기 상태를 나중에 추가할 수 있게 윈도우 객체 참조
  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 800;
  const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 600;

  return (
    <Stage
      width={screenWidth}
      height={screenHeight}
      options={{ backgroundColor: 0x1a1a1a }} // 어두운 황무지 테마
    >
      <Container>
        {/* 플레이어 (좌측) */}
        <Sprite
          texture={placeholderTexture as any}
          x={screenWidth * 0.2}
          y={screenHeight * 0.6}
          width={100}
          height={150}
          anchor={0.5}
          tint={0x00ff00} // 녹색 임시 플레이어
        />
        <Text
          text="Player"
          x={screenWidth * 0.2}
          y={screenHeight * 0.6 - 100}
          anchor={0.5}
          style={defaultTextStyle}
        />

        {/* 적 1 (우측) */}
        <Sprite
          texture={placeholderTexture as any}
          x={screenWidth * 0.8}
          y={screenHeight * 0.6}
          width={120}
          height={160}
          anchor={0.5}
          tint={0xff0000} // 빨간색 임시 적
        />
        <Text
          text="Enemy: 고철 수집가"
          x={screenWidth * 0.8}
          y={screenHeight * 0.6 - 110}
          anchor={0.5}
          style={defaultTextStyle}
        />

        {/* 중앙 상태 텍스트 (피드백용) */}
        <Text
          text={currentTurn === 'PLAYER' ? "Your Turn" : "Enemy Turn"}
          x={screenWidth * 0.5}
          y={screenHeight * 0.3}
          anchor={0.5}
          style={turnTextStyle}
        />
      </Container>
    </Stage>
  );
};
