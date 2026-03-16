import React, { useState, useEffect, useMemo } from 'react';
import { useRunStore } from '../store/useRunStore';
import { RELICS } from '../assets/data/relics';
import { useRngStore } from '../store/useRngStore';
import { useResponsive } from '../hooks/useResponsive';
import { useAudioStore } from '../store/useAudioStore';

type ChestSize = 'SMALL' | 'MEDIUM' | 'LARGE';

interface TreasureReward {
  chestSize: ChestSize;
  relic: typeof RELICS[number];
  gold: number;
}

export const TreasureRoomView: React.FC = () => {
  const { isMobile, height } = useResponsive();
  const isShortScreen = height < 500;
  const { relics, addRelic, addGold, setScene, setToastMessage } = useRunStore();
  const [reward, setReward] = useState<TreasureReward | null>(null);
  const [claimed, setClaimed] = useState(false);

  const chestLabels: Record<ChestSize, string> = useMemo(() => ({
    SMALL: '소형 상자',
    MEDIUM: '중형 상자',
    LARGE: '대형 상자',
  }), []);

  useEffect(() => {
    const rng = useRngStore.getState().lootRng;

    // 상자 크기 결정: 50% 소형, 33% 중형, 17% 대형
    const sizeRoll = rng.next();
    let chestSize: ChestSize;
    if (sizeRoll < 0.5) chestSize = 'SMALL';
    else if (sizeRoll < 0.83) chestSize = 'MEDIUM';
    else chestSize = 'LARGE';

    // 유물 등급 결정
    let relicPool: typeof RELICS;
    const tierRoll = rng.next();
    if (chestSize === 'SMALL') {
      // 75% 일반, 25% 고급
      relicPool = RELICS.filter(r =>
        (tierRoll < 0.75 ? r.tier === 'COMMON' : r.tier === 'UNCOMMON') &&
        !relics.includes(r.id) && r.tier !== 'STARTER'
      );
    } else if (chestSize === 'MEDIUM') {
      // 35% 일반, 50% 고급, 15% 희귀
      relicPool = RELICS.filter(r =>
        (tierRoll < 0.35 ? r.tier === 'COMMON' : tierRoll < 0.85 ? r.tier === 'UNCOMMON' : r.tier === 'RARE') &&
        !relics.includes(r.id) && r.tier !== 'STARTER'
      );
    } else {
      // 75% 고급, 25% 희귀
      relicPool = RELICS.filter(r =>
        (tierRoll < 0.75 ? r.tier === 'UNCOMMON' : r.tier === 'RARE') &&
        !relics.includes(r.id) && r.tier !== 'STARTER'
      );
    }

    // 폴백: 풀이 비어있으면 전체에서 선택
    if (relicPool.length === 0) {
      relicPool = RELICS.filter(r => !relics.includes(r.id) && r.tier !== 'BOSS' && r.tier !== 'STARTER');
    }

    const selectedRelic = relicPool.length > 0
      ? relicPool[Math.floor(rng.next() * relicPool.length)]
      : null;

    // 골드 결정
    let gold = 0;
    const goldRoll = rng.next();
    if (chestSize === 'SMALL' && goldRoll < 0.5) gold = 23 + Math.floor(rng.next() * 5);
    else if (chestSize === 'MEDIUM' && goldRoll < 0.35) gold = 45 + Math.floor(rng.next() * 11);
    else if (chestSize === 'LARGE' && goldRoll < 0.5) gold = 68 + Math.floor(rng.next() * 15);

    if (selectedRelic) {
      setReward({ chestSize, relic: selectedRelic, gold });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClaim = () => {
    if (!reward || claimed) return;
    useAudioStore.getState().playClick();
    addRelic(reward.relic.id);
    if (reward.gold > 0) addGold(reward.gold);
    setClaimed(true);
    setToastMessage(`[${reward.relic.name}] 유물 획득!${reward.gold > 0 ? ` 골드 ${reward.gold}도 발견!` : ''}`);
  };

  const handleLeave = () => {
    useAudioStore.getState().playClick();
    setScene('MAP');
  };

  const chestEmoji = reward?.chestSize === 'LARGE' ? '🏆' : reward?.chestSize === 'MEDIUM' ? '📦' : '🎁';
  const tierColor = reward?.relic.tier === 'RARE' ? '#ffd700' : reward?.relic.tier === 'UNCOMMON' ? '#4a90e2' : '#aaa';

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: 'radial-gradient(circle at center, #2a1f0a 0%, #0a0a0a 80%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: '"Courier New", Courier, monospace', color: '#fff',
      gap: isShortScreen ? '16px' : '30px',
    }}>
      <h1 style={{
        fontSize: isShortScreen ? '24px' : isMobile ? '32px' : '48px',
        color: '#ffd700', margin: 0,
        textShadow: '0 0 20px rgba(255, 215, 0, 0.5)',
      }}>
        💎 보물방
      </h1>

      {reward && (
        <div style={{
          textAlign: 'center',
          animation: 'fadeIn 0.5s ease-out',
        }}>
          <div style={{ fontSize: isShortScreen ? '48px' : '72px', marginBottom: '12px' }}>
            {chestEmoji}
          </div>
          <p style={{ fontSize: isShortScreen ? '16px' : '20px', color: '#d4a854', margin: '0 0 20px 0' }}>
            {chestLabels[reward.chestSize]}을 발견했습니다!
          </p>

          {/* 유물 표시 */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: '10px', padding: isShortScreen ? '16px' : '24px',
            border: `2px solid ${tierColor}`,
            borderRadius: '12px', backgroundColor: 'rgba(0,0,0,0.6)',
            boxShadow: `0 0 20px ${tierColor}33`,
            minWidth: isShortScreen ? '200px' : '300px',
          }}>
            {reward.relic.image
              ? <img src={reward.relic.image} alt={reward.relic.name} style={{ width: isShortScreen ? 48 : 64, height: isShortScreen ? 48 : 64, objectFit: 'contain' }} />
              : <span style={{ fontSize: isShortScreen ? '36px' : '48px' }}>{reward.relic.icon || '❓'}</span>
            }
            <h3 style={{ color: tierColor, margin: 0, fontSize: isShortScreen ? '16px' : '22px' }}>
              {reward.relic.name}
            </h3>
            <p style={{ color: '#9ca3af', margin: 0, fontSize: isShortScreen ? '12px' : '14px', maxWidth: '280px' }}>
              {reward.relic.description}
            </p>
            <span style={{ color: '#6b7280', fontSize: '12px' }}>[{reward.relic.tier}]</span>
            {reward.gold > 0 && (
              <p style={{ color: '#fbbf24', margin: '8px 0 0 0', fontSize: isShortScreen ? '14px' : '16px' }}>
                💰 골드 {reward.gold}도 함께 발견!
              </p>
            )}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '16px', marginTop: '10px' }}>
        {!claimed && reward && (
          <button
            onClick={handleClaim}
            style={{
              padding: isShortScreen ? '10px 24px' : '14px 36px',
              fontSize: isShortScreen ? '16px' : '20px',
              fontWeight: 'bold', background: 'none', color: '#ffd700',
              border: '2px solid rgba(255, 215, 0, 0.5)', borderRadius: '8px',
              cursor: 'pointer', transition: 'all 0.2s',
              textShadow: '0 0 10px rgba(255, 215, 0, 0.3)',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#ffd700'; e.currentTarget.style.transform = 'scale(1.05)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.5)'; e.currentTarget.style.transform = 'scale(1)'; }}
          >
            획득하기
          </button>
        )}
        {claimed && (
          <button
            onClick={handleLeave}
            style={{
              padding: isShortScreen ? '10px 24px' : '14px 36px',
              fontSize: isShortScreen ? '16px' : '20px',
              fontWeight: 'bold', background: 'none', color: '#aaa',
              border: '1px solid rgba(150, 150, 150, 0.4)', borderRadius: '8px',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#aaa'; }}
          >
            맵으로 돌아가기
          </button>
        )}
      </div>
    </div>
  );
};
