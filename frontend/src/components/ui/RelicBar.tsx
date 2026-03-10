import React, { useState } from 'react';
import { useRunStore } from '../../store/useRunStore';
import { RELICS } from '../../assets/data/relics';
import { useAudioStore } from '../../store/useAudioStore';
import { colors } from '../../styles/theme';

export const RelicBar: React.FC = () => {
  const relicsList = useRunStore(state => state.relics);
  const [hoveredRelic, setHoveredRelic] = useState<any | null>(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const [selectedRelic, setSelectedRelic] = useState<any | null>(null);

  return (
    <>
      {/* 유물 목록 (헤더 바로 아래 좌측 정렬) */}
      <div style={{
        position: 'absolute',
        top: '65px',
        left: '20px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        maxWidth: '60%',
        zIndex: 10
      }}>
        {relicsList.map((relicId) => {
          const relicData = RELICS.find((r: any) => r.id === relicId);
          if (!relicData) return null;
          return (
            <div
              key={relicId}
              onClick={() => {
                useAudioStore.getState().playClick();
                setSelectedRelic(relicData);
                setHoveredRelic(null);
              }}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setHoverPosition({ x: rect.left, y: rect.bottom + 10 });
                setHoveredRelic(relicData);
                e.currentTarget.style.transform = 'scale(1.2)';
              }}
              onMouseLeave={(e) => {
                setHoveredRelic(null);
                e.currentTarget.style.transform = 'scale(1)';
              }}
              style={{
                width: '36px', height: '36px',
                backgroundColor: 'rgba(30, 30, 30, 0.8)',
                border: `1px solid ${colors.border.medium}`,
                borderRadius: '50%',
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                fontSize: '20px', cursor: 'pointer', userSelect: 'none',
                boxShadow: '0 2px 5px rgba(0,0,0,0.5)',
                transition: 'transform 0.1s'
              }}
            >
              {relicData.image ? <img src={relicData.image} alt={relicData.name} style={{ width: '80%', height: '80%', objectFit: 'contain' }} /> : relicData.icon}
            </div>
          );
        })}
      </div>

      {/* 유물 호버 툴팁 */}
      {hoveredRelic && (
        <div style={{
          position: 'absolute',
          left: `${hoverPosition.x}px`,
          top: `${hoverPosition.y}px`,
          backgroundColor: 'rgba(20, 20, 20, 0.95)',
          border: `1px solid ${colors.border.medium}`,
          borderRadius: '6px',
          padding: '10px 15px',
          color: '#eee',
          maxWidth: '300px',
          zIndex: 500,
          pointerEvents: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.8)'
        }}>
          <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#ffaaaa', marginBottom: '4px' }}>
            {hoveredRelic.name} <span style={{ fontSize: '11px', color: '#aaa', fontWeight: 'normal' }}>[{hoveredRelic.tier}]</span>
          </div>
          <div style={{ fontSize: '13px', lineHeight: '1.4' }}>
            {hoveredRelic.description}
          </div>
          <div style={{ fontSize: '10px', color: '#777', marginTop: '6px', fontStyle: 'italic' }}>
            클릭하여 자세히 보기
          </div>
        </div>
      )}

      {/* 유물 상세 정보 클릭 모달 */}
      {selectedRelic && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.85)',
          zIndex: 9999,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ position: 'absolute', width: '100%', height: '100%', cursor: 'pointer' }} onClick={() => setSelectedRelic(null)} />

          <div style={{
            position: 'relative',
            width: '320px',
            backgroundColor: colors.bg.medium,
            border: '2px solid #ffaaaa',
            borderRadius: '12px',
            padding: '30px',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            boxShadow: '0 0 30px rgba(0,0,0,0.8)',
            zIndex: 10000
          }}>
            <button
              onClick={() => setSelectedRelic(null)}
              style={{
                position: 'absolute', top: '10px', right: '15px',
                background: 'none', border: 'none', color: '#888',
                fontSize: '24px', cursor: 'pointer', fontWeight: 'bold'
              }}
            >
              ×
            </button>
            <div style={{ width: '100px', height: '100px', marginBottom: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {selectedRelic.image ? <img src={selectedRelic.image} alt={selectedRelic.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <span style={{ fontSize: '80px' }}>{selectedRelic.icon}</span>}
            </div>
            <h2 style={{ color: '#fff', fontSize: '24px', margin: '0 0 5px 0', textAlign: 'center' }}>
              {selectedRelic.name}
            </h2>
            <div style={{ color: '#ffaaaa', fontSize: '14px', marginBottom: '20px' }}>
              등급: {selectedRelic.tier}
            </div>
            <p style={{ color: '#ddd', fontSize: '16px', lineHeight: '1.5', textAlign: 'center', margin: 0 }}>
              {selectedRelic.description}
            </p>
          </div>
        </div>
      )}
    </>
  );
};
