import React from 'react';
import { useRunStore } from '../../store/useRunStore';
import { useBattleStore } from '../../store/useBattleStore';
import { useDeckStore } from '../../store/useDeckStore';

export const HUD: React.FC = () => {
  const { playerHp, playerMaxHp, gold } = useRunStore();
  const { playerStatus, enemies, applyDamageToEnemy } = useBattleStore();
  const { drawPile, hand, discardPile, exhaustPile, setViewingPile } = useDeckStore();

  const handleKillAll = () => {
    enemies.forEach(enemy => {
      if (enemy.currentHp > 0) {
        applyDamageToEnemy(enemy.id, 9999, 'PIERCING');
      }
    });
  };

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '60px',
      backgroundColor: 'rgba(20, 20, 20, 0.8)',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      padding: '0 20px',
      boxSizing: 'border-box',
      borderBottom: '2px solid #444',
      zIndex: 10
    }}>
      <div style={{ marginRight: '30px' }}>
        <strong>Stage 1 - 오염된 외곽 도시</strong>
      </div>
      <div style={{ marginRight: '20px' }}>
        <span style={{ color: '#ff4444' }}>HP:</span> {playerHp} / {playerMaxHp}
      </div>
      <div style={{ marginRight: '20px' }}>
        <span style={{ color: '#4499ff' }}>Shield:</span> {playerStatus.shield} | <span style={{ color: '#9944ff' }}>Resist:</span> {playerStatus.resist}
      </div>
      <div>
        <span style={{ color: '#ffd700' }}>Gold:</span> {gold}
      </div>
      <div style={{ flex: 1 }} /> {/* 우측 정렬을 위한 스페이서 */}

      {/* 🌟 치트 버튼: 적 강제 처치 */}
      <div
        onClick={handleKillAll}
        style={{
          marginRight: '15px',
          backgroundColor: '#ff4444',
          padding: '5px 15px',
          borderRadius: '4px',
          border: '1px solid #777',
          cursor: 'pointer',
          userSelect: 'none',
          transition: 'background-color 0.2s',
          fontWeight: 'bold',
          color: 'white'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#cc3333'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ff4444'}
        title="화면 상의 모든 적을 즉사시킵니다 (테스트용)"
      >
        <span>🔥 전원 처치 (Kill)</span>
      </div>

      <div
        onClick={() => setViewingPile('DECK')}
        style={{
          backgroundColor: '#333',
          padding: '5px 15px',
          borderRadius: '4px',
          border: '1px solid #777',
          cursor: 'pointer',
          userSelect: 'none',
          transition: 'background-color 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#555'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#333'}
      >
        <span>전체 보유 덱: <strong>{drawPile.length + hand.length + discardPile.length + exhaustPile.length}</strong>장</span>
      </div>
    </div>
  );
};
