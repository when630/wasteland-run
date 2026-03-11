import React from 'react';
import { useBattleStore } from '../../store/useBattleStore';
import { useDeckStore } from '../../store/useDeckStore';
import { useAudioStore } from '../../store/useAudioStore';
import { useResponsive } from '../../hooks/useResponsive';
import { colors } from '../../styles/theme';

export const ResourcePanel: React.FC = () => {
  const { playerActionPoints, playerMaxAp, playerAmmo, endPlayerTurn, currentTurn } = useBattleStore();
  const { discardHand } = useDeckStore();
  const { isMobile } = useResponsive();

  const handleTurnEnd = () => {
    useAudioStore.getState().playClick();
    const retainCount = useBattleStore.getState().playerStatus.retainCardCount;
    if (retainCount > 0) {
      useDeckStore.getState().discardHandWithRetain(retainCount);
    } else {
      discardHand();
    }
    endPlayerTurn();
  };

  return (
    <>
      {/* 🌟 에너지(AP) 및 탄약 뱃지 (좌측 하단, 드로우 덱 우측 위쪽) */}
      <div style={{
        position: 'absolute',
        bottom: isMobile ? '40px' : '60px',
        left: isMobile ? '60px' : '120px',
        width: isMobile ? '60px' : '80px',
        height: isMobile ? '60px' : '80px',
        borderRadius: '50%', // 둥근 구슬 모양
        background: 'radial-gradient(circle at 30% 30%, #ff8c00, #b22222)',
        border: `3px solid ${colors.accent.gold}`,
        boxShadow: '0 0 15px rgba(255, 60, 0, 0.6)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
        zIndex: 10,
        pointerEvents: 'none' // 클릭 이벤트 무시
      }}>
        {/* Slay the Spire 에너지 텍스트 스타일 */}
        <div style={{ fontSize: isMobile ? '20px' : '28px', fontWeight: '900', textShadow: '2px 2px 2px black' }}>
          {playerActionPoints}<span style={{ fontSize: isMobile ? '12px' : '16px' }}>/{playerMaxAp}</span>
        </div>
        <div style={{ fontSize: isMobile ? '10px' : '12px', fontWeight: 'bold', textShadow: '1px 1px 1px black' }}>
          Ammo: {playerAmmo}
        </div>
      </div>

      {/* 🌟 턴 종료 버튼 (우측 하단, 덱 위쪽) */}
      <button
        onClick={handleTurnEnd}
        disabled={currentTurn !== 'PLAYER'}
        style={{
          position: 'absolute',
          right: isMobile ? '15px' : '50px',
          bottom: isMobile ? '100px' : '150px',
          padding: isMobile ? '8px 18px' : '12px 30px',
          backgroundColor: currentTurn === 'PLAYER' ? '#2c5364' : '#555',
          color: currentTurn === 'PLAYER' ? '#a2f5df' : '#bbb',
          border: '2px solid',
          borderColor: currentTurn === 'PLAYER' ? '#4dc3a3' : '#333',
          borderRadius: '30px',
          fontSize: isMobile ? '14px' : '20px',
          fontWeight: 'bold',
          letterSpacing: '2px',
          boxShadow: currentTurn === 'PLAYER' ? '0 0 10px rgba(77, 195, 163, 0.4)' : 'none',
          cursor: currentTurn === 'PLAYER' ? 'pointer' : 'not-allowed',
          zIndex: 10,
          pointerEvents: 'auto',
          transition: 'all 0.2s ease-in-out'
        }}
        onMouseEnter={(e) => {
          if (currentTurn === 'PLAYER') {
            e.currentTarget.style.backgroundColor = '#203a43';
            e.currentTarget.style.boxShadow = '0 0 15px rgba(77, 195, 163, 0.8)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }
        }}
        onMouseLeave={(e) => {
          if (currentTurn === 'PLAYER') {
            e.currentTarget.style.backgroundColor = '#2c5364';
            e.currentTarget.style.boxShadow = '0 0 10px rgba(77, 195, 163, 0.4)';
            e.currentTarget.style.transform = 'scale(1)';
          }
        }}
      >
        {currentTurn === 'PLAYER' ? '턴 종료' : '적 행동 중'}
      </button>
    </>
  );
};
