import React, { useState } from 'react';
import { useRunStore } from '../../store/useRunStore';
import { useBattleStore } from '../../store/useBattleStore';
import { RELICS } from '../../assets/data/relics';
import { useAudioStore } from '../../store/useAudioStore';
import { iconRelicReward, iconBurn } from '../../assets/images/GUI';

export const DebugMenu: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { enemies, applyDamageToEnemy } = useBattleStore();

  const handleKillAll = () => {
    useAudioStore.getState().playClick();
    enemies.forEach(enemy => {
      if (enemy.currentHp > 0) {
        applyDamageToEnemy(enemy.id, 9999, 'PIERCING');
      }
    });
  };

  return (
    <div style={{ position: 'relative', marginRight: '15px' }}>
      <div
        onClick={() => {
          useAudioStore.getState().playClick();
          setIsMenuOpen(!isMenuOpen);
        }}
        style={{
          cursor: 'pointer',
          userSelect: 'none',
          fontSize: '24px',
          textShadow: '2px 2px 2px black',
          transition: 'transform 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        title="디버그 메뉴"
      >
        🐛
      </div>

      {isMenuOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '8px',
          backgroundColor: 'rgba(30, 30, 30, 0.95)',
          border: '1px solid #555',
          borderRadius: '8px',
          padding: '10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          minWidth: '180px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          zIndex: 100
        }}>
          <div style={{ fontSize: '12px', color: '#aaa', borderBottom: '1px solid #444', paddingBottom: '4px', marginBottom: '4px' }}>
            디버그 / 치트 기능
          </div>
          <div
            onClick={() => {
              useAudioStore.getState().playClick();
              const { relics, addRelic } = useRunStore.getState();
              RELICS.forEach(r => {
                if (!relics.includes(r.id)) addRelic(r.id);
              });
              setIsMenuOpen(false);
            }}
            style={{
              backgroundColor: '#2266aa',
              padding: '8px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              textAlign: 'center',
              fontSize: '14px',
              color: 'white',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#114488'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2266aa'}
          >
            <img src={iconRelicReward} alt="" style={{ width: 18, height: 18, objectFit: 'contain', verticalAlign: 'middle', marginRight: 4 }} /> 모든 유물 획득
          </div>

          <div
            onClick={() => {
              handleKillAll();
              setIsMenuOpen(false);
            }}
            style={{
              backgroundColor: '#ff4444',
              padding: '8px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              textAlign: 'center',
              fontSize: '14px',
              color: 'white',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#cc3333'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ff4444'}
          >
            <img src={iconBurn} alt="" style={{ width: 18, height: 18, objectFit: 'contain', verticalAlign: 'middle', marginRight: 4 }} /> 적 전원 처치
          </div>
        </div>
      )}
    </div>
  );
};
