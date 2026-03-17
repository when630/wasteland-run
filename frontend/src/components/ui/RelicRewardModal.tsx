import React, { useState } from 'react';
import { useRunStore } from '../../store/useRunStore';
import { useRngStore } from '../../store/useRngStore';
import { RELICS } from '../../assets/data/relics';
import type { Relic, RelicTier } from '../../types/relicTypes';
import { iconRelicReward } from '../../assets/images/GUI';

interface RelicRewardModalProps {
  onClose: () => void;
  onRelicSelected: () => void;
  guaranteedTier?: RelicTier;
}

export const RelicRewardModal: React.FC<RelicRewardModalProps> = ({ onClose, onRelicSelected, guaranteedTier }) => {
  const { addRelic, relics: ownedRelics, setToastMessage } = useRunStore();

  const [rewardRelic] = useState<Relic | null>(() => {
    let available = RELICS.filter(r => !ownedRelics.includes(r.id));

    if (guaranteedTier === 'BOSS') {
      available = available.filter(r => r.tier === 'BOSS');
    } else {
      available = available.filter(r => r.tier !== 'BOSS');
    }

    if (available.length === 0) return null;

    const lootRng = useRngStore.getState().lootRng;
    return available[lootRng.nextInt(available.length)];
  });

  const handleSelectRelic = (relicId: string) => {
    addRelic(relicId);
    setToastMessage('새로운 유물의 힘이 깨어납니다!');
    onRelicSelected();
    onClose();
  };

  const iconW = 64;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(5, 5, 3, 0.92)', zIndex: 2000,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeIn 0.3s ease-out',
    }}>
      <h2 style={{
        fontSize: '32px', color: '#cc8888',
        marginBottom: '20px',
        display: 'flex', alignItems: 'center', gap: '10px',
        textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
      }}>
        <img src={iconRelicReward} alt="" style={{ width: 36, height: 36, objectFit: 'contain', filter: 'drop-shadow(0 0 6px rgba(200, 80, 80, 0.5))' }} />
        숨겨진 유물 발견
      </h2>

      {rewardRelic ? (
        <>
          <p style={{ fontSize: '16px', color: '#8a7e6a', marginBottom: '35px' }}>
            {guaranteedTier === 'BOSS' ? '보스가 남긴 진귀한 유물입니다.' : '먼지 구덩이 속에서 신기한 물건을 발견했습니다.'}
          </p>
          <div
            onClick={() => handleSelectRelic(rewardRelic.id)}
            style={{
              width: '280px',
              maxWidth: '280px',
              minHeight: '200px',
              background: 'none',
              border: '1px solid rgba(180, 80, 80, 0.4)',
              borderRadius: '6px',
              padding: '24px',
              cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.25s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-10px) scale(1.03)';
              e.currentTarget.style.borderColor = 'rgba(220, 120, 120, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.borderColor = 'rgba(180, 80, 80, 0.4)';
            }}
          >
            <span style={{ width: `${iconW}px`, height: `${iconW}px`, marginBottom: '15px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {rewardRelic.image
                ? <img src={rewardRelic.image} alt={rewardRelic.name} style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 0 8px rgba(200, 100, 100, 0.4))' }} />
                : <span style={{ fontSize: '56px' }}>{rewardRelic.icon}</span>
              }
            </span>
            <h3 style={{
              margin: '0 0 4px 0',
              fontSize: '22px',
              color: '#e8dcc8', textAlign: 'center',
              textShadow: '1px 1px 3px rgba(0,0,0,0.6)',
            }}>
              {rewardRelic.name}
              <span style={{ fontSize: '11px', color: '#cc8888', marginLeft: '6px', verticalAlign: 'middle' }}>[{rewardRelic.tier}]</span>
            </h3>
            <p style={{ color: '#a09888', fontSize: '14px', textAlign: 'center', lineHeight: '1.5', margin: 0 }}>
              {rewardRelic.description}
            </p>
          </div>
        </>
      ) : (
        <p style={{ fontSize: '16px', color: '#8a7e6a', marginBottom: '35px' }}>
          더 이상 이 구역에서 획득할 수 있는 유물이 없습니다.
        </p>
      )}

      <button
        onClick={() => {
          onRelicSelected();
          onClose();
        }}
        style={{
          marginTop: '45px',
          padding: '10px 30px',
          fontSize: '16px',
          background: 'none', color: '#a09078',
          border: '1px solid rgba(120, 100, 70, 0.4)',
          borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s',
          textShadow: '1px 1px 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.5)',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(180, 150, 100, 0.6)'; e.currentTarget.style.color = '#c8b898'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(120, 100, 70, 0.4)'; e.currentTarget.style.color = '#a09078'; }}
      >
        건너뛰기
      </button>
    </div>
  );
};
