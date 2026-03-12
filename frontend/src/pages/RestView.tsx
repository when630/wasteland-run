import React, { useState, useEffect } from 'react';
import { useRunStore } from '../store/useRunStore';
import { UpgradeCardModal } from '../components/ui/UpgradeCardModal';
import { onRestOrEventEnter } from '../logic/relicEffects';
import restBg from '../assets/images/backgrounds/campfire_map_background.png';
import { iconRest, iconCardUpgrade, iconHeart } from '../assets/images/GUI';
import { useResponsive } from '../hooks/useResponsive';

export const RestView: React.FC = () => {
  const { isMobile } = useResponsive();
  const { playerHp, playerMaxHp, healPlayer, setScene, relics } = useRunStore();
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [healResult, setHealResult] = useState<number | null>(null);

  const relicEffects = onRestOrEventEnter(relics, playerMaxHp);
  const canUpgrade = relicEffects.canUpgrade;

  useEffect(() => {
    if (relicEffects.healAmount > 0) {
      healPlayer(relicEffects.healAmount);
      useRunStore.getState().setToastMessage(`불에 탄 작전 지도 — 체력 ${relicEffects.healAmount} 회복!`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleHeal = async () => {
    const healAmount = Math.ceil(playerMaxHp * 0.3);
    const actualHeal = Math.min(healAmount, playerMaxHp - playerHp);
    healPlayer(healAmount);
    setHealResult(actualHeal);
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
      backgroundColor: 'rgba(30, 18, 12, 0.55)',
      color: '#e8dcc8',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    }}>
      <h1 style={{
        fontSize: isMobile ? '28px' : '44px', color: '#e8a444', marginBottom: '8px',
        textAlign: 'center', padding: '0 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
        textShadow: '2px 3px 6px rgba(0,0,0,0.8), 0 0 20px rgba(232, 164, 68, 0.3)',
        animation: 'fadeIn 0.6s ease-out',
      }}>
        <img src={iconRest} alt="" style={{ width: isMobile ? 32 : 44, height: isMobile ? 32 : 44, objectFit: 'contain', filter: 'drop-shadow(0 0 8px rgba(232, 164, 68, 0.6))' }} />
        타오르는 모닥불
      </h1>
      <p style={{
        fontSize: isMobile ? '14px' : '18px', color: '#a09078',
        marginBottom: isMobile ? '24px' : '45px', textAlign: 'center', padding: '0 16px',
      }}>
        잠시 몸을 녹이고 정비할 시간입니다. 현재 HP: {playerHp}/{playerMaxHp}
      </p>

      <div style={{
        display: 'flex', gap: isMobile ? '16px' : '28px',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: 'center', padding: '0 16px',
        animation: 'slideUp 0.5s ease-out',
      }}>
        {healResult === null ? (
          <>
            {/* 휴식 버튼 */}
            <button
              onClick={handleHeal}
              style={{
                width: isMobile ? '80vw' : '220px', height: isMobile ? '180px' : '280px',
                backgroundColor: 'rgba(25, 40, 25, 0.85)',
                border: '1px solid rgba(80, 180, 80, 0.3)',
                borderRadius: '10px', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.25s',
                boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(35, 55, 35, 0.9)';
                e.currentTarget.style.borderColor = 'rgba(100, 220, 100, 0.5)';
                e.currentTarget.style.boxShadow = '0 0 25px rgba(80, 180, 80, 0.2)';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(25, 40, 25, 0.85)';
                e.currentTarget.style.borderColor = 'rgba(80, 180, 80, 0.3)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.4)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <img src={iconRest} alt="" style={{ width: 56, height: 56, objectFit: 'contain', marginBottom: '16px', filter: 'drop-shadow(0 0 8px rgba(232, 164, 68, 0.5))' }} />
              <h2 style={{ margin: '0 0 8px 0', color: '#88dd88', fontSize: '20px', textShadow: '1px 1px 3px rgba(0,0,0,0.6)' }}>휴식</h2>
              <p style={{ margin: 0, color: '#8a9a8a', padding: '0 16px', textAlign: 'center', fontSize: '14px', lineHeight: '1.4' }}>
                최대 체력의 30%({Math.ceil(playerMaxHp * 0.3)})를 회복합니다.
              </p>
            </button>

            {/* 강화 버튼 */}
            <button
              onClick={handleUpgrade}
              disabled={!canUpgrade}
              style={{
                width: isMobile ? '80vw' : '220px', height: isMobile ? '180px' : '280px',
                backgroundColor: canUpgrade ? 'rgba(35, 20, 45, 0.85)' : 'rgba(20, 18, 16, 0.6)',
                border: `1px solid ${canUpgrade ? 'rgba(160, 100, 220, 0.3)' : 'rgba(60, 50, 40, 0.3)'}`,
                borderRadius: '10px',
                cursor: canUpgrade ? 'pointer' : 'not-allowed',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.25s', opacity: canUpgrade ? 1 : 0.5,
                boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
              }}
              onMouseEnter={(e) => {
                if (canUpgrade) {
                  e.currentTarget.style.backgroundColor = 'rgba(50, 30, 65, 0.9)';
                  e.currentTarget.style.borderColor = 'rgba(180, 120, 255, 0.5)';
                  e.currentTarget.style.boxShadow = '0 0 25px rgba(160, 100, 220, 0.2)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }
              }}
              onMouseLeave={(e) => {
                if (canUpgrade) {
                  e.currentTarget.style.backgroundColor = 'rgba(35, 20, 45, 0.85)';
                  e.currentTarget.style.borderColor = 'rgba(160, 100, 220, 0.3)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.4)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              <img src={iconCardUpgrade} alt="" style={{ width: 56, height: 56, objectFit: 'contain', marginBottom: '16px', filter: canUpgrade ? 'drop-shadow(0 0 8px rgba(160, 100, 220, 0.5))' : 'brightness(0.4)' }} />
              <h2 style={{ margin: '0 0 8px 0', color: canUpgrade ? '#cc88ff' : '#555', fontSize: '20px', textShadow: '1px 1px 3px rgba(0,0,0,0.6)' }}>강화</h2>
              <p style={{ margin: 0, color: canUpgrade ? '#9a8aaa' : '#555', padding: '0 16px', textAlign: 'center', fontSize: '14px', lineHeight: '1.4' }}>
                {canUpgrade ? '덱의 카드 한 장을 선택하여 업그레이드 합니다.' : '균열된 태양석 반응로에 의해 강화할 수 없습니다.'}
              </p>
            </button>
          </>
        ) : (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px',
            backgroundColor: 'rgba(15, 50, 30, 0.85)', padding: isMobile ? '24px' : '45px 70px', borderRadius: '10px',
            border: '1px solid rgba(60, 180, 100, 0.4)',
            boxShadow: '0 0 30px rgba(60, 180, 100, 0.15)',
            animation: 'slideUp 0.4s ease-out',
          }}>
            <img src={iconHeart} alt="" style={{ width: 64, height: 64, objectFit: 'contain', filter: 'drop-shadow(0 0 10px rgba(80, 220, 120, 0.5))' }} />
            <h2 style={{ fontSize: '32px', color: '#66cc88', margin: 0, textShadow: '1px 2px 4px rgba(0,0,0,0.6)' }}>회복 완료</h2>
            <p style={{ fontSize: '24px', color: '#b8e8c8', margin: 0 }}>
              +{healResult} HP (현재 {useRunStore.getState().playerHp}/{playerMaxHp})
            </p>
            <button
              onClick={() => setScene('MAP')}
              style={{
                marginTop: '8px', padding: '14px 45px', fontSize: '18px', fontWeight: 'bold',
                backgroundColor: 'rgba(25, 70, 40, 0.9)', color: '#c8e8d4',
                border: '1px solid rgba(60, 180, 100, 0.4)',
                borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(35, 90, 55, 0.95)'; e.currentTarget.style.boxShadow = '0 0 15px rgba(60, 180, 100, 0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(25, 70, 40, 0.9)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              길을 떠난다
            </button>
          </div>
        )}
      </div>

      {isUpgradeModalOpen && (
        <UpgradeCardModal
          onClose={() => setIsUpgradeModalOpen(false)}
          onUpgradeComplete={() => {
            setIsUpgradeModalOpen(false);
            setScene('MAP');
          }}
        />
      )}
    </div>
  );
};
