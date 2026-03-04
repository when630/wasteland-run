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

function SceneManager() {
  const { currentScene } = useRunStore();

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
  const { masterDeck, setMasterDeck } = useDeckStore();
  const { isAuthenticated } = useAuthStore();
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

  useEffect(() => {
    // 앱 최초 실행 시 기본 덱이 없으면 지급 (런 시작 연동)
    if (masterDeck.length === 0) {
      setMasterDeck(createStartingDeck());
    }
  }, [masterDeck.length, setMasterDeck]);

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
