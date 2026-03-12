import React, { useState } from 'react';
import { useDeckStore } from '../../store/useDeckStore';
import type { Card } from '../../types/gameTypes';
import { iconCardUpgrade } from '../../assets/images/GUI';
import { CardFrame } from './CardFrame';

interface UpgradeCardModalProps {
  onClose: () => void;
  onUpgradeComplete: () => void;
}

export const UpgradeCardModal: React.FC<UpgradeCardModalProps> = ({ onClose, onUpgradeComplete }) => {
  const { masterDeck, upgradeCard } = useDeckStore();
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

  const cardW = 160;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 10000,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    }}>
      <h2 style={{ fontSize: '36px', color: '#ffaaaa', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
        <img src={iconCardUpgrade} alt="" style={{ width: 36, height: 36, objectFit: 'contain' }} /> 덱 정비: 카드 강화
      </h2>
      <p style={{ fontSize: '18px', color: '#ccc', marginBottom: '40px' }}>
        강화할 카드를 한 장 선택하세요. 선택된 카드는 즉시 전투력이 영구 상승합니다.
      </p>

      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center',
        padding: '20px', maxWidth: '80%', maxHeight: '50vh', overflowY: 'auto',
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

      <div style={{ display: 'flex', gap: '20px', marginTop: '40px' }}>
        <button
          onClick={onClose}
          style={{
            padding: '12px 30px', fontSize: '18px',
            backgroundColor: '#444', color: '#fff', border: '1px solid #666',
            borderRadius: '8px', cursor: 'pointer',
          }}
        >
          취소
        </button>
        <button
          onClick={handleConfirm}
          disabled={!selectedCardId}
          style={{
            padding: '12px 40px', fontSize: '20px', fontWeight: 'bold',
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
