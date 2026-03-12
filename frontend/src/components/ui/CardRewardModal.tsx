import React, { useState } from 'react';
import { useDeckStore } from '../../store/useDeckStore';
import { useRngStore } from '../../store/useRngStore';
import { useResponsive } from '../../hooks/useResponsive';
import type { Card } from '../../types/gameTypes';
import { ALL_CARDS } from '../../assets/data/cards';
import { useRunStore } from '../../store/useRunStore';
import { iconLoot } from '../../assets/images/GUI';
import { CardFrame } from './CardFrame';

interface CardRewardModalProps {
  onClose: () => void;
  onCardSelected: () => void;
}

export const CardRewardModal: React.FC<CardRewardModalProps> = ({ onClose, onCardSelected }) => {
  const { addCardToMasterDeck } = useDeckStore();
  const { isMobile } = useResponsive();

  const [rewardCards] = useState<Card[]>(() => {
    const chapter = useRunStore.getState().currentChapter;
    const dropPool = ALL_CARDS.filter(c => c.tier !== 'BASIC' && (c.chapter ?? 1) <= chapter);
    const lootRng = useRngStore.getState().lootRng;
    const shuffled = lootRng.shuffle(dropPool) as Card[];
    return shuffled.slice(0, 3);
  });

  const handleSelectCard = (card: Card) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...cardBlueprint } = card;
    addCardToMasterDeck(cardBlueprint);
    onCardSelected();
    onClose();
  };

  const cardW = isMobile ? 140 : 200;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(5, 5, 3, 0.92)', zIndex: 9999,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeIn 0.3s ease-out',
    }}>
      <h2 style={{
        fontSize: isMobile ? '24px' : '32px', color: '#d4a854', marginBottom: isMobile ? '10px' : '20px',
        display: 'flex', alignItems: 'center', gap: '10px',
        textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
      }}>
        <img src={iconLoot} alt="" style={{ width: isMobile ? 28 : 36, height: isMobile ? 28 : 36, objectFit: 'contain', filter: 'drop-shadow(0 0 6px rgba(212,168,84,0.5))' }} />
        전리품: 카드 선택
      </h2>
      <p style={{ fontSize: isMobile ? '13px' : '16px', color: '#8a7e6a', marginBottom: isMobile ? '20px' : '35px' }}>
        덱에 추가할 카드를 한 장 선택하세요.
      </p>

      <div style={{ display: 'flex', gap: isMobile ? '10px' : '30px', flexWrap: 'wrap', justifyContent: 'center', padding: isMobile ? '0 10px' : undefined }}>
        {rewardCards.map((card, index) => (
          <div
            key={`reward-${index}`}
            onClick={() => handleSelectCard(card)}
            style={{
              cursor: 'pointer',
              transition: 'transform 0.25s, filter 0.25s',
              borderRadius: `${12 * (cardW / 220)}px`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-15px) scale(1.05)';
              e.currentTarget.style.filter = 'drop-shadow(0 0 15px rgba(212, 168, 84, 0.4))';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.filter = 'none';
            }}
          >
            <CardFrame card={card} width={cardW} />
          </div>
        ))}
      </div>

      <button
        onClick={onClose}
        style={{
          marginTop: '45px', padding: '10px 30px', fontSize: '16px',
          backgroundColor: 'rgba(40, 35, 28, 0.9)', color: '#8a7e6a',
          border: '1px solid rgba(100, 80, 50, 0.4)',
          borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(55, 48, 35, 0.95)'; e.currentTarget.style.color = '#a09078'; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(40, 35, 28, 0.9)'; e.currentTarget.style.color = '#8a7e6a'; }}
      >
        건너뛰기
      </button>
    </div>
  );
};
