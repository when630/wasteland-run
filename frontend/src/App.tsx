import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { BattleView } from './pages/BattleView';
import { MapView } from './pages/MapView';
import { RestView } from './pages/RestView';
import { EventView } from './pages/EventView';
import { ShopView } from './pages/ShopView';
import { useRunStore } from './store/useRunStore';
import { useDeckStore } from './store/useDeckStore';
import { createStartingDeck } from './assets/data/cards';
import { ToastMessage } from './components/ui/ToastMessage';
import { useEffect, useState } from 'react';
import { AuthModal } from './components/ui/AuthModal';
import { useAuthStore } from './store/useAuthStore';
import { LeaderboardModal } from './components/ui/LeaderboardModal';

import { useAudioStore } from './store/useAudioStore';

function SceneManager() {
  const { currentScene } = useRunStore();

  useEffect(() => {
    const audioStore = useAudioStore.getState();
    switch (currentScene) {
      case 'MAP':
      case 'REST':
      case 'EVENT':
      case 'SHOP':
        audioStore.playBgm('MAP');
        break;
      case 'BATTLE':
      case 'ELITE':
        audioStore.playBgm('BATTLE');
        break;
      case 'BOSS':
        audioStore.playBgm('BOSS');
        break;
      default:
        audioStore.playBgm('MAP');
    }
  }, [currentScene]);

  switch (currentScene) {
    case 'MAP':
      return <MapView />;
    case 'BATTLE':
    case 'ELITE':
    case 'BOSS':
      return <BattleView />;
    case 'REST':
      return <RestView />;
    case 'EVENT':
      return <EventView />;
    case 'SHOP':
      return <ShopView />;
    default:
      return <MapView />;
  }
}

function App() {
  const { isAuthenticated } = useAuthStore();
  const { loadRunData } = useRunStore();
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

  // 인증 상태가 참이 되면 (로그인 직후) 세이브 데이터를 불러옴
  useEffect(() => {
    if (isAuthenticated) {
      loadRunData().then(() => {
        // 불러오기가 끝났을 때 현재 런이 진행 중이 아니거나(isActive === false) 
        // 덱이 아예 비어있으면 초기 덱을 세팅해 줌
        const { masterDeck: currentMasterDeck } = useDeckStore.getState();
        const { isActive: currentActive } = useRunStore.getState();
        if (!currentActive || currentMasterDeck.length === 0) {
          useDeckStore.getState().setMasterDeck(createStartingDeck());
        }
      });
    }
  }, [isAuthenticated, loadRunData]);

  return (
    <>
      <ToastMessage />
      {!isAuthenticated && <AuthModal />}
      {isLeaderboardOpen && <LeaderboardModal onClose={() => setIsLeaderboardOpen(false)} />}

      {/* 화면 우상단 고정 랭킹 모달 토글 버튼 */}
      <button
        onClick={() => setIsLeaderboardOpen(true)}
        style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 9000,
          padding: '10px 16px', backgroundColor: '#334455', color: '#fff',
          border: '1px solid #5a7a9a', borderRadius: '8px', cursor: 'pointer',
          fontWeight: 'bold', fontSize: '14px', boxShadow: '0 2px 5px rgba(0,0,0,0.5)'
        }}
      >
        🏆 명예의 전당
      </button>

      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SceneManager />} />
          {/* 없는 경로 접근 시 루트로 리다이렉트 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
