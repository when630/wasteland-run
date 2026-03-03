import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { BattleView } from './pages/BattleView';
import { MapView } from './pages/MapView';
import { RestView } from './pages/RestView';
import { EventView } from './pages/EventView';
import { useRunStore } from './store/useRunStore';

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
