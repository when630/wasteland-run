import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useBattleStore } from '../../store/useBattleStore';
import { useDeckStore } from '../../store/useDeckStore';
import { useAudioStore } from '../../store/useAudioStore';
import { useResponsive } from '../../hooks/useResponsive';
import { iconAp, iconEmptyAp, iconAmmo, iconEmptyAmmo } from '../../assets/images/GUI';

// ── 탄피 이젝션 파티클 ──
interface ShellParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  vr: number;
  opacity: number;
  startTime: number;
}

let shellIdCounter = 0;

const ShellEjectionLayer: React.FC<{ particles: ShellParticle[] }> = ({ particles }) => (
  <>
    {particles.map((p) => {
      const elapsed = (Date.now() - p.startTime) / 1000;
      const gravity = 600;
      const px = p.x + p.vx * elapsed;
      const py = p.y + p.vy * elapsed + 0.5 * gravity * elapsed * elapsed;
      const rot = p.rotation + p.vr * elapsed;
      const opacity = Math.max(0, p.opacity - elapsed * 1.5);

      if (opacity <= 0) return null;
      return (
        <img
          key={p.id}
          src={iconEmptyAmmo}
          alt=""
          style={{
            position: 'fixed',
            left: px,
            top: py,
            width: 28,
            height: 28,
            objectFit: 'contain',
            transform: `rotate(${rot}deg)`,
            opacity,
            pointerEvents: 'none',
            zIndex: 9999,
            filter: 'brightness(1.3)',
          }}
        />
      );
    })}
  </>
);

export const ResourcePanel: React.FC = () => {
  const { playerActionPoints, playerMaxAp, playerAmmo, endPlayerTurn, currentTurn } = useBattleStore();
  const { discardHand } = useDeckStore();
  const { isMobile } = useResponsive();

  // 이전 ammo 값 추적 (탄피 이젝션용)
  const prevAmmoRef = useRef(playerAmmo);
  const [shellParticles, setShellParticles] = useState<ShellParticle[]>([]);
  const ammoContainerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number>(0);

  // 탄피 이젝션 파티클 생성
  const spawnShells = useCallback((count: number) => {
    const container = ammoContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    // 컨테이너 우측 상단에서 발사
    const baseX = rect.right - 10;
    const baseY = rect.top + rect.height * 0.3;

    const newParticles: ShellParticle[] = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: shellIdCounter++,
        x: baseX + Math.random() * 10,
        y: baseY + Math.random() * 6 - 3,
        vx: 60 + Math.random() * 100,
        vy: -120 - Math.random() * 80,
        rotation: Math.random() * 360,
        vr: 300 + Math.random() * 400,
        opacity: 1,
        startTime: Date.now() + i * 60, // 약간씩 딜레이
      });
    }
    setShellParticles(prev => [...prev, ...newParticles]);
  }, []);

  // ammo 감소 감지 → 탄피 이젝션
  useEffect(() => {
    const diff = prevAmmoRef.current - playerAmmo;
    if (diff > 0) {
      spawnShells(diff);
    }
    prevAmmoRef.current = playerAmmo;
  }, [playerAmmo, spawnShells]);

  // 파티클 애니메이션 루프
  useEffect(() => {
    if (shellParticles.length === 0) return;

    const tick = () => {
      setShellParticles(prev => {
        const now = Date.now();
        const alive = prev.filter(p => (now - p.startTime) / 1000 < 0.8);
        return alive;
      });
      animFrameRef.current = requestAnimationFrame(tick);
    };
    animFrameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [shellParticles.length > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTurnEnd = () => {
    useAudioStore.getState().playClick();
    const retainCount = useBattleStore.getState().playerStatus.retainCardCount;
    if (retainCount > 0) {
      useDeckStore.getState().discardHandWithRetain(retainCount);
    } else {
      discardHand();
    }
    endPlayerTurn();
  };

  const ammoSize = isMobile ? 22 : 28;

  return (
    <>
      {/* AP + Ammo 패널 */}
      <div style={{
        position: 'absolute',
        bottom: isMobile ? '40px' : '60px',
        left: isMobile ? '60px' : '110px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        zIndex: 10,
        pointerEvents: 'none',
      }}>
        {/* AP 아이콘 + 숫자 */}
        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <img
            src={playerActionPoints > 0 ? iconAp : iconEmptyAp}
            alt=""
            style={{
              width: isMobile ? 44 : 56,
              height: isMobile ? 44 : 56,
              objectFit: 'contain',
              filter: playerActionPoints > 0
                ? 'drop-shadow(0 0 6px rgba(255,180,0,0.6))'
                : 'brightness(0.5)',
              transition: 'filter 0.3s',
            }}
          />
          <span style={{
            position: 'absolute',
            fontSize: isMobile ? '14px' : '18px',
            fontWeight: 'bold',
            color: playerActionPoints > 0 ? '#fff' : '#888',
            textShadow: '1px 1px 3px rgba(0,0,0,0.9), -1px -1px 3px rgba(0,0,0,0.9)',
            letterSpacing: '-1px',
            pointerEvents: 'none',
          }}>
            {playerActionPoints}/{playerMaxAp}
          </span>
        </div>

        {/* Ammo 아이콘 행 */}
        <div
          ref={ammoContainerRef}
          style={{ display: 'flex', alignItems: 'center', minHeight: ammoSize }}
        >
          {playerAmmo > 0 ? (
            Array.from({ length: playerAmmo }).map((_, i) => (
              <img
                key={`ammo-${i}`}
                src={iconAmmo}
                alt=""
                style={{
                  width: ammoSize,
                  height: ammoSize,
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 0 3px rgba(200,150,50,0.5))',
                  marginLeft: i > 0 ? (isMobile ? -6 : -8) : 0,
                }}
              />
            ))
          ) : (
            <span style={{
              fontSize: isMobile ? 10 : 12,
              color: '#666',
              fontWeight: 'bold',
              letterSpacing: 1,
            }}>
              NO AMMO
            </span>
          )}
        </div>
      </div>

      {/* 턴 종료 버튼 */}
      <button
        onClick={handleTurnEnd}
        disabled={currentTurn !== 'PLAYER'}
        style={{
          position: 'absolute',
          right: isMobile ? '15px' : '50px',
          bottom: isMobile ? '100px' : '150px',
          padding: isMobile ? '8px 18px' : '12px 30px',
          backgroundColor: currentTurn === 'PLAYER' ? '#2c5364' : '#555',
          color: currentTurn === 'PLAYER' ? '#a2f5df' : '#bbb',
          border: '2px solid',
          borderColor: currentTurn === 'PLAYER' ? '#4dc3a3' : '#333',
          borderRadius: '30px',
          fontSize: isMobile ? '14px' : '20px',
          fontWeight: 'bold',
          letterSpacing: '2px',
          boxShadow: currentTurn === 'PLAYER' ? '0 0 10px rgba(77, 195, 163, 0.4)' : 'none',
          cursor: currentTurn === 'PLAYER' ? 'pointer' : 'not-allowed',
          zIndex: 10,
          pointerEvents: 'auto',
          transition: 'all 0.2s ease-in-out',
        }}
        onMouseEnter={(e) => {
          if (currentTurn === 'PLAYER') {
            e.currentTarget.style.backgroundColor = '#203a43';
            e.currentTarget.style.boxShadow = '0 0 15px rgba(77, 195, 163, 0.8)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }
        }}
        onMouseLeave={(e) => {
          if (currentTurn === 'PLAYER') {
            e.currentTarget.style.backgroundColor = '#2c5364';
            e.currentTarget.style.boxShadow = '0 0 10px rgba(77, 195, 163, 0.4)';
            e.currentTarget.style.transform = 'scale(1)';
          }
        }}
      >
        {currentTurn === 'PLAYER' ? '턴 종료' : '적 행동 중'}
      </button>

      {/* 탄피 이젝션 파티클 레이어 */}
      <ShellEjectionLayer particles={shellParticles} />
    </>
  );
};
