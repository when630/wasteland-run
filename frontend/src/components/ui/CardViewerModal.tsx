import React from 'react';
import { useDeckStore } from '../../store/useDeckStore';
import { CardFrame } from './CardFrame';
import type { Card } from '../../types/gameTypes';

export const CardViewerModal: React.FC = () => {
  const viewingPile = useDeckStore(s => s.viewingPile);

  if (viewingPile === 'NONE') return null;

  // 모달이 열렸을 때만 나머지 상태 읽기
  const { drawPile, hand, discardPile, exhaustPile } = useDeckStore.getState();

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

  const cardW = 140;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 100,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '40px',
    }}>
      {/* 닫기 영역 */}
      <div
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor: 'pointer' }}
        onClick={() => useDeckStore.getState().setViewingPile('NONE')}
      />

      <div style={{ position: 'relative', zIndex: 101, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '900px', height: '100%' }}>
        <h1 style={{ color: '#fff', margin: '0 0 10px 0', fontSize: '24px', flexShrink: 0 }}>
          {title} ({cardsToShow.length}장)
        </h1>

        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: '10px',
          justifyContent: 'center',
          flex: 1, overflowY: 'auto',
          padding: '20px',
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
          onClick={() => useDeckStore.getState().setViewingPile('NONE')}
          style={{
            marginTop: '30px', padding: '10px 40px', fontSize: '18px', fontWeight: 'bold',
            background: 'none', color: '#a09078', border: '1px solid rgba(120, 100, 70, 0.4)',
            borderRadius: '6px', cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s',
            textShadow: '1px 1px 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.5)',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(180, 150, 100, 0.6)'; e.currentTarget.style.color = '#c8b898'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(120, 100, 70, 0.4)'; e.currentTarget.style.color = '#a09078'; }}
        >
          돌아가기
        </button>
      </div>
    </div>
  );
};
