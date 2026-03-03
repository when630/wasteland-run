import React from 'react';
import { useRunStore } from '../../store/useRunStore';
import { useBattleStore } from '../../store/useBattleStore';

export const HUD: React.FC = () => {
  const { playerHp, playerMaxHp, gold } = useRunStore();
  const { playerStatus } = useBattleStore();

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
    </div>
  );
};
