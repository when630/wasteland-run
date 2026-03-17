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

  const selectedCard = masterDeck.find(c => c.id === selectedCardId) ?? null;

  const handleSelect = (card: Card) => {
    setSelectedCardId(card.id);
  };

  const handleConfirmRemove = () => {
    if (!selectedCardId) return;
    const newMasterDeck = masterDeck.filter(card => card.id !== selectedCardId);
    setMasterDeck(newMasterDeck);
    onRemoveComplete();
  };

  const cardW = 160;
  const previewW = 240;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(5, 5, 3, 0.92)', zIndex: 2000,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center',
      overflowY: 'auto', padding: '0',
    }}>
      <h2 style={{ fontSize: '36px', color: '#ffaaaa', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', padding: '0 16px' }}>
        <img src={iconCardRemove} alt="" style={{ width: 36, height: 36, objectFit: 'contain' }} /> {title}
      </h2>
      <p style={{ fontSize: '18px', color: '#ccc', marginBottom: '40px', padding: '0 16px', textAlign: 'center' }}>
        {description}
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, ${cardW}px)`,
        gap: '14px',
        justifyContent: 'center',
        padding: '20px 30px',
        width: '100%', boxSizing: 'border-box',
        overflowY: 'auto',
        minHeight: 0,
      }}>
        {masterDeck.length === 0 ? (
          <p style={{ color: '#888', gridColumn: '1 / -1', textAlign: 'center' }}>덱에 카드가 없습니다.</p>
        ) : (
          masterDeck.map((card) => (
            <div
              key={card.id}
              onClick={() => handleSelect(card)}
              style={{
                cursor: 'pointer',
                transition: 'transform 0.1s, box-shadow 0.2s',
                borderRadius: `${12 * (cardW / 220)}px`,
                justifySelf: 'center',
              }}
            >
              <CardFrame card={card} width={cardW} />
            </div>
          ))
        )}
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '40px', alignItems: 'center', padding: '0 16px', flexShrink: 0 }}>
        <button
          onClick={onClose}
          style={{
            padding: '12px 30px', fontSize: '18px',
            background: 'none', color: '#a09078', border: '1px solid rgba(120, 100, 70, 0.4)',
            borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s',
            textShadow: '1px 1px 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.5)',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(180, 150, 100, 0.6)'; e.currentTarget.style.color = '#c8b898'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(120, 100, 70, 0.4)'; e.currentTarget.style.color = '#a09078'; }}
        >
          취소
        </button>
      </div>

      {/* 카드 클릭 시 확대 오버레이 */}
      {selectedCard && (
        <div
          onClick={() => setSelectedCardId(null)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 3000,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: '20px',
            animation: 'fadeIn 0.15s ease-out',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ filter: 'drop-shadow(0 0 20px rgba(255, 100, 100, 0.3))' }}
          >
            <CardFrame card={selectedCard} width={previewW} />
          </div>

          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', gap: '10px', marginTop: '28px' }}>
              <button
                onClick={() => setSelectedCardId(null)}
                style={{
                  padding: '12px 30px', fontSize: '18px',
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
                onClick={handleConfirmRemove}
                style={{
                  padding: '12px 40px', fontSize: '20px', fontWeight: 'bold',
                  background: 'none', color: '#ff6666',
                  border: '1px solid rgba(255, 80, 80, 0.4)',
                  borderRadius: '6px', cursor: 'pointer',
                  transition: 'all 0.2s',
                  textShadow: '1px 1px 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.5)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255, 100, 100, 0.7)'; e.currentTarget.style.color = '#ff8888'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255, 80, 80, 0.4)'; e.currentTarget.style.color = '#ff6666'; }}
              >
                제거
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
