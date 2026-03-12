import React, { useState } from 'react';
import { CardRewardModal } from './CardRewardModal';
import { RelicRewardModal } from './RelicRewardModal';
import { useRunStore } from '../../store/useRunStore';
import { useResponsive } from '../../hooks/useResponsive';
import { colors } from '../../styles/theme';
import { iconLoot, iconGoldReward, iconCardCount, iconRelicReward } from '../../assets/images/GUI';

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
    padding: '12px 24px', fontSize: '18px', fontWeight: 'bold', width: '100%',
    backgroundColor: '#4a3a10', color: colors.accent.gold, border: '2px solid #cca500',
    borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s',
    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px'
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      zIndex: 200,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      color: 'white'
    }}>
      <h1 style={{ fontSize: isMobile ? '32px' : '48px', color: '#44ff44', marginBottom: '10px' }}>
        전투 승리!
      </h1>
      <p style={{ fontSize: isMobile ? '14px' : '18px', color: '#ccc', marginBottom: isMobile ? '15px' : '30px' }}>
        수고하셨습니다. 보상을 챙기거나 스킵하고 넘어갈 수 있습니다.
      </p>

      <div style={{
        margin: '0 0 30px 0', padding: isMobile ? '15px' : '20px', width: isMobile ? '90vw' : '360px', maxWidth: '360px',
        backgroundColor: '#2a1f1a', borderRadius: '12px', border: '2px solid #aa7700',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px'
      }}>
        <h3 style={{ margin: '0 0 5px 0', color: colors.accent.gold, fontSize: '24px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
          <img src={iconLoot} alt="" style={{ width: 28, height: 28, objectFit: 'contain' }} /> 전리품 발견
        </h3>

        {!goldClaimed && (
          <button
            onClick={() => {
              const goldAmount = currentScene === 'BOSS' ? 100 : currentScene === 'ELITE' ? 50 : 20;
              addGold(goldAmount);
              setGoldClaimed(true);
            }}
            style={rewardBtnStyle}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5a4a20'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4a3a10'}
          >
            <img src={iconGoldReward} alt="" style={{ width: 22, height: 22, objectFit: 'contain' }} /> {currentScene === 'BOSS' ? 100 : currentScene === 'ELITE' ? 50 : 20} 골드 획득
          </button>
        )}

        {!cardClaimed && (
          <button
            onClick={() => setIsCardModalOpen(true)}
            style={{ ...rewardBtnStyle, color: '#fff', borderColor: '#4a70b0', backgroundColor: '#2a3a50' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3a4a60'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2a3a50'}
          >
            <img src={iconCardCount} alt="" style={{ width: 22, height: 22, objectFit: 'contain' }} /> 새 카드 1장 선택 (3택 1)
          </button>
        )}

        {(currentScene === 'ELITE' || currentScene === 'BOSS') && !relicClaimed && (
          <button
            onClick={() => setIsRelicModalOpen(true)}
            style={{ ...rewardBtnStyle, color: '#ffaaaa', borderColor: '#b04a4a', backgroundColor: '#502a2a' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#603a3a'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#502a2a'}
          >
            <img src={iconRelicReward} alt="" style={{ width: 22, height: 22, objectFit: 'contain' }} /> {currentScene === 'BOSS' ? '보스 유물' : '일반 유물'} 획득
          </button>
        )}

        {goldClaimed && cardClaimed && (!(currentScene === 'ELITE' || currentScene === 'BOSS') || relicClaimed) && (
          <span style={{ color: '#88ff88', marginTop: '10px' }}>✓ 모든 보상을 남김없이 획득했습니다.</span>
        )}
      </div>

      <button
        onClick={onContinue}
        style={{
          padding: '15px 40px', fontSize: '20px', fontWeight: 'bold',
          backgroundColor: '#444', color: 'white',
          border: '2px solid #555', borderRadius: '8px', cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#555'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#444'}
      >
        {currentScene === 'BOSS' ? '엔딩 보기' : '계속하기 (보상 획득 완료 및 이동)'}
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
