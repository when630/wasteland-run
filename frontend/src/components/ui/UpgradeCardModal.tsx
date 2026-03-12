import React, { useState } from 'react';
import { useDeckStore } from '../../store/useDeckStore';
import type { Card } from '../../types/gameTypes';
import { iconCardUpgrade } from '../../assets/images/GUI';
import { CardFrame } from './CardFrame';
import { useResponsive } from '../../hooks/useResponsive';

interface UpgradeCardModalProps {
  onClose: () => void;
  onUpgradeComplete: () => void;
}

export const UpgradeCardModal: React.FC<UpgradeCardModalProps> = ({ onClose, onUpgradeComplete }) => {
  const { masterDeck, upgradeCard } = useDeckStore();
  const { isMobile } = useResponsive();
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const handleSelect = (card: Card) => {
    if (card.isUpgraded) return;
    setSelectedCardId(card.id);
  };

  const handleConfirm = () => {
    if (!selectedCardId) return;
    upgradeCard(selectedCardId);
    onUpgradeComplete();
  };

  const cardW = isMobile ? 120 : 160;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 10000,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    }}>
      <h2 style={{ fontSize: isMobile ? '24px' : '36px', color: '#ffaaaa', marginBottom: isMobile ? '12px' : '20px', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', padding: '0 16px' }}>
        <img src={iconCardUpgrade} alt="" style={{ width: isMobile ? 28 : 36, height: isMobile ? 28 : 36, objectFit: 'contain' }} /> 덱 정비: 카드 강화
      </h2>
      <p style={{ fontSize: isMobile ? '14px' : '18px', color: '#ccc', marginBottom: isMobile ? '20px' : '40px', padding: '0 16px', textAlign: 'center' }}>
        강화할 카드를 한 장 선택하세요. 선택된 카드는 즉시 전투력이 영구 상승합니다.
      </p>

      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: isMobile ? '8px' : '16px', justifyContent: 'center',
        padding: isMobile ? '12px' : '20px', maxWidth: isMobile ? '95%' : '80%', maxHeight: '50vh', overflowY: 'auto',
        backgroundColor: 'rgba(30, 20, 20, 0.8)', borderRadius: '12px', border: '1px solid #555',
      }}>
        {masterDeck.map((card) => {
          const isSelected = selectedCardId === card.id;
          const isUpgraded = card.isUpgraded === true;

          return (
            <div
              key={card.id}
              onClick={() => handleSelect(card)}
              style={{
                cursor: isUpgraded ? 'not-allowed' : 'pointer',
                opacity: isUpgraded ? 0.5 : 1,
                transition: 'transform 0.1s, box-shadow 0.2s',
                transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                borderRadius: `${12 * (cardW / 220)}px`,
                boxShadow: isSelected ? '0 0 20px rgba(255,170,170,0.6)' : 'none',
                position: 'relative',
              }}
            >
              <CardFrame card={card} width={cardW} />
              {isUpgraded && (
                <div style={{
                  position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
                  background: 'rgba(0,0,0,0.7)', color: '#88ff88', fontSize: '11px', fontWeight: 'bold',
                  padding: '2px 8px', borderRadius: '10px', border: '1px solid #3a6b3a',
                  zIndex: 20, whiteSpace: 'nowrap',
                }}>
                  강화 완료
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: isMobile ? '12px' : '20px', marginTop: isMobile ? '24px' : '40px', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', padding: '0 16px', width: isMobile ? '80%' : undefined }}>
        <button
          onClick={onClose}
          style={{
            padding: isMobile ? '10px 20px' : '12px 30px', fontSize: isMobile ? '15px' : '18px',
            backgroundColor: '#444', color: '#fff', border: '1px solid #666',
            borderRadius: '8px', cursor: 'pointer', width: isMobile ? '100%' : undefined,
          }}
        >
          취소
        </button>
        <button
          onClick={handleConfirm}
          disabled={!selectedCardId}
          style={{
            padding: isMobile ? '10px 20px' : '12px 40px', fontSize: isMobile ? '16px' : '20px', fontWeight: 'bold',
            width: isMobile ? '100%' : undefined,
            backgroundColor: selectedCardId ? '#b04a4a' : '#555',
            color: selectedCardId ? '#fff' : '#888',
            border: `2px solid ${selectedCardId ? '#ffaaaa' : '#444'}`,
            borderRadius: '8px', cursor: selectedCardId ? 'pointer' : 'not-allowed',
            transition: 'background-color 0.2s',
          }}
        >
          선택한 카드 개조
        </button>
      </div>
    </div>
  );
};
