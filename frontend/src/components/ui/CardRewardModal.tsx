import React, { useState } from 'react';
import { useDeckStore } from '../../store/useDeckStore';
import { useResponsive } from '../../hooks/useResponsive';
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
  const { isMobile, height } = useResponsive();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const isShortScreen = height < 500;
  const cardW = isShortScreen ? 100 : isMobile ? 140 : 240;
  const previewW = isShortScreen ? 140 : isMobile ? 200 : 280;

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
      backgroundColor: 'rgba(5, 5, 3, 0.92)', zIndex: 9999,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeIn 0.3s ease-out',
    }}>
      <h2 style={{
        fontSize: isShortScreen ? '18px' : isMobile ? '24px' : '32px', color: '#d4a854',
        marginBottom: isShortScreen ? '10px' : isMobile ? '16px' : '24px',
        display: 'flex', alignItems: 'center', gap: '10px',
        textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
      }}>
        <img src={iconLoot} alt="" style={{ width: isShortScreen ? 22 : isMobile ? 28 : 36, height: isShortScreen ? 22 : isMobile ? 28 : 36, objectFit: 'contain', filter: 'drop-shadow(0 0 6px rgba(212,168,84,0.5))' }} />
        전리품: 카드 선택
      </h2>
      {!isShortScreen && (
        <p style={{ fontSize: isMobile ? '13px' : '16px', color: '#8a7e6a', marginBottom: isMobile ? '24px' : '40px' }}>
          덱에 추가할 카드를 한 장 선택하세요.
        </p>
      )}

      <div style={{
        display: 'flex', gap: isShortScreen ? '12px' : isMobile ? '16px' : '36px',
        flexWrap: 'wrap', justifyContent: 'center',
        padding: isMobile ? '0 16px' : undefined,
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
          marginTop: isShortScreen ? '20px' : isMobile ? '32px' : '50px',
          padding: isShortScreen ? '8px 20px' : '10px 30px',
          fontSize: isShortScreen ? '13px' : '16px',
          backgroundColor: 'rgba(40, 35, 28, 0.9)', color: '#8a7e6a',
          border: '1px solid rgba(100, 80, 50, 0.4)',
          borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(55, 48, 35, 0.95)'; e.currentTarget.style.color = '#a09078'; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(40, 35, 28, 0.9)'; e.currentTarget.style.color = '#8a7e6a'; }}
      >
        건너뛰기
      </button>

      {/* 카드 클릭 시 오버레이로 확대 — 기존 레이아웃 변경 없음 */}
      {selectedIndex !== null && (
        <div
          onClick={() => setSelectedIndex(null)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)', zIndex: 10000,
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
              marginTop: isShortScreen ? '14px' : '28px',
            }}
          >
            <button
              onClick={() => setSelectedIndex(null)}
              style={{
                padding: isShortScreen ? '8px 18px' : '12px 30px',
                fontSize: isShortScreen ? '14px' : '18px',
                backgroundColor: '#444', color: '#fff', border: '1px solid #666',
                borderRadius: '8px', cursor: 'pointer',
              }}
            >
              닫기
            </button>
            <button
              onClick={handleConfirmTake}
              style={{
                padding: isShortScreen ? '8px 20px' : '12px 40px',
                fontSize: isShortScreen ? '14px' : '20px', fontWeight: 'bold',
                backgroundColor: '#8b6914', color: '#fff',
                border: '2px solid #d4a854',
                borderRadius: '8px', cursor: 'pointer',
                transition: 'background-color 0.2s',
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#a67c1a'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#8b6914'; }}
            >
              가져간다
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
