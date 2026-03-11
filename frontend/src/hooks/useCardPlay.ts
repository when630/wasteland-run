import { useBattleStore } from '../store/useBattleStore';
import { useRunStore } from '../store/useRunStore';
import { useDeckStore } from '../store/useDeckStore';
import { useAudioStore } from '../store/useAudioStore';
import { resolveCardEffects, type EffectAction } from '../logic/cardEffectHandlers';
import { onCardPlayed } from '../logic/relicEffects';
import { useRngStore } from '../store/useRngStore';
import { dispatchVfx } from '../components/pixi/vfx/vfxDispatcher';
import { VFX_PROFILES } from '../components/pixi/vfx/vfxProfiles';
import { PLAYER_POS, enemyPos } from '../components/pixi/vfx/battleLayout';

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

    const actions = resolveCardEffects(card, {
      targetEnemyId: targetEnemy?.id || null,
      targetEnemy: targetEnemy || null,
      enemies,
      consumedAmmoAmount,
      physicalScalingBonus: powerPhysicalScalingBonus,
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

      if (vfxProfile.isAoe) {
        // AoE: 생존 적 전체 좌표 전달
        const positions = livingEnemies.map((_, idx) => {
          const originalIdx = enemies.indexOf(livingEnemies[idx]);
          return enemyPos(originalIdx >= 0 ? originalIdx : idx);
        });
        dispatchVfx({
          cardBaseId: card.baseId,
          sourceX: PLAYER_POS.x,
          sourceY: PLAYER_POS.y,
          targetPositions: positions,
        });
      } else if (vfxProfile.multiHitCount > 1) {
        // 멀티히트 (chainsaw): 150ms 간격 분산 디스패치
        const targetEnemyIndex = targetEnemy ? enemies.findIndex(e => e.id === targetEnemy.id) : 0;
        const pos = enemyPos(targetEnemyIndex >= 0 ? targetEnemyIndex : 0);
        for (let hit = 0; hit < vfxProfile.multiHitCount; hit++) {
          setTimeout(() => {
            dispatchVfx({
              cardBaseId: card.baseId,
              sourceX: PLAYER_POS.x,
              sourceY: PLAYER_POS.y,
              targetPositions: [pos],
              hitIndex: hit,
            });
          }, hit * 150);
        }
      } else {
        // 단일 타겟
        const targetEnemyIndex = targetEnemy ? enemies.findIndex(e => e.id === targetEnemy.id) : 0;
        const pos = enemyPos(targetEnemyIndex >= 0 ? targetEnemyIndex : 0);
        dispatchVfx({
          cardBaseId: card.baseId,
          sourceX: PLAYER_POS.x,
          sourceY: PLAYER_POS.y,
          targetPositions: [pos],
        });
      }
    }

    // 유물 효과: 카드 사용 후 보너스
    const relicBonus = onCardPlayed(relics, card);
    if (relicBonus.bonusShield > 0) addPlayerShield(relicBonus.bonusShield);
    if (relicBonus.bonusResist > 0) addPlayerResist(relicBonus.bonusResist);

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
  }
}
