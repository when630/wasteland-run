import React, { useEffect, useRef, useState, useCallback } from 'react';
import { BattleStage } from '../components/pixi/BattleStage';
import { Hand } from '../components/ui/Hand';
import { ResourcePanel } from '../components/ui/ResourcePanel';
import { DeckPiles } from '../components/ui/DeckPiles';
import { VictoryRewardPanel } from '../components/ui/VictoryRewardPanel';
import { CardViewerModal } from '../components/ui/CardViewerModal';
import { CardAnimationLayer } from '../components/ui/CardAnimationLayer';
import { TargetingLine } from '../components/ui/TargetingLine';
import { GameOverModal } from '../components/ui/GameOverModal';
import { ChapterTransitionModal } from '../components/ui/ChapterTransitionModal';
import { useDeckStore } from '../store/useDeckStore';
import { useBattleStore } from '../store/useBattleStore';
import { createStartingDeck, createAllCardsDeck, STATUS_CARDS } from '../assets/data/cards';
import { createEnemy, getEnemyIdsByTier } from '../assets/data/enemies';
import { useRunStore } from '../store/useRunStore';
import { onBattleStart } from '../logic/relicEffects';
import { useRngStore } from '../store/useRngStore';
import battleBg from '../assets/images/stage1_battle_backgroung.png';

export const BattleView: React.FC = () => {
  const { initDeck, drawCards, masterDeck, setMasterDeck } = useDeckStore();
  const { currentTurn, battleResult, startPlayerTurn, spawnEnemies, executeOneEnemyTurn, setActiveEnemyIndex, resetBattle, addAmmo, targetingCardId, targetingPosition } = useBattleStore();
  const { setScene, currentScene, currentChapter, relics } = useRunStore();

  const [showBossClear, setShowBossClear] = useState(false);

  // 게임(전투 뷰) 진입 시 초기 덱과 몬스터를 세팅
  useEffect(() => {
    resetBattle();

    if (currentScene === 'DEBUG_BATTLE') {
      // 디버그 모드: 모든 카드 + 훈련용 허수아비
      setMasterDeck(createAllCardsDeck());
      initDeck();
      drawCards(10);
      spawnEnemies([createEnemy('training_dummy')]);
      // 무제한 자원
      useBattleStore.setState({ playerMaxAp: 99, playerActionPoints: 99, playerAmmo: 99 });
    } else {
      // 일반 전투
      if (masterDeck.length === 0) {
        setMasterDeck(createStartingDeck());
      }

      initDeck();
      drawCards(5);

      // 씬에 따른 몬스터 소환 (챕터별 필터링)
      const battleRng = useRngStore.getState().battleRng;
      const chapter = useRunStore.getState().currentChapter;
      if (currentScene === 'BOSS') {
        const bossIds = getEnemyIdsByTier('BOSS', chapter);
        spawnEnemies([createEnemy(bossIds[battleRng.nextInt(bossIds.length)], battleRng)]);
      } else if (currentScene === 'ELITE') {
        const eliteIds = getEnemyIdsByTier('ELITE', chapter);
        spawnEnemies([createEnemy(eliteIds[battleRng.nextInt(eliteIds.length)], battleRng)]);
      } else {
        const normalIds = getEnemyIdsByTier('NORMAL', chapter);
        const shuffled = battleRng.shuffle(normalIds);
        spawnEnemies(shuffled.slice(0, 2).map(id => createEnemy(id, battleRng)));
      }

      // 유물 효과 일괄 적용
      const fx = onBattleStart(relics, currentScene);
      if (fx.ammo > 0) addAmmo(fx.ammo);
      if (fx.shield > 0) useBattleStore.getState().addPlayerShield(fx.shield);
      if (fx.extraAp > 0) useBattleStore.getState().consumeAp(-fx.extraAp);
      if (fx.extraDraw > 0) useDeckStore.getState().drawCards(fx.extraDraw);
      if (fx.statusCardBaseId) {
        const statusBlueprint = STATUS_CARDS.find(c => c.baseId === fx.statusCardBaseId);
        if (statusBlueprint) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, ...blueprint } = statusBlueprint;
          for (let i = 0; i < fx.statusCardCount; i++) {
            useDeckStore.getState().addCardToDiscardPile(blueprint);
          }
        }
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 적 턴 순차 실행
  const enemyTurnTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const processEnemyTurnsSequentially = useCallback(() => {
    enemyTurnTimersRef.current.forEach(clearTimeout);
    enemyTurnTimersRef.current = [];

    const currentEnemies = useBattleStore.getState().enemies;
    const aliveIndices = currentEnemies
      .map((e, i) => (e.currentHp > 0 ? i : -1))
      .filter(i => i >= 0);

    if (aliveIndices.length === 0) {
      startPlayerTurn();
      drawCards(5);
      return;
    }

    const ENEMY_ACTION_DELAY = 800;

    aliveIndices.forEach((enemyIdx, seqIdx) => {
      const highlightTimer = setTimeout(() => setActiveEnemyIndex(enemyIdx), seqIdx * ENEMY_ACTION_DELAY);
      enemyTurnTimersRef.current.push(highlightTimer);

      const actionTimer = setTimeout(() => executeOneEnemyTurn(enemyIdx), seqIdx * ENEMY_ACTION_DELAY + 300);
      enemyTurnTimersRef.current.push(actionTimer);
    });

    const totalTime = aliveIndices.length * ENEMY_ACTION_DELAY + 500;
    const turnEndTimer = setTimeout(() => {
      setActiveEnemyIndex(null);
      startPlayerTurn();
      drawCards(5);
    }, totalTime);
    enemyTurnTimersRef.current.push(turnEndTimer);
  }, [startPlayerTurn, drawCards, executeOneEnemyTurn, setActiveEnemyIndex]);

  useEffect(() => {
    if (currentTurn === 'ENEMY') {
      const startTimer = setTimeout(() => processEnemyTurnsSequentially(), 300);
      return () => {
        clearTimeout(startTimer);
        enemyTurnTimersRef.current.forEach(clearTimeout);
        enemyTurnTimersRef.current = [];
      };
    }
  }, [currentTurn, processEnemyTurnsSequentially]);

  // 타겟팅 마우스 추적
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (targetingCardId !== null && targetingPosition !== null) {
      // 타겟팅 진입 시 카드 위치로 초기화 (선이 (0,0)으로 가는 것 방지)
      setMousePos({ x: targetingPosition.x, y: targetingPosition.y });
      const handleMouseMove = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
  }, [targetingCardId, targetingPosition]);

  const handleVictoryContinue = async () => {
    if (currentScene === 'DEBUG_BATTLE') {
      setScene('MAIN_MENU');
      return;
    }
    if (currentScene === 'BOSS') {
      const maxChapter = 3; // 현재 최대 챕터
      if (currentChapter < maxChapter) {
        // 다음 챕터로 전환
        setShowBossClear(true);
      } else {
        // 최종 챕터 클리어
        setShowBossClear(true);
      }
    } else {
      setScene('MAP');
      await useRunStore.getState().saveRunData();
    }
  };

  return (
    <div
      className={targetingCardId ? 'targeting-mode' : ''}
      style={{
        position: 'relative',
        width: '100vw', height: '100vh', overflow: 'hidden',
        backgroundImage: `url(${battleBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'bottom'
      }}>
      {/* Pixi.js Canvas */}
      <div style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
        <BattleStage />
      </div>

      {/* React UI 레이어 */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 20 }}>
        <div style={{ pointerEvents: 'auto' }}>
          <ResourcePanel />
          <Hand />
          <DeckPiles />
        </div>
      </div>

      {/* 타겟팅 SVG 곡선 (UI 위에 렌더링) */}
      {targetingCardId && targetingPosition && (
        <TargetingLine
          startX={targetingPosition.x} startY={targetingPosition.y}
          endX={mousePos.x} endY={mousePos.y}
          positioning="absolute" zIndex={30}
        />
      )}

      {/* 승리 보상 패널 */}
      {battleResult === 'VICTORY' && !showBossClear && (
        <VictoryRewardPanel onContinue={handleVictoryContinue} currentScene={currentScene} />
      )}

      {battleResult === 'DEFEAT' && <GameOverModal result="DEFEAT" />}
      {showBossClear && currentChapter < 3 && <ChapterTransitionModal />}
      {showBossClear && currentChapter >= 3 && <GameOverModal result="VICTORY" />}

      {/* 디버그 전투 컨트롤 */}
      {currentScene === 'DEBUG_BATTLE' && (
        <div style={{
          position: 'absolute', top: 10, right: 10, zIndex: 100,
          display: 'flex', gap: '8px',
        }}>
          <button
            onClick={() => {
              resetBattle();
              setMasterDeck(createAllCardsDeck());
              initDeck();
              drawCards(10);
              spawnEnemies([createEnemy('training_dummy')]);
              useBattleStore.setState({ playerMaxAp: 99, playerActionPoints: 99, playerAmmo: 99 });
            }}
            style={{
              padding: '8px 16px', fontSize: '13px', fontWeight: 'bold',
              background: '#2a4a2a', color: '#8f8', border: '1px solid #4a8a4a',
              borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace',
            }}
          >
            Reset
          </button>
          <button
            onClick={() => setScene('MAIN_MENU')}
            style={{
              padding: '8px 16px', fontSize: '13px', fontWeight: 'bold',
              background: '#4a2a2a', color: '#f88', border: '1px solid #8a4a4a',
              borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace',
            }}
          >
            Exit
          </button>
        </div>
      )}

      <CardViewerModal />
      <CardAnimationLayer />
    </div>
  );
};
