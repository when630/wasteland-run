import React from 'react';
import { useDeckStore } from '../../store/useDeckStore';
import { useResponsive } from '../../hooks/useResponsive';
import { CardFrame } from './CardFrame';
import type { Card } from '../../types/gameTypes';

export const CardViewerModal: React.FC = () => {
  const { viewingPile, setViewingPile, drawPile, hand, discardPile, exhaustPile } = useDeckStore();
  const { isMobile } = useResponsive();

  if (viewingPile === 'NONE') return null;

  let title = '';
  let cardsToShow: Card[] = [];

  switch (viewingPile) {
    case 'DECK':
      title = '현재 보유 덱';
      cardsToShow = [...drawPile, ...hand, ...discardPile, ...exhaustPile];
      break;
    case 'DRAW':
      title = '뽑을 카드뭉치';
      cardsToShow = [...drawPile];
      break;
    case 'DISCARD':
      title = '버려진 카드뭉치';
      cardsToShow = [...discardPile];
      break;
    case 'EXHAUST':
      title = '소멸된 카드뭉치';
      cardsToShow = [...exhaustPile];
      break;
  }

  const cardW = isMobile ? 100 : 140;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 100,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: isMobile ? '16px 8px' : '40px',
    }}>
      {/* 닫기 영역 */}
      <div
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor: 'pointer' }}
        onClick={() => setViewingPile('NONE')}
      />

      <div style={{ position: 'relative', zIndex: 101, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '900px' }}>
        <h1 style={{ color: '#fff', margin: '0 0 15px 0', fontSize: isMobile ? '20px' : '32px' }}>
          {title} ({cardsToShow.length}장)
        </h1>

        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: isMobile ? '10px' : '16px',
          justifyContent: 'center',
          maxHeight: '70vh', overflowY: 'auto',
          padding: isMobile ? '8px' : '20px',
          width: '100%', boxSizing: 'border-box',
        }}>
          {cardsToShow.map((card, idx) => (
            <div key={`${card.id}-${idx}`}>
              <CardFrame card={card} width={cardW} />
            </div>
          ))}
          {cardsToShow.length === 0 && (
            <div style={{ color: '#888', textAlign: 'center', marginTop: '50px', width: '100%' }}>
              카드가 없습니다.
            </div>
          )}
        </div>

        <button
          onClick={() => setViewingPile('NONE')}
          style={{
            marginTop: '30px', padding: '10px 40px', fontSize: '18px', fontWeight: 'bold',
            backgroundColor: '#444', color: 'white', border: '2px solid #666',
            borderRadius: '8px', cursor: 'pointer',
          }}
        >
          돌아가기
        </button>
      </div>
    </div>
  );
};
