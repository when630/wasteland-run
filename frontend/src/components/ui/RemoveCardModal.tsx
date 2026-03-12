import React, { useState } from 'react';
import { useDeckStore } from '../../store/useDeckStore';
import type { Card } from '../../types/gameTypes';
import { iconCardRemove } from '../../assets/images/GUI';
import { CardFrame } from './CardFrame';
import { useResponsive } from '../../hooks/useResponsive';

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
  const { isMobile } = useResponsive();
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

  const cardW = isMobile ? 120 : 160;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 10000,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    }}>
      <h2 style={{ fontSize: isMobile ? '24px' : '36px', color: '#ffaaaa', marginBottom: isMobile ? '12px' : '20px', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', padding: '0 16px' }}>
        <img src={iconCardRemove} alt="" style={{ width: isMobile ? 28 : 36, height: isMobile ? 28 : 36, objectFit: 'contain' }} /> {title}
      </h2>
      <p style={{ fontSize: isMobile ? '14px' : '18px', color: '#ccc', marginBottom: isMobile ? '20px' : '40px', padding: '0 16px', textAlign: 'center' }}>
        {description}
      </p>

      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: isMobile ? '8px' : '16px', justifyContent: 'center',
        padding: isMobile ? '12px' : '20px', maxWidth: isMobile ? '95%' : '80%', maxHeight: '50vh', overflowY: 'auto',
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

      <div style={{ display: 'flex', gap: isMobile ? '12px' : '20px', marginTop: isMobile ? '24px' : '40px', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', padding: '0 16px', width: isMobile ? '80%' : undefined }}>
        <button
          onClick={onClose}
          style={{
            padding: isMobile ? '10px 20px' : '12px 30px', fontSize: isMobile ? '15px' : '18px',
            backgroundColor: '#444', color: '#fff', border: '1px solid #666',
            borderRadius: '8px', cursor: 'pointer', width: isMobile ? '100%' : undefined,
          }}
        >
          취소 (선택 해제)
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
          제거 실행
        </button>
      </div>
    </div>
  );
};
