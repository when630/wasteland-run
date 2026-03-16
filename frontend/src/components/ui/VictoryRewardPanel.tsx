import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CardRewardModal } from './CardRewardModal';
import { RelicRewardModal } from './RelicRewardModal';
import { useRunStore } from '../../store/useRunStore';
import { useRngStore } from '../../store/useRngStore';
import { iconGold, iconGoldReward, iconCardCount, iconRelicReward, iconBossClear } from '../../assets/images/GUI';
import type { Card } from '../../types/gameTypes';
import { ALL_CARDS } from '../../assets/data/cards';

// ── 골드 이펙트 (Canvas 기반, 렉 없음) ──
interface CoinData {
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  delay: number;
  duration: number;
  curveX: number;
  curveY: number;
}

const GoldEffect: React.FC<{
  coins: CoinData[];
  popupAmount: number;
  popupX: number;
  popupY: number;
  startTime: number;
}> = ({ coins, popupAmount, popupX, popupY, startTime }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const coinImgRef = useRef<HTMLImageElement | null>(null);
  const doneRef = useRef(false);

  useEffect(() => {
    const img = new Image();
    img.src = iconGold;
    img.onload = () => { coinImgRef.current = img; };
  }, []);

  useEffect(() => {
    doneRef.current = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let rafId: number;

    const draw = () => {
      if (doneRef.current) return;
      const now = Date.now();
      const elapsed = (now - startTime) / 1000;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let allDone = true;
      const coinImg = coinImgRef.current;

      // 코인 파티클
      for (const c of coins) {
        const t0 = (elapsed - c.delay / 1000);
        if (t0 < 0) { allDone = false; continue; }
        const t = Math.min(t0 / c.duration, 1);
        if (t >= 1) continue;
        allDone = false;

        // ease-in-out cubic
        const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

        // 2차 베지어
        const ctrlX = (c.startX + c.targetX) / 2 + c.curveX;
        const ctrlY = Math.min(c.startY, c.targetY) - 80 + c.curveY;
        const u = 1 - ease;
        const px = u * u * c.startX + 2 * u * ease * ctrlX + ease * ease * c.targetX;
        const py = u * u * c.startY + 2 * u * ease * ctrlY + ease * ease * c.targetY;

        const opacity = t > 0.85 ? 1 - (t - 0.85) / 0.15 : Math.min(1, t0 * 5);
        const scale = t > 0.7 ? 1 - (t - 0.7) * 2 : 1;
        const size = 22 * Math.max(0.1, scale);

        ctx.save();
        ctx.globalAlpha = Math.max(0, opacity);
        ctx.translate(px, py);
        ctx.rotate(ease * Math.PI * 2);

        if (coinImg) {
          ctx.drawImage(coinImg, -size / 2, -size / 2, size, size);
        } else {
          // fallback circle
          ctx.fillStyle = '#d4a854';
          ctx.beginPath();
          ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // "+N G" 팝업 텍스트
      if (elapsed < 1.2) {
        allDone = false;
        const popOpacity = elapsed > 0.8 ? 1 - (elapsed - 0.8) / 0.4 : Math.min(1, elapsed * 3);
        const popScale = elapsed < 0.15 ? 0.5 + elapsed * 3.3 : 1;
        const offsetY = -elapsed * 40;

        ctx.save();
        ctx.globalAlpha = Math.max(0, popOpacity);
        ctx.font = `bold ${Math.round(24 * popScale)}px sans-serif`;
        ctx.fillStyle = '#ffd700';
        ctx.strokeStyle = 'rgba(0,0,0,0.9)';
        ctx.lineWidth = 3;
        ctx.textAlign = 'center';
        ctx.strokeText(`+${popupAmount} G`, popupX, popupY + offsetY);
        ctx.fillText(`+${popupAmount} G`, popupX, popupY + offsetY);
        ctx.restore();
      }

      if (allDone && elapsed >= 1.2) {
        doneRef.current = true;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, [coins, popupAmount, popupX, popupY, startTime]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', top: 0, left: 0,
        width: '100vw', height: '100vh',
        pointerEvents: 'none', zIndex: 10001,
      }}
    />
  );
};

interface VictoryRewardPanelProps {
  onContinue: () => void;
  currentScene: string;
}

export const VictoryRewardPanel: React.FC<VictoryRewardPanelProps> = ({ onContinue, currentScene }) => {
  const { addGold, currentChapter } = useRunStore();

  const [goldClaimed, setGoldClaimed] = useState(false);
  const [cardClaimed, setCardClaimed] = useState(false);
  const [relicClaimed, setRelicClaimed] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isRelicModalOpen, setIsRelicModalOpen] = useState(false);

  // 골드 이펙트 상태 (한 번만 트리거)
  const [goldEffect, setGoldEffect] = useState<{
    coins: CoinData[];
    popupAmount: number;
    popupX: number;
    popupY: number;
    startTime: number;
  } | null>(null);

  const goldBtnRef = useRef<HTMLButtonElement>(null);

  const [rewardCards] = useState<Card[]>(() => {
    const dropPool = ALL_CARDS.filter(c => c.tier !== 'BASIC');
    const lootRng = useRngStore.getState().lootRng;
    const shuffled = lootRng.shuffle(dropPool) as Card[];
    return shuffled.slice(0, 3);
  });

  const isFinalBoss = currentScene === 'BOSS' && currentChapter >= 3;
  const goldAmount = currentScene === 'BOSS' ? 100 : currentScene === 'ELITE' ? 50 : 20;
  const showRelic = !isFinalBoss && (currentScene === 'ELITE' || currentScene === 'BOSS');
  const iconSize = 64;

  const handleGoldClaim = useCallback(() => {
    if (goldClaimed) return;
    addGold(goldAmount);
    setGoldClaimed(true);

    const btn = goldBtnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;
    const targetX = 240;
    const targetY = 30;

    const coinCount = Math.min(Math.max(6, Math.floor(goldAmount / 5)), 12);
    const coins: CoinData[] = [];
    for (let i = 0; i < coinCount; i++) {
      coins.push({
        startX: startX + (Math.random() - 0.5) * 30,
        startY: startY + (Math.random() - 0.5) * 20,
        targetX: targetX + (Math.random() - 0.5) * 20,
        targetY: targetY + (Math.random() - 0.5) * 10,
        delay: i * 40 + Math.random() * 20,
        duration: 0.45 + Math.random() * 0.2,
        curveX: (Math.random() - 0.5) * 100,
        curveY: (Math.random() - 0.5) * 40,
      });
    }

    setGoldEffect({
      coins,
      popupAmount: goldAmount,
      popupX: startX,
      popupY: startY - 30,
      startTime: Date.now(),
    });
  }, [goldClaimed, goldAmount, addGold]);

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(5, 5, 3, 0.9)',
      zIndex: 200,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      color: '#e8dcc8',
      animation: 'fadeIn 0.5s ease-out',
    }}>
      {/* 타이틀 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', animation: 'slideUp 0.4s ease-out' }}>
        <img src={iconBossClear} alt="" style={{ width: 48, height: 48, objectFit: 'contain', filter: 'drop-shadow(0 0 10px rgba(100, 255, 100, 0.5))' }} />
        <h1 style={{
          fontSize: '44px', color: '#66cc88', margin: 0,
          textShadow: '2px 3px 6px rgba(0,0,0,0.8), 0 0 20px rgba(100, 200, 100, 0.3)',
        }}>
          전투 승리!
        </h1>
      </div>

      {/* 보상 아이콘 가로 배치 (최종 보스는 보상 없음) */}
      {!isFinalBoss && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '24px',
          margin: '28px 0',
          animation: 'slideUp 0.5s ease-out',
        }}>
          {/* 골드 */}
          <button
            ref={goldBtnRef}
            onClick={handleGoldClaim}
            disabled={goldClaimed}
            style={{
              background: 'none', border: 'none',
              cursor: goldClaimed ? 'default' : 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
              opacity: goldClaimed ? 0.35 : 1,
              transition: 'transform 0.2s, opacity 0.3s',
            }}
            onMouseEnter={e => { if (!goldClaimed) e.currentTarget.style.transform = 'scale(1.15)'; }}
            onMouseLeave={e => { if (!goldClaimed) e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <img src={iconGoldReward} alt="골드" style={{ width: iconSize, height: iconSize, objectFit: 'contain', filter: goldClaimed ? 'grayscale(1)' : 'drop-shadow(0 0 8px rgba(212,168,84,0.5))' }} />
            <span style={{ fontSize: '14px', fontWeight: 'bold', color: goldClaimed ? '#666' : '#d4a854' }}>
              {goldAmount}G
            </span>
          </button>

          {/* 카드 */}
          <button
            onClick={() => { if (!cardClaimed) setIsCardModalOpen(true); }}
            disabled={cardClaimed}
            style={{
              background: 'none', border: 'none',
              cursor: cardClaimed ? 'default' : 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
              opacity: cardClaimed ? 0.35 : 1,
              transition: 'transform 0.2s',
            }}
            onMouseEnter={e => { if (!cardClaimed) e.currentTarget.style.transform = 'scale(1.15)'; }}
            onMouseLeave={e => { if (!cardClaimed) e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <img src={iconCardCount} alt="카드" style={{ width: iconSize, height: iconSize, objectFit: 'contain', filter: cardClaimed ? 'grayscale(1)' : 'drop-shadow(0 0 8px rgba(100,150,220,0.5))' }} />
          </button>

          {/* 유물 (엘리트/보스만) */}
          {showRelic && (
            <button
              onClick={() => { if (!relicClaimed) setIsRelicModalOpen(true); }}
              disabled={relicClaimed}
              style={{
                background: 'none', border: 'none',
                cursor: relicClaimed ? 'default' : 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                opacity: relicClaimed ? 0.35 : 1,
                transition: 'transform 0.2s',
              }}
              onMouseEnter={e => { if (!relicClaimed) e.currentTarget.style.transform = 'scale(1.15)'; }}
              onMouseLeave={e => { if (!relicClaimed) e.currentTarget.style.transform = 'scale(1)'; }}
            >
              <img src={iconRelicReward} alt="유물" style={{ width: iconSize, height: iconSize, objectFit: 'contain', filter: relicClaimed ? 'grayscale(1)' : 'drop-shadow(0 0 8px rgba(200,100,100,0.5))' }} />
            </button>
          )}
        </div>
      )}

      {/* 계속하기 */}
      <button
        onClick={onContinue}
        style={{
          padding: '14px 40px',
          fontSize: '18px', fontWeight: 'bold',
          background: 'none', color: '#66cc88',
          border: '1px solid rgba(60, 180, 100, 0.4)',
          borderRadius: '6px', cursor: 'pointer',
          transition: 'all 0.2s',
          textShadow: '1px 1px 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.5)',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(100, 220, 140, 0.6)'; e.currentTarget.style.color = '#88eebb'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(60, 180, 100, 0.4)'; e.currentTarget.style.color = '#66cc88'; }}
      >
        {currentScene === 'BOSS' ? (currentChapter >= 3 ? '엔딩 보기' : '다음 구역으로...') : '계속하기'}
      </button>

      {/* 골드 이펙트 (Canvas 기반) */}
      {goldEffect && <GoldEffect {...goldEffect} />}

      {isCardModalOpen && (
        <CardRewardModal
          rewardCards={rewardCards}
          onClose={() => setIsCardModalOpen(false)}
          onCardSelected={() => setCardClaimed(true)}
        />
      )}

      {isRelicModalOpen && (
        <RelicRewardModal
          guaranteedTier={currentScene === 'BOSS' ? 'BOSS' : undefined}
          onClose={() => setIsRelicModalOpen(false)}
          onRelicSelected={() => setRelicClaimed(true)}
        />
      )}
    </div>
  );
};
