import React, { useState } from 'react';
import { useRunStore } from '../../store/useRunStore';
import { RELICS } from '../../assets/data/relics';
import type { Relic, RelicTier } from '../../types/relicTypes';

interface RelicRewardModalProps {
  onClose: () => void;
  onRelicSelected: () => void;
  guaranteedTier?: RelicTier; // 'BOSS' 등이 넘어오면 보스 유물만 필터링
}

export const RelicRewardModal: React.FC<RelicRewardModalProps> = ({ onClose, onRelicSelected, guaranteedTier }) => {
  const { addRelic, relics: ownedRelics, setToastMessage } = useRunStore();

  // 초기 렌더링 시 조건에 맞는 유물을 식별하여 무작위로 1개(또는 n개) 추출
  // 현재는 승리 보상으로 1개만 뜨고 획득/스킵 하는 구조로 작성합니다.
  const [rewardRelic] = useState<Relic | null>(() => {
    // 1. 이미 보유 중인 유물 제외
    let available = RELICS.filter(r => !ownedRelics.includes(r.id));

    // 2. 등급 조건이 있다면 필터링 (기본 엘리트는 COMMON/UNCOMMON/RARE 중, 보스는 BOSS 중)
    if (guaranteedTier === 'BOSS') {
      available = available.filter(r => r.tier === 'BOSS');
    } else {
      available = available.filter(r => r.tier !== 'BOSS');
    }

    if (available.length === 0) return null; // 더 이상 얻을 유물이 없음

    // 무작위 1개 셔플 & 픽
    const randomIdx = Math.floor(Math.random() * available.length);
    return available[randomIdx];
  });

  const handleSelectRelic = (relicId: string) => {
    addRelic(relicId);
    setToastMessage('🏺 새로운 유물의 힘이 깨어납니다!');
    onRelicSelected();
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
    }}>
      <h2 style={{ fontSize: '36px', color: '#ffaaaa', marginBottom: '30px' }}>
        📦 전리품: 숨겨진 유물 발견
      </h2>

      {rewardRelic ? (
        <>
          <p style={{ fontSize: '18px', color: '#ccc', marginBottom: '40px' }}>
            {guaranteedTier === 'BOSS' ? '보스가 남긴 진귀한 유물입니다.' : '먼지 구덩이 속에서 신기한 물건을 발견했습니다.'}
          </p>
          <div
            onClick={() => handleSelectRelic(rewardRelic.id)}
            style={{
              width: '280px', height: '220px',
              backgroundColor: '#3a2a2a', border: '2px solid #b04a4a', borderRadius: '12px',
              padding: '20px', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              transition: 'transform 0.2s', boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-15px) scale(1.05)';
              e.currentTarget.style.borderColor = '#ffaaaa';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.borderColor = '#b04a4a';
            }}
          >
            <span style={{ width: '64px', height: '64px', marginBottom: '15px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {rewardRelic.image ? <img src={rewardRelic.image} alt={rewardRelic.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <span style={{ fontSize: '64px' }}>{rewardRelic.icon}</span>}
            </span>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '24px', color: '#fff', textAlign: 'center' }}>
              {rewardRelic.name}
              <span style={{ fontSize: '12px', color: '#ffaaaa', marginLeft: '8px', verticalAlign: 'middle' }}>[{rewardRelic.tier}]</span>
            </h3>
            <p style={{ color: '#ddd', fontSize: '15px', textAlign: 'center', lineHeight: '1.4', margin: 0 }}>
              {rewardRelic.description}
            </p>
          </div>
        </>
      ) : (
        <p style={{ fontSize: '18px', color: '#ccc', marginBottom: '40px' }}>
          더 이상 이 구역에서 획득할 수 있는 유물이 없습니다.
        </p>
      )}

      <button
        onClick={() => {
          onRelicSelected(); // 건너뛰어도 보상 처리 완료로 마킹
          onClose();
        }}
        style={{
          marginTop: '50px', padding: '10px 30px', fontSize: '18px',
          backgroundColor: '#444', color: '#fff', border: '1px solid #666',
          borderRadius: '8px', cursor: 'pointer'
        }}
      >
        건너뛰기 (가져가지 않음)
      </button>
    </div>
  );
};
