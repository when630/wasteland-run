// 카드 이동 애니메이션 오버레이 — 명령적 DOM 조작 (React 리렌더 제로)
// Slay the Spire 스타일: 베지어 곡선 경로, 카드 플립, 회전, 스케일링

import React, { useEffect, useRef } from 'react';
import { subscribe, consumeAnims, type CardAnim } from './cardAnimations';

interface ActiveAnim extends CardAnim {
  phase: 'waiting' | 'moving' | 'done';
  moveStart: number;
  el: HTMLDivElement | null;
}

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  size: number; color: string;
  alpha: number;
}

// 2차 베지어 곡선 보간
function quadBezier(t: number, p0: number, p1: number, p2: number): number {
  const u = 1 - t;
  return u * u * p0 + 2 * u * t * p1 + t * t * p2;
}

// ease-out cubic (빠른 시작, 부드러운 감속)
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

// ease-out quint (더 극적인 감속 — 플립용)
function easeOutQuint(t: number): number {
  return 1 - Math.pow(1 - t, 5);
}

export const CardAnimationLayer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<{ anims: ActiveAnim[]; particles: Particle[] }>({ anims: [], particles: [] });
  const rafRef = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d')!;
    const state = stateRef.current;

    // 캔버스 크기 맞춤
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // 큐 구독
    const unsub = subscribe(() => {
      const newAnims = consumeAnims();
      if (newAnims.length === 0) return;
      const now = Date.now();
      for (const a of newAnims) {
        // 카드 DOM 생성 (3D 플립 구조)
        const el = document.createElement('div');
        el.style.cssText = `
          position:absolute;pointer-events:none;
          width:80px;height:100px;
          perspective:800px;
          will-change:transform,opacity;
        `;

        // 플립 가능한 내부 래퍼
        const inner = document.createElement('div');
        inner.style.cssText = `
          position:relative;width:100%;height:100%;
          transform-style:preserve-3d;
        `;

        // 앞면 (카드 정보)
        const front = document.createElement('div');
        front.style.cssText = `
          position:absolute;top:0;left:0;width:100%;height:100%;
          backface-visibility:hidden;
          background:${a.cardColor};
          border:2px solid rgba(255,255,255,0.5);
          border-radius:6px;
          display:flex;justify-content:center;align-items:center;
          padding:4px;
          box-shadow:0 4px 12px rgba(0,0,0,0.5);
          font:bold 10px/1.2 monospace;color:#fff;text-align:center;
          text-shadow:0 1px 2px rgba(0,0,0,0.8);
        `;
        front.textContent = a.cardName;

        // 뒷면 (카드 뒤판)
        const back = document.createElement('div');
        back.style.cssText = `
          position:absolute;top:0;left:0;width:100%;height:100%;
          backface-visibility:hidden;
          transform:rotateY(180deg);
          background:linear-gradient(135deg, #2a1a3a 0%, #1a2a4a 100%);
          border:2px solid rgba(255,200,100,0.3);
          border-radius:6px;
          display:flex;justify-content:center;align-items:center;
          box-shadow:0 4px 12px rgba(0,0,0,0.5);
        `;
        // 뒷면 장식 패턴
        const backDecor = document.createElement('div');
        backDecor.style.cssText = `
          width:50px;height:70px;
          border:2px solid rgba(255,200,100,0.25);
          border-radius:3px;
          background:repeating-linear-gradient(
            45deg,transparent,transparent 5px,
            rgba(255,200,100,0.06) 5px,rgba(255,200,100,0.06) 10px
          );
        `;
        back.appendChild(backDecor);

        inner.appendChild(front);
        inner.appendChild(back);
        el.appendChild(inner);

        el.style.opacity = '0';
        container.appendChild(el);

        state.anims.push({
          ...a,
          phase: 'waiting',
          moveStart: now,
          el,
        });
      }
    });

    // 메인 루프
    const tick = () => {
      const now = Date.now();

      // --- 카드 애니메이션 ---
      for (let i = state.anims.length - 1; i >= 0; i--) {
        const a = state.anims[i];

        if (a.phase === 'waiting') {
          if (now - a.moveStart >= a.delay) {
            a.phase = 'moving';
            a.moveStart = now;
          } else {
            continue;
          }
        }

        if (a.phase === 'moving') {
          const elapsed = now - a.moveStart;
          const rawT = Math.min(1, elapsed / a.duration);

          if (a.type === 'DRAW') {
            // ═══ DRAW: 베지어 곡선 + 카드 플립 + 회전 + 스케일 ═══
            const ease = easeOutCubic(rawT);

            // 베지어 컨트롤 포인트: 뽑을 덱 → 화면 중앙 위로 볼록 → 손패
            const cpX = (a.fromX + a.toX) * 0.5;
            const cpY = Math.min(a.fromY, a.toY) - 160;

            const x = quadBezier(ease, a.fromX, cpX, a.toX);
            const y = quadBezier(ease, a.fromY, cpY, a.toY);

            // 스케일: 0.3 → 1.0 (ease-out)
            const scale = 0.3 + 0.7 * ease;

            // Z축 회전: -25° → 0° (비행 중 기울어져 있다가 도착하며 정렬)
            const rotateZ = -25 * (1 - ease);

            // Y축 플립: 처음 55%에서 180° → 0° (뒷면 → 앞면)
            const flipProgress = Math.min(1, rawT / 0.55);
            const flipEase = easeOutQuint(flipProgress);
            const rotateY = 180 * (1 - flipEase);

            // 불투명도: 즉시 나타남
            const opacity = Math.min(1, rawT * 6);

            if (a.el) {
              a.el.style.transform = `translate(${x - 40}px, ${y - 50}px)`;
              a.el.style.opacity = `${opacity}`;
              const inner = a.el.firstChild as HTMLElement;
              if (inner) {
                inner.style.transform = `rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) scale(${scale})`;
              }
            }
          } else if (a.type === 'DISCARD') {
            // ═══ DISCARD: 부드러운 곡선으로 버린덱으로 ═══
            const ease = easeOutCubic(rawT);

            // 오른쪽 아래로 약간의 호를 그리며 날아감
            const cpX = (a.fromX + a.toX) * 0.5 + 60;
            const cpY = Math.min(a.fromY, a.toY) - 80;

            const x = quadBezier(ease, a.fromX, cpX, a.toX);
            const y = quadBezier(ease, a.fromY, cpY, a.toY);

            // 축소 + 기울어지며 날아감
            const scale = 1.0 - 0.5 * ease;
            const rotateZ = 15 * ease;
            const opacity = 1 - rawT * 0.4;

            if (a.el) {
              a.el.style.transform = `translate(${x - 40}px, ${y - 50}px)`;
              a.el.style.opacity = `${opacity}`;
              const inner = a.el.firstChild as HTMLElement;
              if (inner) {
                inner.style.transform = `rotateZ(${rotateZ}deg) scale(${scale})`;
              }
            }
          } else if (a.type === 'EXHAUST') {
            // ═══ EXHAUST: 위로 떠오르며 흔들리다 소멸 ═══
            const ease = easeOutCubic(rawT);

            const x = a.fromX + (a.toX - a.fromX) * ease;
            const y = a.fromY + (a.toY - a.fromY) * ease;
            const scale = 1.0 - 0.4 * ease;
            const opacity = 1 - ease;
            // 소멸 흔들림 (점점 작아지는 진동)
            const wobble = Math.sin(rawT * Math.PI * 8) * 4 * (1 - rawT);

            if (a.el) {
              a.el.style.transform = `translate(${x - 40 + wobble}px, ${y - 50}px)`;
              a.el.style.opacity = `${opacity}`;
              const inner = a.el.firstChild as HTMLElement;
              if (inner) {
                inner.style.transform = `scale(${scale})`;
              }
            }
          }

          if (rawT >= 1) {
            a.phase = 'done';

            // 소멸 파티클 (더 많이, 더 화려하게)
            if (a.type === 'EXHAUST') {
              for (let j = 0; j < 28; j++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 1 + Math.random() * 5;
                state.particles.push({
                  x: a.toX + (Math.random() - 0.5) * 60,
                  y: a.toY - 50 + (Math.random() - 0.5) * 40,
                  vx: Math.cos(angle) * speed,
                  vy: Math.sin(angle) * speed - 2.5,
                  size: 2 + Math.random() * 6,
                  color: a.cardColor,
                  alpha: 1,
                });
              }
            }

            // 뽑기 도착 시 미세 파티클 (살짝 반짝임)
            if (a.type === 'DRAW') {
              for (let j = 0; j < 5; j++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 0.5 + Math.random() * 1.5;
                state.particles.push({
                  x: a.toX + (Math.random() - 0.5) * 30,
                  y: a.toY - 30 + (Math.random() - 0.5) * 20,
                  vx: Math.cos(angle) * speed,
                  vy: Math.sin(angle) * speed - 1,
                  size: 2 + Math.random() * 3,
                  color: '#ffffff',
                  alpha: 0.6,
                });
              }
            }

            // DOM 제거
            if (a.el) {
              a.el.remove();
              a.el = null;
            }
            state.anims.splice(i, 1);
          }
        }
      }

      // --- 파티클 (Canvas 2D) ---
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12;
        p.vx *= 0.97;
        p.alpha -= 0.025;

        if (p.alpha <= 0) {
          state.particles.splice(i, 1);
          continue;
        }

        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      }
      ctx.globalAlpha = 1;

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      unsub();
      window.removeEventListener('resize', resize);
      // 남은 DOM 엘리먼트 정리
      for (const a of state.anims) {
        if (a.el) a.el.remove();
      }
      state.anims.length = 0;
      state.particles.length = 0;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed', top: 0, left: 0,
        width: '100vw', height: '100vh',
        pointerEvents: 'none', zIndex: 999,
        overflow: 'hidden',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      />
    </div>
  );
};
