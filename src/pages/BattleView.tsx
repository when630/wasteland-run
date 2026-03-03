import React, { useEffect } from 'react';
import { BattleStage } from '../components/pixi/BattleStage';
import { HUD } from '../components/ui/HUD';
import { Hand } from '../components/ui/Hand';
import { ResourcePanel } from '../components/ui/ResourcePanel';
import { useDeckStore } from '../store/useDeckStore';
import { useBattleStore } from '../store/useBattleStore';
import { createStartingDeck } from '../assets/data/cards';

export const BattleView: React.FC = () => {
  const { initDeck, drawCards } = useDeckStore();
  const { currentTurn, startPlayerTurn } = useBattleStore();

  // 게임(전투 뷰) 진입 시 초기 덱 10장을 세팅하고 첫 5장을 드로우합니다.
  useEffect(() => {
    const startingDeck = createStartingDeck();
    initDeck(startingDeck);
    drawCards(5);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 턴 전환 감지 - 임시 적 턴 로직 처리 (1초 대기 후 플레이어 턴으로 복귀 및 드로우)
  useEffect(() => {
    if (currentTurn === 'ENEMY') {
      const timer = setTimeout(() => {
        startPlayerTurn();
        drawCards(5);
      }, 1000); // 임시 적 턴 진행 시간 (1초)

      return () => clearTimeout(timer);
    }
  }, [currentTurn, startPlayerTurn, drawCards]);

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
        </div>
      </div>
    </div>
  );
};
