import React, { useState, useMemo } from 'react';
import { useRunStore } from '../store/useRunStore';
import { RELICS } from '../assets/data/relics';
import { useRngStore } from '../store/useRngStore';
import { useAudioStore } from '../store/useAudioStore';

type ChestSize = 'SMALL' | 'MEDIUM' | 'LARGE';

interface ChestVisual {
  size: ChestSize;
  label: string;
  color: string;
  borderColor: string;
  glowColor: string;
}

interface TreasureReward {
  relic: typeof RELICS[number];
  gold: number;
}

const CHEST_VISUALS: Record<ChestSize, ChestVisual> = {
  SMALL: { size: 'SMALL', label: '낡은 상자', color: '#8b7355', borderColor: '#a0845c', glowColor: 'rgba(160, 132, 92, 0.3)' },
  MEDIUM: { size: 'MEDIUM', label: '철제 상자', color: '#5a7a9a', borderColor: '#6a9aba', glowColor: 'rgba(106, 154, 186, 0.3)' },
  LARGE: { size: 'LARGE', label: '황금 상자', color: '#b8860b', borderColor: '#ffd700', glowColor: 'rgba(255, 215, 0, 0.3)' },
};

function rollChestSize(): ChestSize {
  const rng = useRngStore.getState().lootRng;
  const roll = rng.next(); // 0~1
  if (roll < 0.50) return 'SMALL';       // 50%
  if (roll < 0.83) return 'MEDIUM';      // 33%
  return 'LARGE';                         // 17%
}

function rollReward(chestSize: ChestSize, ownedRelics: string[]): TreasureReward | null {
  const rng = useRngStore.getState().lootRng;
  const tierRoll = rng.next();

  let relicPool: typeof RELICS;
  if (chestSize === 'SMALL') {
    relicPool = RELICS.filter(r =>
      (tierRoll < 0.75 ? r.tier === 'COMMON' : r.tier === 'UNCOMMON') &&
      !ownedRelics.includes(r.id) && r.tier !== 'STARTER'
    );
  } else if (chestSize === 'MEDIUM') {
    relicPool = RELICS.filter(r =>
      (tierRoll < 0.35 ? r.tier === 'COMMON' : tierRoll < 0.85 ? r.tier === 'UNCOMMON' : r.tier === 'RARE') &&
      !ownedRelics.includes(r.id) && r.tier !== 'STARTER'
    );
  } else {
    relicPool = RELICS.filter(r =>
      (tierRoll < 0.75 ? r.tier === 'UNCOMMON' : r.tier === 'RARE') &&
      !ownedRelics.includes(r.id) && r.tier !== 'STARTER'
    );
  }

  if (relicPool.length === 0) {
    relicPool = RELICS.filter(r => !ownedRelics.includes(r.id) && !['BOSS', 'STARTER', 'EVENT', 'SHOP'].includes(r.tier));
  }

  const selectedRelic = relicPool.length > 0
    ? relicPool[Math.floor(rng.next() * relicPool.length)]
    : null;

  let gold = 0;
  const goldRoll = rng.next();
  if (chestSize === 'SMALL' && goldRoll < 0.5) gold = 23 + Math.floor(rng.next() * 5);
  else if (chestSize === 'MEDIUM' && goldRoll < 0.35) gold = 45 + Math.floor(rng.next() * 11);
  else if (chestSize === 'LARGE' && goldRoll < 0.5) gold = 68 + Math.floor(rng.next() * 15);

  if (!selectedRelic) return null;
  return { relic: selectedRelic, gold };
}

export const TreasureRoomView: React.FC = () => {
  const relics = useRunStore(s => s.relics);
  const addRelic = useRunStore(s => s.addRelic);
  const addGold = useRunStore(s => s.addGold);
  const setScene = useRunStore(s => s.setScene);
  const setToastMessage = useRunStore(s => s.setToastMessage);
  const [opened, setOpened] = useState(false);
  const [reward, setReward] = useState<TreasureReward | null>(null);
  const [claimed, setClaimed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // 랜덤 1개 상자 결정
  const chest = useMemo(() => {
    const size = rollChestSize();
    return CHEST_VISUALS[size];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenChest = () => {
    useAudioStore.getState().playClick();
    const result = rollReward(chest.size, relics);
    setReward(result);
    setOpened(true);
  };

  const handleClaim = async () => {
    if (!reward || claimed) return;
    useAudioStore.getState().playClick();
    addRelic(reward.relic.id);
    if (reward.gold > 0) addGold(reward.gold);
    setClaimed(true);
    setToastMessage(`[${reward.relic.name}] 유물 획득!${reward.gold > 0 ? ` 골드 ${reward.gold}도 발견!` : ''}`);
    await useRunStore.getState().saveRunData();
  };

  const handleLeave = () => {
    useAudioStore.getState().playClick();
    setScene('MAP');
  };

  const tierColor = reward?.relic.tier === 'RARE' ? '#ffd700' : reward?.relic.tier === 'UNCOMMON' ? '#4a90e2' : '#aaa';

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: 'radial-gradient(circle at center, #2a1f0a 0%, #0a0a0a 80%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      color: '#fff',
      gap: '24px',
    }}>
      <h1 style={{
        fontSize: '36px',
        color: '#ffd700', margin: 0,
        textShadow: '0 0 20px rgba(255, 215, 0, 0.5)',
      }}>
        보물방
      </h1>

      {!opened && (
        <>
          <p style={{ fontSize: '16px', color: '#888', margin: 0 }}>
            상자를 열어보세요
          </p>

          <div
            onClick={handleOpenChest}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
              width: '200px',
              padding: '32px 20px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px',
              border: `2px solid ${isHovered ? chest.borderColor : 'rgba(100,100,100,0.4)'}`,
              borderRadius: '12px',
              backgroundColor: isHovered ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.4)',
              cursor: 'pointer',
              transition: 'all 0.25s',
              transform: isHovered ? 'translateY(-6px) scale(1.05)' : 'translateY(0) scale(1)',
              boxShadow: isHovered ? `0 8px 30px ${chest.glowColor}` : '0 2px 8px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{
              width: '72px', height: '72px',
              borderRadius: '8px',
              backgroundColor: chest.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `inset 0 -3px 6px rgba(0,0,0,0.4), 0 0 12px ${chest.glowColor}`,
              transition: 'box-shadow 0.25s',
            }}>
              <div style={{
                width: '22px', height: '16px',
                borderRadius: '3px',
                backgroundColor: 'rgba(255,255,255,0.25)',
                border: '2px solid rgba(255,255,255,0.15)',
              }} />
            </div>
            <span style={{
              fontSize: '18px', fontWeight: 'bold',
              color: isHovered ? chest.borderColor : '#888',
              transition: 'color 0.2s',
            }}>
              {chest.label}
            </span>
          </div>
        </>
      )}

      {opened && (
        <div style={{ textAlign: 'center', animation: 'fadeIn 0.4s ease-out' }}>
          <p style={{ fontSize: '18px', color: chest.borderColor, margin: '0 0 20px 0' }}>
            {chest.label}을 열었습니다!
          </p>

          {reward ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: '10px', padding: '24px',
              border: `2px solid ${tierColor}`,
              borderRadius: '12px', backgroundColor: 'rgba(0,0,0,0.6)',
              boxShadow: `0 0 20px ${tierColor}33`,
              minWidth: '280px',
            }}>
              {reward.relic.image
                ? <img src={reward.relic.image} alt={reward.relic.name} style={{ width: 56, height: 56, objectFit: 'contain' }} />
                : <span style={{ fontSize: '40px' }}>{reward.relic.icon || '?'}</span>
              }
              <h3 style={{ color: tierColor, margin: 0, fontSize: '20px' }}>
                {reward.relic.name}
              </h3>
              <p style={{ color: '#9ca3af', margin: 0, fontSize: '13px', maxWidth: '260px' }}>
                {reward.relic.description}
              </p>
              <span style={{ color: '#6b7280', fontSize: '11px' }}>[{reward.relic.tier}]</span>
              {reward.gold > 0 && (
                <p style={{ color: '#fbbf24', margin: '6px 0 0 0', fontSize: '15px' }}>
                  골드 {reward.gold}도 함께 발견!
                </p>
              )}
            </div>
          ) : (
            <p style={{ color: '#888', fontSize: '16px' }}>상자가 비어있었습니다...</p>
          )}

          <div style={{ display: 'flex', gap: '14px', marginTop: '20px', justifyContent: 'center' }}>
            {!claimed && reward && (
              <button
                onClick={handleClaim}
                style={{
                  padding: '12px 32px', fontSize: '18px', fontWeight: 'bold',
                  background: 'none', color: '#ffd700',
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
            {(claimed || !reward) && (
              <button
                onClick={handleLeave}
                style={{
                  padding: '12px 32px', fontSize: '18px', fontWeight: 'bold',
                  background: 'none', color: '#aaa',
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
      )}
    </div>
  );
};
