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
    hasPlayedUtilityThisTurn, setPlayedUtilityThisTurn,
    playerStatus, powerPhysicalScalingBonus
  } = useBattleStore();
  const { hand, playCardFromHand } = useDeckStore();
  const { relics, setToastMessage } = useRunStore();

  const playCard = (cardId: string, targetId?: string) => {
    // 1. 플레이어 턴 검사
    if (currentTurn !== 'PLAYER') {
      setToastMessage('적의 차례입니다. 잠시 기다리세요.');
      return false;
    }

    // 2. 카드 정보 찾기
    const card = hand.find((c) => c.id === cardId);
    if (!card) {
      return false;
    }

    // 2.5. 물리 공격 금지 체크 (결사항전)
    if (card.type === 'PHYSICAL_ATTACK' && playerStatus.cannotPlayPhysicalAttack) {
      setToastMessage('이번 턴에는 물리 공격을 사용할 수 없습니다.');
      setTargetingCard(null);
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
      setToastMessage('타겟을 지정하세요 — 적을 클릭!');
      setTargetingCard(null);
      return false;
    }
    if (!needsEnemyTarget && finalTargetId !== 'PLAYER') {
      // 🌟 단일 대상이 아닌 카드(전체 공격/버프/방어)는 어디를 클릭해도 발동
      finalTargetId = 'PLAYER';
    }

    // 5. 코스트(AP/Ammo) 검사 — nextPhysicalFree 적용
    let effectiveApCost = card.costAp;
    if (card.type === 'PHYSICAL_ATTACK' && playerStatus.nextPhysicalFree) {
      effectiveApCost = 0;
    }

    if (playerActionPoints < effectiveApCost) {
      setToastMessage(`AP 부족! (${playerActionPoints}/${effectiveApCost})`);
      setTargetingCard(null); // 혹시 모를 타겟 취소
      return false;
    }
    if (playerAmmo < card.costAmmo) {
      setToastMessage(`탄약 부족! (${playerAmmo}/${card.costAmmo})`);
      setTargetingCard(null);
      return false;
    }

    // 6. 자원 차감
    const apUsed = consumeAp(effectiveApCost);
    if (!apUsed) return false; // 혹시 모를 내부 검증 실패 대비

    // nextPhysicalFree 소비
    if (card.type === 'PHYSICAL_ATTACK' && playerStatus.nextPhysicalFree) {
      useBattleStore.getState().setPlayerStatusField({ nextPhysicalFree: false });
      setToastMessage('무료 물리 공격!');
    }

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

        // 물리 피해 스케일링 보너스 적용 (청테이프 공학)
        let baseAmount = effect.amount;
        if (dType === 'PHYSICAL' && powerPhysicalScalingBonus > 0) {
          baseAmount += powerPhysicalScalingBonus;
        }

        // 🌟 [과충전 코일건] 타격
        if (effect.condition === 'PER_AMMO_CONSUMED') {
          if (targetEnemy) {
            applyDamageToEnemy(targetEnemy.id, baseAmount * consumedAmmoAmount, dType);
            hasDamage = true;
          }
        }
        // 🌟 [대물 저격 사격] 적이 '공격' 의도일 때 추가 데미지
        else if (effect.condition?.startsWith('BONUS_IF_ATTACKING_')) {
          if (targetEnemy) {
            const bonus = parseInt(effect.condition.split('_')[3], 10) || 0;
            let finalDamage = baseAmount;
            if (targetEnemy.currentIntent?.type === 'ATTACK') {
              finalDamage += bonus;
              setToastMessage(`카운터! +${bonus} 추가 피해`);
            }
            applyDamageToEnemy(targetEnemy.id, finalDamage, dType);
            hasDamage = true;
          }
        }
        // 🌟 [전기톱 갈아버리기] 다단 히트
        else if (effect.condition?.startsWith('MULTI_HIT_')) {
          if (targetEnemy) {
            const hits = parseInt(effect.condition.split('_')[2], 10) || 1;
            for (let i = 0; i < hits; i++) {
              applyDamageToEnemy(targetEnemy.id, baseAmount, dType);
            }
            hasDamage = true;
          }
        }
        // 🌟 [급조된 네이팜], [수제 독성 가스탄] 구역 데미지
        else if (effect.target === 'ALL_ENEMIES') {
          enemies.forEach(e => {
            if (e.currentHp > 0) {
              applyDamageToEnemy(e.id, baseAmount, dType);
            }
          });
          hasDamage = true;
        }
        // 일반 단일 공격
        else if (targetEnemy) {
          applyDamageToEnemy(targetEnemy.id, baseAmount, dType);
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
          setToastMessage(`전체 ${effect.condition} x${amount}!`);
        } else if (effect.target === 'PLAYER') {
          // 플레이어 대상 디버프
          if (effect.condition === 'CANNOT_PLAY_PHYSICAL_ATTACK') {
            useBattleStore.getState().setPlayerStatusField({ cannotPlayPhysicalAttack: true });
            setToastMessage('이번 턴 물리 공격 사용 불가!');
          }
        } else if (effect.condition?.startsWith('MARK_OF_FATE_')) {
          // 약육강식: 적에게 운명의 낙인
          if (targetEnemy) {
            const parts = effect.condition.split('_');
            const healAmount = parseInt(parts[3], 10) || 0;
            const ammoAmount = parseInt(parts[4], 10) || 0;
            useBattleStore.getState().setMarkOfFate(targetEnemy.id, healAmount, ammoAmount);
            setToastMessage(`${targetEnemy.name}에게 운명의 낙인!`);
          }
        } else if (targetEnemy) {
          useBattleStore.getState().applyStatusToEnemy(targetEnemy.id, effect.condition!, amount);
          setToastMessage(`${targetEnemy.name} -- ${effect.condition} x${amount}!`);
        }
      } else if (effect.type === 'BUFF') {
        if (effect.condition?.startsWith('ADD_AP_')) {
          const apToAdd = parseInt(effect.condition.split('_')[2], 10);
          useBattleStore.getState().consumeAp(-apToAdd); // AP 획득
        } else if (effect.condition === 'PURIFY_1') {
          // 무작위 상태이상 카드 1장 제거 (뽑는 더미/버린 더미에서)
          const deckState = useDeckStore.getState();
          const statusInDraw = deckState.drawPile.filter(c => c.type === 'STATUS_BURN');
          const statusInDiscard = deckState.discardPile.filter(c => c.type === 'STATUS_BURN');
          const allStatus = [...statusInDraw, ...statusInDiscard];
          if (allStatus.length > 0) {
            const toRemove = allStatus[Math.floor(Math.random() * allStatus.length)];
            useDeckStore.setState((s) => ({
              drawPile: s.drawPile.filter(c => c.id !== toRemove.id),
              discardPile: s.discardPile.filter(c => c.id !== toRemove.id),
            }));
            setToastMessage('상태이상 카드 1장 정화!');
          } else {
            setToastMessage('정화할 디버프가 없습니다.');
          }
        } else if (effect.condition === 'NEXT_PHYSICAL_FREE') {
          useBattleStore.getState().setPlayerStatusField({ nextPhysicalFree: true });
          setToastMessage('다음 물리 공격 AP 소모 0!');
        } else if (effect.condition?.startsWith('RETAIN_')) {
          // RETAIN_1_CARD or RETAIN_2_CARD
          const retainCount = parseInt(effect.condition.split('_')[1], 10) || 1;
          const currentRetain = useBattleStore.getState().playerStatus.retainCardCount;
          useBattleStore.getState().setPlayerStatusField({ retainCardCount: Math.max(currentRetain, retainCount) });
          setToastMessage(`턴 종료 시 카드 ${retainCount}장 보존!`);
        } else if (effect.condition?.startsWith('REFLECT_PHYSICAL_')) {
          const reflectAmount = parseInt(effect.condition.split('_')[2], 10) || 0;
          useBattleStore.getState().setPlayerStatusField({ reflectPhysical: reflectAmount });
          setToastMessage(`물리 피격 시 ${reflectAmount} 반사!`);
        } else if (effect.condition?.startsWith('AP_ON_SPECIAL_DEFEND_')) {
          const apAmount = parseInt(effect.condition.split('_')[4], 10) || 0;
          useBattleStore.getState().setPlayerStatusField({ apOnSpecialDefend: apAmount });
          setToastMessage(`특수 방어 시 다음 턴 AP +${apAmount}!`);
        } else if (effect.condition?.startsWith('AMMO_ON_SPECIAL_DEFEND_')) {
          const ammoAmount = parseInt(effect.condition.split('_')[4], 10) || 0;
          useBattleStore.getState().setPlayerStatusField({ ammoOnSpecialDefend: ammoAmount });
          setToastMessage(`특수 방어 시 탄약 ${ammoAmount} 획득!`);
        } else if (effect.condition === 'POWER_DEFENSE_AMMO_50') {
          useBattleStore.getState().setPowerDefenseAmmo50(true);
          setToastMessage('[지속] 방어 카드 사용 시 50% 확률로 탄약 획득!');
        } else if (effect.condition?.startsWith('POWER_PHYSICAL_SCALING_')) {
          useBattleStore.getState().setPowerPhysicalScaling(true);
          setToastMessage('[지속] 물리 공격마다 물리 피해 영구 증가!');
        } else {
          setToastMessage(`${effect.condition} 발동!`);
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

    // 지속 효과(Power) 후처리
    const battleState = useBattleStore.getState();

    // 고철 재활용 공학: 방어 카드 사용 시 50% 확률로 탄약 1
    if (battleState.powerDefenseAmmo50) {
      if (card.type === 'PHYSICAL_DEFENSE' || card.type === 'SPECIAL_DEFENSE') {
        if (Math.random() < 0.5) {
          addAmmo(1);
          setToastMessage('고철 재활용 -- 탄약 1 획득!');
        }
      }
    }

    // 청테이프 공학: 물리 공격 카드 사용 시 물리 피해 영구 +2
    if (battleState.powerPhysicalScalingActive) {
      if (card.type === 'PHYSICAL_ATTACK') {
        useBattleStore.getState().addPhysicalScalingBonus(2);
      }
    }

    // 통계 추적: 카드 사용 수 + 1
    useRunStore.getState().addCardsPlayed(1);

    // 카드 사용 완료

    // 8. 타겟팅 모드 및 카드 사용 처리 (비우기/소멸)
    if (targetingCardId === cardId) {
      setTargetingCard(null);
    }
    playCardFromHand(cardId);

    return true;
  };

  return { playCard };
};
