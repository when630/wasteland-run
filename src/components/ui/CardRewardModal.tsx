import React, { useState, useEffect } from 'react';
import { useDeckStore } from '../../store/useDeckStore';
import type { Card } from '../../types/gameTypes';
import { STARTING_CARDS } from '../../assets/data/cards';

interface CardRewardModalProps {
  onClose: () => void;
  onCardSelected: () => void;
}

export const CardRewardModal: React.FC<CardRewardModalProps> = ({ onClose, onCardSelected }) => {
  const { addCardToMasterDeck } = useDeckStore();
  const [rewardCards, setRewardCards] = useState<Card[]>([]);

  // 컴포넌트 마운트 시 카드 3장 무작위 뽑기
  useEffect(() => {
    // 런 최초 지급용으로 만들어둔 STARTING_CARDS 배열에서 임시로 3장을 무작위 추출합니다.
    const shuffled = [...STARTING_CARDS].sort(() => 0.5 - Math.random()) as Card[];
    setRewardCards(shuffled.slice(0, 3));
  }, []);

  const handleSelectCard = (card: Card) => {
    // ID를 제거한 블루프린트 형태로 덱에 추가 (내부적으로 새 ID 발급됨)
    const { id, ...cardBlueprint } = card;
    addCardToMasterDeck(cardBlueprint);
    onCardSelected();
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 300,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
    }}>
      <h2 style={{ fontSize: '36px', color: '#ffdd44', marginBottom: '30px' }}>
        🃏 전리품: 카드 선택
      </h2>
      <p style={{ fontSize: '18px', color: '#ccc', marginBottom: '40px' }}>
        덱에 추가할 카드를 한 장 선택하세요.
      </p>

      <div style={{ display: 'flex', gap: '30px' }}>
        {rewardCards.map((card, index) => (
          <div
            key={`reward-${index}`}
            onClick={() => handleSelectCard(card)}
            style={{
              width: '200px', height: '300px',
              backgroundColor: card.type.includes('ATTACK') ? '#4a2a2a' : card.type.includes('DEFENSE') ? '#2a4a3a' : '#2a2a4a',
              border: '2px solid #777', borderRadius: '12px',
              padding: '20px', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              transition: 'transform 0.2s',
              boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-15px) scale(1.05)';
              e.currentTarget.style.borderColor = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.borderColor = '#777';
            }}
          >
            <h3 style={{ margin: '0 0 10px 0', fontSize: '20px', color: '#fff', textAlign: 'center' }}>{card.name}</h3>
            <div style={{
              backgroundColor: 'rgba(0,0,0,0.5)', padding: '5px 10px',
              borderRadius: '20px', color: '#00ffff', marginBottom: '20px', fontSize: '14px'
            }}>
              AP: {card.costAp} {card.costAmmo > 0 && `| 탄약: ${card.costAmmo}`}
            </div>
            <p style={{ color: '#ddd', fontSize: '15px', textAlign: 'center', lineHeight: '1.4' }}>
              {card.description}
            </p>
          </div>
        ))}
      </div>

      <button
        onClick={onClose}
        style={{
          marginTop: '50px', padding: '10px 30px', fontSize: '18px',
          backgroundColor: '#444', color: '#fff', border: '1px solid #666',
          borderRadius: '8px', cursor: 'pointer'
        }}
      >
        건너뛰기 (선택 안 함)
      </button>
    </div>
  );
};
