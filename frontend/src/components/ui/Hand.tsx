import React, { useState } from 'react';
import { useDeckStore } from '../../store/useDeckStore';
import { useBattleStore } from '../../store/useBattleStore';
import { useCardPlay } from '../../hooks/useCardPlay';

export const Hand: React.FC = () => {
  const { hand } = useDeckStore();
  const { targetingCardId } = useBattleStore();
  const { playCard } = useCardPlay();
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

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
      {hand.map((card) => {
        const isSelected = targetingCardId === card.id;
        const isHovered = hoveredCardId === card.id;
        const needsEnemyTarget = card.effects.some((e) => e.type === 'DAMAGE' || e.type === 'DEBUFF');
        const targetLabel = needsEnemyTarget ? '🎯 적' : '👤 나';

        return (
          <div
            key={card.id}
            onClick={() => playCard(card.id)}
            style={{
              width: '130px',
              height: '190px',
              backgroundColor: '#2a2a2a',
              // 선택된 카드는 금색 테두리, 일반 호버 시 밝은 회색 테두리
              border: `2px solid ${isSelected ? '#ffaa00' : isHovered ? '#aaa' : '#555'}`,
              borderRadius: '8px',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              cursor: 'pointer',
              // 선택된 카드는 위로 크게 떠오르고, 호버된 카드는 살짝 떠오름
              transform: isSelected ? 'translateY(-30px)' : isHovered ? 'translateY(-15px)' : 'translateY(0)',
              boxShadow: isSelected
                ? '0 0 20px rgba(255, 170, 0, 0.7)'
                : isHovered
                  ? '0 8px 15px rgba(255, 255, 255, 0.2)'
                  : '0 4px 10px rgba(0,0,0,0.5)',
              transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), border-color 0.2s, box-shadow 0.2s',
              userSelect: 'none'
            }}
            onMouseEnter={() => setHoveredCardId(card.id)}
            onMouseLeave={() => setHoveredCardId(prev => prev === card.id ? null : prev)}
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

            {/* 중앙: 타입 및 타겟 대상 뱃지 */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', margin: '5px 0' }}>
              <span style={{ fontSize: '10px', padding: '3px 6px', backgroundColor: '#444', borderRadius: '4px', color: '#bbb' }}>
                {card.type.replace('_', ' ')}
              </span>
              <span style={{ fontSize: '10px', padding: '3px 6px', backgroundColor: needsEnemyTarget ? '#662222' : '#225522', borderRadius: '4px', color: '#ddd' }}>
                {targetLabel}
              </span>
            </div>

            {/* 하단: 효과 텍스트 */}
            <div style={{ fontSize: '12px', color: '#ddd', textAlign: 'center' }}>
              {card.description}
            </div>
          </div>
        );
      })}
    </div>
  );
};
