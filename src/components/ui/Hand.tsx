import React from 'react';

export const Hand: React.FC = () => {
  return (
    <div style={{
      position: 'absolute',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: '15px',
      zIndex: 10
    }}>
      {/* 임시 카드 UI 박스들 */}
      {[1, 2, 3, 4, 5].map((cardId) => (
        <div
          key={cardId}
          style={{
            width: '120px',
            height: '180px',
            backgroundColor: '#2a2a2a',
            border: '2px solid #666',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '10px',
            color: 'white',
            cursor: 'pointer',
            transition: 'transform 0.2s',
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-20px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{
            width: '24px', height: '24px', backgroundColor: '#d4af37',
            borderRadius: '50%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: '#000', fontWeight: 'bold'
          }}>1</div>
          <div style={{ textAlign: 'center' }}>임시 카드 {cardId}</div>
          <div style={{ fontSize: '12px', color: '#aaa', textAlign: 'center' }}>물리 피해 6</div>
        </div>
      ))}
    </div>
  );
};
