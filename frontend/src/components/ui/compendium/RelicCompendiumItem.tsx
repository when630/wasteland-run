import React from 'react';
import type { Relic } from '../../../types/relicTypes';

interface Props {
  relic: Relic;
}

export const RelicCompendiumItem: React.FC<Props> = ({ relic }) => {
  let tierColor = '#ccc';
  if (relic.tier === 'UNCOMMON') tierColor = '#4a90e2';
  if (relic.tier === 'RARE') tierColor = '#ffd700';
  if (relic.tier === 'BOSS') tierColor = '#ef4444';

  const imgSize = '80px';

  return (
    <div style={{
      backgroundColor: '#1f2937',
      border: `2px solid ${tierColor}`,
      borderRadius: '12px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      gap: '15px',
      boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
      transition: 'transform 0.2s',
    }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      {relic.image
        ? <img src={relic.image} alt={relic.name} style={{ width: imgSize, height: imgSize, objectFit: 'contain', filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.2))' }} />
        : <span style={{ fontSize: `${parseInt(imgSize) * 0.7}px`, lineHeight: imgSize, display: 'block', width: imgSize, height: imgSize, textAlign: 'center' }}>{relic.icon || '❓'}</span>
      }
      <div>
        <h4 style={{ margin: '0 0 3px 0', fontSize: '18px', color: tierColor }}>{relic.name}</h4>
        <span style={{ fontSize: '12px', color: '#6b7280' }}>[{relic.tier}]</span>
      </div>
      <p style={{ margin: 0, fontSize: '14px', color: '#9ca3af', lineHeight: '1.4' }}>
        {relic.description}
      </p>
    </div>
  );
};
