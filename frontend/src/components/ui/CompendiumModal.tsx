import React, { useState } from 'react';
import { ALL_CARDS } from '../../assets/data/cards';
import { RELICS } from '../../assets/data/relics';
import { BASE_ENEMIES } from '../../assets/data/enemies';
import { CardCompendiumItem } from './compendium/CardCompendiumItem';
import { RelicCompendiumItem } from './compendium/RelicCompendiumItem';
import { EnemyCompendiumItem } from './compendium/EnemyCompendiumItem';
import { iconClose } from '../../assets/images/GUI';

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

  const isMobile = window.innerWidth < 768;

  const tabButtonStyle = (isActive: boolean): React.CSSProperties => ({
    padding: isMobile ? '8px 14px' : '10px 30px',
    fontSize: isMobile ? '13px' : '20px',
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
        width: '100%', padding: isMobile ? '12px' : '20px 40px',
        display: 'flex', flexDirection: isMobile ? 'column' as const : 'row' as const,
        justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center',
        gap: isMobile ? '10px' : undefined,
        borderBottom: '2px solid #333', backgroundColor: '#111', boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{
            fontSize: isMobile ? '20px' : '32px', fontWeight: 'bold', color: '#fbbf24',
            textShadow: '0 0 10px rgba(251, 191, 36, 0.5)', margin: 0
          }}>
            도감
          </h2>
          <button style={{
            padding: isMobile ? '6px 12px' : '10px 20px', fontSize: isMobile ? '14px' : '18px', fontWeight: 'bold',
            backgroundColor: '#ef4444', color: '#fff', border: 'none',
            borderRadius: '6px', cursor: 'pointer',
            display: isMobile ? undefined : 'none',
          }} onClick={onClose}>
            <img src={iconClose} alt="닫기" style={{ width: 16, height: 16, objectFit: 'contain' }} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: isMobile ? '6px' : '20px', flexWrap: 'wrap' }}>
          <button style={tabButtonStyle(activeTab === 'CARDS')} onClick={() => setActiveTab('CARDS')}>
            카드 ({ALL_CARDS.length})
          </button>
          <button style={tabButtonStyle(activeTab === 'RELICS')} onClick={() => setActiveTab('RELICS')}>
            유물 ({RELICS.length})
          </button>
          <button style={tabButtonStyle(activeTab === 'ENEMIES')} onClick={() => setActiveTab('ENEMIES')}>
            적 ({Object.keys(BASE_ENEMIES).length})
          </button>
        </div>

        {!isMobile && (
          <button style={{
            padding: '10px 20px', fontSize: '18px', fontWeight: 'bold',
            backgroundColor: '#ef4444', color: '#fff', border: 'none',
            borderRadius: '6px', cursor: 'pointer'
          }} onClick={onClose}>
            <img src={iconClose} alt="" style={{ width: 16, height: 16, objectFit: 'contain', verticalAlign: 'middle', marginRight: '4px' }} /> 닫기
          </button>
        )}
      </div>

      {/* Content Area */}
      <div style={{
        width: '100%', maxWidth: '1200px', flex: 1,
        overflowY: 'auto', padding: isMobile ? '16px 10px' : '40px 20px', boxSizing: 'border-box'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(auto-fill, minmax(140px, 1fr))' : 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: isMobile ? '12px' : '30px', justifyContent: 'center'
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
