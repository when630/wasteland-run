import React from 'react';
import { useBattleStore } from '../../store/useBattleStore';

export const ResourcePanel: React.FC = () => {
  const { playerActionPoints, playerAmmo, endPlayerTurn, currentTurn } = useBattleStore();

  return (
    <div style={{
      position: 'absolute',
      bottom: '10px',
      left: '10px',
      width: '200px',
      backgroundColor: 'rgba(20, 20, 20, 0.9)',
      border: '2px solid #555',
      borderRadius: '8px',
      padding: '15px',
      color: 'white',
      zIndex: 10
    }}>
      <div style={{ marginBottom: '15px' }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#ffcc00' }}>AP: {playerActionPoints} / 3</h3>
        <h3 style={{ margin: 0, color: '#cc9944' }}>Ammo: {playerAmmo}</h3>
      </div>

      <button
        onClick={endPlayerTurn}
        disabled={currentTurn !== 'PLAYER'}
        style={{
          width: '100%',
          padding: '10px',
          backgroundColor: currentTurn === 'PLAYER' ? '#cc3333' : '#555',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontWeight: 'bold',
          cursor: currentTurn === 'PLAYER' ? 'pointer' : 'not-allowed'
        }}
      >
        {currentTurn === 'PLAYER' ? 'TURN END' : 'ENEMY TURN...'}
      </button>
    </div>
  );
};
