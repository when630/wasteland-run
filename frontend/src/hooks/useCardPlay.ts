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
      if (targetingCardId === cardId) {
        // 이미 타겟팅 중인 카드를 한 번 더 눌렀을 경우 -> 타겟팅 취소
        useAudioStore.getState().playClick();
        setTargetingCard(null);
        return false;
      }

      useAudioStore.getState().playClick(); // 타겟팅 시 클릭음
      setTargetingCard(cardId);
      return false;
    }

    // 🌟 유물 효과: [불안정한 아크 심장]
    // 이번 턴의 첫 번째 UTILITY 카드라면 대상 지정 여부와 상관없이 적을 무작위로 선택함
    let finalTargetId = targetId;

    // 공격형 카드이면서, 전체 타겟이 아니며, 플레이어 타겟도 아닐 경우에만 적 타겟팅 요구 ('단일 공격')
    let needsEnemyTarget = card.effects.some(e =>
      (e.type === 'DAMAGE' || e.type === 'DEBUFF') &&
      e.target !== 'ALL_ENEMIES' &&
      e.target !== 'PLAYER'
    );

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
      // 🌟 단일 대상이 아닌 카드(전체 공격/버프/방어)는 어디를 클릭해도 발동
      finalTargetId = 'PLAYER';
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

    // 탄약 소모 로직 (과충전 코일건 처럼 전체 소모 기믹 대비)
    let consumedAmmoAmount = 0;
    if (card.effects.some(e => e.condition === 'PER_AMMO_CONSUMED')) {
      // 🌟 모든 탄약 소모
      consumedAmmoAmount = playerAmmo;
      if (playerAmmo > 0) {
        addAmmo(-playerAmmo);
      }
    } else if (card.costAmmo > 0) {
      addAmmo(-card.costAmmo);
    }

    // 7. CardEffect 기반의 실제 퍼포먼스 발동 처리
    const targetEnemy = (finalTargetId && finalTargetId !== 'PLAYER') ? enemies.find(e => e.id === finalTargetId) : null;

    let hasDamage = false;
    let hasBuff = false;

    card.effects.forEach((effect) => {
      if (effect.type === 'DAMAGE' && effect.amount) {
        // 물리/특수 속성은 카드 타입으로 유추
        const dType: DamageType = card.type === 'SPECIAL_ATTACK' ? 'SPECIAL' : 'PHYSICAL';

        // 🌟 [과충전 코일건] 타격
        if (effect.condition === 'PER_AMMO_CONSUMED') {
          if (targetEnemy) {
            applyDamageToEnemy(targetEnemy.id, effect.amount * consumedAmmoAmount, dType);
            hasDamage = true;
          }
        }
        // 🌟 [대물 저격 사격] 적이 '공격' 의도일 때 추가 데미지
        else if (effect.condition?.startsWith('BONUS_IF_ATTACKING_')) {
          if (targetEnemy) {
            const bonus = parseInt(effect.condition.split('_')[3], 10) || 0;
            let finalDamage = effect.amount;
            if (targetEnemy.currentIntent?.type === 'ATTACK') {
              finalDamage += bonus;
              setToastMessage(`카운터 적중! 추가 피해 +${bonus}`);
            }
            applyDamageToEnemy(targetEnemy.id, finalDamage, dType);
            hasDamage = true;
          }
        }
        // 🌟 [전기톱 갈아버리기] 다단 히트
        else if (effect.condition?.startsWith('MULTI_HIT_')) {
          if (targetEnemy) {
            const hits = parseInt(effect.condition.split('_')[2], 10) || 1;
            // 타격당 개별적인 피해 연산을 수행할 수 있도록 반복 호출
            for (let i = 0; i < hits; i++) {
              applyDamageToEnemy(targetEnemy.id, effect.amount, dType);
            }
            hasDamage = true;
          }
        }
        // 🌟 [급조된 네이팜], [수제 독성 가스탄] 구역 데미지
        else if (effect.target === 'ALL_ENEMIES') {
          enemies.forEach(e => {
            if (e.currentHp > 0) {
              applyDamageToEnemy(e.id, effect.amount!, dType);
            }
          });
          hasDamage = true;
        }
        // 일반 단일 공격
        else if (targetEnemy) {
          applyDamageToEnemy(targetEnemy.id, effect.amount, dType);
          hasDamage = true;
        }

      } else if (effect.type === 'SHIELD' && effect.amount) {
        addPlayerShield(effect.amount);
        hasBuff = true;
      } else if (effect.type === 'RESIST' && effect.amount) {
        addPlayerResist(effect.amount);
        hasBuff = true;
      } else if (effect.type === 'DRAW' && effect.amount) {
        useDeckStore.getState().drawCards(effect.amount);
        hasBuff = true;
      } else if (effect.type === 'ADD_AMMO' && effect.amount) {
        addAmmo(effect.amount);
        hasBuff = true;
      } else if (effect.type === 'HEAL' && effect.amount) {
        // 음수면 피해, 양수면 회복 (카드 효과에서는 보통 자신 피해로 쓰임)
        if (effect.amount > 0) {
          useRunStore.getState().healPlayer(effect.amount);
        } else {
          useRunStore.getState().damagePlayer(Math.abs(effect.amount));
        }
        hasBuff = true;
      } else if (effect.type === 'DEBUFF') {
        const amount = effect.amount || 1;
        if (effect.target === 'ALL_ENEMIES') {
          enemies.forEach(e => {
            if (e.currentHp > 0) {
              useBattleStore.getState().applyStatusToEnemy(e.id, effect.condition!, amount);
            }
          });
          setToastMessage(`적 전체에 ${effect.condition} ${amount} 부여!`);
        } else if (targetEnemy) {
          useBattleStore.getState().applyStatusToEnemy(targetEnemy.id, effect.condition!, amount);
          setToastMessage(`${targetEnemy.name}에게 ${effect.condition} ${amount} 부여!`);
        } else if (effect.target === 'PLAYER') {
          // 플레이어 상태이상: 현재 기획된 카드에선 직접 사용되지 않으나, 향후 확장 시 이곳에 로직 추가
          console.log(`[CardPlay] 플레이어 대상 상태이상 효과 예약됨: ${effect.condition} x${amount}`);
        }
      } else if (effect.type === 'BUFF') {
        if (effect.condition === 'PURIFY_1') {
          setToastMessage('디버프 1개 정화 됨 (효과 구현 중)');
        } else if (effect.condition?.startsWith('ADD_AP_')) {
          const apToAdd = parseInt(effect.condition.split('_')[2], 10);
          useBattleStore.getState().consumeAp(-apToAdd); // AP 획득
        } else {
          setToastMessage(`버프 획득: ${effect.condition} (효과 구현 중)`);
        }
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

