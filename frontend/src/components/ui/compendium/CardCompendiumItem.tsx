import React from 'react';
import type { Card } from '../../../types/gameTypes';
import { CardFrame } from '../CardFrame';

interface Props {
  card: Partial<Card>;
}

export const CardCompendiumItem: React.FC<Props> = ({ card }) => {
  // CardFrame은 full Card를 요구하므로 기본값 보충
  const fullCard: Card = {
    id: card.id ?? '',
    baseId: card.baseId ?? '',
    name: card.name ?? '???',
    type: card.type ?? 'UTILITY',
    tier: card.tier,
    costAp: card.costAp ?? 0,
    costAmmo: card.costAmmo ?? 0,
    description: card.description ?? '',
    effects: card.effects ?? [],
    isExhaust: card.isExhaust,
    isUpgraded: card.isUpgraded,
    chapter: card.chapter,
  };

  // 티어별 border glow
  let glowColor = 'transparent';
  if (card.tier === 'UNCOMMON') glowColor = 'rgba(74,144,226,0.3)';
  if (card.tier === 'RARE') glowColor = 'rgba(255,215,0,0.3)';

  return (
    <div
      style={{
        transition: 'transform 0.2s',
        cursor: 'default',
        borderRadius: '12px',
        boxShadow: glowColor !== 'transparent' ? `0 0 16px ${glowColor}` : undefined,
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <CardFrame card={fullCard} width={180} />
    </div>
  );
};
