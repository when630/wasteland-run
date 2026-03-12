import React, { useState } from 'react';
import { CardRewardModal } from './CardRewardModal';
import { RelicRewardModal } from './RelicRewardModal';
import { useRunStore } from '../../store/useRunStore';
import { useRngStore } from '../../store/useRngStore';
import { useResponsive } from '../../hooks/useResponsive';
import { iconGoldReward, iconCardCount, iconRelicReward, iconBossClear } from '../../assets/images/GUI';
import type { Card } from '../../types/gameTypes';
import { ALL_CARDS } from '../../assets/data/cards';

interface VictoryRewardPanelProps {
  onContinue: () => void;
  currentScene: string;
}

export const VictoryRewardPanel: React.FC<VictoryRewardPanelProps> = ({ onContinue, currentScene }) => {
  const { addGold } = useRunStore();
  const { isMobile, height } = useResponsive();
  const isShortScreen = height < 500;

  const [goldClaimed, setGoldClaimed] = useState(false);
  const [cardClaimed, setCardClaimed] = useState(false);
  const [relicClaimed, setRelicClaimed] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isRelicModalOpen, setIsRelicModalOpen] = useState(false);

  // 보상 카드를 한 번만 생성 (모달 재오픈해도 유지)
  const [rewardCards] = useState<Card[]>(() => {
    const chapter = useRunStore.getState().currentChapter;
    const dropPool = ALL_CARDS.filter(c => c.tier !== 'BASIC' && (c.chapter ?? 1) <= chapter);
    const lootRng = useRngStore.getState().lootRng;
    const shuffled = lootRng.shuffle(dropPool) as Card[];
    return shuffled.slice(0, 3);
  });

  const goldAmount = currentScene === 'BOSS' ? 100 : currentScene === 'ELITE' ? 50 : 20;
  const showRelic = currentScene === 'ELITE' || currentScene === 'BOSS';
  const iconSize = isShortScreen ? 44 : isMobile ? 52 : 64;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(5, 5, 3, 0.9)',
      zIndex: 200,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      color: '#e8dcc8',
      animation: 'fadeIn 0.5s ease-out',
    }}>
      {/* 타이틀 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: isShortScreen ? '4px' : '8px', animation: 'slideUp 0.4s ease-out' }}>
        <img src={iconBossClear} alt="" style={{ width: isShortScreen ? 28 : isMobile ? 36 : 48, height: isShortScreen ? 28 : isMobile ? 36 : 48, objectFit: 'contain', filter: 'drop-shadow(0 0 10px rgba(100, 255, 100, 0.5))' }} />
        <h1 style={{
          fontSize: isShortScreen ? '24px' : isMobile ? '32px' : '44px', color: '#66cc88', margin: 0,
          textShadow: '2px 3px 6px rgba(0,0,0,0.8), 0 0 20px rgba(100, 200, 100, 0.3)',
        }}>
          전투 승리!
        </h1>
      </div>

      {/* 보상 아이콘 가로 배치 */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: isShortScreen ? '16px' : '24px',
        margin: isShortScreen ? '16px 0' : '28px 0',
        animation: 'slideUp 0.5s ease-out',
      }}>
        {/* 골드 */}
        <button
          onClick={() => {
            if (!goldClaimed) {
              addGold(goldAmount);
              setGoldClaimed(true);
            }
          }}
          disabled={goldClaimed}
          style={{
            background: 'none', border: 'none',
            cursor: goldClaimed ? 'default' : 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
            opacity: goldClaimed ? 0.35 : 1,
            transition: 'transform 0.2s',
          }}
          onMouseEnter={e => { if (!goldClaimed) e.currentTarget.style.transform = 'scale(1.15)'; }}
          onMouseLeave={e => { if (!goldClaimed) e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <img src={iconGoldReward} alt="골드" style={{ width: iconSize, height: iconSize, objectFit: 'contain', filter: goldClaimed ? 'grayscale(1)' : 'drop-shadow(0 0 8px rgba(212,168,84,0.5))' }} />
          <span style={{ fontSize: isShortScreen ? '12px' : '14px', fontWeight: 'bold', color: goldClaimed ? '#666' : '#d4a854' }}>
            {goldAmount}G
          </span>
        </button>

        {/* 카드 */}
        <button
          onClick={() => { if (!cardClaimed) setIsCardModalOpen(true); }}
          disabled={cardClaimed}
          style={{
            background: 'none', border: 'none',
            cursor: cardClaimed ? 'default' : 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
            opacity: cardClaimed ? 0.35 : 1,
            transition: 'transform 0.2s',
          }}
          onMouseEnter={e => { if (!cardClaimed) e.currentTarget.style.transform = 'scale(1.15)'; }}
          onMouseLeave={e => { if (!cardClaimed) e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <img src={iconCardCount} alt="카드" style={{ width: iconSize, height: iconSize, objectFit: 'contain', filter: cardClaimed ? 'grayscale(1)' : 'drop-shadow(0 0 8px rgba(100,150,220,0.5))' }} />
        </button>

        {/* 유물 (엘리트/보스만) */}
        {showRelic && (
          <button
            onClick={() => { if (!relicClaimed) setIsRelicModalOpen(true); }}
            disabled={relicClaimed}
            style={{
              background: 'none', border: 'none',
              cursor: relicClaimed ? 'default' : 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
              opacity: relicClaimed ? 0.35 : 1,
              transition: 'transform 0.2s',
            }}
            onMouseEnter={e => { if (!relicClaimed) e.currentTarget.style.transform = 'scale(1.15)'; }}
            onMouseLeave={e => { if (!relicClaimed) e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <img src={iconRelicReward} alt="유물" style={{ width: iconSize, height: iconSize, objectFit: 'contain', filter: relicClaimed ? 'grayscale(1)' : 'drop-shadow(0 0 8px rgba(200,100,100,0.5))' }} />
          </button>
        )}
      </div>

      {/* 계속하기 */}
      <button
        onClick={onContinue}
        style={{
          padding: isShortScreen ? '8px 24px' : '14px 40px',
          fontSize: isShortScreen ? '14px' : '18px', fontWeight: 'bold',
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
          rewardCards={rewardCards}
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
