import React from 'react';
import { BASE_ENEMIES, determineNextIntent } from '../../../assets/data/enemies';
import type { EnemyTier } from '../../../types/enemyTypes';
import { iconHeart, iconPhysicalDefense } from '../../../assets/images/GUI';

interface Props {
  baseId: string;
}

const getTierColor = (tier: EnemyTier): string => {
  if (tier === 'BOSS') return '#ef4444';
  if (tier === 'ELITE') return '#a855f7';
  return '#888';
};

const getTierLabel = (tier: EnemyTier): string => {
  if (tier === 'BOSS') return '보스';
  if (tier === 'ELITE') return '엘리트';
  return '일반';
};

export const EnemyCompendiumItem: React.FC<Props> = ({ baseId }) => {
  const enemy = BASE_ENEMIES[baseId];
  const tierColor = getTierColor(enemy.tier);

  const intents = new Set<string>();
  for (let i = 0; i < 20 && intents.size < 3; i++) {
    intents.add(determineNextIntent(baseId).description);
  }

  return (
    <div style={{
      backgroundColor: '#1f2937',
      border: `2px solid ${tierColor}`,
      borderRadius: '12px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
      transition: 'transform 0.2s',
    }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ margin: 0, fontSize: '18px', color: '#fff' }}>{enemy.name}</h4>
        <span style={{ fontSize: '12px', color: tierColor, fontWeight: 'bold', padding: '2px 8px', border: `1px solid ${tierColor}`, borderRadius: '4px' }}>
          {getTierLabel(enemy.tier)}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <div style={{ backgroundColor: '#2d3748', padding: '4px 10px', borderRadius: '4px', fontSize: '14px' }}>
          <img src={iconHeart} alt="" style={{ width: 16, height: 16, objectFit: 'contain', verticalAlign: 'middle' }} /> HP: {enemy.maxHp}
        </div>
        {enemy.tier === 'BOSS' && (
          <div style={{ backgroundColor: '#2d3748', padding: '4px 10px', borderRadius: '4px', fontSize: '14px' }}>
            <img src={iconPhysicalDefense} alt="" style={{ width: 16, height: 16, objectFit: 'contain', verticalAlign: 'middle' }} /> 초기 방어: 20
          </div>
        )}
      </div>

      <div style={{
        backgroundColor: 'rgba(0,0,0,0.3)',
        padding: '10px',
        borderRadius: '8px',
        fontSize: '13px',
        color: '#d1d5db',
        lineHeight: '1.6'
      }}>
        <div style={{ fontWeight: 'bold', color: '#9ca3af', marginBottom: '4px' }}>주요 패턴:</div>
        {Array.from(intents).map((desc, i) => (
          <div key={i}>• {desc}</div>
        ))}
      </div>
    </div>
  );
};
