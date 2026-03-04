import { useBattleStore } from '../store/useBattleStore';
import type { DamageType } from '../store/useBattleStore';
import { useRunStore } from '../store/useRunStore';
import { useDeckStore } from '../store/useDeckStore';

import { useAudioStore } from '../store/useAudioStore';

/**
 * 카드를 플레이할 때 호출하는 커스텀 훅
 * AP, Ammo 코스트 검증, 자원 차감, 그리고 덱 상태(playCardFromHand) 변경을 한 번에 처리합니다.
 */
export const useCardPlay = () => {
  const {
    currentTurn, playerActionPoints, playerAmmo,
    consumeAp, addAmmo, enemies,
    applyDamageToEnemy, addPlayerShield, addPlayerResist,
    targetingCardId, setTargetingCard,
    hasPlayedUtilityThisTurn, setPlayedUtilityThisTurn
  } = useBattleStore();
  const { hand, playCardFromHand } = useDeckStore();
  const { relics, setToastMessage } = useRunStore();

  const playCard = (cardId: string, targetId?: string) => {
    // 1. 플레이어 턴 검사
    if (currentTurn !== 'PLAYER') {
      setToastMessage('아직 플레이어 턴이 아닙니다.');
      return false;
    }

    // 2. 카드 정보 찾기
    const card = hand.find((c) => c.id === cardId);
    if (!card) {
      console.warn('손패에 해당 카드가 없습니다.');
      return false;
    }

    // 3. 무조건 타겟팅 모드 진입 (대상을 아직 지정하지 않은 경우)
    if (!targetId) {
      useAudioStore.getState().playClick(); // 타겟팅 시 클릭음
      setTargetingCard(cardId);
      return false;
    }

    // 🌟 유물 효과: [불안정한 아크 심장]
    // 이번 턴의 첫 번째 UTILITY 카드라면 대상 지정 여부와 상관없이 적을 무작위로 선택함
    let finalTargetId = targetId;
    let needsEnemyTarget = card.effects.some(e => e.type === 'DAMAGE' || e.type === 'DEBUFF');

    if (card.type === 'UTILITY' && relics.includes('arc_heart') && !hasPlayedUtilityThisTurn) {
      console.log('⚡ [아크 심장 발동] 첫 번째 변화(UTILITY) 카드의 대상이 무작위 적으로 변경됩니다!');
      const livingEnemies = enemies.filter(e => e.currentHp > 0);
      if (livingEnemies.length > 0) {
        const randomEnemy = livingEnemies[Math.floor(Math.random() * livingEnemies.length)];
        finalTargetId = randomEnemy.id;
        needsEnemyTarget = true; // 무작위 공격으로 타겟 요구속성 강제 변조
      }
      setPlayedUtilityThisTurn(true); // 이번 턴 첫 변화 카드 사용 마킹
    }

    // 4. 대상 유형 검증 (공격형은 적에게, 방어/버프형은 나에게)
    if (needsEnemyTarget && finalTargetId === 'PLAYER') {
      setToastMessage('이 카드는 적을 대상으로 지정해야 합니다.');
      setTargetingCard(null);
      return false;
    }
    if (!needsEnemyTarget && finalTargetId !== 'PLAYER') {
      setToastMessage('이 카드는 플레이어 자신에게만 사용할 수 있습니다.');
      setTargetingCard(null);
      return false;
    }

    // 5. 코스트(AP/Ammo) 검사
    if (playerActionPoints < card.costAp) {
      setToastMessage(`AP가 부족합니다! (필요: ${card.costAp}, 현재: ${playerActionPoints})`);
      setTargetingCard(null); // 혹시 모를 타겟 취소
      return false;
    }
    if (playerAmmo < card.costAmmo) {
      setToastMessage(`탄약이 없습니다! (필요: ${card.costAmmo}, 현재: ${playerAmmo})`);
      setTargetingCard(null);
      return false;
    }

    // 6. 자원 차감
    const apUsed = consumeAp(card.costAp);
    if (!apUsed) return false; // 혹시 모를 내부 검증 실패 대비

    // 탄약 소모 로직
    if (card.costAmmo > 0) {
      addAmmo(-card.costAmmo);
    }

    // 7. CardEffect 기반의 실제 퍼포먼스 발동 처리
    const targetEnemy = (finalTargetId && finalTargetId !== 'PLAYER') ? enemies.find(e => e.id === finalTargetId) : null;

    let hasDamage = false;
    let hasBuff = false;

    card.effects.forEach((effect) => {
      if (effect.type === 'DAMAGE' && effect.amount && targetEnemy) {
        // 물리/특수 속성은 카드 타입으로 유추
        const dType: DamageType = card.type === 'SPECIAL_ATTACK' ? 'SPECIAL' : 'PHYSICAL';
        applyDamageToEnemy(targetEnemy.id, effect.amount, dType);
        hasDamage = true;
      } else if (effect.type === 'SHIELD' && effect.amount) {
        addPlayerShield(effect.amount);
        hasBuff = true;
      } else if (effect.type === 'RESIST' && effect.amount) {
        addPlayerResist(effect.amount);
        hasBuff = true;
      } else if (effect.type === 'ADD_AMMO' && effect.amount) {
        addAmmo(effect.amount);
        hasBuff = true;
      }
    });

    if (hasDamage) useAudioStore.getState().playHit();
    else if (hasBuff) useAudioStore.getState().playHeal();
    else useAudioStore.getState().playDraw(); // 유틸류는 드로우(휙) 소리로 대체

    // 🌟 유물 효과: [이중 합금 장갑판]
    if (relics.includes('alloy_plating')) {
      if (card.type === 'PHYSICAL_DEFENSE') {
        addPlayerResist(2);
      } else if (card.type === 'SPECIAL_DEFENSE') {
        addPlayerShield(2);
      }
    }

    console.log(`[Card Played] ${card.name} 사용! (효과 처리 완료)`);

    // 8. 타겟팅 모드 및 카드 사용 처리 (비우기/소멸)
    if (targetingCardId === cardId) {
      setTargetingCard(null);
    }
    playCardFromHand(cardId);

    return true;
  };

  return { playCard };
};

