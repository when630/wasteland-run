import React, { useMemo, useState, useEffect } from 'react';
import { Stage, Container, Sprite, Text } from '@pixi/react';
import * as PIXI from 'pixi.js';
import { useBattleStore } from '../../store/useBattleStore';
import { useRunStore } from '../../store/useRunStore';
import { useDeckStore } from '../../store/useDeckStore';
import { useCardPlay } from '../../hooks/useCardPlay';
import { AnimatedEnemy } from './AnimatedEnemy';
import playerImg from '../../assets/images/player.png';

export const BattleStage: React.FC = () => {
  // 스토어에서 런 상태 및 전투 상태 가져오기
  const { playerHp, playerMaxHp } = useRunStore();
  const { currentTurn, enemies, playerStatus, targetingCardId, playerVisualEffect } = useBattleStore();
  const { hand } = useDeckStore();
  const { playCard } = useCardPlay();

  // 타입 충돌을 피하기 위해 useMemo로 텍스처와 스타일 인스턴스 생성
  const placeholderTexture = useMemo(() => PIXI.Texture.WHITE, []);
  const playerTexture = useMemo(() => PIXI.Texture.from(playerImg), []);

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

  // 타겟팅 모드 시 어떤 카드를 선택했는지 안내 문구 작성
  const targetingCard = targetingCardId ? hand.find(c => c.id === targetingCardId) : null;
  const targetGuideText = targetingCard
    ? `선택된 카드: [${targetingCard.name}]\n공격 대상을 클릭하세요!`
    : (currentTurn === 'PLAYER' ? "Your Turn" : "Enemy Turn");

  // 🌟 피격 효과 제어용 로컬 상태 및 타이머 구조
  const [playerHitOffset, setPlayerHitOffset] = useState(0);
  const [playerTint, setPlayerTint] = useState(0xffffff);

  useEffect(() => {
    if (playerVisualEffect?.type === 'DAMAGE') {
      setPlayerTint(0xff4444); // 피격 시 붉은색
      setPlayerHitOffset(-10); // 좌측으로 먼저 덜컹

      const t1 = setTimeout(() => setPlayerHitOffset(10), 50); // 우측
      const t2 = setTimeout(() => setPlayerHitOffset(-10), 100); // 좌측
      const t3 = setTimeout(() => {
        setPlayerHitOffset(0); // 원위치
        setPlayerTint(0xffffff); // 색상 원복
      }, 150);

      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }
  }, [playerVisualEffect?.tick]);

  return (
    <Stage
      width={screenWidth}
      height={screenHeight}
      options={{ backgroundAlpha: 0 }} // 배경 이미지를 투과시키기 위해 투명도 0으로 설정
    >
      <Container
        scale={scale}
        x={(screenWidth - 1920 * scale) / 2}
        y={(screenHeight - 1080 * scale) / 2}
      >
        {/* 플레이어 (좌측) 구역을 Container로 묶어 클릭(타겟팅) 상호작용 추가 */}
        <Container
          x={1920 * 0.25}
          y={1080 * 0.65}
          interactive={targetingCardId !== null}
          pointerdown={() => {
            if (targetingCardId) {
              playCard(targetingCardId, 'PLAYER');
            }
          }}
          cursor={targetingCardId !== null ? 'crosshair' : 'default'}
        >
          <Sprite
            texture={playerTexture}
            width={150}
            height={300}
            anchor={0.5}
            x={playerHitOffset} // 🌟 흔들림 연출
            tint={playerTint} // 🌟 피격 붉은 점멸 연출
          />
          <Text
            text="Player"
            y={-150}
            anchor={0.5}
            style={defaultTextStyle}
          />
          {/* 플레이어 체력 */}
          <Text
            text={`HP: ${playerHp} / ${playerMaxHp}`}
            y={160}
            anchor={0.5}
            style={hpTextStyle}
          />
          {/* 플레이어 방어 버프 */}
          {(playerStatus.shield > 0 || playerStatus.resist > 0) && (
            <Text
              text={`[S: ${playerStatus.shield} | R: ${playerStatus.resist}]`}
              y={190}
              anchor={0.5}
              style={defaultTextStyle}
            />
          )}
        </Container>

        {/* 적 다중 렌더링 배열 */}
        {enemies.map((enemyObj, index) => {
          // 죽은 몬스터는 AnimatedEnemy 내부에서 alpha가 0이 되며 서서히 사라짐
          // if (enemyObj.currentHp <= 0) return null; 

          // 다중 배치를 위한 위치 지정 (화면 우측에 좌우로 배열)
          const baseY = 1080 * 0.65;
          const baseX = 1920 * (0.6 + index * 0.18);
          const isTargeting = targetingCardId !== null;

          return (
            <AnimatedEnemy
              key={enemyObj.id}
              enemy={enemyObj}
              baseX={baseX}
              baseY={baseY}
              isTargeting={isTargeting}
              onPointerDown={() => {
                if (targetingCardId) {
                  playCard(targetingCardId, enemyObj.id);
                }
              }}
              defaultTextStyle={defaultTextStyle}
              hpTextStyle={enemyHpTextStyle}
              intentTextStyle={intentTextStyle}
              texture={placeholderTexture}
            />
          );
        })}

        {/* 중앙 상태 텍스트 (피드백용) */}
        <Text
          text={targetGuideText}
          x={1920 * 0.5}
          y={1080 * 0.1}
          anchor={0.5}
          style={turnTextStyle}
        />
      </Container>
    </Stage>
  );
};
