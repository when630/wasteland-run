import React, { useEffect } from 'react';
import { BattleStage } from '../components/pixi/BattleStage';
import { HUD } from '../components/ui/HUD';
import { Hand } from '../components/ui/Hand';
import { ResourcePanel } from '../components/ui/ResourcePanel';
import { DeckPiles } from '../components/ui/DeckPiles';
import { CardViewerModal } from '../components/ui/CardViewerModal';
import { useDeckStore } from '../store/useDeckStore';
import { useBattleStore } from '../store/useBattleStore';
import { createStartingDeck } from '../assets/data/cards';
import { createEnemy } from '../assets/data/enemies';

export const BattleView: React.FC = () => {
  const { initDeck, drawCards } = useDeckStore();
  const { currentTurn, startPlayerTurn, spawnEnemies, executeEnemyTurns } = useBattleStore();

  // 게임(전투 뷰) 진입 시 초기 덱과 몬스터를 세팅합니다
  useEffect(() => {
    // 덱 세팅 및 5장 드로우
    const startingDeck = createStartingDeck();
    initDeck(startingDeck);
    drawCards(5);

    // 1스테이지 튜토리얼 몬스터 소환
    spawnEnemies([createEnemy('scrap_collector')]);

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

      {/* 3. 모달 UI: 상태 변경 시 화면 전체를 덮는 가장 높은 레이어 */}
      <CardViewerModal />
    </div>
  );
};
