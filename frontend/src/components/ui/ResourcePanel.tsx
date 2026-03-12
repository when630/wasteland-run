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

// ── AP 이펙트 파티클 ──
interface ApParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  startTime: number;
  color: string;
}

let apParticleIdCounter = 0;

const ApEffectLayer: React.FC<{ particles: ApParticle[] }> = ({ particles }) => (
  <>
    {particles.map((p) => {
      const elapsed = (Date.now() - p.startTime) / 1000;
      const px = p.x + p.vx * elapsed;
      const py = p.y + p.vy * elapsed;
      const opacity = Math.max(0, p.opacity - elapsed * 2.0);
      const size = p.size * (1 - elapsed * 0.5);

      if (opacity <= 0 || size <= 0) return null;
      return (
        <div
          key={p.id}
          style={{
            position: 'fixed',
            left: px - size / 2,
            top: py - size / 2,
            width: size,
            height: size,
            borderRadius: '50%',
            background: p.color,
            boxShadow: `0 0 ${size}px ${p.color}`,
            opacity,
            pointerEvents: 'none',
            zIndex: 9999,
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

  // 이전 값 추적
  const prevAmmoRef = useRef(playerAmmo);
  const prevApRef = useRef(playerActionPoints);
  const mountedRef = useRef(false); // 최초 마운트 시 이펙트 스킵
  const [shellParticles, setShellParticles] = useState<ShellParticle[]>([]);
  const [apParticles, setApParticles] = useState<ApParticle[]>([]);
  const [apEffect, setApEffect] = useState<'none' | 'consume' | 'charge'>('none');
  const ammoContainerRef = useRef<HTMLDivElement>(null);
  const apContainerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number>(0);

  // 탄피 이젝션 파티클 생성
  const spawnShells = useCallback((count: number) => {
    const container = ammoContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
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
        startTime: Date.now() + i * 60,
      });
    }
    setShellParticles(prev => [...prev, ...newParticles]);
  }, []);

  // AP 소모 파티클 — 에너지가 흩어지는 느낌
  const spawnApConsumeParticles = useCallback(() => {
    const container = apContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const newParticles: ApParticle[] = [];
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8 + (Math.random() - 0.5) * 0.4;
      const speed = 40 + Math.random() * 60;
      newParticles.push({
        id: apParticleIdCounter++,
        x: cx + (Math.random() - 0.5) * 10,
        y: cy + (Math.random() - 0.5) * 10,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 4 + Math.random() * 4,
        opacity: 0.9,
        startTime: Date.now(),
        color: 'rgba(255, 180, 0, 0.8)',
      });
    }
    setApParticles(prev => [...prev, ...newParticles]);
  }, []);

  // AP 충전 파티클 — 에너지가 모여드는 느낌
  const spawnApChargeParticles = useCallback(() => {
    const container = apContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const newParticles: ApParticle[] = [];
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 * i) / 12 + (Math.random() - 0.5) * 0.3;
      const dist = 50 + Math.random() * 40;
      const startX = cx + Math.cos(angle) * dist;
      const startY = cy + Math.sin(angle) * dist;
      const speed = dist * 1.8;
      newParticles.push({
        id: apParticleIdCounter++,
        x: startX,
        y: startY,
        vx: -Math.cos(angle) * speed,
        vy: -Math.sin(angle) * speed,
        size: 3 + Math.random() * 3,
        opacity: 0.85,
        startTime: Date.now() + i * 30,
        color: 'rgba(100, 220, 255, 0.9)',
      });
    }
    setApParticles(prev => [...prev, ...newParticles]);
  }, []);

  // 최초 마운트 시 ref 동기화만 하고 이펙트 스킵
  useEffect(() => {
    prevAmmoRef.current = playerAmmo;
    prevApRef.current = playerActionPoints;
    mountedRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ammo 감소 감지 → 탄피 이젝션 (여러 발이면 시차 발사)
  useEffect(() => {
    if (!mountedRef.current) return;
    const diff = prevAmmoRef.current - playerAmmo;
    if (diff > 0) {
      for (let i = 0; i < diff; i++) {
        setTimeout(() => spawnShells(1), i * 120);
      }
    }
    prevAmmoRef.current = playerAmmo;
  }, [playerAmmo, spawnShells]);

  // AP 변화 감지 → 소모/충전 이펙트
  useEffect(() => {
    if (!mountedRef.current) return;
    const diff = prevApRef.current - playerActionPoints;
    if (diff > 0) {
      // AP 소모
      setApEffect('consume');
      spawnApConsumeParticles();
      setTimeout(() => setApEffect('none'), 300);
    } else if (diff < 0) {
      // AP 충전
      setApEffect('charge');
      spawnApChargeParticles();
      setTimeout(() => setApEffect('none'), 400);
    }
    prevApRef.current = playerActionPoints;
  }, [playerActionPoints, spawnApConsumeParticles, spawnApChargeParticles]);

  // 파티클 애니메이션 루프
  useEffect(() => {
    const hasParticles = shellParticles.length > 0 || apParticles.length > 0;
    if (!hasParticles) return;

    const tick = () => {
      const now = Date.now();
      setShellParticles(prev => {
        const alive = prev.filter(p => (now - p.startTime) / 1000 < 0.8);
        return alive;
      });
      setApParticles(prev => {
        const alive = prev.filter(p => (now - p.startTime) / 1000 < 0.6);
        return alive;
      });
      animFrameRef.current = requestAnimationFrame(tick);
    };
    animFrameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [shellParticles.length > 0 || apParticles.length > 0]); // eslint-disable-line react-hooks/exhaustive-deps

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
  const apIconSize = isMobile ? 44 : 56;

  // AP 이펙트 CSS
  const apIconStyle: React.CSSProperties = {
    width: apIconSize,
    height: apIconSize,
    objectFit: 'contain',
    filter: playerActionPoints > 0
      ? 'drop-shadow(0 0 6px rgba(255,180,0,0.6))'
      : 'brightness(0.5)',
    transition: 'filter 0.3s, transform 0.15s',
    transform: apEffect === 'consume'
      ? 'scale(0.85)'
      : apEffect === 'charge'
        ? 'scale(1.15)'
        : 'scale(1)',
  };

  const apGlowStyle: React.CSSProperties = apEffect === 'charge' ? {
    position: 'absolute',
    inset: -8,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(100,220,255,0.4) 0%, transparent 70%)',
    animation: 'apChargeGlow 0.4s ease-out forwards',
    pointerEvents: 'none',
  } : apEffect === 'consume' ? {
    position: 'absolute',
    inset: -4,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,180,0,0.3) 0%, transparent 70%)',
    animation: 'apConsumeFlash 0.3s ease-out forwards',
    pointerEvents: 'none',
  } : { display: 'none' };

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
        <div
          ref={apContainerRef}
          style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div style={apGlowStyle} />
          <img
            src={playerActionPoints > 0 ? iconAp : iconEmptyAp}
            alt=""
            style={apIconStyle}
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
            <>
              {Array.from({ length: Math.min(playerAmmo, 5) }).map((_, i) => (
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
              ))}
              {playerAmmo > 5 && (
                <span style={{
                  fontSize: isMobile ? 12 : 14,
                  fontWeight: 'bold',
                  color: '#d4a854',
                  marginLeft: 4,
                  textShadow: '1px 1px 3px rgba(0,0,0,0.9)',
                }}>
                  x{playerAmmo}
                </span>
              )}
            </>
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
      {/* AP 이펙트 파티클 레이어 */}
      <ApEffectLayer particles={apParticles} />
    </>
  );
};
