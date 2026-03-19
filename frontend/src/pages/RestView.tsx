import React, { useState, useEffect, useRef } from 'react';
import { useRunStore } from '../store/useRunStore';
import { UpgradeCardModal } from '../components/ui/UpgradeCardModal';
import { RemoveCardModal } from '../components/ui/RemoveCardModal';
import { onRestOrEventEnter } from '../logic/relicEffects';
import { getMutationModifiers } from '../logic/mutationModifiers';
import restBg from '../assets/images/backgrounds/campfire_map_background.webp';
import { iconCampfire, iconCardUpgrade, iconHeart, iconBurn, iconCardRemove } from '../assets/images/GUI';

export const RestView: React.FC = () => {
  const playerHp = useRunStore(s => s.playerHp);
  const playerMaxHp = useRunStore(s => s.playerMaxHp);
  const healPlayer = useRunStore(s => s.healPlayer);
  const setScene = useRunStore(s => s.setScene);
  const relics = useRunStore(s => s.relics);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [healResult, setHealResult] = useState<number | null>(null);

  const relicEffects = onRestOrEventEnter(relics, playerMaxHp);
  const canUpgrade = relicEffects.canUpgrade;
  const canRemoveCard = relicEffects.canRemoveCard;
  const hasManual = relics.includes('forgotten_manual');
  const [upgradeCount, setUpgradeCount] = useState(0);
  const maxUpgrades = hasManual ? 2 : 1;
  const upgradeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (relicEffects.healAmount > 0) {
      healPlayer(relicEffects.healAmount);
      useRunStore.getState().setToastMessage(`불에 탄 작전 지도 — 체력 ${relicEffects.healAmount} 회복!`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (upgradeTimerRef.current) clearTimeout(upgradeTimerRef.current);
    };
  }, []);

  const handleHeal = async () => {
    const mutMod = getMutationModifiers(useRunStore.getState().mutationStage);
    const baseRate = (0.3 + relicEffects.restHealBonus) * (1 - mutMod.restHealReduction);
    const healAmount = Math.ceil(playerMaxHp * baseRate);
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
      overflowY: 'auto', padding: '0',
    }}>
      <h1 style={{
        fontSize: '40px', color: '#e8a444',
        marginBottom: '8px',
        textAlign: 'center', padding: '0 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
        textShadow: txtShadow,
        animation: 'fadeIn 0.6s ease-out',
      }}>
        <img src={iconBurn} alt="" style={{ width: 40, height: 40, objectFit: 'contain', filter: 'drop-shadow(0 0 8px rgba(232, 164, 68, 0.6))' }} />
        타오르는 모닥불
      </h1>
      <p style={{
        fontSize: '17px', color: '#a09078',
        marginBottom: '36px',
        textAlign: 'center', padding: '0 16px',
        textShadow: txtShadowSub,
      }}>
        잠시 몸을 녹이고 정비할 시간입니다. 현재 HP: {playerHp}/{playerMaxHp}
      </p>

      {/* 구분선 */}
      <div style={{ width: '400px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(232, 164, 68, 0.3), transparent)', marginBottom: '24px' }} />

      <div style={{
        display: 'flex', gap: '40px',
        flexDirection: 'row',
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
                padding: '16px 28px',
                transition: 'all 0.25s', opacity: 1,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <img src={iconCampfire} alt="" style={{ width: 56, height: 56, objectFit: 'contain', marginBottom: '12px', filter: 'drop-shadow(0 0 10px rgba(232, 164, 68, 0.6))' }} />
              <h2 style={{ margin: '0 0 6px 0', color: '#88dd88', fontSize: '20px', textShadow: txtShadow }}>휴식</h2>
              <p style={{ margin: 0, color: '#8a9a8a', textAlign: 'center', fontSize: '14px', lineHeight: '1.4', textShadow: txtShadowSub }}>
                최대 체력의 {Math.round((0.3 + relicEffects.restHealBonus) * 100)}%({Math.ceil(playerMaxHp * (0.3 + relicEffects.restHealBonus))})를 회복합니다.
              </p>
            </button>

            {/* 구분 */}
            <div style={{
              width: '1px',
              height: '80px',
              background: 'linear-gradient(180deg, transparent, rgba(160, 120, 60, 0.3), transparent)',
            }} />

            {/* 강화 */}
            <button
              onClick={handleUpgrade}
              disabled={!canUpgrade}
              style={{
                background: 'none', border: 'none',
                cursor: canUpgrade ? 'pointer' : 'not-allowed',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '16px 28px',
                transition: 'all 0.25s', opacity: canUpgrade ? 1 : 0.4,
              }}
              onMouseEnter={(e) => { if (canUpgrade) e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseLeave={(e) => { if (canUpgrade) e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <img src={iconCardUpgrade} alt="" style={{ width: 56, height: 56, objectFit: 'contain', marginBottom: '12px', filter: canUpgrade ? 'drop-shadow(0 0 10px rgba(160, 100, 220, 0.6))' : 'brightness(0.4)' }} />
              <h2 style={{ margin: '0 0 6px 0', color: canUpgrade ? '#cc88ff' : '#555', fontSize: '20px', textShadow: txtShadow }}>강화</h2>
              <p style={{ margin: 0, color: canUpgrade ? '#9a8aaa' : '#555', textAlign: 'center', fontSize: '14px', lineHeight: '1.4', textShadow: txtShadowSub }}>
                {canUpgrade ? '덱의 카드 한 장을 선택하여 업그레이드 합니다.' : '균열된 태양석 반응로에 의해 강화할 수 없습니다.'}
              </p>
            </button>

            {/* 카드 제거 (만능 수리 도구 유물) */}
            {canRemoveCard && (
              <>
                <div style={{
                  width: '1px',
                  height: '80px',
                  background: 'linear-gradient(180deg, transparent, rgba(160, 120, 60, 0.3), transparent)',
                }} />
                <button
                  onClick={() => setIsRemoveModalOpen(true)}
                  style={{
                    background: 'none', border: 'none',
                    cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    padding: '16px 28px',
                    transition: 'all 0.25s', opacity: 1,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <img src={iconCardRemove} alt="" style={{ width: 56, height: 56, objectFit: 'contain', marginBottom: '12px', filter: 'drop-shadow(0 0 10px rgba(220, 80, 80, 0.6))' }} />
                  <h2 style={{ margin: '0 0 6px 0', color: '#dd8888', fontSize: '20px', textShadow: txtShadow }}>카드 제거</h2>
                  <p style={{ margin: 0, color: '#9a8a8a', textAlign: 'center', fontSize: '14px', lineHeight: '1.4', textShadow: txtShadowSub }}>
                    덱의 카드 한 장을 영구 제거합니다.
                  </p>
                </button>
              </>
            )}
          </>
        ) : (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px',
            padding: '24px',
            animation: 'slideUp 0.4s ease-out',
          }}>
            <img src={iconHeart} alt="" style={{ width: 56, height: 56, objectFit: 'contain', filter: 'drop-shadow(0 0 12px rgba(80, 220, 120, 0.6))' }} />
            <h2 style={{ fontSize: '30px', color: '#66cc88', margin: 0, textShadow: txtShadow }}>회복 완료</h2>
            <p style={{ fontSize: '22px', color: '#b8e8c8', margin: 0, textShadow: txtShadowSub }}>
              +{healResult} HP (현재 {useRunStore.getState().playerHp}/{playerMaxHp})
            </p>
            <button
              onClick={() => setScene('MAP')}
              style={{
                marginTop: '8px',
                padding: '12px 40px',
                fontSize: '18px', fontWeight: 'bold',
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
            const newCount = upgradeCount + 1;
            setUpgradeCount(newCount);
            setIsUpgradeModalOpen(false);
            if (hasManual && newCount < maxUpgrades) {
              // 잊혀진 기술서: 2번째 강화 가능
              useRunStore.getState().setToastMessage(`잊혀진 기술서 — 강화 ${newCount}/${maxUpgrades} 완료! 한 번 더 강화 가능!`);
              upgradeTimerRef.current = setTimeout(() => setIsUpgradeModalOpen(true), 300);
            } else {
              if (hasManual) {
                useRunStore.getState().removeRelic('forgotten_manual');
                useRunStore.getState().setToastMessage('잊혀진 기술서 소모 — 2장 강화 완료!');
              }
              setScene('MAP');
            }
          }}
        />
      )}
      {isRemoveModalOpen && (
        <RemoveCardModal
          onClose={() => setIsRemoveModalOpen(false)}
          onRemoveComplete={() => {
            setIsRemoveModalOpen(false);
            setScene('MAP');
          }}
        />
      )}
    </div>
  );
};
