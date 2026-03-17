import React from 'react';
import { useDeckStore } from '../../store/useDeckStore';
import { iconDrawPile, iconDiscardPile, iconExhaustPile } from '../../assets/images/GUI';

const PileButton: React.FC<{
  icon: string;
  alt: string;
  count: number;
  badgeColor: string;
  onClick: () => void;
  size: number;
}> = ({ icon, alt, count, badgeColor, onClick, size }) => (
  <div
    style={{ position: 'relative', cursor: 'pointer', userSelect: 'none' }}
    onClick={onClick}
  >
    <img
      src={icon}
      alt={alt}
      style={{
        width: size, height: size, objectFit: 'contain',
        filter: 'drop-shadow(0 0 3px rgba(0,0,0,0.7))',
      }}
    />
    <div style={{
      position: 'absolute',
      top: -4, right: -6,
      minWidth: 20, height: 20,
      borderRadius: '50%',
      background: badgeColor,
      border: '2px solid rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '0 4px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.5)',
    }}>
      <span style={{
        fontSize: 12, fontWeight: 'bold', color: '#fff',
        textShadow: '1px 1px 1px rgba(0,0,0,0.8)',
        lineHeight: 1,
      }}>
        {count}
      </span>
    </div>
  </div>
);

export const DeckPiles: React.FC = () => {
  const drawPile = useDeckStore(s => s.drawPile);
  const discardPile = useDeckStore(s => s.discardPile);
  const exhaustPile = useDeckStore(s => s.exhaustPile);
  const size = 52;

  return (
    <>
      {/* 뽑을 덱: 좌측 하단 */}
      <div style={{
        position: 'absolute', bottom: 24, left: 24,
        zIndex: 10, pointerEvents: 'auto',
      }}>
        <PileButton
          icon={iconDrawPile} alt="뽑을 덱"
          count={drawPile.length} badgeColor="#4488cc"
          onClick={() => useDeckStore.getState().setViewingPile('DRAW')} size={size}
        />
      </div>

      {/* 버린 덱 + 소멸 덱: 우측 하단 */}
      <div style={{
        position: 'absolute', bottom: 24, right: 24,
        display: 'flex', gap: 14,
        zIndex: 10, pointerEvents: 'auto',
      }}>
        <PileButton
          icon={iconDiscardPile} alt="버린 덱"
          count={discardPile.length} badgeColor="#cc4444"
          onClick={() => useDeckStore.getState().setViewingPile('DISCARD')} size={size}
        />
        <PileButton
          icon={iconExhaustPile} alt="소멸 덱"
          count={exhaustPile.length} badgeColor="#666666"
          onClick={() => useDeckStore.getState().setViewingPile('EXHAUST')} size={size}
        />
      </div>
    </>
  );
};
