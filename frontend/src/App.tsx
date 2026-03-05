import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { BattleView } from './pages/BattleView';
import { MapView } from './pages/MapView';
import { RestView } from './pages/RestView';
import { EventView } from './pages/EventView';
import { ShopView } from './pages/ShopView';
import { useRunStore } from './store/useRunStore';
import { ToastMessage } from './components/ui/ToastMessage';
import { useEffect } from 'react';
import { MainMenuView } from './pages/MainMenuView';
import { AuthModal } from './components/ui/AuthModal';
import { useAuthStore } from './store/useAuthStore';
import { LeaderboardModal } from './components/ui/LeaderboardModal';

import { useAudioStore } from './store/useAudioStore';

function SceneManager() {
  const { currentScene } = useRunStore();

  useEffect(() => {
    const audioStore = useAudioStore.getState();
    switch (currentScene) {
      case 'MAIN_MENU':
        audioStore.playBgm('MAP'); // 임시로 MAP bgm 사용. 나중에 TITLE 추가 시 변경
        break;
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
    case 'MAIN_MENU':
      return <MainMenuView />;
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
  const { loadRunData, isLeaderboardOpen, setIsLeaderboardOpen } = useRunStore();

  // 인증 상태가 참이 되면 (로그인 직후) 세이브 데이터를 불러옴
  useEffect(() => {
    if (isAuthenticated) {
      loadRunData(); // 내부에 저장 이력이 없으면 MAIN_MENU로 강제 이동 및 isActive 초기화 로직 존재
    }
  }, [isAuthenticated, loadRunData]);

  return (
    <>
      <ToastMessage />
      {!isAuthenticated && <AuthModal />}
      {isLeaderboardOpen && <LeaderboardModal onClose={() => setIsLeaderboardOpen(false)} />}

      {/* 화면 우상단 고정 랭킹 모달 토글 버튼 (HUD로 이동됨) */}

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
