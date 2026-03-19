import React, { useState } from 'react';
import { useRunStore } from '../store/useRunStore';
import { useDeckStore } from '../store/useDeckStore';
import { useMapStore } from '../store/useMapStore';
import { createStartingDeck } from '../assets/data/cards';
import type { Card } from '../types/gameTypes';
import { useAudioStore } from '../store/useAudioStore';
import { useRngStore } from '../store/useRngStore';
import { CompendiumModal } from '../components/ui/CompendiumModal';
import { getMutationModifiers, MUTATION_DESCRIPTIONS } from '../logic/mutationModifiers';
import { STATUS_CARDS } from '../assets/data/cards';
import { SettingsModal } from '../components/ui/SettingsModal';
import { StatisticsModal } from '../components/ui/StatisticsModal';

export const MainMenuView: React.FC = () => {
  const { isActive, setScene } = useRunStore();
  const maxMutationUnlocked = useRunStore(s => s.maxMutationUnlocked);
  const [selectedMutation, setSelectedMutation] = useState(0);
  const [showMutationSelect, setShowMutationSelect] = useState(false);
  const [isHovered, setIsHovered] = useState<string | null>(null);
  const [isCompendiumOpen, setIsCompendiumOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStatisticsOpen, setIsStatisticsOpen] = useState(false);

  const buttonStyle = (id: string, disabled: boolean = false) => ({
    padding: '15px 40px',
    fontSize: '24px',
    fontWeight: 'bold',
    color: disabled ? '#555' : isHovered === id ? '#fff' : '#aaa',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    textShadow: isHovered === id ? '0 0 10px rgba(255,255,255,0.8)' : 'none',
    transform: isHovered === id && !disabled ? 'scale(1.1)' : 'scale(1)',
    transition: 'all 0.2s ease-in-out',
    fontFamily: '"Galmuri11", "Courier New", Courier, monospace',
    textAlign: 'left' as const,
    whiteSpace: 'nowrap' as const,
  });

  const handleNewGame = async (mutationLevel: number = 0) => {
    useAudioStore.getState().playClick();
    setShowMutationSelect(false);

    const mut = getMutationModifiers(mutationLevel);
    const baseMaxHp = 84 - mut.startMaxHpReduction;

    // 런 정보 완전 초기화
    const newSeed = Math.random().toString(36).substring(2, 10);
    useRunStore.setState({
      playerHp: baseMaxHp,
      playerMaxHp: baseMaxHp,
      gold: mut.startGoldZero ? 0 : 0,
      currentMapNode: null,
      currentChapter: 1,
      relics: [],
      supplies: [],
      mutationStage: mutationLevel,
      runStartTime: Date.now(),
      runSeed: newSeed,
      isActive: true,
      enemiesKilled: 0,
      cardsPlayed: 0,
      totalDamageDealt: 0,
      totalDamageTaken: 0,
      totalGoldEarned: 0,
      usedEventIds: [],
      unknownProb: { enemy: 10, shop: 3, treasure: 2 },
      unknownVisitedCount: 0,
      lastVisitedNodeType: null,
      cardRemovalCount: 0,
    });

    // 시드 RNG 초기화
    useRngStore.getState().initialize(newSeed);

    // 덱 초기화
    useDeckStore.getState().setMasterDeck(createStartingDeck());

    // 변이 10단계 이상: 시작 덱에 [방사능 오염] 추가
    if (mut.startWithBurn) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _id, ...radiationBlueprint } = STATUS_CARDS[1]; // 방사능 오염
      useDeckStore.getState().addCardToMasterDeck(radiationBlueprint as any);
    }

    // 맵(층) 초기화 — 0층에서 출발 이벤트 후 1층으로 진입
    useMapStore.setState({ currentFloor: 0, nodes: [], currentNodeId: null, visitedNodeIds: [], pendingNodeId: null, mapChapter: 1 });

    // 출발 이벤트로 이동 (0층)
    setScene('STARTING_EVENT');

    await useRunStore.getState().saveRunData();
  };

  const handleContinue = () => {
    useAudioStore.getState().playClick();
    useMapStore.getState().setPendingNode(null); // 잔여 pendingNodeId 클리어
    setScene('MAP');
  };

  return (
    <div style={{
      width: '100vw',
      minHeight: '100vh',
      overflowY: 'auto',
      backgroundColor: '#0a0a0a',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      justifyContent: 'center',
      paddingLeft: '15%',
      backgroundImage: 'radial-gradient(circle at right bottom, #2a0a0a 0%, #000 70%)',
    }}>

      {/* 타이틀 로고/텍스트 영역 */}
      <div style={{ marginBottom: '40px', pointerEvents: 'none' }}>
        <h1 style={{
          fontSize: '96px',
          margin: 0,
          color: '#ff4444',
          textShadow: '4px 4px 0px #440000, 0 0 20px rgba(255,60,60,0.5)',
          fontFamily: '"Galmuri11", Impact, sans-serif',
          letterSpacing: '5px'
        }}>
          WASTELAND RUN
        </h1>
        <p style={{
          fontSize: '24px',
          color: '#888',
          marginTop: '10px',
          letterSpacing: '10px',
          fontFamily: '"Galmuri11", "Courier New", Courier, monospace',
          textTransform: 'uppercase'
        }}>
          The End of the World is just the Beginning
        </p>
      </div>

      {/* 메뉴 버튼 영역 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {isActive && (
          <button
            style={buttonStyle('continue')}
            onMouseEnter={() => setIsHovered('continue')}
            onMouseLeave={() => setIsHovered(null)}
            onClick={handleContinue}
          >
            ▶ 이어하기
          </button>
        )}

        <button
          style={buttonStyle('newgame')}
          onMouseEnter={() => setIsHovered('newgame')}
          onMouseLeave={() => setIsHovered(null)}
          onClick={() => { useAudioStore.getState().playClick(); setShowMutationSelect(true); }}
        >
          {isActive ? '▶ 새 게임 (현재 진행도 삭제)' : '▶ 새 게임'}
        </button>

        <button
          style={buttonStyle('compendium')}
          onMouseEnter={() => setIsHovered('compendium')}
          onMouseLeave={() => setIsHovered(null)}
          onClick={() => {
            useAudioStore.getState().playClick();
            setIsCompendiumOpen(true);
          }}
        >
          ▶ 도감
        </button>

        <button
          style={buttonStyle('statistics')}
          onMouseEnter={() => setIsHovered('statistics')}
          onMouseLeave={() => setIsHovered(null)}
          onClick={() => {
            useAudioStore.getState().playClick();
            setIsStatisticsOpen(true);
          }}
        >
          ▶ 통계
        </button>

        <button
          style={buttonStyle('settings')}
          onMouseEnter={() => setIsHovered('settings')}
          onMouseLeave={() => setIsHovered(null)}
          onClick={() => {
            useAudioStore.getState().playClick();
            setIsSettingsOpen(true);
          }}
        >
          ▶ 설정
        </button>

        {/* 연습 모드 (개발 모드에서만 표시) */}
        {import.meta.env.DEV && (
          <button
            style={{ ...buttonStyle('practice'), fontSize: '20px', color: isHovered === 'practice' ? '#ff0' : '#665' }}
            onMouseEnter={() => setIsHovered('practice')}
            onMouseLeave={() => setIsHovered(null)}
            onClick={() => {
              useAudioStore.getState().playClick();

              // 현재 런 상태 백업 (진행 중인 런 보호)
              const runSnap = useRunStore.getState();
              const deckSnap = useDeckStore.getState().masterDeck;
              const rngSnap = useRngStore.getState().serializeStates();
              (window as any).__practiceBackup = {
                run: {
                  playerHp: runSnap.playerHp,
                  playerMaxHp: runSnap.playerMaxHp,
                  gold: runSnap.gold,
                  relics: [...runSnap.relics],
                  supplies: [...runSnap.supplies],
                  isActive: runSnap.isActive,
                  currentScene: runSnap.currentScene,
                  currentMapNode: runSnap.currentMapNode,
                  currentChapter: runSnap.currentChapter,
                  runSeed: runSnap.runSeed,
                },
                deck: deckSnap.map((c: Card) => ({ ...c })),
                rng: rngSnap,
              };

              const seed = 'practice_' + Date.now();
              useRngStore.getState().initialize(seed);
              useRunStore.setState({ playerHp: 9999, playerMaxHp: 9999 });
              setScene('DEBUG_BATTLE');
            }}
          >
            ▶ 연습 모드
          </button>
        )}

      </div>

      {isCompendiumOpen && <CompendiumModal onClose={() => setIsCompendiumOpen(false)} />}
      {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} showQuitButton={false} />}
      {isStatisticsOpen && <StatisticsModal onClose={() => setIsStatisticsOpen(false)} />}

      {/* 변이 단계 선택 모달 */}
      {showMutationSelect && (
        <div
          onClick={() => setShowMutationSelect(false)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.88)', zIndex: 10000,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <div onClick={e => e.stopPropagation()} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            maxWidth: '500px', width: '90%',
          }}>
            <h2 style={{
              fontSize: '28px', color: '#d4a854', marginBottom: '6px',
              textShadow: '2px 2px 6px rgba(0,0,0,0.8)',
            }}>
              ☢️ 변이 단계 선택
            </h2>
            <p style={{ fontSize: '13px', color: '#8a7e6a', marginBottom: '20px' }}>
              높은 단계일수록 황무지가 더 위험해집니다. 효과는 누적 적용됩니다.
            </p>

            {/* 단계 선택 슬라이더 */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              marginBottom: '16px',
            }}>
              <button
                onClick={() => setSelectedMutation(Math.max(0, selectedMutation - 1))}
                style={{
                  background: 'none', border: '1px solid rgba(180,140,50,0.4)',
                  color: '#d4a854', fontSize: '22px', padding: '4px 12px',
                  borderRadius: '6px', cursor: 'pointer',
                }}
              >◀</button>
              <div style={{
                fontSize: '36px', fontWeight: 'bold',
                color: selectedMutation === 0 ? '#8a8a6a' : selectedMutation <= 5 ? '#a8b8a0' : selectedMutation <= 10 ? '#d4a854' : selectedMutation <= 15 ? '#d48844' : '#cc4444',
                minWidth: '60px', textAlign: 'center',
                textShadow: '2px 2px 6px rgba(0,0,0,0.8)',
              }}>
                {selectedMutation}
              </div>
              <button
                onClick={() => setSelectedMutation(Math.min(maxMutationUnlocked, selectedMutation + 1))}
                style={{
                  background: 'none', border: '1px solid rgba(180,140,50,0.4)',
                  color: '#d4a854', fontSize: '22px', padding: '4px 12px',
                  borderRadius: '6px', cursor: 'pointer',
                }}
              >▶</button>
            </div>

            {/* 현재 선택 단계 효과 목록 */}
            <div style={{
              width: '100%', maxHeight: '240px', overflowY: 'auto',
              background: 'rgba(20,18,14,0.7)', borderRadius: '8px',
              border: '1px solid rgba(100,80,40,0.3)',
              padding: '10px 14px', marginBottom: '20px',
            }}>
              {selectedMutation === 0 ? (
                <div style={{ color: '#8a8a6a', fontSize: '14px', textAlign: 'center', padding: '10px' }}>
                  변이 없음 — 기본 난이도
                </div>
              ) : (
                Array.from({ length: selectedMutation }).map((_, i) => {
                  const stage = i + 1;
                  const desc = MUTATION_DESCRIPTIONS[stage];
                  if (!desc) return null;
                  return (
                    <div key={stage} style={{
                      display: 'flex', gap: '8px', padding: '4px 0',
                      borderBottom: '1px solid rgba(100,80,40,0.15)',
                      fontSize: '13px',
                    }}>
                      <span style={{
                        color: stage <= 5 ? '#a8b8a0' : stage <= 10 ? '#d4a854' : stage <= 15 ? '#d48844' : '#cc4444',
                        fontWeight: 'bold', minWidth: '24px',
                      }}>{stage}</span>
                      <span style={{ color: '#b0a890' }}>{desc.name}</span>
                      <span style={{ color: '#888', flex: 1, textAlign: 'right' }}>{desc.effect}</span>
                    </div>
                  );
                })
              )}
            </div>

            {/* 버튼 */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowMutationSelect(false)}
                style={{
                  padding: '10px 24px', fontSize: '16px',
                  background: 'none', color: '#a09078',
                  border: '1px solid rgba(120,100,70,0.4)',
                  borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(180,150,100,0.6)'; e.currentTarget.style.color = '#c8b898'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(120,100,70,0.4)'; e.currentTarget.style.color = '#a09078'; }}
              >
                취소
              </button>
              <button
                onClick={() => handleNewGame(selectedMutation)}
                style={{
                  padding: '10px 30px', fontSize: '18px', fontWeight: 'bold',
                  background: 'none',
                  color: '#d4a854',
                  border: '1px solid rgba(212,168,84,0.5)',
                  borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(212,168,84,0.8)'; e.currentTarget.style.color = '#e8c878'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(212,168,84,0.5)'; e.currentTarget.style.color = '#d4a854'; }}
              >
                {selectedMutation > 0 ? `변이 ${selectedMutation}단계로 시작` : '시작'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
