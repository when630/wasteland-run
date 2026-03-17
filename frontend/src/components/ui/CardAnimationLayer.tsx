// 카드 이동 애니메이션 오버레이 — 명령적 DOM 조작 (React 리렌더 제로)
// Slay the Spire 스타일: 베지어 곡선 경로, 카드 플립, 회전, 스케일링

import React, { useEffect, useRef } from 'react';
import { subscribe, consumeAnims, type CardAnim } from './cardAnimations';

// CardFrame과 동일한 테마 매핑 (축소 카드용)
const ANIM_THEMES: Record<string, { accent: string; accentLight: string; artBg: string; costBorder: string }> = {
  PHYSICAL_ATTACK: {
    accent: '#c0392b', accentLight: '#ff6b6b',
    artBg: 'linear-gradient(160deg, #1a0505 0%, #2d0808 50%, #0a0202 100%)',
    costBorder: 'rgba(192,57,43,0.6)',
  },
  SPECIAL_ATTACK: {
    accent: '#8e44ad', accentLight: '#c39bd3',
    artBg: 'linear-gradient(160deg, #0d0515 0%, #1a0a2e 50%, #070310 100%)',
    costBorder: 'rgba(142,68,173,0.6)',
  },
  PHYSICAL_DEFENSE: {
    accent: '#2980b9', accentLight: '#7fb3d3',
    artBg: 'linear-gradient(160deg, #010d1a 0%, #052038 50%, #010810 100%)',
    costBorder: 'rgba(41,128,185,0.6)',
  },
  SPECIAL_DEFENSE: {
    accent: '#16a085', accentLight: '#76d7c4',
    artBg: 'linear-gradient(160deg, #010f0c 0%, #052a22 50%, #010d08 100%)',
    costBorder: 'rgba(22,160,133,0.6)',
  },
  UTILITY: {
    accent: '#d4ac0d', accentLight: '#f9e79f',
    artBg: 'linear-gradient(160deg, #131000 0%, #2a2100 50%, #100d00 100%)',
    costBorder: 'rgba(212,172,13,0.6)',
  },
};
const STATUS_ANIM_THEME = {
  accent: '#6b2233', accentLight: '#aa3355',
  artBg: 'linear-gradient(160deg, #1a0810 0%, #2d0515 50%, #0a0205 100%)',
  costBorder: 'rgba(107,34,51,0.6)',
};

function getAnimTheme(type: string) {
  if (type.startsWith('STATUS_')) return STATUS_ANIM_THEME;
  return ANIM_THEMES[type] || ANIM_THEMES.UTILITY;
}

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

        // 앞면 — CardFrame CSS 구조 충실 재현 (80×100 축소판)
        const theme = getAnimTheme(a.cardType);
        const front = document.createElement('div');
        front.style.cssText = `
          position:absolute;top:0;left:0;width:100%;height:100%;
          backface-visibility:hidden;
          background:#12121a;
          border:1px solid #2a2a3a;
          border-radius:5px;
          overflow:hidden;
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.03),
            0 8px 24px rgba(0,0,0,0.8),
            0 0 16px rgba(0,0,0,0.5),
            0 0 20px ${theme.accent}1a inset;
          font-family:'Rajdhani','Galmuri11',sans-serif;
        `;

        // cf-accent-top (4px → 2px)
        const accentTop = document.createElement('div');
        accentTop.style.cssText = `position:absolute;top:0;left:0;right:0;height:2px;z-index:5;background:linear-gradient(90deg,${theme.accent},${theme.accentLight},${theme.accent});`;

        // cf-accent-bottom (2px → 1px)
        const accentBottom = document.createElement('div');
        accentBottom.style.cssText = `position:absolute;bottom:0;left:0;right:0;height:1px;z-index:5;opacity:0.5;background:${theme.accent};`;

        // cf-corner-glow
        const cornerGlow = document.createElement('div');
        cornerGlow.style.cssText = `position:absolute;top:0;left:0;width:30px;height:30px;z-index:4;border-radius:0 0 100% 0;opacity:0.12;background:${theme.accent};`;

        // cf-corner ornaments (4개)
        const mkCorner = (css: string) => { const d = document.createElement('div'); d.style.cssText = `position:absolute;width:5px;height:5px;z-index:6;${css}`; return d; };
        const cTL = mkCorner(`top:3px;left:3px;border-top:1px solid ${theme.accent};border-left:1px solid ${theme.accent};`);
        const cTR = mkCorner(`top:3px;right:3px;border-top:1px solid ${theme.accent};border-right:1px solid ${theme.accent};`);
        const cBL = mkCorner(`bottom:3px;left:3px;border-bottom:1px solid ${theme.accent};border-left:1px solid ${theme.accent};opacity:0.5;`);
        const cBR = mkCorner(`bottom:3px;right:3px;border-bottom:1px solid ${theme.accent};border-right:1px solid ${theme.accent};opacity:0.5;`);

        // cf-header (이름 + 코스트)
        const header = document.createElement('div');
        header.style.cssText = `position:absolute;top:3px;left:4px;right:4px;z-index:6;display:flex;align-items:center;justify-content:space-between;gap:2px;`;

        const nameEl = document.createElement('div');
        nameEl.style.cssText = `font-family:'Cinzel','Galmuri11',serif;font-size:7px;font-weight:700;color:#e8e0cc;letter-spacing:0.02em;line-height:1.15;text-shadow:0 1px 4px rgba(0,0,0,0.9);flex:1;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;`;
        nameEl.textContent = a.cardName;

        const costPill = document.createElement('div');
        costPill.style.cssText = `display:flex;align-items:center;gap:1px;background:rgba(0,0,0,0.72);border:1px solid ${theme.costBorder};border-radius:10px;padding:1px 4px 1px 3px;flex-shrink:0;backdrop-filter:blur(4px);`;
        const costVal = document.createElement('span');
        costVal.style.cssText = `font-family:'Cinzel','Galmuri11',serif;font-size:8px;font-weight:900;color:#e8e0cc;line-height:1;`;
        costVal.textContent = `${a.cardCostAp}`;
        const costLbl = document.createElement('span');
        costLbl.style.cssText = `font-size:4px;letter-spacing:0.06em;text-transform:uppercase;opacity:0.75;line-height:1;color:${theme.accentLight};margin-top:1px;`;
        costLbl.textContent = 'AP';
        costPill.appendChild(costVal);
        costPill.appendChild(costLbl);
        header.appendChild(nameEl);
        header.appendChild(costPill);

        // cf-header-divider
        const headerDiv = document.createElement('div');
        headerDiv.style.cssText = `position:absolute;top:16px;left:4px;right:4px;height:1px;z-index:6;opacity:0.3;background:linear-gradient(90deg,transparent,${theme.accent},transparent);`;

        // cf-art-area (top:17px, height:~55px)
        const artArea = document.createElement('div');
        artArea.style.cssText = `position:absolute;top:17px;left:0;right:0;height:55px;overflow:hidden;`;
        const artBg = document.createElement('div');
        artBg.style.cssText = `width:100%;height:100%;background:${theme.artBg};`;
        artArea.appendChild(artBg);
        // diagonal cut
        const artCut = document.createElement('div');
        artCut.style.cssText = `position:absolute;bottom:-1px;left:0;right:0;height:11px;background:#12121a;clip-path:polygon(0 100%,100% 0,100% 100%);`;
        artArea.appendChild(artCut);

        // cf-divider (mid)
        const midDiv = document.createElement('div');
        midDiv.style.cssText = `position:absolute;top:74px;left:5px;right:5px;height:1px;z-index:3;opacity:0.4;background:linear-gradient(90deg,transparent,${theme.accent},transparent);`;

        // cf-type-badge (bottom)
        const typeBadge = document.createElement('div');
        typeBadge.style.cssText = `position:absolute;bottom:4px;left:50%;transform:translateX(-50%);z-index:6;display:flex;align-items:center;gap:2px;background:rgba(0,0,0,0.65);border:1px solid ${theme.accent};border-radius:10px;padding:1px 5px;white-space:nowrap;`;
        const typeLabel = document.createElement('span');
        typeLabel.style.cssText = `font-family:'Cinzel','Galmuri11',serif;font-size:4px;letter-spacing:0.1em;text-transform:uppercase;font-weight:700;color:${theme.accentLight};`;
        typeLabel.textContent = (ANIM_THEMES[a.cardType] ? a.cardType : 'STATUS').replace(/_/g, ' ');
        typeBadge.appendChild(typeLabel);

        front.appendChild(accentTop);
        front.appendChild(accentBottom);
        front.appendChild(cornerGlow);
        front.appendChild(cTL);
        front.appendChild(cTR);
        front.appendChild(cBL);
        front.appendChild(cBR);
        front.appendChild(header);
        front.appendChild(headerDiv);
        front.appendChild(artArea);
        front.appendChild(midDiv);
        front.appendChild(typeBadge);

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
