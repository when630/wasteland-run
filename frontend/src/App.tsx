import { BattleView } from './pages/BattleView';
import { MapView } from './pages/MapView';
import { RestView } from './pages/RestView';
import { EventView } from './pages/EventView';
import { ShopView } from './pages/ShopView';
import { TreasureRoomView } from './pages/TreasureRoomView';
import { StartingEventView } from './pages/StartingEventView';
import { useRunStore } from './store/useRunStore';
import { ToastMessage } from './components/ui/ToastMessage';
import { useEffect, useState } from 'react';
import { MainMenuView } from './pages/MainMenuView';
import { LeaderboardModal } from './components/ui/LeaderboardModal';
import { SettingsModal } from './components/ui/SettingsModal';

import { useAudioStore } from './store/useAudioStore';
import { HUD } from './components/ui/HUD';
import { CardViewerModal } from './components/ui/CardViewerModal';

function SceneManager() {
  const currentScene = useRunStore(s => s.currentScene);

  useEffect(() => {
    const audioStore = useAudioStore.getState();
    switch (currentScene) {
      case 'MAIN_MENU':
        audioStore.playBgm('MAP');
        break;
      case 'MAP':
      case 'REST':
      case 'EVENT':
      case 'SHOP':
      case 'TREASURE':
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
      case 'TREASURE':
        return <TreasureRoomView />;
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
  const isLeaderboardOpen = useRunStore(s => s.isLeaderboardOpen);
  const currentScene = useRunStore(s => s.currentScene);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // 앱 시작 시 세이브 데이터 + 저장된 설정 로드
  useEffect(() => {
    useRunStore.getState().loadRunData();
    // 저장된 오디오 설정 복원
    // 오디오 설정 복원 (해상도는 main.ts에서 창 생성 시 처리)
    window.electronAPI?.loadSettings().then((data: any) => {
      if (data) {
        if (typeof data.bgmVolume === 'number') useAudioStore.getState().setBgmVolume(data.bgmVolume);
        if (typeof data.sfxVolume === 'number') useAudioStore.getState().setSfxVolume(data.sfxVolume);
      }
    });
  }, []);

  // ESC 키 → 설정 모달 토글
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSettingsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showQuitButton = currentScene !== 'MAIN_MENU' && currentScene !== 'DEBUG_BATTLE';

  return (
    <>
      <ToastMessage />
      {isLeaderboardOpen && <LeaderboardModal onClose={() => useRunStore.getState().setIsLeaderboardOpen(false)} />}
      {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} showQuitButton={showQuitButton} />}
      <SceneManager />
    </>
  );
}

export default App;
