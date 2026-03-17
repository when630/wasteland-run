import React, { useState, useMemo } from 'react';
import { useRunStore } from '../../store/useRunStore';
import { useRngStore } from '../../store/useRngStore';
import { RELICS } from '../../assets/data/relics';
import type { Relic } from '../../types/relicTypes';

interface BossRelicPickModalProps {
  onComplete: () => void;
}

export const BossRelicPickModal: React.FC<BossRelicPickModalProps> = ({ onComplete }) => {
  const { addRelic, relics: ownedRelics, setToastMessage } = useRunStore();
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  // 보스 유물 3개 랜덤 선택 (이미 보유한 유물 제외)
  const choices = useMemo<Relic[]>(() => {
    const lootRng = useRngStore.getState().lootRng;
    const available = RELICS.filter(r => r.tier === 'BOSS' && !ownedRelics.includes(r.id));
    const shuffled = lootRng.shuffle(available);
    return shuffled.slice(0, Math.min(3, shuffled.length));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePick = (relic: Relic) => {
    addRelic(relic.id);
    setToastMessage(`[${relic.name}] 보스 유물 획득! 턴당 AP +1`);
    useRunStore.getState().saveRunData();
    onComplete();
  };

  const iconW = 56;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(5, 3, 0, 0.94)', zIndex: 9999,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeIn 0.5s ease-out',
    }}>
      <h2 style={{
        fontSize: '36px', color: '#d4a854',
        marginBottom: '8px',
        textShadow: '2px 2px 6px rgba(0,0,0,0.9), 0 0 20px rgba(212, 168, 84, 0.3)',
      }}>
        보스 유물 선택
      </h2>
      <p style={{ fontSize: '16px', color: '#8a7e6a', marginBottom: '32px' }}>
        보스가 남긴 유물 중 하나를 선택하세요. 모든 보스 유물은 턴당 AP +1과 함께 고유한 페널티를 가집니다.
      </p>

      {choices.length > 0 ? (
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {choices.map((relic, idx) => {
            const isSelected = selectedIdx === idx;
            return (
              <div
                key={relic.id}
                onClick={() => setSelectedIdx(idx)}
                style={{
                  width: '240px',
                  padding: '20px 16px',
                  border: `2px solid ${isSelected ? '#d4a854' : 'rgba(120, 80, 40, 0.4)'}`,
                  borderRadius: '10px',
                  backgroundColor: isSelected ? 'rgba(212, 168, 84, 0.08)' : 'rgba(0,0,0,0.4)',
                  cursor: 'pointer',
                  transition: 'all 0.25s',
                  transform: isSelected ? 'translateY(-6px) scale(1.03)' : 'translateY(0)',
                  boxShadow: isSelected ? '0 8px 30px rgba(212, 168, 84, 0.2)' : '0 2px 8px rgba(0,0,0,0.5)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
                }}
                onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.borderColor = 'rgba(180, 130, 60, 0.6)'; e.currentTarget.style.transform = 'translateY(-3px)'; } }}
                onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.borderColor = 'rgba(120, 80, 40, 0.4)'; e.currentTarget.style.transform = 'translateY(0)'; } }}
              >
                <div style={{
                  width: iconW, height: iconW,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {relic.image
                    ? <img src={relic.image} alt={relic.name} style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 0 8px rgba(212, 168, 84, 0.4))' }} />
                    : <span style={{ fontSize: '40px' }}>{relic.icon}</span>
                  }
                </div>
                <h3 style={{ margin: 0, fontSize: '18px', color: '#e8dcc8', textAlign: 'center' }}>
                  {relic.name}
                </h3>
                <p style={{ margin: 0, fontSize: '12px', color: '#a09888', textAlign: 'center', lineHeight: '1.5' }}>
                  {relic.description}
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <p style={{ fontSize: '16px', color: '#666' }}>선택 가능한 보스 유물이 없습니다.</p>
      )}

      <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
        <button
          onClick={onComplete}
          style={{
            padding: '12px 30px', fontSize: '16px',
            background: 'none', color: '#a09078',
            border: '1px solid rgba(120, 100, 70, 0.4)',
            borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(180, 150, 100, 0.6)'; e.currentTarget.style.color = '#c8b898'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(120, 100, 70, 0.4)'; e.currentTarget.style.color = '#a09078'; }}
        >
          건너뛰기
        </button>
        {selectedIdx !== null && (
          <button
            onClick={() => handlePick(choices[selectedIdx])}
            style={{
              padding: '12px 40px', fontSize: '18px', fontWeight: 'bold',
              background: 'none', color: '#d4a854',
              border: '2px solid rgba(212, 168, 84, 0.5)',
              borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s',
              textShadow: '0 0 10px rgba(212, 168, 84, 0.3)',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#d4a854'; e.currentTarget.style.transform = 'scale(1.05)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(212, 168, 84, 0.5)'; e.currentTarget.style.transform = 'scale(1)'; }}
          >
            선택하기
          </button>
        )}
      </div>
    </div>
  );
};
