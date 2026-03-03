import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { BattleView } from './pages/BattleView';
import { MapView } from './pages/MapView';
import { RestView } from './pages/RestView';
import { EventView } from './pages/EventView';
import { useRunStore } from './store/useRunStore';
import { useDeckStore } from './store/useDeckStore';
import { createStartingDeck } from './assets/data/cards';
import { useEffect } from 'react';

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
    // 추후 SHOP 추가
    default:
      return <MapView />;
  }
}

function App() {
  const { masterDeck, setMasterDeck } = useDeckStore();

  useEffect(() => {
    // 앱 최초 실행 시 기본 덱이 없으면 지급 (런 시작 연동)
    if (masterDeck.length === 0) {
      setMasterDeck(createStartingDeck());
    }
  }, [masterDeck.length, setMasterDeck]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SceneManager />} />
        {/* 없는 경로 접근 시 루트로 리다이렉트 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
