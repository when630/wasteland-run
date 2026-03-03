import React from 'react';
import { useRunStore } from '../store/useRunStore';

export const EventView: React.FC = () => {
  const { setScene, addGold } = useRunStore();

  const handleLoot = () => {
    // 50 골드 획득 이벤트
    alert("시체에서 50 골드를 찾았습니다!");
    addGold(50);
    setScene('MAP');
  };

  const handleIgnore = () => {
    alert("수상한 자리를 뒤로하고 길을 재촉합니다.");
    setScene('MAP');
  };

  return (
    <div style={{
      width: '100vw', height: '100vh', backgroundColor: '#111827', color: '#fff',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
    }}>
      <h1 style={{ fontSize: '48px', color: '#a78bfa', marginBottom: '10px' }}>
        ❓ 버려진 수레
      </h1>

      <div style={{
        backgroundColor: '#1f2937', padding: '40px', borderRadius: '16px',
        maxWidth: '600px', textAlign: 'center', marginBottom: '50px',
        border: '1px solid #374151'
      }}>
        <p style={{ fontSize: '20px', color: '#d1d5db', lineHeight: '1.6' }}>
          길 한가운데 바퀴가 부서진 수레가 방치되어 있습니다.
          주변에 아직 핏자국이 선명하며, 수레 안쪽에서는 누군가의 짐가방이 열려 있는 상태입니다.
          가까이 다가가서 쓸만한 물건을 찾아볼까요?
        </p>
      </div>

      <div style={{ display: 'flex', gap: '20px', flexDirection: 'column', width: '400px' }}>
        <button
          onClick={handleLoot}
          style={{
            padding: '20px', backgroundColor: '#374151',
            border: '2px solid #4b5563', borderRadius: '8px', cursor: 'pointer',
            fontSize: '18px', color: '#fff', textAlign: 'left',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#374151'}
        >
          <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>[뒤적거리기]</span> 50 골드를 즉시 획득합니다.
        </button>

        <button
          onClick={handleIgnore}
          style={{
            padding: '20px', backgroundColor: '#374151',
            border: '2px solid #4b5563', borderRadius: '8px', cursor: 'pointer',
            fontSize: '18px', color: '#fff', textAlign: 'left',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#374151'}
        >
          <span style={{ color: '#9ca3af', fontWeight: 'bold' }}>[무시하고 지나가기]</span> 아무 일도 일어나지 않습니다.
        </button>
      </div>
    </div>
  );
};
