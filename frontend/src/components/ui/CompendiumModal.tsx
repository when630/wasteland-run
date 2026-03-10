import React, { useState } from 'react';
import { ALL_CARDS } from '../../assets/data/cards';
import { RELICS } from '../../assets/data/relics';
import { BASE_ENEMIES } from '../../assets/data/enemies';
import { CardCompendiumItem } from './compendium/CardCompendiumItem';
import { RelicCompendiumItem } from './compendium/RelicCompendiumItem';
import { EnemyCompendiumItem } from './compendium/EnemyCompendiumItem';

interface CompendiumModalProps {
  onClose: () => void;
}

export const CompendiumModal: React.FC<CompendiumModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'CARDS' | 'RELICS' | 'ENEMIES'>('CARDS');

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0, left: 0,
    width: '100vw', height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.90)',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    fontFamily: '"Courier New", Courier, monospace',
    color: '#fff',
    animation: 'fadeIn 0.3s ease-out'
  };

  const tabButtonStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '10px 30px',
    fontSize: '20px',
    fontWeight: 'bold',
    backgroundColor: isActive ? '#374151' : 'transparent',
    color: isActive ? '#fbbf24' : '#9ca3af',
    border: `2px solid ${isActive ? '#fbbf24' : '#4b5563'}`,
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  });

  return (
    <div style={overlayStyle}>
      {/* Header */}
      <div style={{
        width: '100%', padding: '20px 40px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '2px solid #333', backgroundColor: '#111', boxSizing: 'border-box'
      }}>
        <h2 style={{
          fontSize: '32px', fontWeight: 'bold', color: '#fbbf24',
          textShadow: '0 0 10px rgba(251, 191, 36, 0.5)', margin: 0
        }}>
          도감 (Compendium)
        </h2>

        <div style={{ display: 'flex', gap: '20px' }}>
          <button style={tabButtonStyle(activeTab === 'CARDS')} onClick={() => setActiveTab('CARDS')}>
            기록된 카드 ({ALL_CARDS.length})
          </button>
          <button style={tabButtonStyle(activeTab === 'RELICS')} onClick={() => setActiveTab('RELICS')}>
            발견된 유물 ({RELICS.length})
          </button>
          <button style={tabButtonStyle(activeTab === 'ENEMIES')} onClick={() => setActiveTab('ENEMIES')}>
            조우한 적 ({Object.keys(BASE_ENEMIES).length})
          </button>
        </div>

        <button style={{
          padding: '10px 20px', fontSize: '18px', fontWeight: 'bold',
          backgroundColor: '#ef4444', color: '#fff', border: 'none',
          borderRadius: '6px', cursor: 'pointer'
        }} onClick={onClose}>
          ❌ 닫기
        </button>
      </div>

      {/* Content Area */}
      <div style={{
        width: '100%', maxWidth: '1200px', flex: 1,
        overflowY: 'auto', padding: '40px 20px', boxSizing: 'border-box'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '30px', justifyContent: 'center'
        }}>
          {activeTab === 'CARDS' && ALL_CARDS.map(card => (
            <CardCompendiumItem key={card.baseId} card={card} />
          ))}
          {activeTab === 'RELICS' && RELICS.map(relic => (
            <RelicCompendiumItem key={relic.id} relic={relic} />
          ))}
          {activeTab === 'ENEMIES' && Object.keys(BASE_ENEMIES).map(baseId => (
            <EnemyCompendiumItem key={baseId} baseId={baseId} />
          ))}
        </div>
      </div>
    </div>
  );
};
