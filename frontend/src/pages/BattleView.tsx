import React, { useEffect, useRef, useState, useCallback } from 'react';
import { BattleStage } from '../components/pixi/BattleStage';
import { Hand } from '../components/ui/Hand';
import { ResourcePanel } from '../components/ui/ResourcePanel';
import { DeckPiles } from '../components/ui/DeckPiles';
import { VictoryRewardPanel } from '../components/ui/VictoryRewardPanel';
import { CardViewerModal } from '../components/ui/CardViewerModal';
import { CardAnimationLayer } from '../components/ui/CardAnimationLayer';
import { GameOverModal } from '../components/ui/GameOverModal';
import { ChapterTransitionModal } from '../components/ui/ChapterTransitionModal';
import { StatusOverlay } from '../components/ui/StatusOverlay';
import { DebugTestPanel } from '../components/ui/DebugTestPanel';
import { BossRelicPickModal } from '../components/ui/BossRelicPickModal';
import { useDeckStore } from '../store/useDeckStore';
import { useBattleStore } from '../store/useBattleStore';
import { createStartingDeck, STATUS_CARDS } from '../assets/data/cards';
import { createEnemy, getEnemyIdsByTier, determineNextIntent } from '../assets/data/enemies';
import { useRunStore } from '../store/useRunStore';
import { onBattleStart, onBattleEnd } from '../logic/relicEffects';
import { useRngStore } from '../store/useRngStore';
import { DESIGN_WIDTH, DESIGN_HEIGHT, enemyPos } from '../components/pixi/vfx/battleLayout';
import battleBg1 from '../assets/images/backgrounds/stage1_battle_backgroung.webp';
import battleBg2 from '../assets/images/backgrounds/stage2_battle_backgroung.webp';
import battleBg3 from '../assets/images/backgrounds/stage3_battle_backgroung.webp';

const BATTLE_BGS: Record<number, string> = { 1: battleBg1, 2: battleBg2, 3: battleBg3 };

export const BattleView: React.FC = () => {
  // Render-driving state — individual selectors to avoid unnecessary re-renders
  const currentTurn = useBattleStore(s => s.currentTurn);
  const battleResult = useBattleStore(s => s.battleResult);
  const targetingCardId = useBattleStore(s => s.targetingCardId);
  const dragPreviewCardId = useBattleStore(s => s.dragPreviewCardId);
  const currentScene = useRunStore(s => s.currentScene);
  const currentChapter = useRunStore(s => s.currentChapter);
  const relics = useRunStore(s => s.relics);

  const [showBossClear, setShowBossClear] = useState(false);
  const [showBossRelicPick, setShowBossRelicPick] = useState(false);

  // 게임(전투 뷰) 진입 시 초기 덱과 몬스터를 세팅
  useEffect(() => {
    useBattleStore.getState().resetBattle();

    if (currentScene === 'DEBUG_BATTLE') {
      // 연습 모드: 기본 덱 + 훈련용 허수아비, 일반 턴제
      useDeckStore.getState().setMasterDeck(createStartingDeck());
      useDeckStore.getState().initDeck();
      useDeckStore.getState().drawCards(5);
      const dummy = createEnemy('training_dummy');
      dummy.currentIntent = { type: 'DEFEND', description: '대기 중' };
      useBattleStore.getState().spawnEnemies([dummy]);
    } else {
      // 일반 전투
      if (useDeckStore.getState().masterDeck.length === 0) {
        useDeckStore.getState().setMasterDeck(createStartingDeck());
      }

      useDeckStore.getState().initDeck();
      useDeckStore.getState().drawCards(5);

      // 씬에 따른 몬스터 소환 (챕터별 필터링)
      const battleRng = useRngStore.getState().battleRng;
      const chapter = useRunStore.getState().currentChapter;
      if (currentScene === 'BOSS') {
        const bossIds = getEnemyIdsByTier('BOSS', chapter);
        useBattleStore.getState().spawnEnemies([createEnemy(bossIds[battleRng.nextInt(bossIds.length)], battleRng)]);
      } else if (currentScene === 'ELITE') {
        const eliteIds = getEnemyIdsByTier('ELITE', chapter);
        useBattleStore.getState().spawnEnemies([createEnemy(eliteIds[battleRng.nextInt(eliteIds.length)], battleRng)]);
      } else {
        const normalIds = getEnemyIdsByTier('NORMAL', chapter);
        const shuffled = battleRng.shuffle(normalIds);
        useBattleStore.getState().spawnEnemies(shuffled.slice(0, 2).map(id => createEnemy(id, battleRng)));
      }

      // 예언의 수정구: 초기 nextIntent 설정
      if (relics.includes('prophecy_orb')) {
        const intentRng = useRngStore.getState().intentRng;
        useBattleStore.setState(s => ({
          enemies: s.enemies.map(e => ({
            ...e,
            nextIntent: determineNextIntent(e.baseId, intentRng),
          })),
        }));
      }

      // 유물 효과 일괄 적용
      const fx = onBattleStart(relics, currentScene);
      if (fx.ammo > 0) useBattleStore.getState().addAmmo(fx.ammo);
      if (fx.shield > 0) useBattleStore.getState().addPlayerShield(fx.shield);
      if (fx.resist > 0) useBattleStore.getState().addPlayerResist(fx.resist);
      if (fx.extraAp > 0) useBattleStore.getState().consumeAp(-fx.extraAp);
      if (fx.extraDraw > 0) useDeckStore.getState().drawCards(fx.extraDraw);
      if (fx.healAmount > 0) useRunStore.getState().healPlayer(fx.healAmount);
      // 적 전체 디버프
      if (fx.vulnerableAllEnemies > 0) {
        useBattleStore.getState().enemies.forEach(e => {
          if (e.currentHp > 0) useBattleStore.getState().applyStatusToEnemy(e.id, 'VULNERABLE', fx.vulnerableAllEnemies);
        });
      }
      if (fx.weakAllEnemies > 0) {
        useBattleStore.getState().enemies.forEach(e => {
          if (e.currentHp > 0) useBattleStore.getState().applyStatusToEnemy(e.id, 'WEAK', fx.weakAllEnemies);
        });
      }
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
      useBattleStore.getState().startPlayerTurn();
      useDeckStore.getState().drawCards(5);
      return;
    }

    const ENEMY_ACTION_DELAY = 800;

    aliveIndices.forEach((enemyIdx, seqIdx) => {
      const highlightTimer = setTimeout(() => useBattleStore.getState().setActiveEnemyIndex(enemyIdx), seqIdx * ENEMY_ACTION_DELAY);
      enemyTurnTimersRef.current.push(highlightTimer);

      const actionTimer = setTimeout(() => {
        useBattleStore.getState().executeOneEnemyTurn(enemyIdx);
        // 연습 모드: 적 턴 후 의도를 대기 상태로 복원 (determineNextIntent 덮어쓰기)
        if (useRunStore.getState().currentScene === 'DEBUG_BATTLE') {
          useBattleStore.setState(s => ({
            enemies: s.enemies.map((e, i) => i !== enemyIdx ? e : {
              ...e, currentIntent: { type: 'DEFEND' as const, description: '대기 중' },
            }),
          }));
        }
      }, seqIdx * ENEMY_ACTION_DELAY + 300);
      enemyTurnTimersRef.current.push(actionTimer);
    });

    const totalTime = aliveIndices.length * ENEMY_ACTION_DELAY + 500;
    const turnEndTimer = setTimeout(() => {
      useBattleStore.getState().setActiveEnemyIndex(null);
      useBattleStore.getState().startPlayerTurn();
      useDeckStore.getState().drawCards(5);
    }, totalTime);
    enemyTurnTimersRef.current.push(turnEndTimer);
  }, []);

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


  // 타겟팅/드래그 프리뷰 중 DOM 레벨 마우스 추적 → 가장 가까운 적 탐지
  const isPreviewActive = targetingCardId !== null || dragPreviewCardId !== null;
  useEffect(() => {
    if (!isPreviewActive) {
      useBattleStore.getState().setPreviewTargetEnemy(null);
      return;
    }
    const onPointerMove = (e: PointerEvent) => {
      const es = useBattleStore.getState().enemies;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const scale = (w / h > 16 / 9) ? h / DESIGN_HEIGHT : w / DESIGN_WIDTH;
      const cx = (w - DESIGN_WIDTH * scale) / 2;
      const cy = (h - DESIGN_HEIGHT * scale) / 2;

      let bestId: string | null = null;
      let bestDist = Infinity;
      es.forEach((enemy, i) => {
        if (enemy.currentHp <= 0) return;
        const ep = enemyPos(i, es.length);
        const ex = ep.x * scale + cx;
        const ey = ep.y * scale + cy;
        const d = Math.hypot(e.clientX - ex, e.clientY - ey);
        if (d < bestDist) { bestDist = d; bestId = enemy.id; }
      });

      useBattleStore.getState().setPreviewTargetEnemy(bestDist < Math.max(140, 200 * scale) ? bestId : null);
    };
    window.addEventListener('pointermove', onPointerMove);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      useBattleStore.getState().setPreviewTargetEnemy(null);
    };
  }, [isPreviewActive]);

  // 전투 종료 시 유물 효과 (인식표 등)
  useEffect(() => {
    if (battleResult === 'VICTORY') {
      const endEffects = onBattleEnd(useRunStore.getState().relics);
      if (endEffects.healAmount > 0) {
        useRunStore.getState().healPlayer(endEffects.healAmount);
        useRunStore.getState().setToastMessage(`생존자의 인식표 — 체력 ${endEffects.healAmount} 회복!`);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [battleResult]);

  const handleVictoryContinue = async () => {
    if (currentScene === 'DEBUG_BATTLE') {
      useRunStore.getState().setScene('MAIN_MENU');
      return;
    }
    if (currentScene === 'BOSS') {
      if (currentChapter < 3) {
        // 1~2막 보스: 유물 선택방 → 챕터 전환
        setShowBossRelicPick(true);
      } else {
        // 3막 보스: 게임 클리어
        setShowBossClear(true);
      }
    } else {
      useRunStore.getState().setScene('MAP');
    }
  };

  return (
    <div
      className={targetingCardId ? 'targeting-mode' : ''}
      style={{
        position: 'relative',
        width: '100vw', height: '100vh', overflow: 'hidden',
        backgroundImage: `url(${BATTLE_BGS[currentChapter] || battleBg1})`,
        backgroundSize: 'cover',
        backgroundPosition: 'bottom'
      }}>
      {/* Pixi.js Canvas */}
      <div style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
        <BattleStage />
      </div>

      {/* 상태 오버레이 (Pixi 위, UI 아래) */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 15 }}>
        <StatusOverlay />
      </div>

      {/* React UI 레이어 */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 20 }}>
        <div style={{ pointerEvents: 'auto' }}>
          <ResourcePanel />
          <Hand />
          <DeckPiles />
        </div>
      </div>

      {/* 타겟팅 선은 드래그 시에만 Hand.tsx 포탈에서 표시 */}

      {/* 승리 보상 패널 */}
      {battleResult === 'VICTORY' && !showBossClear && !showBossRelicPick && (
        <VictoryRewardPanel onContinue={handleVictoryContinue} currentScene={currentScene} />
      )}

      {/* 보스 유물 선택방 (1~2막) */}
      {showBossRelicPick && !showBossClear && (
        <BossRelicPickModal onComplete={() => { setShowBossRelicPick(false); setShowBossClear(true); }} />
      )}

      {battleResult === 'DEFEAT' && <GameOverModal result="DEFEAT" />}
      {showBossClear && currentChapter < 3 && <ChapterTransitionModal />}
      {showBossClear && currentChapter >= 3 && <GameOverModal result="VICTORY" />}

      {/* 디버그 테스트 패널 */}
      {currentScene === 'DEBUG_BATTLE' && (
        <DebugTestPanel
          onReset={() => {
            useBattleStore.getState().resetBattle();
            useDeckStore.getState().setMasterDeck(createStartingDeck());
            useDeckStore.getState().initDeck();
            useDeckStore.getState().drawCards(5);
            useBattleStore.getState().spawnEnemies([createEnemy('training_dummy')]);
            useBattleStore.setState({ playerMaxAp: 99, playerActionPoints: 99, playerAmmo: 99 });
          }}
          onExit={() => useRunStore.getState().setScene('MAIN_MENU')}
        />
      )}

      <CardViewerModal />
      <CardAnimationLayer />
    </div>
  );
};
