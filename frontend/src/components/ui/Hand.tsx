import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useDeckStore } from '../../store/useDeckStore';
import { useBattleStore } from '../../store/useBattleStore';
import { useCardPlay } from '../../hooks/useCardPlay';
import { useResponsive } from '../../hooks/useResponsive';
import { TargetingLine } from './TargetingLine';
import { CardFrame } from './CardFrame';
import { enemyPos } from '../pixi/vfx/battleLayout';

const DRAG_MIN_DIST = 10;
const PLAY_ZONE_RATIO = 0.78;

/** 화면 좌표 → Pixi 월드 좌표 역변환으로 가장 가까운 생존 적 탐색 */
function findNearestEnemyId(sx: number, sy: number): string | null {
  const es = useBattleStore.getState().enemies;
  const w = window.innerWidth;
  const h = window.innerHeight;
  const scale = (w / h > 16 / 9) ? h / 1080 : w / 1920;
  const cx = (w - 1920 * scale) / 2;
  const cy = (h - 1080 * scale) / 2;

  let bestId: string | null = null;
  let bestDist = Infinity;

  es.forEach((enemy, i) => {
    if (enemy.currentHp <= 0) return;
    const ePos = enemyPos(i, es.length);
    const ex = ePos.x * scale + cx;
    const ey = ePos.y * scale + cy;
    const d = Math.hypot(sx - ex, sy - ey);
    if (d < bestDist) { bestDist = d; bestId = enemy.id; }
  });

  return bestDist < Math.max(140, 200 * scale) ? bestId : null;
}

/** 카드가 단일 적 타겟팅이 필요한지 체크 */
function cardNeedsEnemyTarget(card: { effects: Array<{ type: string; target?: string }> }): boolean {
  return card.effects.some(e =>
    (e.type === 'DAMAGE' || e.type === 'DEBUFF') &&
    e.target !== 'ALL_ENEMIES' && e.target !== 'PLAYER'
  );
}

export const Hand: React.FC = () => {
  const { hand } = useDeckStore();
  const { targetingCardId, playerStatus } = useBattleStore();
  const { playCard } = useCardPlay();
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const { isMobile, isTablet, width } = useResponsive();

  // === Drag-to-play ===
  const [dragState, setDragState] = useState<{
    cardId: string;
    x: number;
    y: number;
    startX: number;
    startY: number;
  } | null>(null);

  const cardElRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Refs for stable closure access in global event handlers
  const playCardRef = useRef(playCard);
  playCardRef.current = playCard;
  const handRef = useRef(hand);
  handRef.current = hand;
  const dragStateRef = useRef(dragState);
  dragStateRef.current = dragState;

  // 드래그 파생 상태
  const isActiveDrag = dragState !== null &&
    (Math.abs(dragState.x - dragState.startX) + Math.abs(dragState.y - dragState.startY)) > DRAG_MIN_DIST;
  const draggingCard = dragState ? hand.find(c => c.id === dragState.cardId) : null;
  const inPlayZone = isActiveDrag && dragState!.y < window.innerHeight * PLAY_ZONE_RATIO;

  // 공격 카드 드래그 타겟팅 모드: 플레이 존 위 + 단일 타겟 카드
  const isDragTargeting = inPlayZone && draggingCard && cardNeedsEnemyTarget(draggingCard);

  // 타겟팅 선 시작점 계산 (카드 DOM 위치 기반)
  const dragTargetLineStart = (() => {
    if (!isDragTargeting || !dragState) return null;
    const el = cardElRefs.current.get(dragState.cardId);
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top };
  })();

  // 전역 포인터 핸들러 (드래그 추적 + 드롭 처리)
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!dragStateRef.current) return;
      e.preventDefault();
      setDragState(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null);
    };

    const onUp = (e: PointerEvent) => {
      const ds = dragStateRef.current;
      if (!ds) return;

      const dist = Math.abs(e.clientX - ds.startX) + Math.abs(e.clientY - ds.startY);
      const playZoneY = window.innerHeight * PLAY_ZONE_RATIO;

      if (dist < DRAG_MIN_DIST) {
        // 짧은 이동 = 클릭 (기존 동작 유지)
        setHoveredCardId(null); // 클릭 후 호버 해제 → 선택 취소 시 카드가 손패로 복귀
        const card = handRef.current.find(c => c.id === ds.cardId);
        if (card) {
          const el = cardElRefs.current.get(ds.cardId);
          if (el) {
            const rect = el.getBoundingClientRect();
            useBattleStore.getState().setTargetingPosition({
              x: rect.left + rect.width / 2, y: rect.top,
            });
          }
          playCardRef.current(card.id);
        }
      } else if (e.clientY < playZoneY) {
        // 드래그 → 플레이 존 위에서 놓기
        const card = handRef.current.find(c => c.id === ds.cardId);
        if (card) {
          if (cardNeedsEnemyTarget(card)) {
            const enemyId = findNearestEnemyId(e.clientX, e.clientY);
            if (enemyId) {
              useBattleStore.getState().setTargetingPosition({ x: e.clientX, y: e.clientY });
              playCardRef.current(ds.cardId, enemyId);
            }
          } else {
            useBattleStore.getState().setTargetingCard(null);
            useBattleStore.getState().setTargetingPosition({ x: e.clientX, y: e.clientY });
            playCardRef.current(ds.cardId, 'PLAYER');
          }
        }
      }

      setDragState(null);
    };

    window.addEventListener('pointermove', onMove, { passive: false });
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, []);

  // 드래그 중 카드가 핸드에서 제거되면 드래그 취소
  useEffect(() => {
    if (dragState && !hand.find(c => c.id === dragState.cardId)) {
      setDragState(null);
    }
  }, [hand, dragState]);

  // 드래그 중 플레이 존 진입 시 적 데미지 프리뷰 활성화
  useEffect(() => {
    if (inPlayZone && draggingCard) {
      useBattleStore.getState().setDragPreviewCard(draggingCard.id);
    } else {
      useBattleStore.getState().setDragPreviewCard(null);
    }
  }, [inPlayZone, draggingCard]);

  // 레이아웃 계산
  const cardWidth = isMobile ? 78 : isTablet ? 110 : width >= 1440 ? 160 : 140;
  const cardHeight = cardWidth * (320 / 220);
  const baseOverlap = isMobile ? -28 : isTablet ? -40 : width >= 1440 ? -55 : -50;
  const overlapExtra = hand.length > 6 ? (hand.length - 6) * (isMobile ? -4 : -6) : 0;
  const cardOverlap = baseOverlap + overlapExtra;
  const containerHeight = isMobile ? 160 : isTablet ? 210 : width >= 1440 ? 280 : 260;

  return (
    <div style={{
      position: 'absolute',
      bottom: isMobile ? '-40px' : '-60px',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-end',
      pointerEvents: 'none',
      zIndex: 50,
      width: isMobile ? '95%' : '80%',
      height: `${containerHeight}px`
    }}>
      {hand.map((card, index) => {
        const isPhysicalAttack = card.type === 'PHYSICAL_ATTACK';
        const isLocked = isPhysicalAttack && playerStatus.cannotPlayPhysicalAttack;
        const displayApCost = (isPhysicalAttack && playerStatus.nextPhysicalFree) ? 0 : card.costAp;
        const isSelected = targetingCardId === card.id;
        const isHovered = hoveredCardId === card.id;
        const isBeingDragged = isActiveDrag && dragState?.cardId === card.id;
        const isDragLifted = isDragTargeting && dragState?.cardId === card.id;

        // 아치형 부채꼴 배치
        const totalCards = hand.length;
        const offset = index - (totalCards - 1) / 2;
        const maxOffset = (totalCards - 1) / 2 || 1;
        const maxEdgeRotation = Math.min(isMobile ? 18 : 25, totalCards * (isMobile ? 3 : 4));
        const maxYDrop = Math.min(isMobile ? 25 : 40, totalCards * (isMobile ? 5 : 6));

        const rotationStep = maxEdgeRotation / maxOffset;
        const baseRotation = offset * rotationStep;
        const normalizedOffset = offset / maxOffset;
        const baseYTranslate = normalizedOffset * normalizedOffset * maxYDrop;

        const finalRotation = (isHovered || isSelected || isDragLifted) ? 0 : baseRotation;
        const finalTranslateY = (isSelected || isDragLifted) ? -55 : isHovered ? -45 : baseYTranslate;
        const finalScale = (isSelected || isDragLifted) ? 1.15 : isHovered ? 1.15 : 1.0;

        return (
          <div
            key={card.id}
            ref={(el) => {
              if (el) cardElRefs.current.set(card.id, el);
              else cardElRefs.current.delete(card.id);
            }}
            onPointerDown={(e) => {
              if (e.button !== 0) return;
              if (isLocked) return;
              if (useBattleStore.getState().currentTurn !== 'PLAYER') return;
              e.preventDefault();
              setDragState({
                cardId: card.id,
                x: e.clientX,
                y: e.clientY,
                startX: e.clientX,
                startY: e.clientY,
              });
            }}
            style={{
              position: 'relative',
              width: `${cardWidth}px`,
              height: `${cardHeight}px`,
              cursor: isLocked ? 'not-allowed' : 'pointer',
              opacity: (isBeingDragged && !isDragLifted) ? 0.3 : isLocked ? 0.5 : 1,
              pointerEvents: 'auto',
              marginLeft: index === 0 ? '0px' : `${cardOverlap}px`,
              transform: `translateY(${finalTranslateY}px) rotate(${finalRotation}deg) scale(${finalScale})`,
              transformOrigin: 'bottom center',
              zIndex: (isSelected || isDragLifted) ? 200 : isHovered ? 100 : index + 10,
              borderRadius: `${12 * (cardWidth / 220)}px`,
              boxShadow: (isSelected || isDragLifted)
                ? '0 0 25px rgba(255, 170, 0, 0.9)'
                : isHovered
                  ? '0 10px 20px rgba(255, 255, 255, 0.3)'
                  : '0 4px 10px rgba(0,0,0,0.5)',
              transition: (isBeingDragged && !isDragLifted)
                ? 'opacity 0.15s'
                : 'transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.2s, z-index 0s, opacity 0.15s',
              userSelect: 'none',
              touchAction: 'none',
            }}
            onMouseEnter={() => { if (!dragState) setHoveredCardId(card.id); }}
            onMouseLeave={() => setHoveredCardId(prev => prev === card.id ? null : prev)}
          >
            <CardFrame card={card} width={cardWidth} displayApCost={displayApCost} isLocked={isLocked} />
          </div>
        );
      })}

      {/* 포탈: 고스트 카드 / 타겟팅 선 / 플레이 존 경계선 */}
      {isActiveDrag && dragState && createPortal(
        <>
          {/* 플레이 존 경계선 */}
          <div style={{
            position: 'fixed',
            left: 0,
            top: `${window.innerHeight * PLAY_ZONE_RATIO}px`,
            width: '100%',
            height: '2px',
            background: inPlayZone
              ? 'linear-gradient(90deg, transparent 5%, rgba(255, 170, 0, 0.5) 30%, rgba(255, 170, 0, 0.7) 50%, rgba(255, 170, 0, 0.5) 70%, transparent 95%)'
              : 'linear-gradient(90deg, transparent 10%, rgba(255, 255, 255, 0.12) 40%, rgba(255, 255, 255, 0.12) 60%, transparent 90%)',
            pointerEvents: 'none',
            zIndex: 9998,
            transition: 'background 0.2s',
          }} />

          {/* 공격 카드 타겟팅 드래그: 고스트 대신 카드→커서 타겟팅 선 */}
          {isDragTargeting && dragTargetLineStart && (
            <TargetingLine
              startX={dragTargetLineStart.x} startY={dragTargetLineStart.y}
              endX={dragState.x} endY={dragState.y}
              positioning="fixed" zIndex={9999}
            />
          )}

          {/* 비타겟 카드 또는 플레이 존 아래: 고스트 카드 */}
          {!isDragTargeting && draggingCard && (
            <div style={{
              position: 'fixed',
              left: dragState.x - cardWidth / 2,
              top: dragState.y - cardHeight / 2,
              pointerEvents: 'none',
              zIndex: 9999,
              transform: `scale(1.1) rotate(${inPlayZone ? 0 : -3}deg)`,
              boxShadow: inPlayZone
                ? '0 0 30px rgba(255, 170, 0, 0.8), 0 0 60px rgba(255, 170, 0, 0.3)'
                : '0 10px 30px rgba(0, 0, 0, 0.7)',
              borderRadius: `${12 * (cardWidth / 220)}px`,
              transition: 'box-shadow 0.15s, transform 0.15s',
              opacity: 0.95,
              userSelect: 'none',
            }}>
              <CardFrame card={draggingCard} width={cardWidth} />
            </div>
          )}
        </>,
        document.body
      )}
    </div>
  );
};
