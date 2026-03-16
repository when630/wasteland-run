import { BattleView } from './pages/BattleView';
import { MapView } from './pages/MapView';
import { RestView } from './pages/RestView';
import { EventView } from './pages/EventView';
import { ShopView } from './pages/ShopView';
import { StartingEventView } from './pages/StartingEventView';
import { useRunStore } from './store/useRunStore';
import { ToastMessage } from './components/ui/ToastMessage';
import { useEffect } from 'react';
import { MainMenuView } from './pages/MainMenuView';
import { LeaderboardModal } from './components/ui/LeaderboardModal';

import { useAudioStore } from './store/useAudioStore';
import { HUD } from './components/ui/HUD';
import { CardViewerModal } from './components/ui/CardViewerModal';

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
      case 'STARTING_EVENT':
        audioStore.playBgm('MAP');
        break;
      case 'BATTLE':
      case 'ELITE':
      case 'DEBUG_BATTLE':
        audioStore.playBgm('BATTLE');
        break;
      case 'BOSS':
        audioStore.playBgm('BOSS');
        break;
      default:
        audioStore.playBgm('MAP');
    }
  }, [currentScene]);

  const showHUD = currentScene !== 'MAIN_MENU' && currentScene !== 'DEBUG_BATTLE';

  const scene = (() => {
    switch (currentScene) {
      case 'MAIN_MENU':
        return <MainMenuView />;
      case 'MAP':
        return <MapView />;
      case 'BATTLE':
      case 'ELITE':
      case 'BOSS':
      case 'DEBUG_BATTLE':
        return <BattleView />;
      case 'REST':
        return <RestView />;
      case 'EVENT':
        return <EventView />;
      case 'STARTING_EVENT':
        return <StartingEventView />;
      case 'SHOP':
        return <ShopView />;
      default:
        return <MapView />;
    }
  })();

  return (
    <>
      {scene}
      {showHUD && <HUD />}
      <CardViewerModal />
    </>
  );
}

function App() {
  const { loadRunData, isLeaderboardOpen, setIsLeaderboardOpen } = useRunStore();

  useEffect(() => {
    loadRunData();
  }, [loadRunData]);

  return (
    <>
      <ToastMessage />
      {isLeaderboardOpen && <LeaderboardModal onClose={() => setIsLeaderboardOpen(false)} />}
      <SceneManager />
    </>
  );
}

export default App;
