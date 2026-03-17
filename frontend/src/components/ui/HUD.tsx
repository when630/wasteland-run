import React, { useState } from 'react';
import { useRunStore } from '../../store/useRunStore';
import { useDeckStore } from '../../store/useDeckStore';
import { useAudioStore } from '../../store/useAudioStore';
import { SettingsModal } from './SettingsModal';
import { DebugMenu } from './DebugMenu';
import { RelicBar } from './RelicBar';
import { MapView } from '../../pages/MapView';
import { useMapStore } from '../../store/useMapStore';
import { UI } from '../../styles/uiConstants';
import { iconHeart, iconGold, iconSettings, iconCardCount, iconMap, iconRelicReward } from '../../assets/images/GUI';

export const HUD: React.FC = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMapOverlayOpen, setIsMapOverlayOpen] = useState(false);
  const [isRelicBagOpen, setIsRelicBagOpen] = useState(false);
  const playerHp = useRunStore(s => s.playerHp);
  const playerMaxHp = useRunStore(s => s.playerMaxHp);
  const gold = useRunStore(s => s.gold);
  const currentScene = useRunStore(s => s.currentScene);
  const currentChapter = useRunStore(s => s.currentChapter);
  const relics = useRunStore(s => s.relics);

  const CHAPTER_NAMES: Record<number, string> = {
    1: '오염된 외곽 도시',
    2: '무너진 지하철도',
    3: '거대 기업의 방주',
  };
  const currentFloor = useMapStore(s => s.currentFloor);
  const drawPile = useDeckStore(s => s.drawPile);
  const hand = useDeckStore(s => s.hand);
  const discardPile = useDeckStore(s => s.discardPile);
  const exhaustPile = useDeckStore(s => s.exhaustPile);
  const isMap = currentScene === 'MAP';
  const totalFloor = (currentChapter - 1) * 15 + currentFloor;

  const iconSize = 26;
  const iconStyle: React.CSSProperties = {
    cursor: 'pointer',
    userSelect: 'none',
    fontSize: '24px',
    marginRight: '15px',
    textShadow: '2px 2px 2px black',
    transition: 'transform 0.2s'
  };
  const iconImg = (src: string, size = iconSize) => (
    <img src={src} alt="" style={{ width: size, height: size, objectFit: 'contain', verticalAlign: 'middle', filter: 'drop-shadow(1px 1px 1px black)' }} />
  );

  const handleIconHover = (e: React.MouseEvent<HTMLDivElement>) => e.currentTarget.style.transform = 'scale(1.2)';
  const handleIconLeave = (e: React.MouseEvent<HTMLDivElement>) => e.currentTarget.style.transform = 'scale(1)';

  return (
    <>
      <div style={{
        position: 'absolute',
        top: 0, left: 0, width: '100%', height: '60px',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
        color: 'white',
        display: 'flex', alignItems: 'center',
        padding: '0 20px', boxSizing: 'border-box',
        zIndex: 10
      }}>
        {/* 좌측 정보 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '18px', fontWeight: 'bold', textShadow: '2px 2px 2px black' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#8bb8f0' }}>
            <span style={{ fontSize: '16px' }}>{totalFloor}F</span>
          </div>
          <div style={{ color: '#aaa', fontSize: '14px' }}>{CHAPTER_NAMES[currentChapter] || `챕터 ${currentChapter}`}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: UI.color.danger }}>
            {iconImg(iconHeart)}<span>{playerHp} / {playerMaxHp}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: UI.color.gold }}>
            {iconImg(iconGold)}<span>{gold}</span>
          </div>
        </div>

        <div style={{ flex: 1 }} />

        {/* 유물 가방 버튼 */}
        <div
          onClick={() => { useAudioStore.getState().playClick(); setIsRelicBagOpen(true); }}
          style={{ ...iconStyle, display: 'flex', alignItems: 'center', gap: '4px' }}
          onMouseEnter={handleIconHover} onMouseLeave={handleIconLeave}
          title="유물 가방"
        >
          {iconImg(iconRelicReward)}
          {relics.length > 0 && (
            <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#cc8888' }}>
              {relics.length}
            </span>
          )}
        </div>

        {/* 지도 버튼 */}
        {!isMap && (
          <div onClick={() => { useAudioStore.getState().playClick(); setIsMapOverlayOpen(true); }}
            style={iconStyle} onMouseEnter={handleIconHover} onMouseLeave={handleIconLeave} title="지도 보기">
            {iconImg(iconMap)}
          </div>
        )}

        {/* 덱 카운트 */}
        <div
          onClick={() => useDeckStore.getState().setViewingPile('DECK')}
          style={{
            cursor: 'pointer', userSelect: 'none', fontSize: '24px',
            textShadow: '2px 2px 2px black',
            display: 'flex', alignItems: 'center', gap: '5px',
            transition: 'transform 0.2s',
            marginRight: '15px',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          title="전체 덱 보기"
        >
          {iconImg(iconCardCount)} <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{drawPile.length + hand.length + discardPile.length + exhaustPile.length}</span>
        </div>

        {/* 디버그 메뉴 (개발 모드에서만 표시) */}
        {import.meta.env.DEV && <DebugMenu />}

        {/* 환경 설정 */}
        <div onClick={() => { useAudioStore.getState().playClick(); setIsSettingsOpen(true); }}
          style={iconStyle} onMouseEnter={handleIconHover} onMouseLeave={handleIconLeave} title="환경 설정">
          {iconImg(iconSettings)}
        </div>
      </div>

      {/* 유물 가방 모달 */}
      <RelicBar isOpen={isRelicBagOpen} onClose={() => setIsRelicBagOpen(false)} />

      {/* 모달들 */}
      {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} showQuitButton={true} />}
      {isMapOverlayOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 9999 }}>
          <MapView viewOnly onClose={() => setIsMapOverlayOpen(false)} />
        </div>
      )}
    </>
  );
};
