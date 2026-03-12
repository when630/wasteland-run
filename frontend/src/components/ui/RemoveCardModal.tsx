import React, { useState } from 'react';
import { useDeckStore } from '../../store/useDeckStore';
import type { Card } from '../../types/gameTypes';
import { iconCardRemove } from '../../assets/images/GUI';
import { CardFrame } from './CardFrame';

interface RemoveCardModalProps {
  onClose: () => void;
  onRemoveComplete: () => void;
  title?: string;
  description?: string;
}

export const RemoveCardModal: React.FC<RemoveCardModalProps> = ({
  onClose,
  onRemoveComplete,
  title = '덱 압축: 카드 제거',
  description = '방해되는 카드를 한 장 선택하여 덱에서 영구히 제거하세요.',
}) => {
  const { masterDeck, setMasterDeck } = useDeckStore();
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const handleSelect = (card: Card) => {
    setSelectedCardId(card.id);
  };

  const handleConfirm = () => {
    if (!selectedCardId) return;
    const newMasterDeck = masterDeck.filter(card => card.id !== selectedCardId);
    setMasterDeck(newMasterDeck);
    onRemoveComplete();
  };

  const cardW = 160;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 10000,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    }}>
      <h2 style={{ fontSize: '36px', color: '#ffaaaa', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
        <img src={iconCardRemove} alt="" style={{ width: 36, height: 36, objectFit: 'contain' }} /> {title}
      </h2>
      <p style={{ fontSize: '18px', color: '#ccc', marginBottom: '40px' }}>
        {description}
      </p>

      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center',
        padding: '20px', maxWidth: '80%', maxHeight: '50vh', overflowY: 'auto',
        backgroundColor: 'rgba(30, 20, 20, 0.8)', borderRadius: '12px', border: '1px solid #555',
      }}>
        {masterDeck.length === 0 ? (
          <p style={{ color: '#888' }}>덱에 카드가 없습니다.</p>
        ) : (
          masterDeck.map((card) => {
            const isSelected = selectedCardId === card.id;
            return (
              <div
                key={card.id}
                onClick={() => handleSelect(card)}
                style={{
                  cursor: 'pointer',
                  transition: 'transform 0.1s, box-shadow 0.2s',
                  transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                  borderRadius: `${12 * (cardW / 220)}px`,
                  boxShadow: isSelected ? '0 0 20px rgba(255,170,170,0.6)' : 'none',
                  opacity: selectedCardId && !isSelected ? 0.6 : 1,
                }}
              >
                <CardFrame card={card} width={cardW} />
              </div>
            );
          })
        )}
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
          취소 (선택 해제)
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
          제거 실행
        </button>
      </div>
    </div>
  );
};
