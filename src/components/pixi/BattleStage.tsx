import React, { useMemo } from 'react';
import { Stage, Container, Sprite, Text } from '@pixi/react';
import * as PIXI from 'pixi.js';
import { useBattleStore } from '../../store/useBattleStore';

export const BattleStage: React.FC = () => {
  // 스토어에서 현재 턴과 적 목록 가져오기
  const { currentTurn, enemies } = useBattleStore();

  // 테스트용 1번 적
  const enemy = enemies.length > 0 ? enemies[0] : null;

  // 타입 충돌을 피하기 위해 useMemo로 텍스처와 스타일 인스턴스 생성
  const placeholderTexture = useMemo(() => PIXI.Texture.WHITE, []);

  const defaultTextStyle = useMemo(() => new PIXI.TextStyle({
    fill: 0xffffff,
    fontSize: 18,
  }), []);

  const hpTextStyle = useMemo(() => new PIXI.TextStyle({
    fill: 0xff4444,
    fontSize: 20,
    fontWeight: 'bold',
  }), []);

  const intentTextStyle = useMemo(() => new PIXI.TextStyle({
    fill: 0x4499ff,
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

      const targetRatio = 16 / 9;
      const currentRatio = w / h;

      let scale = 1;
      if (currentRatio > targetRatio) {
        scale = h / 1080;
      } else {
        scale = w / 1920;
      }

      setDimensions({ width: w, height: h, scale });
    };

    window.addEventListener('resize', handleResize);
    handleResize();
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

        {/* 적 1 (우측) 데이터 렌더링 */}
        {enemy && (
          <>
            <Sprite
              texture={placeholderTexture as any}
              x={1920 * 0.75}
              y={1080 * 0.6}
              width={180}
              height={240}
              anchor={0.5}
              tint={0xff0000} // 빨간색 임시 적
            />
            {/* 적 이름 */}
            <Text
              text={enemy.name}
              x={1920 * 0.75}
              y={1080 * 0.6 - 170}
              anchor={0.5}
              style={defaultTextStyle}
            />
            {/* 적 체력 */}
            <Text
              text={`HP: ${enemy.currentHp} / ${enemy.maxHp}`}
              x={1920 * 0.75}
              y={1080 * 0.6 - 140}
              anchor={0.5}
              style={hpTextStyle}
            />
            {/* 적 방어력 */}
            {(enemy.shield > 0 || enemy.resist > 0) && (
              <Text
                text={`[S: ${enemy.shield} | R: ${enemy.resist}]`}
                x={1920 * 0.75}
                y={1080 * 0.6 - 110}
                anchor={0.5}
                style={defaultTextStyle}
              />
            )}
            {/* 적 의도(Intent) */}
            {enemy.currentIntent && (
              <Text
                text={`의도: ${enemy.currentIntent.description}`}
                x={1920 * 0.75}
                y={1080 * 0.6 - 200}
                anchor={0.5}
                style={intentTextStyle}
              />
            )}
          </>
        )}

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
