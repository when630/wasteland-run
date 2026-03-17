import React, { useState } from 'react';
import { useRunStore } from '../../store/useRunStore';
import { RELICS } from '../../assets/data/relics';
import { useAudioStore } from '../../store/useAudioStore';
import { iconClose } from '../../assets/images/GUI';

interface RelicBarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RelicBar: React.FC<RelicBarProps> = ({ isOpen, onClose }) => {
  const relicsList = useRunStore(state => state.relics);
  const [selectedRelic, setSelectedRelic] = useState<typeof RELICS[number] | null>(null);

  if (!isOpen) return null;

  const txtShadow = '1px 1px 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.5)';
  const relicSize = 64;

  return (
    <>
      {/* 가방 모달 오버레이 */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(5, 5, 3, 0.92)', zIndex: 9999,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.2s ease-out',
        }}
      >
        <div onClick={e => e.stopPropagation()} style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          maxWidth: '500px', width: '100%',
        }}>
          <h2 style={{
            fontSize: '32px',
            color: '#cc8888', margin: '0 0 8px 0',
            textShadow: txtShadow,
          }}>
            유물 가방
          </h2>
          <p style={{
            fontSize: '14px', color: '#8a7e6a',
            marginBottom: '28px',
            textShadow: '1px 1px 3px rgba(0,0,0,0.8)',
          }}>
            수집한 유물 {relicsList.length}개
          </p>

          {/* 구분선 */}
          <div style={{
            width: '400px', height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(200, 100, 100, 0.3), transparent)',
            marginBottom: '24px',
          }} />

          {relicsList.length === 0 ? (
            <p style={{ color: '#6a5e4a', fontSize: '16px', textShadow: txtShadow }}>
              아직 획득한 유물이 없습니다.
            </p>
          ) : (
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: '16px',
              justifyContent: 'center', padding: '0 16px',
              maxHeight: '400px', overflowY: 'auto',
            }}>
              {relicsList.map((relicId) => {
                const relicData = RELICS.find(r => r.id === relicId);
                if (!relicData) return null;
                return (
                  <div
                    key={relicId}
                    onClick={() => {
                      useAudioStore.getState().playClick();
                      setSelectedRelic(relicData);
                    }}
                    style={{
                      width: relicSize, height: relicSize,
                      border: '1px solid rgba(180, 80, 80, 0.4)',
                      borderRadius: '50%',
                      display: 'flex', justifyContent: 'center', alignItems: 'center',
                      cursor: 'pointer', transition: 'all 0.2s',
                      background: 'none',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'scale(1.15)';
                      e.currentTarget.style.borderColor = 'rgba(220, 120, 120, 0.6)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.borderColor = 'rgba(180, 80, 80, 0.4)';
                    }}
                  >
                    {relicData.image
                      ? <img src={relicData.image} alt={relicData.name} style={{ width: '75%', height: '75%', objectFit: 'contain', filter: 'drop-shadow(0 0 4px rgba(200, 100, 100, 0.3))' }} />
                      : <span style={{ fontSize: relicSize * 0.5 }}>{relicData.icon}</span>
                    }
                  </div>
                );
              })}
            </div>
          )}

          {/* 닫기 버튼 */}
          <button
            onClick={onClose}
            style={{
              marginTop: '32px',
              padding: '10px 30px',
              fontSize: '16px',
              background: 'none', color: '#a09078',
              border: '1px solid rgba(120, 100, 70, 0.4)',
              borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s',
              textShadow: txtShadow,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(180, 150, 100, 0.6)'; e.currentTarget.style.color = '#c8b898'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(120, 100, 70, 0.4)'; e.currentTarget.style.color = '#a09078'; }}
          >
            닫기
          </button>
        </div>
      </div>

      {/* 유물 상세 정보 모달 */}
      {selectedRelic && (
        <div
          onClick={() => setSelectedRelic(null)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 10000,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            animation: 'fadeIn 0.15s ease-out',
          }}
        >
          <div onClick={e => e.stopPropagation()} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            maxWidth: '320px', padding: '20px',
          }}>
            <button
              onClick={() => setSelectedRelic(null)}
              style={{
                position: 'absolute', top: '20px', right: '20px',
                background: 'none', border: 'none', cursor: 'pointer',
              }}
            >
              <img src={iconClose} alt="닫기" style={{ width: 22, height: 22, objectFit: 'contain' }} />
            </button>

            <div style={{ width: 100, height: 100, marginBottom: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {selectedRelic.image
                ? <img src={selectedRelic.image} alt={selectedRelic.name} style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 0 12px rgba(200, 100, 100, 0.4))' }} />
                : <span style={{ fontSize: 80 }}>{selectedRelic.icon}</span>
              }
            </div>
            <h2 style={{ color: '#e8dcc8', fontSize: '24px', margin: '0 0 4px 0', textAlign: 'center', textShadow: txtShadow }}>
              {selectedRelic.name}
            </h2>
            <div style={{ color: '#cc8888', fontSize: '13px', marginBottom: '16px', textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
              [{selectedRelic.tier}]
            </div>
            <p style={{ color: '#b8a888', fontSize: '15px', lineHeight: '1.5', textAlign: 'center', margin: 0, textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
              {selectedRelic.description}
            </p>
          </div>
        </div>
      )}
    </>
  );
};
