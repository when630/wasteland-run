import React, { useEffect } from 'react';
import { BattleStage } from '../components/pixi/BattleStage';
import { HUD } from '../components/ui/HUD';
import { Hand } from '../components/ui/Hand';
import { ResourcePanel } from '../components/ui/ResourcePanel';
import { DeckPiles } from '../components/ui/DeckPiles';
// import { CardViewerModal } from '../components/ui/CardViewerModal';
import { useDeckStore } from '../store/useDeckStore';
import { useBattleStore } from '../store/useBattleStore';
import { createStartingDeck } from '../assets/data/cards';
import { createEnemy } from '../assets/data/enemies';
import { useRunStore } from '../store/useRunStore';

export const BattleView: React.FC = () => {
  const { initDeck, drawCards } = useDeckStore();
  const { currentTurn, battleResult, startPlayerTurn, spawnEnemies, executeEnemyTurns, resetBattle } = useBattleStore();
  const { setScene } = useRunStore();

  // 게임(전투 뷰) 진입 시 초기 덱과 몬스터를 세팅합니다
  useEffect(() => {
    resetBattle(); // 🌟 이전 전투 상태(VICTORY, DEFEAT 등) 초기화

    // 덱 세팅 및 5장 드로우
    const startingDeck = createStartingDeck();
    initDeck(startingDeck);
    drawCards(5);

    // 1스테이지 튜토리얼 몬스터 다중 소환
    spawnEnemies([
      createEnemy('scrap_collector'),
      createEnemy('acid_dog')
    ]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 턴 전환 감지 및 적 턴 행동(AI) 처리
  useEffect(() => {
    if (currentTurn === 'ENEMY') {
      // 1. 적군 행동(Intent) 연산 실행
      // 애니메이션 대기 느낌을 주기 위해 살짝 딜레이(0.5초) 후 행동 실행
      const actionTimer = setTimeout(() => {
        executeEnemyTurns();
      }, 500);

      // 2. 적군 행동이 끝나면 플레이어 턴으로 복귀 및 새 카드 드로우 (1.5초 뒤)
      const turnTimer = setTimeout(() => {
        startPlayerTurn();
        drawCards(5);
      }, 1500);

      return () => {
        clearTimeout(actionTimer);
        clearTimeout(turnTimer);
      };
    }
  }, [currentTurn, startPlayerTurn, drawCards, executeEnemyTurns]);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* 
        [하이브리드 렌더링 아키텍처]
        1. Pixi.js Canvas: 맨 밑에 깔려서 전투 연출(스프라이트, 파티클)을 담당합니다.
      */}
      <div style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
        <BattleStage />
      </div>

      {/* 
        2. React UI: Canvas 위를 덮는 투명한 DOM 레이어로 메뉴, 카드, 상태를 담당합니다.
      */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10 }}>
        {/* pointerEvents: 'none'을 통해 클릭이 기본적으로 아래 Canvas로 투과되게 하고, 
            각종 UI 요소들에만 pointerEvents: 'auto'를 줍니다. */}
        <div style={{ pointerEvents: 'auto' }}>
          <HUD />
          <ResourcePanel />
          <Hand />
          <DeckPiles />
        </div>
      </div>

      {/* 4. 전투 결과 팝업 오버레이 (승리/패배) */}
      {battleResult !== 'NONE' && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          zIndex: 200, // 모달보다 더 위로
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          color: 'white'
        }}>
          <h1 style={{
            fontSize: '48px',
            color: battleResult === 'VICTORY' ? '#44ff44' : '#ff4444',
            marginBottom: '20px'
          }}>
            {battleResult === 'VICTORY' ? '전투 승리!' : '사망 (Game Over)'}
          </h1>
          <p style={{ fontSize: '20px', color: '#ccc', marginBottom: '40px' }}>
            {battleResult === 'VICTORY'
              ? '보상을 획득하고 다음 구역으로 이동합니다.'
              : '황무지의 이슬로 사라졌습니다...'}
          </p>
          <button
            onClick={() => {
              if (battleResult === 'VICTORY') {
                setScene('MAP'); // 승리 시 맵으로 반환
                // 추후: BattleStore 리셋 로직 필요
              } else {
                window.location.reload(); // 패배 시 임시 전면 리부팅 유지
              }
            }}
            style={{
              padding: '15px 40px', fontSize: '20px', fontWeight: 'bold',
              backgroundColor: '#444', color: 'white', border: '2px solid #555',
              borderRadius: '8px', cursor: 'pointer'
            }}
          >
            {battleResult === 'VICTORY' ? '계속하기' : '다시 시작'}
          </button>
        </div>
      )}
    </div>
  );
};
