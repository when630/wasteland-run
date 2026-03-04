import React, { useState } from 'react';
import { useRunStore } from '../store/useRunStore';
import { UpgradeCardModal } from '../components/ui/UpgradeCardModal';

export const RestView: React.FC = () => {
  const { playerHp, playerMaxHp, healPlayer, setScene } = useRunStore();
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  const handleHeal = async () => {
    // 최대 체력의 30% 회복 (올림 처리)
    const healAmount = Math.ceil(playerMaxHp * 0.3);
    healPlayer(healAmount);

    // 임시로 회복 즉시 맵 반환 (추후 연출 후 버튼으로 나가도록 개선 가능)
    setScene('MAP');
    await useRunStore.getState().saveRunData();
  };

  const handleUpgrade = () => {
    setIsUpgradeModalOpen(true);
  };

  return (
    <div style={{
      width: '100vw', height: '100vh', backgroundColor: '#1e1410', color: '#fff',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
    }}>
      <h1 style={{ fontSize: '48px', color: '#ffaa66', marginBottom: '10px' }}>
        🔥 타오르는 모닥불
      </h1>
      <p style={{ fontSize: '20px', color: '#ccc', marginBottom: '50px' }}>
        잠시 몸을 녹이고 정비할 시간입니다. 현재 HP: {playerHp}/{playerMaxHp}
      </p>

      <div style={{ display: 'flex', gap: '30px' }}>
        <button
          onClick={handleHeal}
          style={{
            width: '240px', height: '300px', backgroundColor: '#2a1f1a',
            border: '2px solid #5a3f2a', borderRadius: '12px', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3a2f2a'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2a1f1a'}
        >
          <span style={{ fontSize: '64px', marginBottom: '20px' }}>🛌</span>
          <h2 style={{ margin: '0 0 10px 0', color: '#88ff88' }}>휴식</h2>
          <p style={{ margin: 0, color: '#aaa', padding: '0 20px', textAlign: 'center' }}>
            최대 체력의 30%({Math.ceil(playerMaxHp * 0.3)})를 회복합니다.
          </p>
        </button>

        <button
          onClick={handleUpgrade}
          style={{
            width: '240px', height: '300px', backgroundColor: '#2a1f1a',
            border: '2px solid #5a3f2a', borderRadius: '12px', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3a2f2a'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2a1f1a'}
        >
          <span style={{ fontSize: '64px', marginBottom: '20px' }}>🔨</span>
          <h2 style={{ margin: '0 0 10px 0', color: '#ff88ff' }}>강화 (예정)</h2>
          <p style={{ margin: 0, color: '#aaa', padding: '0 20px', textAlign: 'center' }}>
            덱의 카드 한 장을 선택하여 업그레이드 합니다.
          </p>
        </button>
      </div>

      {isUpgradeModalOpen && (
        <UpgradeCardModal
          onClose={() => setIsUpgradeModalOpen(false)}
          onUpgradeComplete={() => {
            setIsUpgradeModalOpen(false);
            setScene('MAP'); // 완료 후 맵 이동
          }}
        />
      )}
    </div>
  );
};
