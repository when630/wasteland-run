import React, { useState, useMemo } from 'react';
import { useDeckStore } from '../../store/useDeckStore';
import { useRunStore } from '../../store/useRunStore';
import type { Card } from '../../types/gameTypes';
import { iconCardUpgrade } from '../../assets/images/GUI';
import { CardFrame } from './CardFrame';
import { applyUpgrade } from '../../logic/cardUpgrades';

interface UpgradeCardModalProps {
  onClose: () => void;
  onUpgradeComplete: () => void;
}

export const UpgradeCardModal: React.FC<UpgradeCardModalProps> = ({ onClose, onUpgradeComplete }) => {
  const { masterDeck } = useDeckStore();
  const relics = useRunStore(s => s.relics);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const selectedCard = masterDeck.find(c => c.id === selectedCardId) ?? null;
  const upgradedPreview = useMemo(
    () => selectedCard ? applyUpgrade(selectedCard, relics) : null,
    [selectedCard, relics],
  );

  const handleSelect = (card: Card) => {
    if (card.isUpgraded) return;
    setSelectedCardId(card.id);
  };

  const handleConfirmUpgrade = () => {
    if (!selectedCardId || !upgradedPreview) return;
    // precision_tools 유물 보너스가 반영된 upgradedPreview를 직접 덱에 적용
    useDeckStore.setState(state => ({
      masterDeck: state.masterDeck.map(c => c.id === selectedCardId ? upgradedPreview : c),
    }));
    onUpgradeComplete();
  };

  const cardW = 160;
  const previewW = 200;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 10000,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center',
      overflowY: 'auto', padding: '0',
    }}>
      <h2 style={{ fontSize: '36px', color: '#ffaaaa', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', padding: '0 16px' }}>
        <img src={iconCardUpgrade} alt="" style={{ width: 36, height: 36, objectFit: 'contain' }} /> 카드 강화
      </h2>
      <p style={{ fontSize: '18px', color: '#ccc', marginBottom: '40px', padding: '0 16px', textAlign: 'center' }}>
        강화할 카드를 한 장 선택하세요.
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
        {masterDeck.map((card) => {
          const isUpgraded = card.isUpgraded === true;

          return (
            <div
              key={card.id}
              onClick={() => handleSelect(card)}
              style={{
                cursor: isUpgraded ? 'not-allowed' : 'pointer',
                opacity: isUpgraded ? 0.5 : 1,
                transition: 'transform 0.1s, box-shadow 0.2s',
                borderRadius: `${12 * (cardW / 220)}px`,
                position: 'relative',
                justifySelf: 'center',
              }}
            >
              <CardFrame card={card} width={cardW} />
              {isUpgraded && (
                <div style={{
                  position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
                  background: 'rgba(0,0,0,0.7)', color: '#88ff88', fontSize: '11px', fontWeight: 'bold',
                  padding: '2px 6px', borderRadius: '10px', border: '1px solid #3a6b3a',
                  zIndex: 20, whiteSpace: 'nowrap',
                }}>
                  강화 완료
                </div>
              )}
            </div>
          );
        })}
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

      {/* 카드 클릭 시 확대 오버레이: 강화 전/후 비교 */}
      {selectedCard && upgradedPreview && (
        <div
          onClick={() => setSelectedCardId(null)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 10001,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            animation: 'fadeIn 0.15s ease-out',
          }}
        >
          {/* 카드 비교 */}
          <div
            onClick={e => e.stopPropagation()}
            style={{
              display: 'flex', alignItems: 'center',
              gap: '40px',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#888', fontSize: '14px', margin: '0 0 4px 0' }}>강화 전</p>
              <div style={{ opacity: 0.6 }}>
                <CardFrame card={selectedCard} width={previewW} />
              </div>
            </div>

            <div style={{
              fontSize: '36px', color: '#88ff88',
              textShadow: '0 0 10px rgba(136,255,136,0.5)',
            }}>
              {'\u27A4'}
            </div>

            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#88ff88', fontSize: '14px', margin: '0 0 4px 0', fontWeight: 'bold' }}>강화 후</p>
              <div style={{ filter: 'drop-shadow(0 0 15px rgba(136,255,136,0.3))' }}>
                <CardFrame card={upgradedPreview} width={previewW} />
              </div>
            </div>
          </div>

          {/* 버튼 */}
          <div
            onClick={e => e.stopPropagation()}
            style={{ display: 'flex', gap: '10px', marginTop: '28px' }}
          >
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
              돌아가기
            </button>
            <button
              onClick={handleConfirmUpgrade}
              style={{
                padding: '12px 40px', fontSize: '20px', fontWeight: 'bold',
                background: 'none', color: '#66cc88',
                border: '1px solid rgba(60, 180, 100, 0.4)',
                borderRadius: '6px', cursor: 'pointer',
                transition: 'all 0.2s',
                textShadow: '1px 1px 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.5)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(100, 220, 140, 0.6)'; e.currentTarget.style.color = '#88eebb'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(60, 180, 100, 0.4)'; e.currentTarget.style.color = '#66cc88'; }}
            >
              강화하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
