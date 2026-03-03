import React from 'react';
import { useDeckStore } from '../../store/useDeckStore';
import { useCardPlay } from '../../hooks/useCardPlay';

export const Hand: React.FC = () => {
  const { hand } = useDeckStore();
  const { playCard } = useCardPlay();

  return (
    <div style={{
      position: 'absolute',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: '15px',
      alignItems: 'flex-end',
      pointerEvents: 'auto', // 카드 클릭 동작 활성화
      zIndex: 10
    }}>
      {hand.map((card) => (
        <div
          key={card.id}
          onClick={() => playCard(card.id)}
          style={{
            width: '130px',
            height: '190px',
            backgroundColor: '#2a2a2a',
            border: '2px solid #555',
            borderRadius: '8px',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'transform 0.15s ease-out, border-color 0.15s',
            boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
            userSelect: 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-20px)';
            e.currentTarget.style.borderColor = '#aaa';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = '#555';
          }}
        >
          {/* 상단: 이름 및 코스트 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontWeight: 'bold', fontSize: '13px', color: '#fff', wordBreak: 'keep-all' }}>
              {card.name}
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
              <span style={{
                backgroundColor: '#ffcc00', color: '#000', borderRadius: '50%',
                width: '24px', height: '24px', display: 'flex', justifyContent: 'center',
                alignItems: 'center', fontSize: '14px', fontWeight: 'bold'
              }}>
                {card.costAp}
              </span>
              {card.costAmmo > 0 && (
                <span style={{
                  backgroundColor: '#cc9944', color: '#000', borderRadius: '50%',
                  width: '18px', height: '18px', display: 'flex', justifyContent: 'center',
                  alignItems: 'center', fontSize: '11px', fontWeight: 'bold'
                }}>
                  {card.costAmmo}
                </span>
              )}
            </div>
          </div>

          {/* 중앙: 타입 분류 뱃지 */}
          <div style={{ textAlign: 'center', margin: '5px 0' }}>
            <span style={{ fontSize: '10px', padding: '3px 6px', backgroundColor: '#444', borderRadius: '4px', color: '#bbb' }}>
              {card.type.replace('_', ' ')}
            </span>
          </div>

          {/* 하단: 효과 텍스트 */}
          <div style={{ fontSize: '12px', color: '#ddd', textAlign: 'center' }}>
            {card.description}
          </div>
        </div>
      ))}
    </div>
  );
};
