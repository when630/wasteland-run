import React from 'react';
import { useDeckStore } from '../../store/useDeckStore';
import type { Card } from '../../types/gameTypes';

export const CardViewerModal: React.FC = () => {
  const { viewingPile, setViewingPile, drawPile, hand, discardPile, exhaustPile } = useDeckStore();

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

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.85)', // 딤드 처리
      zIndex: 100, // 가장 위에 띄움
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '40px'
    }}>
      {/* 닫기 영역: 뒷배경 아무곳이나 클릭해도 닫힘 */}
      <div
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor: 'pointer' }}
        onClick={() => setViewingPile('NONE')}
      />

      {/* 모달 헤더 */}
      <div style={{ position: 'relative', zIndex: 101, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h1 style={{ color: '#fff', margin: '0 0 20px 0' }}>{title} ({cardsToShow.length}장)</h1>

        {/* 카드 그리드 영역 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '20px',
          maxHeight: '70vh',
          overflowY: 'auto', // 카드가 많을 땐 스크롤 가능하게
          padding: '20px'
        }}>
          {cardsToShow.map((card, idx) => (
            <div
              key={`${card.id}-${idx}`}
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
                boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
                userSelect: 'none'
              }}
            >
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

              <div style={{ textAlign: 'center', margin: '5px 0' }}>
                <span style={{ fontSize: '10px', padding: '3px 6px', backgroundColor: '#444', borderRadius: '4px', color: '#bbb' }}>
                  {card.type.replace('_', ' ')}
                </span>
              </div>

              <div style={{ fontSize: '12px', color: '#ddd', textAlign: 'center' }}>
                {card.description}
              </div>
            </div>
          ))}
          {cardsToShow.length === 0 && (
            <div style={{ color: '#888', gridColumn: '1 / span 5', textAlign: 'center', marginTop: '50px' }}>
              카드가 없습니다.
            </div>
          )}
        </div>

        {/* 하단 닫기 버튼 */}
        <button
          onClick={() => setViewingPile('NONE')}
          style={{
            marginTop: '30px',
            padding: '10px 40px',
            fontSize: '18px',
            fontWeight: 'bold',
            backgroundColor: '#444',
            color: 'white',
            border: '2px solid #666',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          돌아가기
        </button>
      </div>
    </div>
  );
};
