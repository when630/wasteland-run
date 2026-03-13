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

  const { height } = useResponsive();
  const isShortScreen = height < 500;
  const cardW = isShortScreen ? 90 : isMobile ? 120 : 200;
  const previewW = isShortScreen ? 140 : isMobile ? 200 : 260;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 10000,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: isShortScreen ? 'flex-start' : 'center',
      overflowY: 'auto', padding: isShortScreen ? '8px 10px' : isMobile ? '20px 0' : '0',
    }}>
      <h2 style={{ fontSize: isShortScreen ? '16px' : isMobile ? '24px' : '36px', color: '#ffaaaa', marginBottom: isShortScreen ? '4px' : isMobile ? '12px' : '20px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', padding: '0 16px', margin: isShortScreen ? '4px 0' : undefined }}>
        <img src={iconCardRemove} alt="" style={{ width: isShortScreen ? 20 : isMobile ? 28 : 36, height: isShortScreen ? 20 : isMobile ? 28 : 36, objectFit: 'contain' }} /> {title}
      </h2>
      {!isShortScreen && (
        <p style={{ fontSize: isMobile ? '14px' : '18px', color: '#ccc', marginBottom: isMobile ? '20px' : '40px', padding: '0 16px', textAlign: 'center' }}>
          {description}
        </p>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(6, ${cardW}px)`,
        gap: isShortScreen ? '6px' : isMobile ? '8px' : '14px',
        justifyContent: 'center',
        padding: isShortScreen ? '8px 12px' : isMobile ? '12px 16px' : '20px 30px',
        width: '100%', boxSizing: 'border-box',
        flex: isShortScreen ? 1 : undefined,
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

      <div style={{ display: 'flex', gap: '10px', marginTop: isShortScreen ? '6px' : isMobile ? '24px' : '40px', marginBottom: isShortScreen ? '6px' : undefined, alignItems: 'center', padding: '0 16px', flexShrink: 0 }}>
        <button
          onClick={onClose}
          style={{
            padding: isShortScreen ? '6px 14px' : '12px 30px', fontSize: isShortScreen ? '13px' : '18px',
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
            backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 10001,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: isShortScreen ? '24px' : '20px',
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
              gap: isShortScreen ? '8px' : '12px',
            }}
          >
            <div style={{ display: 'flex', gap: '10px', marginTop: isShortScreen ? '14px' : '28px' }}>
              <button
                onClick={() => setSelectedCardId(null)}
                style={{
                  padding: isShortScreen ? '8px 18px' : '12px 30px', fontSize: isShortScreen ? '14px' : '18px',
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
                  padding: isShortScreen ? '8px 20px' : '12px 40px', fontSize: isShortScreen ? '14px' : '20px', fontWeight: 'bold',
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
