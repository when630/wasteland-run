import React, { useState } from 'react';
import { useDeckStore } from '../../store/useDeckStore';
import type { Card } from '../../types/gameTypes';

interface RemoveCardModalProps {
  onClose: () => void;
  onRemoveComplete: () => void;
  title?: string;
  description?: string;
}

export const RemoveCardModal: React.FC<RemoveCardModalProps> = ({
  onClose,
  onRemoveComplete,
  title = '🗑️ 덱 압축: 카드 제거',
  description = '방해되는 카드를 한 장 선택하여 덱에서 영구히 제거하세요.'
}) => {
  const { masterDeck, setMasterDeck } = useDeckStore();
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const handleSelect = (card: Card) => {
    setSelectedCardId(card.id);
  };

  const handleConfirm = () => {
    if (!selectedCardId) return;

    // 선택된 카드를 제외한 새로운 마스터 덱 생성
    const newMasterDeck = masterDeck.filter(card => card.id !== selectedCardId);
    setMasterDeck(newMasterDeck);

    onRemoveComplete();
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 10000,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
    }}>
      <h2 style={{ fontSize: '36px', color: '#ffaaaa', marginBottom: '20px' }}>
        {title}
      </h2>
      <p style={{ fontSize: '18px', color: '#ccc', marginBottom: '40px' }}>
        {description}
      </p>

      {/* 카드 스크롤 영역 */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '20px',
        justifyContent: 'center',
        padding: '20px',
        maxWidth: '80%',
        maxHeight: '50vh',
        overflowY: 'auto',
        backgroundColor: 'rgba(30, 20, 20, 0.8)',
        borderRadius: '12px',
        border: '1px solid #555'
      }}>
        {masterDeck.length === 0 ? (
          <p style={{ color: '#888' }}>덱에 카드가 없습니다.</p>
        ) : (
          masterDeck.map((card) => {
            const isSelected = selectedCardId === card.id;
            let cardBg = '#2a2a4a';
            if (card.type.includes('ATTACK')) cardBg = '#4a2a2a';
            else if (card.type.includes('DEFENSE')) cardBg = '#2a4a3a';

            return (
              <div
                key={card.id}
                onClick={() => handleSelect(card)}
                style={{
                  width: '180px', height: '260px',
                  backgroundColor: cardBg,
                  border: `3px solid ${isSelected ? '#ffaaaa' : '#777'}`,
                  borderRadius: '10px', padding: '15px', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  transition: 'transform 0.1s',
                  transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                  opacity: selectedCardId && !isSelected ? 0.6 : 1
                }}
              >
                <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#fff', textAlign: 'center' }}>
                  {card.name}
                </h3>
                <div style={{
                  backgroundColor: 'rgba(0,0,0,0.5)', padding: '4px 8px',
                  borderRadius: '20px', color: '#00ffff', marginBottom: '15px', fontSize: '13px'
                }}>
                  AP: {card.costAp} {card.costAmmo > 0 && `| 탄약: ${card.costAmmo}`}
                </div>
                <p style={{ color: '#ddd', fontSize: '14px', textAlign: 'center', lineHeight: '1.4' }}>
                  {card.description}
                </p>
                <div style={{ marginTop: 'auto', color: '#ffaaaa', fontSize: '14px', fontWeight: 'bold' }}>
                  {card.isUpgraded ? '[강화 완료]' : ''}
                </div>
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
            borderRadius: '8px', cursor: 'pointer'
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
            transition: 'background-color 0.2s'
          }}
        >
          제거 실행
        </button>
      </div>
    </div>
  );
};
