import React, { useState } from 'react';
import { useRunStore } from '../../store/useRunStore';
import { useBattleStore } from '../../store/useBattleStore';
import { useAudioStore } from '../../store/useAudioStore';
import { getSupplyById } from '../../assets/data/supplies';
import { useSupplyUse } from '../../hooks/useSupplyUse';
import { canUseSupply, getMaxSupplySlots } from '../../logic/supplyEffects';

const TIER_COLORS: Record<string, string> = {
  COMMON: '#a8b8a0',
  UNCOMMON: '#5ca8d4',
  RARE: '#d4a854',
};

const TIER_BORDER: Record<string, string> = {
  COMMON: 'rgba(140, 160, 130, 0.6)',
  UNCOMMON: 'rgba(80, 150, 200, 0.6)',
  RARE: 'rgba(200, 160, 70, 0.6)',
};

const TIER_GLOW: Record<string, string> = {
  COMMON: 'rgba(140, 160, 130, 0.25)',
  UNCOMMON: 'rgba(80, 150, 200, 0.25)',
  RARE: 'rgba(200, 160, 70, 0.3)',
};

const TIER_LABELS: Record<string, string> = {
  COMMON: '일반',
  UNCOMMON: '고급',
  RARE: '희귀',
};

interface SupplyBarProps {
  isMapMode?: boolean;
}

export const SupplyBar: React.FC<SupplyBarProps> = ({ isMapMode = false }) => {
  const supplies = useRunStore(s => s.supplies);
  const relics = useRunStore(s => s.relics);
  const currentTurn = useBattleStore(s => s.currentTurn);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [targetingSupplyId, setTargetingSupplyId] = useState<string | null>(null);
  const { useSupply } = useSupplyUse();

  const mutationStage = useRunStore(s => s.mutationStage);
  const maxSlots = getMaxSupplySlots(relics, mutationStage);
  const isBlocked = !canUseSupply(relics);
  const canUseNow = isMapMode || currentTurn === 'PLAYER';

  const handleSlotClick = (idx: number) => {
    const supplyId = supplies[idx];
    if (!supplyId) return;
    // 토글: 같은 슬롯 다시 클릭하면 닫기
    useAudioStore.getState().playClick();
    setSelectedIdx(prev => prev === idx ? null : idx);
  };

  const handleUse = (supplyId: string) => {
    const supply = getSupplyById(supplyId);
    if (!supply) return;

    if (isBlocked) {
      useRunStore.getState().setToastMessage('금욕의 서약에 의해 보급품을 사용할 수 없습니다.');
      setSelectedIdx(null);
      return;
    }
    if (!canUseNow) {
      useRunStore.getState().setToastMessage('지금은 사용할 수 없습니다.');
      setSelectedIdx(null);
      return;
    }
    if (isMapMode && supply.usageContext === 'COMBAT') {
      useRunStore.getState().setToastMessage('이 보급품은 전투 중에만 사용할 수 있습니다.');
      setSelectedIdx(null);
      return;
    }

    // 단일 대상 → 타겟팅 모드
    if (supply.id === 'sticky_bomb' && !isMapMode) {
      setTargetingSupplyId(supplyId);
      setSelectedIdx(null);
      useRunStore.getState().setToastMessage('대상 적을 클릭하세요.');
      return;
    }

    useAudioStore.getState().playClick();
    useSupply(supplyId);
    setSelectedIdx(null);
  };

  const handleDiscard = (supplyId: string) => {
    useAudioStore.getState().playClick();
    useRunStore.getState().removeSupply(supplyId);
    useRunStore.getState().setToastMessage('보급품을 버렸습니다.');
    useRunStore.getState().saveRunData();
    setSelectedIdx(null);
  };

  const cancelTargeting = () => setTargetingSupplyId(null);

  const slotSize = 48;

  return (
    <>
      {/* 라벨 + 슬롯 컨테이너 — HUD 헤더 바로 아래 좌측 */}
      <div style={{
        position: 'absolute',
        top: '50px',
        left: '16px',
        zIndex: 15,
        pointerEvents: 'auto',
      }}>
        {/* 라벨 */}
        <div style={{
          fontSize: '10px',
          fontWeight: 'bold',
          color: '#7a8a6a',
          letterSpacing: '1px',
          marginBottom: '4px',
          textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
          textAlign: 'center',
        }}>
          보급품
        </div>

        {/* 슬롯 행 */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          gap: 5,
          padding: '4px 6px',
          background: 'rgba(10, 10, 8, 0.55)',
          borderRadius: '10px',
          border: '1px solid rgba(100, 100, 80, 0.2)',
        }}>
          {Array.from({ length: maxSlots }).map((_, idx) => {
            const supplyId = supplies[idx];
            const supply = supplyId ? getSupplyById(supplyId) : null;
            const isHovered = hoveredIdx === idx;
            const isSelected = selectedIdx === idx;
            const isUsable = !!supply && canUseNow && !isBlocked &&
              !(isMapMode && supply.usageContext === 'COMBAT');

            return (
              <div
                key={idx}
                style={{ position: 'relative' }}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* 슬롯 */}
                <div
                  onClick={() => supply ? handleSlotClick(idx) : undefined}
                  style={{
                    width: slotSize,
                    height: slotSize,
                    borderRadius: '10px',
                    border: supply
                      ? `2px solid ${isSelected ? TIER_COLORS[supply.tier] : TIER_BORDER[supply.tier]}`
                      : '2px dashed rgba(80, 80, 60, 0.35)',
                    background: supply
                      ? `radial-gradient(circle at center, ${TIER_GLOW[supply.tier]} 0%, rgba(20,18,14,0.9) 80%)`
                      : 'rgba(20, 18, 14, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: supply ? 'pointer' : 'default',
                    transition: 'all 0.15s ease',
                    transform: (isHovered || isSelected) && supply ? 'scale(1.1) translateY(-3px)' : 'scale(1)',
                    boxShadow: isSelected && supply
                      ? `0 0 12px ${TIER_COLORS[supply.tier]}, 0 4px 10px rgba(0,0,0,0.6)`
                      : isHovered && supply
                        ? `0 0 8px ${TIER_GLOW[supply.tier]}, 0 3px 6px rgba(0,0,0,0.4)`
                        : '0 1px 3px rgba(0,0,0,0.3)',
                    opacity: isBlocked ? 0.3 : (supply ? 1 : 0.4),
                  }}
                >
                  {supply ? (
                    supply.image
                      ? <img src={supply.image} alt={supply.name} style={{
                          width: 34, height: 34, objectFit: 'contain',
                          filter: !isUsable ? 'grayscale(0.7) brightness(0.5)' : undefined,
                        }} />
                      : <span style={{
                          fontSize: '24px',
                          filter: !isUsable ? 'grayscale(0.7) brightness(0.5)' : undefined,
                        }}>{supply.icon}</span>
                  ) : (
                    <div style={{
                      width: 20, height: 20,
                      borderRadius: '50%',
                      border: '1px dashed rgba(80, 80, 60, 0.3)',
                    }} />
                  )}
                </div>

                {/* 호버 툴팁 (선택 안 했을 때만) */}
                {isHovered && supply && !isSelected && (
                  <div style={{
                    position: 'absolute',
                    top: slotSize + 6,
                    left: 0,
                    background: 'rgba(12, 10, 8, 0.97)',
                    border: `1px solid ${TIER_BORDER[supply.tier]}`,
                    borderRadius: '8px',
                    padding: '10px 14px',
                    minWidth: '190px',
                    maxWidth: '250px',
                    zIndex: 100,
                    pointerEvents: 'none',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.7)',
                  }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: TIER_COLORS[supply.tier],
                      marginBottom: '3px',
                    }}>
                      {supply.name}
                      <span style={{
                        fontSize: '10px',
                        color: '#777',
                        marginLeft: '6px',
                        fontWeight: 'normal',
                      }}>
                        [{TIER_LABELS[supply.tier]}]
                      </span>
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#c8c0b0',
                      lineHeight: '1.5',
                    }}>
                      {supply.description}
                    </div>
                    {isBlocked && (
                      <div style={{ fontSize: '10px', color: '#cc6666', marginTop: '4px' }}>
                        금욕의 서약: 사용 불가
                      </div>
                    )}
                  </div>
                )}

                {/* 선택 시 액션 팝업 */}
                {isSelected && supply && (
                  <div
                    style={{
                      position: 'absolute',
                      top: slotSize + 6,
                      left: 0,
                      background: 'rgba(12, 10, 8, 0.97)',
                      border: `1px solid ${TIER_BORDER[supply.tier]}`,
                      borderRadius: '10px',
                      padding: '12px 14px',
                      minWidth: '200px',
                      maxWidth: '260px',
                      zIndex: 200,
                      boxShadow: `0 0 16px ${TIER_GLOW[supply.tier]}, 0 6px 20px rgba(0,0,0,0.8)`,
                    }}
                    onClick={e => e.stopPropagation()}
                  >
                    {/* 보급품 정보 */}
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: TIER_COLORS[supply.tier],
                      marginBottom: '3px',
                    }}>
                      {supply.icon} {supply.name}
                      <span style={{ fontSize: '10px', color: '#777', marginLeft: '6px', fontWeight: 'normal' }}>
                        [{TIER_LABELS[supply.tier]}]
                      </span>
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#c8c0b0',
                      lineHeight: '1.5',
                      marginBottom: '10px',
                    }}>
                      {supply.description}
                    </div>

                    {/* 버튼 행 */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {/* 사용 버튼 */}
                      <button
                        onClick={() => handleUse(supply.id)}
                        disabled={!isUsable}
                        style={{
                          flex: 1,
                          padding: '7px 0',
                          fontSize: '13px',
                          fontWeight: 'bold',
                          background: isUsable ? 'rgba(60, 120, 70, 0.25)' : 'rgba(40, 40, 40, 0.3)',
                          color: isUsable ? '#8be8a0' : '#666',
                          border: `1px solid ${isUsable ? 'rgba(80, 180, 100, 0.5)' : 'rgba(80, 80, 80, 0.3)'}`,
                          borderRadius: '6px',
                          cursor: isUsable ? 'pointer' : 'not-allowed',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => { if (isUsable) { e.currentTarget.style.background = 'rgba(60, 140, 80, 0.4)'; e.currentTarget.style.borderColor = 'rgba(100, 200, 120, 0.7)'; } }}
                        onMouseLeave={e => { if (isUsable) { e.currentTarget.style.background = 'rgba(60, 120, 70, 0.25)'; e.currentTarget.style.borderColor = 'rgba(80, 180, 100, 0.5)'; } }}
                      >
                        사용
                      </button>

                      {/* 버리기 버튼 */}
                      <button
                        onClick={() => handleDiscard(supply.id)}
                        style={{
                          flex: 1,
                          padding: '7px 0',
                          fontSize: '13px',
                          fontWeight: 'bold',
                          background: 'rgba(120, 50, 50, 0.2)',
                          color: '#cc8888',
                          border: '1px solid rgba(160, 70, 70, 0.4)',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(140, 60, 60, 0.35)'; e.currentTarget.style.borderColor = 'rgba(200, 90, 90, 0.6)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(120, 50, 50, 0.2)'; e.currentTarget.style.borderColor = 'rgba(160, 70, 70, 0.4)'; }}
                      >
                        버리기
                      </button>
                    </div>

                    {isBlocked && (
                      <div style={{ fontSize: '10px', color: '#cc6666', marginTop: '6px', textAlign: 'center' }}>
                        금욕의 서약: 사용 불가
                      </div>
                    )}
                    {!canUseNow && !isBlocked && (
                      <div style={{ fontSize: '10px', color: '#aa8844', marginTop: '6px', textAlign: 'center' }}>
                        지금은 사용할 수 없습니다
                      </div>
                    )}
                    {isMapMode && supply.usageContext === 'COMBAT' && (
                      <div style={{ fontSize: '10px', color: '#aa8844', marginTop: '6px', textAlign: 'center' }}>
                        전투 중에만 사용 가능
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 선택 팝업 닫기용 오버레이 */}
      {selectedIdx !== null && (
        <div
          onClick={() => setSelectedIdx(null)}
          style={{
            position: 'fixed',
            top: 0, left: 0,
            width: '100vw', height: '100vh',
            zIndex: 14,
          }}
        />
      )}

      {/* 타겟팅 모드 */}
      {targetingSupplyId && (
        <div
          onClick={cancelTargeting}
          style={{
            position: 'fixed',
            top: 0, left: 0,
            width: '100vw', height: '100vh',
            zIndex: 14,
            cursor: 'crosshair',
          }}
        />
      )}
    </>
  );
};
