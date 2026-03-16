import React from 'react';
import type { Card } from '../../../types/gameTypes';
import { CardFrame } from '../CardFrame';

interface Props {
  card: Partial<Card>;
}

export const CardCompendiumItem: React.FC<Props> = ({ card }) => {
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
  };

  let glowColor = 'transparent';
  if (card.tier === 'UNCOMMON') glowColor = 'rgba(74,144,226,0.3)';
  if (card.tier === 'RARE') glowColor = 'rgba(255,215,0,0.3)';

  const cardWidth = 180;

  return (
    <div
      style={{
        transition: 'transform 0.2s',
        cursor: 'default',
        borderRadius: `${12 * (cardWidth / 220)}px`,
        boxShadow: glowColor !== 'transparent' ? `0 0 16px ${glowColor}` : undefined,
        justifySelf: 'center',
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <CardFrame card={fullCard} width={cardWidth} />
    </div>
  );
};
