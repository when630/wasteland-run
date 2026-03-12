import React, { useState } from 'react';
import { CardRewardModal } from './CardRewardModal';
import { RelicRewardModal } from './RelicRewardModal';
import { useRunStore } from '../../store/useRunStore';
import { useResponsive } from '../../hooks/useResponsive';
import { iconLoot, iconGoldReward, iconCardCount, iconRelicReward, iconBossClear } from '../../assets/images/GUI';

interface VictoryRewardPanelProps {
  onContinue: () => void;
  currentScene: string;
}

export const VictoryRewardPanel: React.FC<VictoryRewardPanelProps> = ({ onContinue, currentScene }) => {
  const { addGold } = useRunStore();
  const { isMobile } = useResponsive();

  const [goldClaimed, setGoldClaimed] = useState(false);
  const [cardClaimed, setCardClaimed] = useState(false);
  const [relicClaimed, setRelicClaimed] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isRelicModalOpen, setIsRelicModalOpen] = useState(false);

  const rewardBtnStyle: React.CSSProperties = {
    padding: '14px 24px', fontSize: '16px', fontWeight: 'bold', width: '100%',
    backgroundColor: 'rgba(50, 38, 15, 0.9)', color: '#d4a854',
    border: '1px solid rgba(180, 140, 50, 0.4)',
    borderLeft: '3px solid #b8892e',
    borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s',
    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px',
    textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
  };

  const rewardBtnHover = (e: React.MouseEvent<HTMLButtonElement>, enter: boolean) => {
    if (enter) {
      e.currentTarget.style.backgroundColor = 'rgba(70, 52, 20, 0.95)';
      e.currentTarget.style.boxShadow = '0 0 15px rgba(180, 140, 50, 0.2)';
    } else {
      e.currentTarget.style.backgroundColor = 'rgba(50, 38, 15, 0.9)';
      e.currentTarget.style.boxShadow = 'none';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(5, 5, 3, 0.9)',
      zIndex: 200,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      color: '#e8dcc8',
      animation: 'fadeIn 0.5s ease-out',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', animation: 'slideUp 0.4s ease-out' }}>
        <img src={iconBossClear} alt="" style={{ width: isMobile ? 36 : 48, height: isMobile ? 36 : 48, objectFit: 'contain', filter: 'drop-shadow(0 0 10px rgba(100, 255, 100, 0.5))' }} />
        <h1 style={{
          fontSize: isMobile ? '32px' : '44px', color: '#66cc88', margin: 0,
          textShadow: '2px 3px 6px rgba(0,0,0,0.8), 0 0 20px rgba(100, 200, 100, 0.3)',
        }}>
          전투 승리!
        </h1>
      </div>
      <p style={{ fontSize: isMobile ? '14px' : '16px', color: '#8a9a8a', marginBottom: isMobile ? '20px' : '30px' }}>
        보상을 챙기거나 스킵하고 넘어갈 수 있습니다.
      </p>

      <div style={{
        margin: '0 0 25px 0', padding: isMobile ? '18px' : '24px',
        width: isMobile ? '90vw' : '380px', maxWidth: '380px',
        backgroundColor: 'rgba(20, 16, 10, 0.9)',
        borderRadius: '8px', border: '1px solid rgba(160, 120, 50, 0.3)',
        boxShadow: '0 0 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
        animation: 'slideUp 0.5s ease-out',
      }}>
        <h3 style={{
          margin: '0 0 5px 0', color: '#d4a854', fontSize: '22px',
          display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center',
          textShadow: '1px 1px 3px rgba(0,0,0,0.6)',
        }}>
          <img src={iconLoot} alt="" style={{ width: 26, height: 26, objectFit: 'contain', filter: 'drop-shadow(0 0 4px rgba(212,168,84,0.5))' }} />
          전리품 발견
        </h3>

        {!goldClaimed && (
          <button
            onClick={() => {
              const goldAmount = currentScene === 'BOSS' ? 100 : currentScene === 'ELITE' ? 50 : 20;
              addGold(goldAmount);
              setGoldClaimed(true);
            }}
            style={rewardBtnStyle}
            onMouseEnter={(e) => rewardBtnHover(e, true)}
            onMouseLeave={(e) => rewardBtnHover(e, false)}
          >
            <img src={iconGoldReward} alt="" style={{ width: 22, height: 22, objectFit: 'contain' }} />
            {currentScene === 'BOSS' ? 100 : currentScene === 'ELITE' ? 50 : 20} 골드 획득
          </button>
        )}

        {!cardClaimed && (
          <button
            onClick={() => setIsCardModalOpen(true)}
            style={{ ...rewardBtnStyle, color: '#88aacc', borderLeftColor: '#4a7aaa', borderColor: 'rgba(80, 130, 200, 0.3)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(30, 40, 60, 0.95)'; e.currentTarget.style.boxShadow = '0 0 15px rgba(80, 130, 200, 0.2)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(50, 38, 15, 0.9)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <img src={iconCardCount} alt="" style={{ width: 22, height: 22, objectFit: 'contain' }} />
            새 카드 1장 선택 (3택 1)
          </button>
        )}

        {(currentScene === 'ELITE' || currentScene === 'BOSS') && !relicClaimed && (
          <button
            onClick={() => setIsRelicModalOpen(true)}
            style={{ ...rewardBtnStyle, color: '#cc8888', borderLeftColor: '#aa5555', borderColor: 'rgba(200, 80, 80, 0.3)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(60, 25, 25, 0.95)'; e.currentTarget.style.boxShadow = '0 0 15px rgba(200, 80, 80, 0.2)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(50, 38, 15, 0.9)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <img src={iconRelicReward} alt="" style={{ width: 22, height: 22, objectFit: 'contain' }} />
            {currentScene === 'BOSS' ? '보스 유물' : '일반 유물'} 획득
          </button>
        )}

        {goldClaimed && cardClaimed && (!(currentScene === 'ELITE' || currentScene === 'BOSS') || relicClaimed) && (
          <span style={{ color: '#66aa77', marginTop: '6px', fontSize: '14px' }}>모든 보상을 획득했습니다.</span>
        )}
      </div>

      <button
        onClick={onContinue}
        style={{
          padding: '14px 40px', fontSize: '18px', fontWeight: 'bold',
          backgroundColor: 'rgba(40, 35, 28, 0.9)', color: '#a09078',
          border: '1px solid rgba(120, 100, 70, 0.4)',
          borderRadius: '6px', cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(55, 48, 35, 0.95)'; e.currentTarget.style.color = '#c8b898'; e.currentTarget.style.boxShadow = '0 0 12px rgba(120, 100, 70, 0.2)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(40, 35, 28, 0.9)'; e.currentTarget.style.color = '#a09078'; e.currentTarget.style.boxShadow = 'none'; }}
      >
        {currentScene === 'BOSS' ? '엔딩 보기' : '계속하기'}
      </button>

      {isCardModalOpen && (
        <CardRewardModal
          onClose={() => setIsCardModalOpen(false)}
          onCardSelected={() => setCardClaimed(true)}
        />
      )}

      {isRelicModalOpen && (
        <RelicRewardModal
          guaranteedTier={currentScene === 'BOSS' ? 'BOSS' : undefined}
          onClose={() => setIsRelicModalOpen(false)}
          onRelicSelected={() => setRelicClaimed(true)}
        />
      )}
    </div>
  );
};
