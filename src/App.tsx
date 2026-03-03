import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { BattleView } from './pages/BattleView';
import { MapView } from './pages/MapView';
import { useRunStore } from './store/useRunStore';

function SceneManager() {
  const { currentScene } = useRunStore();

  switch (currentScene) {
    case 'MAP':
      return <MapView />;
    case 'BATTLE':
      return <BattleView />;
    // 추후 REST, SHOP, EVENT 등 추가
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
