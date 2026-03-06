import React, { useMemo, useState, useEffect } from 'react';
import { Stage, Container, Sprite, Text } from '@pixi/react';
import * as PIXI from 'pixi.js';
import { useBattleStore } from '../../store/useBattleStore';
import { useRunStore } from '../../store/useRunStore';
import { useDeckStore } from '../../store/useDeckStore';
import { useAudioStore } from '../../store/useAudioStore';
import { useCardPlay } from '../../hooks/useCardPlay';
import { AnimatedEnemy } from './AnimatedEnemy';
import playerImg from '../../assets/images/player.png';

export const BattleStage: React.FC = () => {
  // 스토어에서 런 상태 및 전투 상태 가져오기
  const { playerHp, playerMaxHp } = useRunStore();
  const { currentTurn, enemies, playerStatus, targetingCardId, playerHitQueue, consumePlayerHitQueue } = useBattleStore();
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

  // 🌟 다단 히트 피격 효과 순차 제어용
  const [playerHitOffset, setPlayerHitOffset] = useState(0);
  const [playerHitOffsetY, setPlayerHitOffsetY] = useState(0);
  const [playerTint, setPlayerTint] = useState(0xffffff);
  const [playerAlphaFlicker, setPlayerAlphaFlicker] = useState(1);
  const isAnimatingRef = React.useRef(false); // 🌟 useRef로 락 관리 (React 배칭 문제 방지)
  const timersRef = React.useRef<ReturnType<typeof setTimeout>[]>([]); // 🌟 클린업용 타이머 추적

  // 타이머 등록 헬퍼
  const safeTimeout = React.useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  // 모든 시각 상태를 원위치로 리셋하는 헬퍼
  const resetVisuals = React.useCallback(() => {
    setPlayerHitOffset(0);
    setPlayerHitOffsetY(0);
    setPlayerTint(0xffffff);
    setPlayerAlphaFlicker(1);
  }, []);

  useEffect(() => {
    // 🌟 큐에 남은 애니메이션이 있고, 현재 재생 중이 아니면 1회 재생 시작
    if (playerHitQueue.length > 0 && !isAnimatingRef.current) {
      const hitType = playerHitQueue[0].type;
      isAnimatingRef.current = true; // 즉시 락 (useState와 달리 동기적)

      if (hitType === 'DAMAGE') {
        // 🌟 직접 피격: 넉백 + 붉은 번쩍
        setPlayerTint(0xff2222);
        setPlayerHitOffset(-20);
        safeTimeout(() => setPlayerHitOffset(8), 100);
        safeTimeout(() => setPlayerHitOffset(-4), 180);
        safeTimeout(() => {
          resetVisuals();
          isAnimatingRef.current = false;
          consumePlayerHitQueue(); // 다음 큐 아이템으로
        }, 300);
      } else if (hitType === 'BURN') {
        // 🌟 화상 틱: 오렌지 점멸 + Y 떨림
        setPlayerTint(0xff6600);
        let tickCount = 0;
        const burnInterval = setInterval(() => {
          tickCount++;
          setPlayerHitOffsetY(Math.sin(tickCount * 2) * 4);
          setPlayerTint(tickCount % 2 === 0 ? 0xff6600 : 0xff9944);
        }, 50);
        safeTimeout(() => {
          clearInterval(burnInterval);
          resetVisuals();
          isAnimatingRef.current = false;
          consumePlayerHitQueue();
        }, 350);
      } else if (hitType === 'POISON') {
        // 🌟 맹독 틱: 녹색 점멸 + 투명도 깜빡
        setPlayerTint(0x22ff44);
        let tickCount = 0;
        const poisonInterval = setInterval(() => {
          tickCount++;
          setPlayerAlphaFlicker(tickCount % 2 === 0 ? 0.6 : 1.0);
          setPlayerTint(tickCount % 2 === 0 ? 0x22ff44 : 0x44ff88);
        }, 60);
        safeTimeout(() => {
          clearInterval(poisonInterval);
          resetVisuals();
          isAnimatingRef.current = false;
          consumePlayerHitQueue();
        }, 350);
      } else {
        isAnimatingRef.current = false;
        consumePlayerHitQueue();
      }
    }
  }, [playerHitQueue, consumePlayerHitQueue, safeTimeout, resetVisuals]);

  // 🌟 컴포넌트 언마운트 시 모든 타이머 정리
  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, []);

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
        {/* 허공(배경) 클릭 감지용 투명 레이어 */}
        {targetingCardId !== null && (
          <Sprite
            texture={placeholderTexture}
            width={1920}
            height={1080}
            alpha={0.001} // 완전 투명이지만 클릭을 잡아냄
            interactive={true}
            pointerdown={() => {
              if (targetingCard) {
                // 단일 공격 카드인지 검수
                const needsEnemyTarget = targetingCard.effects.some(e =>
                  (e.type === 'DAMAGE' || e.type === 'DEBUFF') &&
                  e.target !== 'ALL_ENEMIES' &&
                  e.target !== 'PLAYER'
                );

                if (needsEnemyTarget) {
                  // 단일 공격이면 맨땅(배경) 클릭 시 취소
                  useBattleStore.getState().setTargetingCard(null);
                  useAudioStore.getState().playClick();
                } else {
                  // 전체 공격, 플레이어 버프 등 타겟 지정이 필요 없는 카드는 맨땅 클릭해도 즉시 발동
                  playCard(targetingCardId, 'PLAYER');
                }
              }
            }}
          />
        )}

        {/* 플레이어 (좌측) 구역을 Container로 묶어 클릭(타겟팅) 상호작용 추가 */}
        <Container
          x={1920 * 0.25}
          y={1080 * 0.65 + playerHitOffsetY}
          alpha={playerAlphaFlicker}
          interactive={targetingCardId !== null}
          pointerdown={() => {
            if (targetingCardId) {
              playCard(targetingCardId, 'PLAYER');
            }
          }}
        // 커서 로직 삭제 -> 상위 래퍼의 글로벌 .targeting-mode 클래스 위임
        >
          <Sprite
            texture={playerTexture}
            width={150}
            height={300}
            anchor={0.5}
            x={playerHitOffset} // 🌟 넉백/흔들림 연출
            tint={playerTint} // 🌟 타입별 색상 연출
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
              text={`🛡️ ${playerStatus.shield}  |  💠 ${playerStatus.resist}`}
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
