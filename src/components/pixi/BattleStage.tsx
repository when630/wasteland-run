import React, { useMemo } from 'react';
import { Stage, Container, Sprite, Text } from '@pixi/react';
import * as PIXI from 'pixi.js';
import { useBattleStore } from '../../store/useBattleStore';
import { useRunStore } from '../../store/useRunStore';
import { useCardPlay } from '../../hooks/useCardPlay';

export const BattleStage: React.FC = () => {
  // 스토어에서 런 상태 및 전투 상태 가져오기
  const { playerHp, playerMaxHp } = useRunStore();
  const { currentTurn, enemies, playerStatus, targetingCardId } = useBattleStore();
  const { playCard } = useCardPlay();

  // 타입 충돌을 피하기 위해 useMemo로 텍스처와 스타일 인스턴스 생성
  const placeholderTexture = useMemo(() => PIXI.Texture.WHITE, []);

  const defaultTextStyle = useMemo(() => new PIXI.TextStyle({
    fill: 0xffffff,
    fontSize: 18,
  }), []);

  const hpTextStyle = useMemo(() => new PIXI.TextStyle({
    fill: 0x44ff44, // 플레이어 체력은 녹색 톤으로
    fontSize: 20,
    fontWeight: 'bold',
  }), []);

  const enemyHpTextStyle = useMemo(() => new PIXI.TextStyle({
    fill: 0xff4444, // 적 체력은 붉은 톤
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
        {/* 플레이어 체력 */}
        <Text
          text={`HP: ${playerHp} / ${playerMaxHp}`}
          x={1920 * 0.25}
          y={1080 * 0.6 + 140}
          anchor={0.5}
          style={hpTextStyle}
        />
        {/* 플레이어 방어 버프 */}
        {(playerStatus.shield > 0 || playerStatus.resist > 0) && (
          <Text
            text={`[S: ${playerStatus.shield} | R: ${playerStatus.resist}]`}
            x={1920 * 0.25}
            y={1080 * 0.6 + 170}
            anchor={0.5}
            style={defaultTextStyle}
          />
        )}

        {/* 적 다중 렌더링 배열 */}
        {enemies.map((enemyObj, index) => {
          if (enemyObj.currentHp <= 0) return null; // 죽은 몬스터는 Canvas에서 삭제

          // 다중 배치를 위한 위치 지정 (화면 우측에 좌우로 배열)
          // 플레이어와 동일한 높이 레벨 적용, 간격은 0.15 비율로 축소
          const baseY = 1080 * 0.6;
          const baseX = 1920 * (0.65 + index * 0.15);
          const isTargeting = targetingCardId !== null;

          return (
            <Container
              key={enemyObj.id}
              x={baseX}
              y={baseY}
              interactive={isTargeting}
              pointerdown={() => {
                if (targetingCardId) {
                  playCard(targetingCardId, enemyObj.id);
                }
              }}
              cursor={isTargeting ? 'crosshair' : 'default'}
            >
              <Sprite
                texture={placeholderTexture as any}
                width={150}
                height={200}
                anchor={0.5}
                tint={0xff0000} // 빨간색 임시 적
              />
              {/* 적 이름 */}
              <Text
                text={enemyObj.name}
                y={-140}
                anchor={0.5}
                style={defaultTextStyle}
              />
              {/* 적 체력 */}
              <Text
                text={`HP: ${enemyObj.currentHp} / ${enemyObj.maxHp}`}
                y={-110}
                anchor={0.5}
                style={enemyHpTextStyle}
              />
              {/* 적 방어력 */}
              {(enemyObj.shield > 0 || enemyObj.resist > 0) && (
                <Text
                  text={`[S: ${enemyObj.shield} | R: ${enemyObj.resist}]`}
                  y={-80}
                  anchor={0.5}
                  style={defaultTextStyle}
                />
              )}
              {/* 적 의도(Intent) */}
              {enemyObj.currentIntent && (
                <Text
                  text={`의도: ${enemyObj.currentIntent.description}`}
                  y={-170}
                  anchor={0.5}
                  style={intentTextStyle}
                />
              )}
            </Container>
          );
        })}

        {/* 중앙 상태 텍스트 (피드백용) */}
        <Text
          text={targetingCardId ? "공격 대상을 클릭하세요!" : (currentTurn === 'PLAYER' ? "Your Turn" : "Enemy Turn")}
          x={1920 * 0.5}
          y={1080 * 0.3}
          anchor={0.5}
          style={turnTextStyle}
        />
      </Container>
    </Stage>
  );
};
