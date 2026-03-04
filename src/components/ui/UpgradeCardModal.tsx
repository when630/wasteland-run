import React, { useState } from 'react';
import { useDeckStore } from '../../store/useDeckStore';
import type { Card } from '../../types/gameTypes';

interface UpgradeCardModalProps {
  onClose: () => void;
  onUpgradeComplete: () => void;
}

export const UpgradeCardModal: React.FC<UpgradeCardModalProps> = ({ onClose, onUpgradeComplete }) => {
  const { masterDeck, upgradeCard } = useDeckStore();
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const handleSelect = (card: Card) => {
    // 이미 강화된 카드는 선택 불가
    if (card.isUpgraded) return;
    setSelectedCardId(card.id);
  };

  const handleConfirm = () => {
    if (!selectedCardId) return;
    upgradeCard(selectedCardId); // 스토어에서 강화 플래그 및 수치 변경 트리거
    onUpgradeComplete();
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 10000,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
    }}>
      <h2 style={{ fontSize: '36px', color: '#ffaaaa', marginBottom: '20px' }}>
        🔨 덱 정비: 카드 강화
      </h2>
      <p style={{ fontSize: '18px', color: '#ccc', marginBottom: '40px' }}>
        강화할 카드를 한 장 선택하세요. 선택된 카드는 즉시 전투력이 영구 상승합니다.
      </p>

      {/* 카드 스크롤 영역 */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '20px',
        justifyContent: 'center',
        padding: '20px',
        maxWidth: '80%',
        maxHeight: '50vh', // 세로 스크롤 가능하게 제한
        overflowY: 'auto',
        backgroundColor: 'rgba(30, 20, 20, 0.8)',
        borderRadius: '12px',
        border: '1px solid #555'
      }}>
        {masterDeck.map((card) => {
          const isSelected = selectedCardId === card.id;
          const isUpgraded = card.isUpgraded === true;

          // 배경 색상
          let cardBg = '#2a2a4a';
          if (card.type.includes('ATTACK')) cardBg = '#4a2a2a';
          else if (card.type.includes('DEFENSE')) cardBg = '#2a4a3a';

          // 이미 강화된 카드는 회색 계열 필터
          if (isUpgraded) cardBg = '#333333';

          return (
            <div
              key={card.id}
              onClick={() => handleSelect(card)}
              style={{
                width: '180px', height: '260px',
                backgroundColor: cardBg,
                border: `3px solid ${isSelected ? '#ffaaaa' : isUpgraded ? '#444' : '#777'}`,
                borderRadius: '10px',
                padding: '15px',
                cursor: isUpgraded ? 'not-allowed' : 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                opacity: isUpgraded ? 0.6 : 1,
                transition: 'transform 0.1s',
                transform: isSelected ? 'scale(1.05)' : 'scale(1)'
              }}
            >
              <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: isUpgraded ? '#aaa' : '#fff', textAlign: 'center' }}>
                {card.name}
              </h3>
              <div style={{
                backgroundColor: 'rgba(0,0,0,0.5)', padding: '4px 8px',
                borderRadius: '20px', color: isUpgraded ? '#777' : '#00ffff', marginBottom: '15px', fontSize: '13px'
              }}>
                AP: {card.costAp} {card.costAmmo > 0 && `| 탄약: ${card.costAmmo}`}
              </div>
              <p style={{ color: isUpgraded ? '#888' : '#ddd', fontSize: '14px', textAlign: 'center', lineHeight: '1.4' }}>
                {card.description}
              </p>

              {/* 하단 상태 표시 */}
              <div style={{ marginTop: 'auto', color: '#ffaaaa', fontSize: '14px', fontWeight: 'bold' }}>
                {isUpgraded ? '[강화 완료]' : ''}
              </div>
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
            borderRadius: '8px', cursor: 'pointer'
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
            transition: 'background-color 0.2s'
          }}
        >
          선택한 카드 개조
        </button>
      </div>
    </div>
  );
};
