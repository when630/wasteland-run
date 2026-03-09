import React, { useEffect, useRef, useState, useCallback } from 'react';
import { BattleStage } from '../components/pixi/BattleStage';
import { HUD } from '../components/ui/HUD';
import { Hand } from '../components/ui/Hand';
import { ResourcePanel } from '../components/ui/ResourcePanel';
import { DeckPiles } from '../components/ui/DeckPiles';
import { CardRewardModal } from '../components/ui/CardRewardModal';
import { RelicRewardModal } from '../components/ui/RelicRewardModal';
import { CardViewerModal } from '../components/ui/CardViewerModal';
import { GameOverModal } from '../components/ui/GameOverModal';
import { useDeckStore } from '../store/useDeckStore';
import { useBattleStore } from '../store/useBattleStore';
import { createStartingDeck } from '../assets/data/cards';
import { createEnemy } from '../assets/data/enemies';
import { useRunStore } from '../store/useRunStore';
import battleBg from '../assets/images/stage1_battle_backgroung.png';

export const BattleView: React.FC = () => {
  const { initDeck, drawCards, masterDeck, setMasterDeck } = useDeckStore();
  const { currentTurn, battleResult, startPlayerTurn, spawnEnemies, executeOneEnemyTurn, setActiveEnemyIndex, resetBattle, addAmmo, targetingCardId, targetingPosition, enemies } = useBattleStore();
  const { setScene, addGold, currentScene, relics } = useRunStore();

  // 보상 획득 여부 로컬 플래그 분리
  const [goldClaimed, setGoldClaimed] = useState(false);
  const [cardClaimed, setCardClaimed] = useState(false);
  const [relicClaimed, setRelicClaimed] = useState(false);

  // 🌟 보스전 클리어 연출 진입 플래그
  const [showBossClear, setShowBossClear] = useState(false);

  // 모달 활성화 상태
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isRelicModalOpen, setIsRelicModalOpen] = useState(false);

  // 게임(전투 뷰) 진입 시 초기 덱과 몬스터를 세팅합니다
  useEffect(() => {
    resetBattle(); // 🌟 이전 전투 상태(VICTORY, DEFEAT 등) 초기화
    setGoldClaimed(false); // 보상 수령 플래그 초기화
    setCardClaimed(false);
    setRelicClaimed(false);

    // 런 최초 진입(또는 첫 전투) 시 masterDeck이 비어있으면 기본 덱 지급
    if (masterDeck.length === 0) {
      setMasterDeck(createStartingDeck());
    }

    // 전투용 드로우 파일(drawPile) 셔플 및 5장 드로우
    initDeck();
    drawCards(5);

    // 씬에 따른 몬스터 소환 분기
    if (currentScene === 'BOSS') {
      spawnEnemies([createEnemy('brutus')]);
    } else if (currentScene === 'ELITE') {
      // 엘리트 몹 2종 중 무작위 1종 스폰 (50%)
      const eliteType = Math.random() < 0.5 ? 'mutant_behemoth' : 'rogue_sentry';
      spawnEnemies([createEnemy(eliteType)]);
    } else {
      // 일반 전투 거나 기본 보장값 (랜덤화도 가능하나 지금은 고정값 유지)
      spawnEnemies([
        createEnemy('scrap_collector'),
        createEnemy('acid_dog')
      ]);
    }

    // 🌟 유물 효과: [피 묻은 가죽 탄띠] (전투 시작 시 탄약 +1)
    if (relics.includes('bloody_bandolier')) {
      addAmmo(1);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 적 턴 순차 실행용 ref (cleanup 가능하도록)
  const enemyTurnTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // 적 턴 순차 처리: 각 적이 차례로 행동
  const processEnemyTurnsSequentially = useCallback(() => {
    // cleanup 이전 타이머
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

    const ENEMY_ACTION_DELAY = 800; // 각 적 행동 간 딜레이 (ms)

    aliveIndices.forEach((enemyIdx, seqIdx) => {
      // 1. 활성 적 표시 (공격 전진 연출 시작)
      const highlightTimer = setTimeout(() => {
        setActiveEnemyIndex(enemyIdx);
      }, seqIdx * ENEMY_ACTION_DELAY);
      enemyTurnTimersRef.current.push(highlightTimer);

      // 2. 실제 행동 실행 (표시 후 300ms 뒤)
      const actionTimer = setTimeout(() => {
        executeOneEnemyTurn(enemyIdx);
      }, seqIdx * ENEMY_ACTION_DELAY + 300);
      enemyTurnTimersRef.current.push(actionTimer);
    });

    // 3. 모든 적 행동 완료 후 플레이어 턴 복귀
    const totalTime = aliveIndices.length * ENEMY_ACTION_DELAY + 500;
    const turnEndTimer = setTimeout(() => {
      setActiveEnemyIndex(null);
      startPlayerTurn();
      drawCards(5);
    }, totalTime);
    enemyTurnTimersRef.current.push(turnEndTimer);
  }, [startPlayerTurn, drawCards, executeOneEnemyTurn, setActiveEnemyIndex]);

  // 턴 전환 감지 및 적 턴 행동(AI) 처리
  useEffect(() => {
    if (currentTurn === 'ENEMY') {
      const startTimer = setTimeout(() => {
        processEnemyTurnsSequentially();
      }, 300);

      return () => {
        clearTimeout(startTimer);
        enemyTurnTimersRef.current.forEach(clearTimeout);
        enemyTurnTimersRef.current = [];
      };
    }
  }, [currentTurn, processEnemyTurnsSequentially]);

  // 🌟 타겟팅 모드 전역 마우스 추적 및 곡선 연산용 상태
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (targetingCardId !== null && targetingPosition !== null) {
      const handleMouseMove = (e: MouseEvent) => {
        setMousePos({ x: e.clientX, y: e.clientY });
      };

      // 혹시 모를 초기 커서 위치 틀어짐을 방지하기 위해 등록 시점부터 즉시 추적 시작
      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
  }, [targetingCardId, targetingPosition]);

  // 보상 획득용 버튼 스타일 변수
  const rewardBtnStyle: React.CSSProperties = {
    padding: '12px 24px', fontSize: '18px', fontWeight: 'bold', width: '100%',
    backgroundColor: '#4a3a10', color: '#ffd700', border: '2px solid #cca500',
    borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s',
    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px'
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
      {/*
        [하이브리드 렌더링 아키텍처]
        1. Pixi.js Canvas: 맨 밑에 깔려서 전투 연출(스프라이트, 파티클)을 담당합니다.
      */}
      <div style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
        <BattleStage />
      </div>

      {/* 🌟 타겟팅 SVG 점선 오버레이 (Pixi 캔버스와 React UI 사이쯤 혹은 UI와 동급으로 렌더링) */}
      {targetingCardId && targetingPosition && (
        <svg
          style={{
            position: 'absolute',
            top: 0, left: 0,
            width: '100%', height: '100%',
            pointerEvents: 'none',
            zIndex: 15, // 카드나 몹보단 아래일 수 있으나 명확하게 보이도록 충분히 높힘
            filter: 'drop-shadow(0 0 10px rgba(255, 170, 0, 0.8))' // 네온 광원 효과
          }}
        >
          {/* C자형 둥근 곡선 (Quadratic Bezier) */}
          <path
            d={`M ${targetingPosition.x} ${targetingPosition.y} 
                Q ${targetingPosition.x + (mousePos.x - targetingPosition.x) * 0.5 + 100} ${targetingPosition.y - 150},
                ${mousePos.x} ${mousePos.y}`}
            fill="none"
            stroke="#ffaa00"
            strokeWidth="4"
            strokeDasharray="16 16"
          >
            {/* 흘러가는 점선 애니메이션 */}
            <animate
              attributeName="stroke-dashoffset"
              values="128;0"
              dur="2s"
              repeatCount="indefinite"
            />
          </path>
        </svg>
      )}

      {/* 
        2. React UI: Canvas 위를 덮는 투명한 DOM 레이어로 메뉴, 카드, 상태를 담당합니다.
      */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 20 }}>
        {/* pointerEvents: 'none'을 통해 클릭이 기본적으로 아래 Canvas로 투과되게 하고, 
            각종 UI 요소들에만 pointerEvents: 'auto'를 줍니다. */}
        <div style={{ pointerEvents: 'auto' }}>
          <HUD />
          <ResourcePanel />
          <Hand />
          <DeckPiles />
        </div>
      </div>

      {/* 4. 전투 결과 팝업 오버레이 (승리 보상창) */}
      {battleResult === 'VICTORY' && !showBossClear && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          zIndex: 200,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          color: 'white'
        }}>
          <h1 style={{
            fontSize: '48px',
            color: '#44ff44',
            marginBottom: '10px'
          }}>
            전투 승리!
          </h1>
          <p style={{ fontSize: '18px', color: '#ccc', marginBottom: '30px' }}>
            수고하셨습니다. 보상을 챙기거나 스킵하고 넘어갈 수 있습니다.
          </p>

          {/* 보상(전리품) 선택 영역 */}
          <div style={{
            margin: '0 0 30px 0', padding: '20px', width: '360px',
            backgroundColor: '#2a1f1a', borderRadius: '12px', border: '2px solid #aa7700',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px'
          }}>
            <h3 style={{ margin: '0 0 5px 0', color: '#ffd700', fontSize: '24px' }}>🎁 전리품 발견</h3>

            {!goldClaimed && (
              <button
                onClick={() => {
                  const goldAmount = currentScene === 'BOSS' ? 100 : currentScene === 'ELITE' ? 50 : 20;
                  addGold(goldAmount);
                  setGoldClaimed(true);
                }}
                style={rewardBtnStyle}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5a4a20'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4a3a10'}
              >
                💰 {currentScene === 'BOSS' ? 100 : currentScene === 'ELITE' ? 50 : 20} 골드 획득
              </button>
            )}

            {!cardClaimed && (
              <button
                onClick={() => {
                  setIsCardModalOpen(true);
                }}
                style={{ ...rewardBtnStyle, color: '#fff', borderColor: '#4a70b0', backgroundColor: '#2a3a50' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3a4a60'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2a3a50'}
              >
                🃏 새 카드 1장 선택 (3택 1)
              </button>
            )}

            {(currentScene === 'ELITE' || currentScene === 'BOSS') && !relicClaimed && (
              <button
                onClick={() => setIsRelicModalOpen(true)}
                style={{ ...rewardBtnStyle, color: '#ffaaaa', borderColor: '#b04a4a', backgroundColor: '#502a2a' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#603a3a'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#502a2a'}
              >
                📦 {currentScene === 'BOSS' ? '보스 유물' : '일반 유물'} 획득
              </button>
            )}

            {goldClaimed && cardClaimed && (!(currentScene === 'ELITE' || currentScene === 'BOSS') || relicClaimed) && (
              <span style={{ color: '#88ff88', marginTop: '10px' }}>✓ 모든 보상을 남김없이 획득했습니다.</span>
            )}
          </div>

          <button
            onClick={async () => {
              if (currentScene === 'BOSS') {
                // 보스전이면 맵 이동 대신 클리어 오버레이를 켬
                setShowBossClear(true);
              } else {
                setScene('MAP');
                // 맵 이동 직전까지 진행한 덱과 유물, 골드, 체력 상태 저장 자동 갱신
                await useRunStore.getState().saveRunData();
              }
            }}
            style={{
              padding: '15px 40px', fontSize: '20px', fontWeight: 'bold',
              backgroundColor: '#444', color: 'white',
              border: '2px solid #555', borderRadius: '8px', cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#555'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#444'}
          >
            {currentScene === 'BOSS' ? '엔딩 보기' : '계속하기 (보상 획득 완료 및 이동)'}
          </button>
        </div>
      )}

      {/* 🌟 사망 시 GameOver 모달 */}
      {battleResult === 'DEFEAT' && <GameOverModal result="DEFEAT" />}

      {/* 🌟 1챕터 보스 처치 영광의 결과창 (Game Clear 모달 연결) */}
      {showBossClear && <GameOverModal result="VICTORY" />}

      {/* 카드 3택 1 보상 모달 렌더링 */}
      {isCardModalOpen && (
        <CardRewardModal
          onClose={() => setIsCardModalOpen(false)}
          onCardSelected={() => setCardClaimed(true)}
        />
      )}

      {/* 유물 획득 보상 모달 렌더링 */}
      {isRelicModalOpen && (
        <RelicRewardModal
          guaranteedTier={currentScene === 'BOSS' ? 'BOSS' : undefined}
          onClose={() => setIsRelicModalOpen(false)}
          onRelicSelected={() => setRelicClaimed(true)}
        />
      )}

      {/* 덱 내용물을 보는 공용 뷰어 모달 */}
      <CardViewerModal />
    </div>
  );
};
