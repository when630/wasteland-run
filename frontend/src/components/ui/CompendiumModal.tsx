import React, { useState } from 'react';
import { ALL_CARDS } from '../../assets/data/cards';
import { RELICS } from '../../assets/data/relics';
import { BASE_ENEMIES } from '../../assets/data/enemies';
import { CardCompendiumItem } from './compendium/CardCompendiumItem';
import { RelicCompendiumItem } from './compendium/RelicCompendiumItem';
import { EnemyCompendiumItem } from './compendium/EnemyCompendiumItem';
import { iconClose } from '../../assets/images/GUI';
import { useResponsive } from '../../hooks/useResponsive';

interface CompendiumModalProps {
  onClose: () => void;
}

export const CompendiumModal: React.FC<CompendiumModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'CARDS' | 'RELICS' | 'ENEMIES'>('CARDS');
  const { isMobile, height } = useResponsive();
  const isShortScreen = height < 500;

  const tabButtonStyle = (isActive: boolean): React.CSSProperties => ({
    padding: isShortScreen ? '5px 10px' : isMobile ? '8px 14px' : '10px 30px',
    fontSize: isShortScreen ? '11px' : isMobile ? '13px' : '20px',
    fontWeight: 'bold',
    backgroundColor: isActive ? '#374151' : 'transparent',
    color: isActive ? '#fbbf24' : '#9ca3af',
    border: `2px solid ${isActive ? '#fbbf24' : '#4b5563'}`,
    borderRadius: isShortScreen ? '6px' : '8px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  });

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.90)', zIndex: 1000,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start',
      fontFamily: '"Courier New", Courier, monospace', color: '#fff',
      animation: 'fadeIn 0.3s ease-out'
    }}>
      {/* Header */}
      <div style={{
        width: '100%', padding: isShortScreen ? '8px 10px' : isMobile ? '12px' : '20px 40px',
        display: 'flex', flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center',
        gap: isShortScreen ? '6px' : isMobile ? '10px' : undefined,
        borderBottom: '2px solid #333', backgroundColor: '#111', boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{
            fontSize: isShortScreen ? '16px' : isMobile ? '20px' : '32px', fontWeight: 'bold', color: '#fbbf24',
            textShadow: '0 0 10px rgba(251, 191, 36, 0.5)', margin: 0
          }}>
            도감
          </h2>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={onClose}>
            <img src={iconClose} alt="닫기" style={{ width: isShortScreen ? 14 : 18, height: isShortScreen ? 14 : 18, objectFit: 'contain' }} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: isShortScreen ? '4px' : isMobile ? '6px' : '20px', flexWrap: 'wrap' }}>
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
      </div>

      {/* Content Area */}
      <div style={{
        width: '100%', maxWidth: '1200px', flex: 1,
        overflowY: 'auto',
        padding: isShortScreen ? '8px 6px' : isMobile ? '16px 10px' : '40px 20px',
        boxSizing: 'border-box'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: isShortScreen ? '6px' : isMobile ? '12px' : '30px',
          justifyContent: 'center'
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
