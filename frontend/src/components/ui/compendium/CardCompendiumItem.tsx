import React from 'react';
import type { Card } from '../../../types/gameTypes';

interface Props {
  card: Partial<Card>;
}

export const CardCompendiumItem: React.FC<Props> = ({ card }) => {
  let borderColor = '#666';
  let bgColor = '#1a1a1a';
  if (card.tier === 'COMMON') { borderColor = '#888'; bgColor = '#222'; }
  if (card.tier === 'UNCOMMON') { borderColor = '#4a90e2'; bgColor = '#1c2836'; }
  if (card.tier === 'RARE') { borderColor = '#ffd700'; bgColor = '#2a240c'; }

  return (
    <div style={{
      border: `3px solid ${borderColor}`,
      borderRadius: '12px',
      backgroundColor: bgColor,
      padding: '15px',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
      height: '320px',
      position: 'relative',
      transition: 'transform 0.2s',
      cursor: 'default'
    }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <span style={{ fontSize: '14px', color: '#aaa', fontWeight: 'bold' }}>{card.type?.replace('_', ' ')}</span>
        <span style={{ fontSize: '12px', color: borderColor, fontWeight: 'bold' }}>{card.tier}</span>
      </div>

      <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#fff', textAlign: 'center', minHeight: '44px' }}>
        {card.name}
      </h3>

      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '15px' }}>
        <div style={{ backgroundColor: '#2d3748', padding: '4px 8px', borderRadius: '4px', fontSize: '14px' }}>
          ⚡ AP: {card.costAp}
        </div>
        <div style={{ backgroundColor: '#744210', padding: '4px 8px', borderRadius: '4px', fontSize: '14px' }}>
          🔋 탄약: {card.costAmmo}
        </div>
      </div>

      <div style={{
        backgroundColor: 'rgba(0,0,0,0.3)',
        padding: '10px',
        borderRadius: '8px',
        fontSize: '14px',
        color: '#d1d5db',
        flex: 1,
        lineHeight: '1.4',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center'
      }}>
        {card.description}
      </div>
    </div>
  );
};
