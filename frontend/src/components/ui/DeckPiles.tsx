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
    <div style={{
      position: 'absolute',
      bottom: '10px',
      right: '10px',
      display: 'flex',
      gap: '10px',
      zIndex: 10,
      pointerEvents: 'auto' // 클릭 가능하도록
    }}>
      {/* 뽑을 덱 버튼 */}
      <div
        style={buttonStyle}
        onClick={() => setViewingPile('DRAW')}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#444'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2a2a2a'}
      >
        <span style={{ fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>뽑을 덱</span>
        <span style={{ fontSize: '20px', fontWeight: 'bold' }}>{drawPile.length}</span>
      </div>

      {/* 버린 덱 버튼 */}
      <div
        style={buttonStyle}
        onClick={() => setViewingPile('DISCARD')}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#444'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2a2a2a'}
      >
        <span style={{ fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>버린 덱</span>
        <span style={{ fontSize: '20px', fontWeight: 'bold' }}>{discardPile.length}</span>
      </div>

      {/* 소멸 덱 버튼 (카드가 있을 때만 표시해도 되지만 공간 상 항시 표시) */}
      <div
        style={buttonStyle}
        onClick={() => setViewingPile('EXHAUST')}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#444'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2a2a2a'}
      >
        <span style={{ fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>소멸 덱</span>
        <span style={{ fontSize: '20px', fontWeight: 'bold' }}>{exhaustPile.length}</span>
      </div>
    </div>
  );
};
