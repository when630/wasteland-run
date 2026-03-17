import React, { useState } from 'react';
import { useDeckStore } from '../../store/useDeckStore';
import type { Card } from '../../types/gameTypes';
import { iconLoot } from '../../assets/images/GUI';
import { CardFrame } from './CardFrame';

interface CardRewardModalProps {
  rewardCards: Card[];
  onClose: () => void;
  onCardSelected: () => void;
}

export const CardRewardModal: React.FC<CardRewardModalProps> = ({ rewardCards, onClose, onCardSelected }) => {
  const { addCardToMasterDeck } = useDeckStore();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const cardW = 240;
  const previewW = 280;

  const handleConfirmTake = () => {
    if (selectedIndex === null) return;
    const card = rewardCards[selectedIndex];
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...cardBlueprint } = card;
    addCardToMasterDeck(cardBlueprint);
    onCardSelected();
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(5, 5, 3, 0.92)', zIndex: 2000,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeIn 0.3s ease-out',
    }}>
      <h2 style={{
        fontSize: '32px', color: '#d4a854',
        marginBottom: '24px',
        display: 'flex', alignItems: 'center', gap: '10px',
        textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
      }}>
        <img src={iconLoot} alt="" style={{ width: 36, height: 36, objectFit: 'contain', filter: 'drop-shadow(0 0 6px rgba(212,168,84,0.5))' }} />
        전리품: 카드 선택
      </h2>
      <p style={{ fontSize: '16px', color: '#8a7e6a', marginBottom: '40px' }}>
        덱에 추가할 카드를 한 장 선택하세요.
      </p>

      <div style={{
        display: 'flex', gap: '36px',
        flexWrap: 'wrap', justifyContent: 'center',
      }}>
        {rewardCards.map((card, index) => (
          <div
            key={`reward-${index}`}
            onClick={() => setSelectedIndex(index)}
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
          marginTop: '50px',
          padding: '10px 30px',
          fontSize: '16px',
          background: 'none', color: '#a09078',
          border: '1px solid rgba(120, 100, 70, 0.4)',
          borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s',
          textShadow: '1px 1px 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.5)',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(180, 150, 100, 0.6)'; e.currentTarget.style.color = '#c8b898'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(120, 100, 70, 0.4)'; e.currentTarget.style.color = '#a09078'; }}
      >
        건너뛰기
      </button>

      {/* 카드 클릭 시 오버레이로 확대 — 기존 레이아웃 변경 없음 */}
      {selectedIndex !== null && (
        <div
          onClick={() => setSelectedIndex(null)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)', zIndex: 3000,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            animation: 'fadeIn 0.15s ease-out',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ filter: 'drop-shadow(0 0 20px rgba(212, 168, 84, 0.4))' }}
          >
            <CardFrame card={rewardCards[selectedIndex]} width={previewW} />
          </div>

          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              display: 'flex', gap: '12px',
              marginTop: '28px',
            }}
          >
            <button
              onClick={() => setSelectedIndex(null)}
              style={{
                padding: '12px 30px',
                fontSize: '18px',
                background: 'none', color: '#a09078', border: '1px solid rgba(120, 100, 70, 0.4)',
                borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s',
                textShadow: '1px 1px 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.5)',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(180, 150, 100, 0.6)'; e.currentTarget.style.color = '#c8b898'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(120, 100, 70, 0.4)'; e.currentTarget.style.color = '#a09078'; }}
            >
              닫기
            </button>
            <button
              onClick={handleConfirmTake}
              style={{
                padding: '12px 40px',
                fontSize: '20px', fontWeight: 'bold',
                background: 'none', color: '#d4a854',
                border: '1px solid rgba(212, 168, 84, 0.5)',
                borderRadius: '6px', cursor: 'pointer',
                transition: 'all 0.2s',
                textShadow: '1px 1px 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.5)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(212, 168, 84, 0.8)'; e.currentTarget.style.color = '#e8c878'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(212, 168, 84, 0.5)'; e.currentTarget.style.color = '#d4a854'; }}
            >
              가져간다
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
