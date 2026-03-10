import React, { useState } from 'react';
import { useDeckStore } from '../../store/useDeckStore';
import { useBattleStore } from '../../store/useBattleStore';
import { useCardPlay } from '../../hooks/useCardPlay';

export const Hand: React.FC = () => {
  const { hand } = useDeckStore();
  const { targetingCardId, playerStatus } = useBattleStore();
  const { playCard } = useCardPlay();
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

  return (
    <div style={{
      position: 'absolute',
      bottom: '-30px', /* 핸드 뭉치 자체를 좀 더 화면 밖으로 내림 */
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-end',
      pointerEvents: 'none', // 카드 자체에만 반응하기 위해 컨테이너는 none으로 설정
      zIndex: 50,
      width: '80%', // 너무 퍼지지 않게 핸드 영역 지정
      height: '300px' // 카드가 떠오를 여유 공간
    }}>
      {hand.map((card, index) => {
        const isStatusCard = card.type.startsWith('STATUS_');
        const isPhysicalAttack = card.type === 'PHYSICAL_ATTACK';
        const isLocked = isPhysicalAttack && playerStatus.cannotPlayPhysicalAttack;
        const displayApCost = (isPhysicalAttack && playerStatus.nextPhysicalFree) ? 0 : card.costAp;
        const isSelected = targetingCardId === card.id;
        const isHovered = hoveredCardId === card.id;
        // 타겟팅 라벨 업데이트 (단일 공격/디버프만 적 타겟 요구)
        const needsEnemyTarget = card.effects.some((e) =>
          (e.type === 'DAMAGE' || e.type === 'DEBUFF') &&
          e.target !== 'ALL_ENEMIES' &&
          e.target !== 'PLAYER'
        );
        const targetLabel = needsEnemyTarget ? '🎯 단일 적' : '👤 전체/나';

        // 🌟 아치형 부채꼴 배치를 위한 수식
        const totalCards = hand.length;
        // 중심을 0으로 둥글게 배치하기 위한 인덱스 편차 (예: 5장이면 -2, -1, 0, 1, 2)
        const offset = index - (totalCards - 1) / 2;

        // 양 끝 카드는 많이 꺾이고, 떨어질수록 위치가 내려감 (2차 함수형 커브)
        const baseRotation = offset * 4; // 카드당 4도 간격 꺾임
        const baseYTranslate = Math.pow(Math.abs(offset), 2) * 5; // 카드당 높이 커브 조절 (0, 5, 20px 차이)

        // 호버 시 계산 (회전 해제, 크게 떠오름)
        // 선택 시 계산 (호버보다 훨씬 높이 떠오름)
        const finalRotation = (isHovered || isSelected) ? 0 : baseRotation;
        const finalTranslateY = isSelected ? -70 : isHovered ? -40 : baseYTranslate;
        const finalScale = isSelected ? 1.2 : isHovered ? 1.2 : 1.0;

        return (
          <div
            key={card.id}
            onClick={(e) => {
              if (isLocked) return;
              // DOM 요소를 통한 중심 상단 좌표 계산
              const rect = e.currentTarget.getBoundingClientRect();
              const startX = rect.left + rect.width / 2;
              const startY = rect.top; // 카드 윗부분 시작점

              // 기존 playCard 실행 전 위치 세팅 (추후 useCardPlay 내부나 스토어 감지에 의해 취소 처리 될 수 있음)
              useBattleStore.getState().setTargetingPosition({ x: startX, y: startY });

              playCard(card.id);
            }}
            style={{
              position: 'relative',
              width: '130px',
              height: '190px',
              backgroundColor: isStatusCard ? '#3a1520' : isLocked ? '#1a1a1a' : '#2a2a2a',
              border: `2px solid ${isLocked ? '#aa2222' : isSelected ? '#ffaa00' : isStatusCard ? '#aa3344' : isHovered ? '#aaa' : '#555'}`,
              borderRadius: '8px',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              cursor: isLocked ? 'not-allowed' : 'pointer',
              opacity: isLocked ? 0.5 : 1,
              pointerEvents: 'auto', // 🌟 카드 본체는 마우스 이벤트 수신
              // 🌟 겹침(오버랩) 마진 효과
              marginLeft: index === 0 ? '0px' : '-50px',
              // 🌟 Slay the Spire 식 트랜스폼
              transform: `translateY(${finalTranslateY}px) rotate(${finalRotation}deg) scale(${finalScale})`,
              transformOrigin: 'bottom center',
              zIndex: isSelected ? 200 : isHovered ? 100 : index + 10,
              boxShadow: isSelected
                ? '0 0 25px rgba(255, 170, 0, 0.9)'
                : isStatusCard
                  ? '0 0 12px rgba(170, 50, 70, 0.6)'
                  : isHovered
                    ? '0 10px 20px rgba(255, 255, 255, 0.4)'
                    : '0 4px 10px rgba(0,0,0,0.5)',
              transition: 'transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275), border-color 0.2s, box-shadow 0.2s, z-index 0s',
              userSelect: 'none'
            }}
            onMouseEnter={() => setHoveredCardId(card.id)}
            onMouseLeave={() => setHoveredCardId(prev => prev === card.id ? null : prev)}
          >
            {/* 상단: 이름 및 코스트 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontWeight: 'bold', fontSize: '13px', color: '#fff', wordBreak: 'keep-all' }}>
                {card.name}
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                <span style={{
                  backgroundColor: displayApCost === 0 && card.costAp > 0 ? '#44ff44' : '#ffcc00',
                  color: '#000', borderRadius: '50%',
                  width: '24px', height: '24px', display: 'flex', justifyContent: 'center',
                  alignItems: 'center', fontSize: '14px', fontWeight: 'bold'
                }}>
                  {displayApCost}
                </span>
                {card.costAmmo > 0 && (
                  <span style={{
                    backgroundColor: '#cc9944', color: '#000', borderRadius: '50%',
                    width: '18px', height: '18px', display: 'flex', justifyContent: 'center',
                    alignItems: 'center', fontSize: '11px', fontWeight: 'bold'
                  }}>
                    {card.costAmmo}
                  </span>
                )}
              </div>
            </div>

            {/* 중앙: 타입 및 타겟 대상 뱃지 */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', margin: '5px 0' }}>
              <span style={{ fontSize: '10px', padding: '3px 6px', backgroundColor: isStatusCard ? '#661133' : '#444', borderRadius: '4px', color: isStatusCard ? '#ff8899' : '#bbb' }}>
                {isStatusCard ? '⚠ 상태이상' : card.type.replace('_', ' ')}
              </span>
              <span style={{ fontSize: '10px', padding: '3px 6px', backgroundColor: needsEnemyTarget ? '#662222' : '#225522', borderRadius: '4px', color: '#ddd' }}>
                {targetLabel}
              </span>
            </div>

            {/* 하단: 효과 텍스트 */}
            <div style={{ fontSize: '12px', color: '#ddd', textAlign: 'center' }}>
              {card.description}
            </div>

            {/* 잠금 오버레이 */}
            {isLocked && (
              <div style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                borderRadius: '8px',
                fontSize: '36px',
                pointerEvents: 'none'
              }}>
                🔒
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
