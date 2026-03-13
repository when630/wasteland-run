import React, { useState, useEffect } from 'react';
import { useRunStore } from '../store/useRunStore';
import { UpgradeCardModal } from '../components/ui/UpgradeCardModal';
import { onRestOrEventEnter } from '../logic/relicEffects';
import restBg from '../assets/images/backgrounds/campfire_map_background.webp';
import { iconCampfire, iconCardUpgrade, iconHeart, iconBurn } from '../assets/images/GUI';
import { useResponsive } from '../hooks/useResponsive';

export const RestView: React.FC = () => {
  const { isMobile, height } = useResponsive();
  const isShortScreen = height < 500;
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

  const txtShadow = '1px 1px 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.5)';
  const txtShadowSub = '1px 1px 3px rgba(0,0,0,0.8)';

  return (
    <div style={{
      width: '100vw', minHeight: '100vh',
      backgroundImage: `url(${restBg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundBlendMode: 'overlay',
      backgroundColor: 'rgba(30, 18, 12, 0.55)',
      color: '#e8dcc8',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      overflowY: 'auto', padding: isMobile ? '24px 0' : '0',
    }}>
      <h1 style={{
        fontSize: isShortScreen ? '22px' : isMobile ? '28px' : '40px', color: '#e8a444',
        marginBottom: isShortScreen ? '4px' : '8px',
        textAlign: 'center', padding: '0 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
        textShadow: txtShadow,
        animation: 'fadeIn 0.6s ease-out',
      }}>
        <img src={iconBurn} alt="" style={{ width: isMobile ? 32 : 40, height: isMobile ? 32 : 40, objectFit: 'contain', filter: 'drop-shadow(0 0 8px rgba(232, 164, 68, 0.6))' }} />
        타오르는 모닥불
      </h1>
      <p style={{
        fontSize: isMobile ? '14px' : '17px', color: '#a09078',
        marginBottom: isShortScreen ? '12px' : isMobile ? '24px' : '36px',
        textAlign: 'center', padding: '0 16px',
        textShadow: txtShadowSub,
      }}>
        잠시 몸을 녹이고 정비할 시간입니다. 현재 HP: {playerHp}/{playerMaxHp}
      </p>

      {/* 구분선 */}
      <div style={{ width: isMobile ? '80vw' : '400px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(232, 164, 68, 0.3), transparent)', marginBottom: isShortScreen ? '12px' : '24px' }} />

      <div style={{
        display: 'flex', gap: isShortScreen ? '16px' : isMobile ? '12px' : '40px',
        flexDirection: isShortScreen ? 'row' : isMobile ? 'column' : 'row',
        alignItems: 'center', padding: '0 16px',
        animation: 'slideUp 0.5s ease-out',
      }}>
        {healResult === null ? (
          <>
            {/* 휴식 */}
            <button
              onClick={handleHeal}
              style={{
                background: 'none', border: 'none',
                cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: isShortScreen ? '12px' : isMobile ? '12px 20px' : '16px 28px',
                transition: 'all 0.25s', opacity: 1,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <img src={iconCampfire} alt="" style={{ width: isShortScreen ? 40 : isMobile ? 48 : 56, height: isShortScreen ? 40 : isMobile ? 48 : 56, objectFit: 'contain', marginBottom: isShortScreen ? '8px' : '12px', filter: 'drop-shadow(0 0 10px rgba(232, 164, 68, 0.6))' }} />
              <h2 style={{ margin: '0 0 6px 0', color: '#88dd88', fontSize: isShortScreen ? '18px' : '20px', textShadow: txtShadow }}>휴식</h2>
              <p style={{ margin: 0, color: '#8a9a8a', textAlign: 'center', fontSize: isShortScreen ? '12px' : '14px', lineHeight: '1.4', textShadow: txtShadowSub }}>
                최대 체력의 30%({Math.ceil(playerMaxHp * 0.3)})를 회복합니다.
              </p>
            </button>

            {/* 구분 */}
            <div style={{
              width: isShortScreen ? '1px' : isMobile ? '60%' : '1px',
              height: isShortScreen ? '80px' : isMobile ? '1px' : '80px',
              background: isShortScreen || !isMobile
                ? 'linear-gradient(180deg, transparent, rgba(160, 120, 60, 0.3), transparent)'
                : 'linear-gradient(90deg, transparent, rgba(160, 120, 60, 0.3), transparent)',
            }} />

            {/* 강화 */}
            <button
              onClick={handleUpgrade}
              disabled={!canUpgrade}
              style={{
                background: 'none', border: 'none',
                cursor: canUpgrade ? 'pointer' : 'not-allowed',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: isShortScreen ? '12px' : isMobile ? '12px 20px' : '16px 28px',
                transition: 'all 0.25s', opacity: canUpgrade ? 1 : 0.4,
              }}
              onMouseEnter={(e) => { if (canUpgrade) e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseLeave={(e) => { if (canUpgrade) e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <img src={iconCardUpgrade} alt="" style={{ width: isShortScreen ? 40 : isMobile ? 48 : 56, height: isShortScreen ? 40 : isMobile ? 48 : 56, objectFit: 'contain', marginBottom: isShortScreen ? '8px' : '12px', filter: canUpgrade ? 'drop-shadow(0 0 10px rgba(160, 100, 220, 0.6))' : 'brightness(0.4)' }} />
              <h2 style={{ margin: '0 0 6px 0', color: canUpgrade ? '#cc88ff' : '#555', fontSize: isShortScreen ? '18px' : '20px', textShadow: txtShadow }}>강화</h2>
              <p style={{ margin: 0, color: canUpgrade ? '#9a8aaa' : '#555', textAlign: 'center', fontSize: isShortScreen ? '12px' : '14px', lineHeight: '1.4', textShadow: txtShadowSub }}>
                {canUpgrade ? '덱의 카드 한 장을 선택하여 업그레이드 합니다.' : '균열된 태양석 반응로에 의해 강화할 수 없습니다.'}
              </p>
            </button>
          </>
        ) : (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: isShortScreen ? '10px' : '20px',
            padding: isShortScreen ? '12px' : isMobile ? '16px' : '24px',
            animation: 'slideUp 0.4s ease-out',
          }}>
            <img src={iconHeart} alt="" style={{ width: isShortScreen ? 40 : 56, height: isShortScreen ? 40 : 56, objectFit: 'contain', filter: 'drop-shadow(0 0 12px rgba(80, 220, 120, 0.6))' }} />
            <h2 style={{ fontSize: isShortScreen ? '24px' : '30px', color: '#66cc88', margin: 0, textShadow: txtShadow }}>회복 완료</h2>
            <p style={{ fontSize: isShortScreen ? '18px' : '22px', color: '#b8e8c8', margin: 0, textShadow: txtShadowSub }}>
              +{healResult} HP (현재 {useRunStore.getState().playerHp}/{playerMaxHp})
            </p>
            <button
              onClick={() => setScene('MAP')}
              style={{
                marginTop: '8px',
                padding: isShortScreen ? '10px 28px' : '12px 40px',
                fontSize: isShortScreen ? '15px' : '18px', fontWeight: 'bold',
                background: 'none', color: '#66cc88',
                border: '1px solid rgba(60, 180, 100, 0.4)',
                borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s',
                textShadow: txtShadow,
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(100, 220, 140, 0.6)'; e.currentTarget.style.color = '#88eebb'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(60, 180, 100, 0.4)'; e.currentTarget.style.color = '#66cc88'; }}
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
