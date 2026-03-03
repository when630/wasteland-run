import { useBattleStore } from '../store/useBattleStore';
import type { DamageType } from '../store/useBattleStore';
import { useDeckStore } from '../store/useDeckStore';

/**
 * 카드를 플레이할 때 호출하는 커스텀 훅
 * AP, Ammo 코스트 검증, 자원 차감, 그리고 덱 상태(playCardFromHand) 변경을 한 번에 처리합니다.
 */
export const useCardPlay = () => {
  const {
    currentTurn, playerActionPoints, playerAmmo,
    useAp, addAmmo, enemies,
    applyDamageToEnemy, addPlayerShield, addPlayerResist
  } = useBattleStore();
  const { hand, playCardFromHand } = useDeckStore();

  const playCard = (cardId: string) => {
    // 1. 플레이어 턴 검사
    if (currentTurn !== 'PLAYER') {
      console.warn('플레이어 턴이 아닙니다.');
      return false;
    }

    // 2. 카드 정보 찾기
    const card = hand.find((c) => c.id === cardId);
    if (!card) {
      console.warn('손패에 해당 카드가 없습니다.');
      return false;
    }

    // 3. 코스트(AP/Ammo) 검사
    if (playerActionPoints < card.costAp) {
      console.warn(`AP가 부족합니다. (필요: ${card.costAp}, 보유: ${playerActionPoints})`);
      return false;
    }
    if (playerAmmo < card.costAmmo) {
      console.warn(`탄약이 부족합니다. (필요: ${card.costAmmo}, 보유: ${playerAmmo})`);
      return false;
    }

    // 4. 자원 차감
    const apUsed = useAp(card.costAp);
    if (!apUsed) return false; // 혹시 모를 내부 검증 실패 대비

    // 탄약 소모 로직
    if (card.costAmmo > 0) {
      addAmmo(-card.costAmmo);
    }

    // 5. CardEffect 기반의 실제 데미지/방어 퍼포먼스 발동 처리
    // 현재는 단일 적(enemies[0]) 대상 타겟팅만 지원하도록 하드코딩 (차후 다중 타겟 시스템 확장)
    const targetEnemy = enemies.length > 0 ? enemies[0] : null;

    card.effects.forEach((effect) => {
      if (effect.type === 'DAMAGE' && effect.amount && targetEnemy) {
        // 물리/특수 속성은 카드 타입으로 유추
        const dType: DamageType = card.type === 'SPECIAL_ATTACK' ? 'SPECIAL' : 'PHYSICAL';
        applyDamageToEnemy(targetEnemy.id, effect.amount, dType);
      } else if (effect.type === 'SHIELD' && effect.amount) {
        addPlayerShield(effect.amount);
      } else if (effect.type === 'RESIST' && effect.amount) {
        addPlayerResist(effect.amount);
      }
    });

    console.log(`[Card Played] ${card.name} 사용! (효과 처리 완료)`);

    // 6. 카드 사용 처리 (비우기/소멸)
    playCardFromHand(cardId);

    return true;
  };

  return { playCard };
};

