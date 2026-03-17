import React, { useState } from 'react';
import { useRunStore } from '../store/useRunStore';
import { useDeckStore } from '../store/useDeckStore';
import { useMapStore } from '../store/useMapStore';
import { createStartingDeck } from '../assets/data/cards';
import { useAudioStore } from '../store/useAudioStore';
import { useRngStore } from '../store/useRngStore';
import { CompendiumModal } from '../components/ui/CompendiumModal';
import { SettingsModal } from '../components/ui/SettingsModal';
import { StatisticsModal } from '../components/ui/StatisticsModal';

export const MainMenuView: React.FC = () => {
  const { isActive, setScene } = useRunStore();
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

  const handleNewGame = async () => {
    useAudioStore.getState().playClick();

    // 런 정보 완전 초기화
    const newSeed = Math.random().toString(36).substring(2, 10);
    useRunStore.setState({
      playerHp: 84,
      playerMaxHp: 84,
      gold: 0,
      currentMapNode: null,
      currentChapter: 1,
      relics: [],
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
          onClick={handleNewGame}
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
              const seed = 'practice_' + Date.now();
              useRngStore.getState().initialize(seed);
              useRunStore.setState({ playerHp: 9999, playerMaxHp: 9999, isActive: false });
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
    </div>
  );
};
