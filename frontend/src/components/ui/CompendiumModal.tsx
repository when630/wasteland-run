import React, { useState } from 'react';
import { ALL_CARDS } from '../../assets/data/cards';
import { RELICS } from '../../assets/data/relics';
import type { Card } from '../../types/gameTypes';
import type { Relic } from '../../types/relicTypes';

interface CompendiumModalProps {
  onClose: () => void;
}

export const CompendiumModal: React.FC<CompendiumModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'CARDS' | 'RELICS'>('CARDS');

  // --- Styled Components (기존 UI 톤앤매너 유지) ---
  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
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

  const headerStyle: React.CSSProperties = {
    width: '100%',
    padding: '20px 40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '2px solid #333',
    backgroundColor: '#111',
    boxSizing: 'border-box'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#fbbf24',
    textShadow: '0 0 10px rgba(251, 191, 36, 0.5)',
    margin: 0
  };

  const tabContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: '20px'
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

  const closeBtnStyle: React.CSSProperties = {
    padding: '10px 20px',
    fontSize: '18px',
    fontWeight: 'bold',
    backgroundColor: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer'
  };

  const contentAreaStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '1200px',
    flex: 1,
    overflowY: 'auto',
    padding: '40px 20px',
    boxSizing: 'border-box'
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '30px',
    justifyContent: 'center'
  };

  // --- 렌더러 ---

  const renderCardItem = (card: Partial<Card>) => {
    // 카드 등급별 테두리 색상
    let borderColor = '#666'; // BASIC
    let bgColor = '#1a1a1a';
    if (card.tier === 'COMMON') { borderColor = '#888'; bgColor = '#222'; }
    if (card.tier === 'UNCOMMON') { borderColor = '#4a90e2'; bgColor = '#1c2836'; }
    if (card.tier === 'RARE') { borderColor = '#ffd700'; bgColor = '#2a240c'; }

    return (
      <div key={card.baseId} style={{
        border: `3px solid ${borderColor}`,
        borderRadius: '12px',
        backgroundColor: bgColor,
        padding: '15px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
        height: '320px',
        position: 'relative',
        transition: 'transform 0.2s',
        cursor: 'default'
      }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ fontSize: '14px', color: '#aaa', fontWeight: 'bold' }}>{card.type?.replace('_', ' ')}</span>
          <span style={{ fontSize: '12px', color: borderColor, fontWeight: 'bold' }}>{card.tier}</span>
        </div>

        <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#fff', textAlign: 'center', minHeight: '44px' }}>
          {card.name}
        </h3>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '15px' }}>
          <div style={{ backgroundColor: '#2d3748', padding: '4px 8px', borderRadius: '4px', fontSize: '14px' }}>
            ⚡ AP: {card.costAp}
          </div>
          <div style={{ backgroundColor: '#744210', padding: '4px 8px', borderRadius: '4px', fontSize: '14px' }}>
            🔋 탄약: {card.costAmmo}
          </div>
        </div>

        <div style={{
          backgroundColor: 'rgba(0,0,0,0.3)',
          padding: '10px',
          borderRadius: '8px',
          fontSize: '14px',
          color: '#d1d5db',
          flex: 1,
          lineHeight: '1.4',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center'
        }}>
          {card.description}
        </div>
      </div>
    );
  };

  const renderRelicItem = (relic: Relic) => {
    let tierColor = '#ccc';
    if (relic.tier === 'UNCOMMON') tierColor = '#4a90e2';
    if (relic.tier === 'RARE') tierColor = '#ffd700';
    if (relic.tier === 'BOSS') tierColor = '#ef4444';

    return (
      <div key={relic.id} style={{
        backgroundColor: '#1f2937',
        border: `2px solid ${tierColor}`,
        borderRadius: '12px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '15px',
        boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
        transition: 'transform 0.2s',
      }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <img src={relic.image} alt={relic.name} style={{ width: '80px', height: '80px', objectFit: 'contain', filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.2))' }} />
        <div>
          <h4 style={{ margin: '0 0 5px 0', fontSize: '18px', color: tierColor }}>{relic.name}</h4>
          <span style={{ fontSize: '12px', color: '#6b7280' }}>[{relic.tier}]</span>
        </div>
        <p style={{ margin: 0, fontSize: '14px', color: '#9ca3af', lineHeight: '1.4' }}>
          {relic.description}
        </p>
      </div>
    );
  };

  return (
    <div style={overlayStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h2 style={titleStyle}>도감 (Compendium)</h2>

        <div style={tabContainerStyle}>
          <button
            style={tabButtonStyle(activeTab === 'CARDS')}
            onClick={() => setActiveTab('CARDS')}
          >
            기록된 카드 ({ALL_CARDS.length})
          </button>
          <button
            style={tabButtonStyle(activeTab === 'RELICS')}
            onClick={() => setActiveTab('RELICS')}
          >
            발견된 유물 ({RELICS.length})
          </button>
        </div>

        <button style={closeBtnStyle} onClick={onClose}>
          ❌ 닫기
        </button>
      </div>

      {/* Content Area */}
      <div style={contentAreaStyle}>
        <div style={gridStyle}>
          {activeTab === 'CARDS' && ALL_CARDS.map(card => renderCardItem(card))}
          {activeTab === 'RELICS' && RELICS.map(relic => renderRelicItem(relic))}
        </div>
      </div>
    </div>
  );
};
