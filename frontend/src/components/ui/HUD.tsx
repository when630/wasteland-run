import React, { useState } from 'react';
import { useRunStore } from '../../store/useRunStore';
import { useDeckStore } from '../../store/useDeckStore';
import { useAudioStore } from '../../store/useAudioStore';
import { useResponsive } from '../../hooks/useResponsive';
import { SettingsModal } from './SettingsModal';
import { DebugMenu } from './DebugMenu';
import { RelicBar } from './RelicBar';
import { MapView } from '../../pages/MapView';
import { useMapStore } from '../../store/useMapStore';
import { colors } from '../../styles/theme';
import { iconHeart, iconGold, iconSettings, iconCardCount, iconMap } from '../../assets/images/GUI';

export const HUD: React.FC = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMapOverlayOpen, setIsMapOverlayOpen] = useState(false);
  const { playerHp, playerMaxHp, gold, currentScene, currentChapter } = useRunStore();

  const CHAPTER_NAMES: Record<number, string> = {
    1: '오염된 외곽 도시',
    2: '무너진 지하철도',
    3: '거대 기업의 방주',
  };
  const { currentFloor } = useMapStore();
  const { drawPile, hand, discardPile, exhaustPile, setViewingPile } = useDeckStore();
  const { isMobile } = useResponsive();
  const isMap = currentScene === 'MAP';
  const totalFloor = (currentChapter - 1) * 15 + currentFloor;

  const iconSize = isMobile ? 20 : 26;
  const iconStyle: React.CSSProperties = {
    cursor: 'pointer',
    userSelect: 'none',
    fontSize: isMobile ? '18px' : '24px',
    marginRight: isMobile ? '8px' : '15px',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '10px' : '20px', fontSize: isMobile ? '14px' : '18px', fontWeight: 'bold', textShadow: '2px 2px 2px black' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#8bb8f0' }}>
            <span style={{ fontSize: isMobile ? '13px' : '16px' }}>{totalFloor}F</span>
          </div>
          {!isMobile && <div style={{ color: '#aaa', fontSize: '14px' }}>{CHAPTER_NAMES[currentChapter] || `챕터 ${currentChapter}`}</div>}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: colors.accent.red }}>
            {iconImg(iconHeart)}<span>{playerHp} / {playerMaxHp}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: colors.accent.gold }}>
            {iconImg(iconGold)}<span>{gold}</span>
          </div>
        </div>

        <div style={{ flex: 1 }} />

        {/* 지도 버튼 */}
        {!isMap && (
          <div onClick={() => { useAudioStore.getState().playClick(); setIsMapOverlayOpen(true); }}
            style={iconStyle} onMouseEnter={handleIconHover} onMouseLeave={handleIconLeave} title="지도 보기">
            {iconImg(iconMap)}
          </div>
        )}

        {/* 덱 카운트 */}
        <div
          onClick={() => setViewingPile('DECK')}
          style={{
            cursor: 'pointer', userSelect: 'none', fontSize: '24px',
            textShadow: '2px 2px 2px black',
            display: 'flex', alignItems: 'center', gap: '5px',
            transition: 'transform 0.2s',
            marginRight: isMobile ? '8px' : '15px',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          title="전체 덱 보기"
        >
          {iconImg(iconCardCount)} <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{drawPile.length + hand.length + discardPile.length + exhaustPile.length}</span>
        </div>

        {/* 디버그 메뉴 */}
        <DebugMenu />

        {/* 환경 설정 */}
        <div onClick={() => { useAudioStore.getState().playClick(); setIsSettingsOpen(true); }}
          style={iconStyle} onMouseEnter={handleIconHover} onMouseLeave={handleIconLeave} title="환경 설정">
          {iconImg(iconSettings)}
        </div>
      </div>

      {/* 유물 바 */}
      <RelicBar />

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
