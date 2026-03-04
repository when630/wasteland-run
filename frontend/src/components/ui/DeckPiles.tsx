import React from 'react';
import { useDeckStore } from '../../store/useDeckStore';

export const DeckPiles: React.FC = () => {
  const { drawPile, discardPile, exhaustPile, setViewingPile } = useDeckStore();

  const buttonStyle = {
    backgroundColor: '#2a2a2a',
    border: '1px solid #555',
    borderRadius: '8px',
    padding: '8px 16px',
    color: '#ddd',
    cursor: 'pointer',
    userSelect: 'none' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    minWidth: '70px',
    transition: 'background-color 0.2s',
  };

  return (
    <>
      {/* 🌟 슬레이 더 스파이어 스타일: 뽑을 덱은 좌측 하단 */}
      <div style={{
        position: 'absolute',
        bottom: '30px',
        left: '30px',
        zIndex: 10,
        pointerEvents: 'auto'
      }}>
        <div
          style={buttonStyle}
          onClick={() => setViewingPile('DRAW')}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#444'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2a2a2a'}
        >
          <span style={{ fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>뽑을 덱</span>
          <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff' }}>{drawPile.length}</span>
        </div>
      </div>

      {/* 🌟 슬레이 더 스파이어 스타일: 버린 덱과 소멸 덱은 우측 하단 */}
      <div style={{
        position: 'absolute',
        bottom: '30px',
        right: '30px',
        display: 'flex',
        gap: '15px',
        zIndex: 10,
        pointerEvents: 'auto'
      }}>
        {/* 버린 덱 버튼 */}
        <div
          style={buttonStyle}
          onClick={() => setViewingPile('DISCARD')}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#444'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2a2a2a'}
        >
          <span style={{ fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>버린 덱</span>
          <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffaaaa' }}>{discardPile.length}</span>
        </div>

        {/* 소멸 덱 버튼 */}
        <div
          style={buttonStyle}
          onClick={() => setViewingPile('EXHAUST')}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#444'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2a2a2a'}
        >
          <span style={{ fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>소멸 덱</span>
          <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#aaaaaa' }}>{exhaustPile.length}</span>
        </div>
      </div>
    </>
  );
};
