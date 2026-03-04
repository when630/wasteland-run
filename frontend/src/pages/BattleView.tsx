import React, { useEffect, useState } from 'react';
import { BattleStage } from '../components/pixi/BattleStage';
import { HUD } from '../components/ui/HUD';
import { Hand } from '../components/ui/Hand';
import { ResourcePanel } from '../components/ui/ResourcePanel';
import { DeckPiles } from '../components/ui/DeckPiles';
import { CardRewardModal } from '../components/ui/CardRewardModal';
import { RelicRewardModal } from '../components/ui/RelicRewardModal';
import { CardViewerModal } from '../components/ui/CardViewerModal';
import { useDeckStore } from '../store/useDeckStore';
import { useBattleStore } from '../store/useBattleStore';
import { createStartingDeck } from '../assets/data/cards';
import { createEnemy } from '../assets/data/enemies';
import { useRunStore } from '../store/useRunStore';
import battleBg from '../assets/images/stage1_battle_backgroung.png';

export const BattleView: React.FC = () => {
  const { initDeck, drawCards, masterDeck, setMasterDeck } = useDeckStore();
  const { currentTurn, battleResult, startPlayerTurn, spawnEnemies, executeEnemyTurns, resetBattle, addAmmo } = useBattleStore();
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

    // 1스테이지 튜토리얼 몬스터 다중 소환
    spawnEnemies([
      createEnemy('scrap_collector'),
      createEnemy('acid_dog')
    ]);

    // 🌟 유물 효과: [피 묻은 가죽 탄띠] (전투 시작 시 탄약 +1)
    if (relics.includes('bloody_bandolier')) {
      addAmmo(1);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 턴 전환 감지 및 적 턴 행동(AI) 처리
  useEffect(() => {
    if (currentTurn === 'ENEMY') {
      // 1. 적군 행동(Intent) 연산 실행
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

  // 보상 획득용 버튼 스타일 변수
  const rewardBtnStyle: React.CSSProperties = {
    padding: '12px 24px', fontSize: '18px', fontWeight: 'bold', width: '100%',
    backgroundColor: '#4a3a10', color: '#ffd700', border: '2px solid #cca500',
    borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s',
    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px'
  };

  return (
    <div style={{
      position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden',
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

      {/* 4. 전투 결과 팝업 오버레이 (승리/패배 보상창) */}
      {battleResult !== 'NONE' && !showBossClear && (
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
            color: battleResult === 'VICTORY' ? '#44ff44' : '#ff4444',
            marginBottom: '10px'
          }}>
            {battleResult === 'VICTORY' ? '전투 승리!' : '사망 (Game Over)'}
          </h1>
          <p style={{ fontSize: '18px', color: '#ccc', marginBottom: '30px' }}>
            {battleResult === 'VICTORY'
              ? '수고하셨습니다. 보상을 챙기거나 스킵하고 넘어갈 수 있습니다.'
              : '황무지의 이슬로 사라졌습니다...'}
          </p>

          {/* 보상(전리품) 선택 영역 */}
          {battleResult === 'VICTORY' && (
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
          )}

          <button
            onClick={async () => {
              if (battleResult === 'VICTORY') {
                if (currentScene === 'BOSS') {
                  // 보스전이면 맵 이동 대신 클리어 오버레이를 켬
                  setShowBossClear(true);
                  // 명예의 전당 보존 직후, 해당 런은 클리어된 런으로 종결
                  useRunStore.getState().setIsActive(false);
                  await useRunStore.getState().saveRunData();
                } else {
                  setScene('MAP');
                  // 맵 이동 직전까지 진행한 덱과 유물, 골드, 체력 상태 저장 자동 갱신
                  await useRunStore.getState().saveRunData();
                }
              }
              else {
                // 게임 오버(DEFEAT) 시 세이브 슬롯 폭파 (isActive = false 전환)
                useRunStore.getState().setIsActive(false);
                await useRunStore.getState().saveRunData();
                window.location.reload();
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
            {battleResult === 'VICTORY' ? (currentScene === 'BOSS' ? '엔딩 보기' : '계속하기 (보상 획득 완료 및 이동)') : '다시 시작'}
          </button>
        </div>
      )}

      {/* 🌟 1챕터 보스 처치 영광의 결과창 (Game Clear) */}
      {showBossClear && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 300,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 2s ease-in-out'
        }}>
          <h1 style={{ fontSize: '64px', color: '#fbbf24', textShadow: '0 0 20px #fbbf24', marginBottom: '20px' }}>
            🎉 1챕터 클리어!
          </h1>
          <p style={{ fontSize: '24px', color: '#d1d5db', textAlign: 'center', lineHeight: '1.6', maxWidth: '600px', marginBottom: '50px' }}>
            거대한 고철 기갑수 브루터스가 굉음과 함께 쓰러졌습니다.<br />
            당신은 매캐한 연기를 뚫고 황무지의 다음 구역으로 발걸음을 옮깁니다.
          </p>
          <div style={{ display: 'flex', gap: '20px' }}>
            <button
              onClick={() => window.location.reload()} // 임시: 나중에 챕터 2로 연결되거나 통계창 노출
              style={{
                padding: '20px 60px', fontSize: '24px', fontWeight: 'bold',
                backgroundColor: '#b45309', color: '#fff', border: 'none',
                borderRadius: '12px', cursor: 'pointer', boxShadow: '0 0 15px rgba(180,83,9,0.5)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              처음부터 다시하기
            </button>
          </div>
        </div>
      )}

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
