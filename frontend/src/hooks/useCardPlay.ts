import { useBattleStore } from '../store/useBattleStore';
import { useRunStore } from '../store/useRunStore';
import { useDeckStore } from '../store/useDeckStore';
import { useAudioStore } from '../store/useAudioStore';
import { resolveCardEffects, type EffectAction } from '../logic/cardEffectHandlers';
import { onCardPlayed, getPassiveDamageBonus } from '../logic/relicEffects';
import { useRngStore } from '../store/useRngStore';
import { dispatchVfx } from '../components/pixi/vfx/vfxDispatcher';
import { VFX_PROFILES } from '../components/pixi/vfx/vfxProfiles';
import { PLAYER_POS, enemyPos } from '../components/pixi/vfx/battleLayout';

/**
 * 카드를 플레이할 때 호출하는 커스텀 훅
 * AP, Ammo 코스트 검증, 자원 차감, 그리고 덱 상태(playCardFromHand) 변경을 한 번에 처리합니다.
 */
export const useCardPlay = () => {
  // 스토어 구독 없음 — playCard 내에서 getState()로 읽어서 리렌더 전파 차단
  const playCard = (cardId: string, targetId?: string) => {
    const { currentTurn, playerActionPoints, playerAmmo, consumeAp, addAmmo, enemies,
      applyDamageToEnemy, addPlayerShield, addPlayerResist, targetingCardId, setTargetingCard,
      hasPlayedUtilityThisTurn, setPlayedUtilityThisTurn, playerStatus, powerPhysicalScalingBonus,
    } = useBattleStore.getState();
    const { hand, playCardFromHand } = useDeckStore.getState();
    const { relics } = useRunStore.getState();
    const setToastMessage = (msg: string) => useRunStore.getState().setToastMessage(msg);

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
        useAudioStore.getState().playClick();
        setTargetingCard(null);
        return false;
      }

      useAudioStore.getState().playClick();
      setTargetingCard(cardId);
      return false;
    }

    // 유물 효과: [불안정한 아크 심장]
    let finalTargetId = targetId;

    let needsEnemyTarget = card.effects.some(e =>
      (e.type === 'DAMAGE' || e.type === 'DEBUFF') &&
      e.target !== 'ALL_ENEMIES' &&
      e.target !== 'PLAYER'
    );

    if (card.type === 'UTILITY' && relics.includes('arc_heart') && !hasPlayedUtilityThisTurn) {
      const livingEnemies = enemies.filter(e => e.currentHp > 0);
      if (livingEnemies.length > 0) {
        const randomEnemy = livingEnemies[useRngStore.getState().battleRng.nextInt(livingEnemies.length)];
        finalTargetId = randomEnemy.id;
        needsEnemyTarget = true;
      }
      setPlayedUtilityThisTurn(true);
    }

    // 4. 대상 유형 검증
    if (needsEnemyTarget && finalTargetId === 'PLAYER') {
      setToastMessage('타겟을 지정하세요 — 적을 클릭!');
      setTargetingCard(null);
      return false;
    }
    if (!needsEnemyTarget && finalTargetId !== 'PLAYER') {
      finalTargetId = 'PLAYER';
    }

    // 5. 코스트(AP/Ammo) 검사
    let effectiveApCost = card.costAp;
    if (card.type === 'PHYSICAL_ATTACK' && playerStatus.nextPhysicalFree) {
      effectiveApCost = 0;
    }

    if (playerActionPoints < effectiveApCost) {
      setToastMessage(`AP 부족! (${playerActionPoints}/${effectiveApCost})`);
      setTargetingCard(null);
      return false;
    }
    if (playerAmmo < card.costAmmo) {
      setToastMessage(`탄약 부족! (${playerAmmo}/${card.costAmmo})`);
      setTargetingCard(null);
      return false;
    }

    // 6. 자원 차감
    const apUsed = consumeAp(effectiveApCost);
    if (!apUsed) return false;

    if (card.type === 'PHYSICAL_ATTACK' && playerStatus.nextPhysicalFree) {
      useBattleStore.getState().setPlayerStatusField({ nextPhysicalFree: false });
      setToastMessage('무료 물리 공격!');
    }

    let consumedAmmoAmount = 0;
    if (card.effects.some(e => e.condition === 'PER_AMMO_CONSUMED')) {
      consumedAmmoAmount = playerAmmo;
      if (playerAmmo > 0) {
        addAmmo(-playerAmmo);
      }
    } else if (card.costAmmo > 0) {
      addAmmo(-card.costAmmo);
    }

    // 7. 카드 효과 해석 및 실행
    const targetEnemy = (finalTargetId && finalTargetId !== 'PLAYER') ? enemies.find(e => e.id === finalTargetId) : null;

    // 유물 패시브 피해 보너스 계산
    const pHp = useRunStore.getState().playerHp;
    const pMaxHp = useRunStore.getState().playerMaxHp;
    const relicDmg = getPassiveDamageBonus(relics, pHp, pMaxHp);

    const actions = resolveCardEffects(card, {
      targetEnemyId: targetEnemy?.id || null,
      targetEnemy: targetEnemy || null,
      enemies,
      consumedAmmoAmount,
      physicalScalingBonus: powerPhysicalScalingBonus,
      playerHp: pHp,
      playerMaxHp: pMaxHp,
      playerShield: useBattleStore.getState().playerStatus.shield,
      rampageCounts: useBattleStore.getState().rampageCounts,
      nextAttackBonus: useBattleStore.getState().nextAttackBonus,
      powerFrenzyAmount: useBattleStore.getState().powerFrenzyAmount,
      relicPhysicalBonus: relicDmg.physicalBonus,
      relicSpecialBonus: relicDmg.specialBonus,
      relicSingleTargetBonus: relicDmg.singleTargetBonus,
    });

    let hasDamage = false;
    let hasBuff = false;

    actions.forEach((action: EffectAction) => {
      executeAction(action, { addAmmo, addPlayerShield, addPlayerResist, applyDamageToEnemy, setToastMessage, enemies });
      if (action.type === 'DAMAGE_ENEMY' || action.type === 'DAMAGE_ALL_ENEMIES') hasDamage = true;
      if (['SHIELD', 'RESIST', 'DRAW', 'ADD_AMMO', 'HEAL', 'DAMAGE_SELF', 'BUFF'].includes(action.type)) hasBuff = true;
    });

    if (hasDamage) useAudioStore.getState().playHit();
    else if (hasBuff) useAudioStore.getState().playHeal();
    else useAudioStore.getState().playDraw();

    // 공격 카드 스프라이트 전환
    if (card.type === 'PHYSICAL_ATTACK') {
      useBattleStore.getState().setPlayerSpriteState('PHYSICAL_ATTACK');
      setTimeout(() => useBattleStore.getState().setPlayerSpriteState('IDLE'), 500);
    } else if (card.type === 'SPECIAL_ATTACK') {
      useBattleStore.getState().setPlayerSpriteState('SPECIAL_ATTACK');
      setTimeout(() => useBattleStore.getState().setPlayerSpriteState('IDLE'), 500);
    }

    // VFX 디스패치
    const vfxProfile = VFX_PROFILES[card.baseId];

    // 방어/유틸 카드 VFX — 플레이어 위치에 이펙트
    if (vfxProfile && !hasDamage) {
      dispatchVfx({
        cardBaseId: card.baseId,
        sourceX: PLAYER_POS.x,
        sourceY: PLAYER_POS.y,
        targetPositions: [{ x: PLAYER_POS.x, y: PLAYER_POS.y }],
      });
    }

    // 공격 카드 VFX — 적 위치에 이펙트
    if (vfxProfile && hasDamage) {
      const livingEnemies = enemies.filter(e => e.currentHp > 0);
      // 특수 공격(총기) → 권총 높이에서 발사, 물리 공격 → 주먹 높이에서
      const vfxSourceX = card.type === 'SPECIAL_ATTACK'
        ? PLAYER_POS.x + 40
        : PLAYER_POS.x;
      const vfxSourceY = card.type === 'SPECIAL_ATTACK'
        ? PLAYER_POS.y - 80
        : card.type === 'PHYSICAL_ATTACK'
          ? PLAYER_POS.y - 60
          : PLAYER_POS.y;

      if (vfxProfile.isAoe) {
        // AoE: 생존 적 전체 좌표 전달
        const positions = livingEnemies.map((_, idx) => {
          const originalIdx = enemies.indexOf(livingEnemies[idx]);
          return enemyPos(originalIdx >= 0 ? originalIdx : idx, enemies.length);
        });
        dispatchVfx({
          cardBaseId: card.baseId,
          sourceX: vfxSourceX,
          sourceY: vfxSourceY,
          targetPositions: positions,
        });
      } else if (vfxProfile.multiHitCount > 1) {
        // 멀티히트 (chainsaw): 150ms 간격 분산 디스패치
        const targetEnemyIndex = targetEnemy ? enemies.findIndex(e => e.id === targetEnemy.id) : 0;
        const pos = enemyPos(targetEnemyIndex >= 0 ? targetEnemyIndex : 0, enemies.length);
        for (let hit = 0; hit < vfxProfile.multiHitCount; hit++) {
          setTimeout(() => {
            dispatchVfx({
              cardBaseId: card.baseId,
              sourceX: vfxSourceX,
              sourceY: vfxSourceY,
              targetPositions: [pos],
              hitIndex: hit,
            });
          }, hit * 150);
        }
      } else {
        // 단일 타겟 — ammo 소비가 2 이상이면 발사 횟수만큼 시차 VFX
        const targetEnemyIndex = targetEnemy ? enemies.findIndex(e => e.id === targetEnemy.id) : 0;
        const pos = enemyPos(targetEnemyIndex >= 0 ? targetEnemyIndex : 0, enemies.length);
        const shotCount = (vfxProfile.category === 'ELECTROMAGNETIC' && card.costAmmo > 1) ? card.costAmmo : 1;
        for (let shot = 0; shot < shotCount; shot++) {
          setTimeout(() => {
            dispatchVfx({
              cardBaseId: card.baseId,
              sourceX: vfxSourceX,
              sourceY: vfxSourceY,
              targetPositions: [pos],
              hitIndex: shot,
            });
          }, shot * 120);
        }
      }
    }

    // 유물 효과: 카드 사용 후 보너스
    const relicBonus = onCardPlayed(relics, card);
    if (relicBonus.bonusShield > 0) addPlayerShield(relicBonus.bonusShield);
    if (relicBonus.bonusResist > 0) addPlayerResist(relicBonus.bonusResist);
    // [가시 어깨받이] 물리 방어 카드 사용 시 랜덤 적에게 피해
    if (relicBonus.spikedDamage > 0) {
      const livingEnemies = enemies.filter(e => e.currentHp > 0);
      if (livingEnemies.length > 0) {
        const target = livingEnemies[Math.floor(useRngStore.getState().battleRng.next() * livingEnemies.length)];
        applyDamageToEnemy(target.id, relicBonus.spikedDamage, 'PHYSICAL');
        setToastMessage(`가시 어깨받이 발동! ${target.name}에게 ${relicBonus.spikedDamage} 피해!`);
      }
    }
    // [재생 연고] 특수 방어 카드 사용 시 힐
    if (relicBonus.healAmount > 0) {
      useRunStore.getState().healPlayer(relicBonus.healAmount);
    }

    // 지속 효과(Power) 후처리
    const battleState = useBattleStore.getState();

    if (battleState.powerDefenseAmmo50) {
      if (card.type === 'PHYSICAL_DEFENSE' || card.type === 'SPECIAL_DEFENSE') {
        if (useRngStore.getState().battleRng.next() < 0.5) {
          addAmmo(1);
          setToastMessage('고철 재활용 -- 탄약 1 획득!');
        }
      }
    }

    if (battleState.powerPhysicalScalingActive) {
      if (card.type === 'PHYSICAL_ATTACK') {
        useBattleStore.getState().addPhysicalScalingBonus(2);
      }
    }

    // 폭주(Rampage) 사용 횟수 증가
    if (card.effects.some(e => e.condition?.startsWith('RAMPAGE_'))) {
      useBattleStore.getState().addRampageCount(card.baseId);
    }

    // nextAttackBonus 소비 (무기 개조)
    if (battleState.nextAttackBonus > 0 && (card.type === 'PHYSICAL_ATTACK' || card.type === 'SPECIAL_ATTACK')) {
      useBattleStore.getState().setNextAttackBonus(0);
    }

    // 유물: [고철 부품 팔찌]
    if (relics.includes('scrap_parts_bracelet') && card.type === 'PHYSICAL_ATTACK') {
      const currentCount = useBattleStore.getState().playerStatus.physicalAttacksThisTurn + 1;
      useBattleStore.getState().setPlayerStatusField({ physicalAttacksThisTurn: currentCount });
      if (currentCount === 3) {
        addAmmo(1);
        setToastMessage('고철 부품 팔찌 발동 — 탄약 1 획득!');
      }
    }

    useRunStore.getState().addCardsPlayed(1);

    // 8. 타겟팅 모드 및 카드 사용 처리
    if (targetingCardId === cardId) {
      setTargetingCard(null);
    }
    playCardFromHand(cardId);

    // [잔해 수집기] 소멸 카드 사용 시 탄약 +1
    if (card.isExhaust && relics.includes('scrap_collector_relic')) {
      addAmmo(1);
      setToastMessage('잔해 수집기 — 소멸 카드에서 탄약 1 획득!');
    }

    // 불사조의 재: 카드 소멸 시 방어도 획득
    if (card.isExhaust) {
      const phoenixAmount = useBattleStore.getState().powerPhoenixAmount;
      if (phoenixAmount > 0) {
        addPlayerShield(phoenixAmount);
        addPlayerResist(phoenixAmount);
        setToastMessage(`불사조의 재 발동! 방어도 ${phoenixAmount}+${phoenixAmount}!`);
      }
    }

    return true;
  };

  return { playCard };
};

/**
 * EffectAction을 실제 스토어 호출로 변환 실행
 */
function executeAction(
  action: EffectAction,
  ctx: {
    addAmmo: (n: number) => void;
    addPlayerShield: (n: number) => void;
    addPlayerResist: (n: number) => void;
    applyDamageToEnemy: (id: string, amount: number, type: import('../types/enemyTypes').DamageType) => void;
    setToastMessage: (msg: string) => void;
    enemies: import('../types/enemyTypes').Enemy[];
  }
) {
  switch (action.type) {
    case 'DAMAGE_ENEMY':
      ctx.applyDamageToEnemy(action.enemyId, action.amount, action.damageType);
      break;
    case 'DAMAGE_ALL_ENEMIES':
      ctx.enemies.forEach(e => {
        if (e.currentHp > 0) ctx.applyDamageToEnemy(e.id, action.amount, action.damageType);
      });
      break;
    case 'SHIELD':
      ctx.addPlayerShield(action.amount);
      break;
    case 'RESIST':
      ctx.addPlayerResist(action.amount);
      break;
    case 'DRAW':
      useDeckStore.getState().drawCards(action.amount);
      break;
    case 'ADD_AMMO':
      ctx.addAmmo(action.amount);
      break;
    case 'HEAL':
      useRunStore.getState().healPlayer(action.amount);
      break;
    case 'DAMAGE_SELF':
      useRunStore.getState().damagePlayer(action.amount);
      break;
    case 'DEBUFF_ENEMY':
      useBattleStore.getState().applyStatusToEnemy(action.enemyId, action.status, action.amount);
      break;
    case 'DEBUFF_ALL_ENEMIES':
      ctx.enemies.forEach(e => {
        if (e.currentHp > 0) useBattleStore.getState().applyStatusToEnemy(e.id, action.status, action.amount);
      });
      break;
    case 'DEBUFF_PLAYER':
      if (action.condition === 'CANNOT_PLAY_PHYSICAL_ATTACK') {
        useBattleStore.getState().setPlayerStatusField({ cannotPlayPhysicalAttack: true });
      }
      break;
    case 'MARK_OF_FATE':
      useBattleStore.getState().setMarkOfFate(action.enemyId, action.healAmount, action.ammoAmount);
      break;
    case 'BUFF':
      executeBuff(action.condition, ctx.setToastMessage);
      break;
    case 'TOAST':
      ctx.setToastMessage(action.message);
      break;
  }
}

function executeBuff(condition: string, setToastMessage: (msg: string) => void) {
  if (condition.startsWith('ADD_AP_')) {
    const apToAdd = parseInt(condition.split('_')[2], 10);
    useBattleStore.getState().consumeAp(-apToAdd);
  } else if (condition === 'PURIFY_1') {
    const deckState = useDeckStore.getState();
    const isStatusCard = (c: { type: string }) => c.type === 'STATUS_BURN' || c.type === 'STATUS_RADIATION';
    const allStatus = [...deckState.drawPile.filter(isStatusCard), ...deckState.discardPile.filter(isStatusCard)];
    if (allStatus.length > 0) {
      const toRemove = allStatus[useRngStore.getState().battleRng.nextInt(allStatus.length)];
      useDeckStore.setState((s) => ({
        drawPile: s.drawPile.filter(c => c.id !== toRemove.id),
        discardPile: s.discardPile.filter(c => c.id !== toRemove.id),
      }));
      setToastMessage('상태이상 카드 1장 정화!');
    } else {
      setToastMessage('정화할 디버프가 없습니다.');
    }
  } else if (condition === 'NEXT_PHYSICAL_FREE') {
    useBattleStore.getState().setPlayerStatusField({ nextPhysicalFree: true });
  } else if (condition.startsWith('RETAIN_')) {
    const retainCount = parseInt(condition.split('_')[1], 10) || 1;
    const currentRetain = useBattleStore.getState().playerStatus.retainCardCount;
    useBattleStore.getState().setPlayerStatusField({ retainCardCount: Math.max(currentRetain, retainCount) });
  } else if (condition.startsWith('REFLECT_PHYSICAL_')) {
    const reflectAmount = parseInt(condition.split('_')[2], 10) || 0;
    useBattleStore.getState().setPlayerStatusField({ reflectPhysical: reflectAmount });
  } else if (condition.startsWith('AP_ON_SPECIAL_DEFEND_')) {
    const apAmount = parseInt(condition.split('_')[4], 10) || 0;
    useBattleStore.getState().setPlayerStatusField({ apOnSpecialDefend: apAmount });
  } else if (condition.startsWith('AMMO_ON_SPECIAL_DEFEND_')) {
    const ammoAmount = parseInt(condition.split('_')[4], 10) || 0;
    useBattleStore.getState().setPlayerStatusField({ ammoOnSpecialDefend: ammoAmount });
  } else if (condition === 'POWER_DEFENSE_AMMO_50') {
    useBattleStore.getState().setPowerDefenseAmmo50(true);
  } else if (condition.startsWith('POWER_PHYSICAL_SCALING_')) {
    useBattleStore.getState().setPowerPhysicalScaling(true);
  } else if (condition.startsWith('POWER_FORTIFY_')) {
    const amount = parseInt(condition.split('_')[2], 10) || 4;
    useBattleStore.getState().setPowerFortify(amount);
  } else if (condition.startsWith('POWER_RAGE_')) {
    const amount = parseInt(condition.split('_')[2], 10) || 3;
    useBattleStore.getState().setPowerRage(amount);
  } else if (condition.startsWith('POWER_FRENZY_')) {
    const amount = parseInt(condition.split('_')[2], 10) || 5;
    useBattleStore.getState().setPowerFrenzy(amount);
  } else if (condition.startsWith('POWER_PHOENIX_')) {
    const amount = parseInt(condition.split('_')[2], 10) || 5;
    useBattleStore.getState().setPowerPhoenix(amount);
  } else if (condition === 'PURIFY_ALL') {
    // 모든 상태이상 카드 제거
    const deckState = useDeckStore.getState();
    const isStatusCard = (c: { type: string }) => c.type === 'STATUS_BURN' || c.type === 'STATUS_RADIATION';
    const statusCount = [...deckState.drawPile.filter(isStatusCard), ...deckState.discardPile.filter(isStatusCard)].length;
    useDeckStore.setState((s) => ({
      drawPile: s.drawPile.filter(c => !isStatusCard(c)),
      discardPile: s.discardPile.filter(c => !isStatusCard(c)),
    }));
    setToastMessage(statusCount > 0 ? `상태이상 카드 ${statusCount}장 전부 정화!` : '정화할 디버프가 없습니다.');
  } else if (condition.startsWith('EXHAUST_FROM_HAND_FOR_AP_')) {
    // 손패에서 카드 1장 소멸 → AP 획득 (추후 카드 선택 UI 연결 필요, 현재 랜덤)
    const apAmount = parseInt(condition.split('_')[5], 10) || 2;
    const handCards = useDeckStore.getState().hand;
    if (handCards.length > 1) {
      const idx = useRngStore.getState().battleRng.nextInt(handCards.length - 1) + 1; // 자기 자신(0) 제외
      const exhausted = handCards[idx];
      useDeckStore.getState().exhaustCardFromHand(exhausted.id);
      useBattleStore.getState().consumeAp(-apAmount);
      setToastMessage(`[${exhausted.name}] 소멸 → ${apAmount} AP 획득!`);
    }
  } else if (condition.startsWith('EXHAUST_FROM_HAND_FOR_DAMAGE_')) {
    // 손패에서 카드 1장 소멸 → 다음 공격 버프
    const dmgBonus = parseInt(condition.split('_')[5], 10) || 10;
    const handCards = useDeckStore.getState().hand;
    if (handCards.length > 1) {
      const idx = useRngStore.getState().battleRng.nextInt(handCards.length - 1) + 1;
      const exhausted = handCards[idx];
      useDeckStore.getState().exhaustCardFromHand(exhausted.id);
      useBattleStore.getState().setNextAttackBonus(dmgBonus);
      setToastMessage(`[${exhausted.name}] 소멸 → 다음 공격 +${dmgBonus}!`);
    }
  }
}
