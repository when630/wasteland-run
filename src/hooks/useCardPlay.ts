import { useBattleStore } from '../store/useBattleStore';
import { useDeckStore } from '../store/useDeckStore';

/**
 * 카드를 플레이할 때 호출하는 커스텀 훅
 * AP, Ammo 코스트 검증, 자원 차감, 그리고 덱 상태(playCardFromHand) 변경을 한 번에 처리합니다.
 */
export const useCardPlay = () => {
  const { currentTurn, playerActionPoints, playerAmmo, useAp, addAmmo } = useBattleStore();
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

    // 탄약 소모 로직 (현재 useBattleStore에는 addAmmo만 있으므로 음수 값을 더함)
    if (card.costAmmo > 0) {
      addAmmo(-card.costAmmo);
    }

    // 5. 카드 사용 처리 (비우기/소멸)
    playCardFromHand(cardId);

    // TODO: 6. CardEffect 기반의 실제 데미지/방어 퍼포먼스 발동 처리 예정
    console.log(`[Card Played] ${card.name} 사용! (AP: -${card.costAp}, Ammo: -${card.costAmmo})`);

    return true;
  };

  return { playCard };
};
