import React, { useState, useEffect } from 'react';
import { useRunStore } from '../store/useRunStore';
import { UpgradeCardModal } from '../components/ui/UpgradeCardModal';
import restBg from '../assets/images/campfire_map_background.png';

export const RestView: React.FC = () => {
  const { playerHp, playerMaxHp, healPlayer, setScene, relics } = useRunStore();
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [healResult, setHealResult] = useState<number | null>(null); // 🌟 회복 연출 상태

  // 🌟 유물 효과: [불에 탄 작전 지도] 모닥불 진입 시 최대 체력 5% 회복
  useEffect(() => {
    if (relics.includes('burnt_operation_map')) {
      const healAmount = Math.ceil(playerMaxHp * 0.05);
      healPlayer(healAmount);
      useRunStore.getState().setToastMessage(`불에 탄 작전 지도 — 체력 ${healAmount} 회복!`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🌟 유물 효과: [균열된 태양석 반응로] 강화 불가
  const canUpgrade = !relics.includes('cracked_sunstone_reactor');

  const handleHeal = async () => {
    const healAmount = Math.ceil(playerMaxHp * 0.3);
    const actualHeal = Math.min(healAmount, playerMaxHp - playerHp); // 실제 회복량 (오버힐 방지)
    healPlayer(healAmount);
    setHealResult(actualHeal); // 🌟 결과 화면 표시
    await useRunStore.getState().saveRunData();
  };

  const handleUpgrade = () => {
    setIsUpgradeModalOpen(true);
  };

  return (
    <div style={{
      width: '100vw', height: '100vh',
      backgroundImage: `url(${restBg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundBlendMode: 'overlay',
      backgroundColor: 'rgba(30, 20, 16, 0.6)',
      color: '#fff',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
    }}>
      <h1 style={{ fontSize: '48px', color: '#ffaa66', marginBottom: '10px' }}>
        🔥 타오르는 모닥불
      </h1>
      <p style={{ fontSize: '20px', color: '#ccc', marginBottom: '50px' }}>
        잠시 몸을 녹이고 정비할 시간입니다. 현재 HP: {playerHp}/{playerMaxHp}
      </p>

      <div style={{ display: 'flex', gap: '30px' }}>
        {/* 🌟 회복 결과 연출이 없을 때만 선택지 표시 */}
        {healResult === null ? (
          <>
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
              disabled={!canUpgrade}
              style={{
                width: '240px', height: '300px', backgroundColor: canUpgrade ? '#2a1f1a' : '#1a1a1a',
                border: `2px solid ${canUpgrade ? '#5a3f2a' : '#333'}`, borderRadius: '12px',
                cursor: canUpgrade ? 'pointer' : 'not-allowed',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s', opacity: canUpgrade ? 1 : 0.5
              }}
              onMouseEnter={(e) => { if (canUpgrade) e.currentTarget.style.backgroundColor = '#3a2f2a'; }}
              onMouseLeave={(e) => { if (canUpgrade) e.currentTarget.style.backgroundColor = '#2a1f1a'; }}
            >
              <span style={{ fontSize: '64px', marginBottom: '20px' }}>🔨</span>
              <h2 style={{ margin: '0 0 10px 0', color: canUpgrade ? '#ff88ff' : '#666' }}>강화</h2>
              <p style={{ margin: 0, color: '#aaa', padding: '0 20px', textAlign: 'center' }}>
                {canUpgrade ? '덱의 카드 한 장을 선택하여 업그레이드 합니다.' : '균열된 태양석 반응로에 의해 강화할 수 없습니다.'}
              </p>
            </button>
          </>
        ) : (
          /* 🌟 회복 결과 연출 */
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px',
            backgroundColor: 'rgba(0, 80, 40, 0.6)', padding: '50px 80px', borderRadius: '16px',
            border: '2px solid #22c55e', animation: 'fadeIn 0.5s ease-out'
          }}>
            <span style={{ fontSize: '72px' }}>💚</span>
            <h2 style={{ fontSize: '36px', color: '#4ade80', margin: 0 }}>회복 완료!</h2>
            <p style={{ fontSize: '28px', color: '#bbf7d0', margin: 0 }}>
              +{healResult} HP 회복 (현재 {useRunStore.getState().playerHp}/{playerMaxHp})
            </p>
            <button
              onClick={async () => { setScene('MAP'); }}
              style={{
                marginTop: '10px', padding: '15px 50px', fontSize: '20px', fontWeight: 'bold',
                backgroundColor: '#166534', color: '#fff', border: '2px solid #22c55e',
                borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#15803d'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#166534'}
            >
              길을 떠난다 🗺️
            </button>
          </div>
        )}
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
