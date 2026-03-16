import type { Card, CardEffect } from '../types/gameTypes';
import type { DamageType, Enemy } from '../types/enemyTypes';

/**
 * 카드 효과 디스패치 모듈
 * 카드 효과를 분석하여 실행할 액션 목록을 반환
 */

export type EffectAction =
  | { type: 'DAMAGE_ENEMY'; enemyId: string; amount: number; damageType: DamageType }
  | { type: 'DAMAGE_ALL_ENEMIES'; amount: number; damageType: DamageType }
  | { type: 'SHIELD'; amount: number }
  | { type: 'RESIST'; amount: number }
  | { type: 'DRAW'; amount: number }
  | { type: 'ADD_AMMO'; amount: number }
  | { type: 'HEAL'; amount: number }
  | { type: 'DAMAGE_SELF'; amount: number }
  | { type: 'DEBUFF_ENEMY'; enemyId: string; status: string; amount: number }
  | { type: 'DEBUFF_ALL_ENEMIES'; status: string; amount: number }
  | { type: 'DEBUFF_PLAYER'; condition: string }
  | { type: 'MARK_OF_FATE'; enemyId: string; healAmount: number; ammoAmount: number }
  | { type: 'BUFF'; condition: string; target?: string }
  | { type: 'TOAST'; message: string };

export interface ResolveContext {
  targetEnemyId: string | null;
  targetEnemy: Enemy | null;
  enemies: Enemy[];
  consumedAmmoAmount: number;
  physicalScalingBonus: number;
  playerHp?: number;
  playerMaxHp?: number;
  playerShield?: number;
  rampageCounts?: Record<string, number>; // baseId → 전투 중 사용 횟수
  nextAttackBonus?: number; // 무기 개조: 다음 공격 보너스 피해
  powerFrenzyAmount?: number; // 광기: HP 50% 이하 시 추가 피해
}

/**
 * 카드의 모든 효과를 분석하여 실행할 액션 목록을 반환
 */
export function resolveCardEffects(card: Card, ctx: ResolveContext): EffectAction[] {
  const actions: EffectAction[] = [];
  const damageType: DamageType = card.type === 'SPECIAL_ATTACK' ? 'SPECIAL' : 'PHYSICAL';

  card.effects.forEach((effect) => {
    resolveOneEffect(effect, card, damageType, ctx, actions);
  });

  return actions;
}

function resolveOneEffect(
  effect: CardEffect,
  card: Card,
  damageType: DamageType,
  ctx: ResolveContext,
  actions: EffectAction[]
): void {
  switch (effect.type) {
    case 'DAMAGE':
      resolveDamageEffect(effect, card, damageType, ctx, actions);
      break;

    case 'SHIELD':
      if (effect.amount) actions.push({ type: 'SHIELD', amount: effect.amount });
      break;

    case 'RESIST':
      if (effect.amount) actions.push({ type: 'RESIST', amount: effect.amount });
      break;

    case 'DRAW':
      if (effect.amount) actions.push({ type: 'DRAW', amount: effect.amount });
      break;

    case 'ADD_AMMO':
      if (effect.amount) actions.push({ type: 'ADD_AMMO', amount: effect.amount });
      break;

    case 'HEAL':
      if (effect.amount) {
        if (effect.amount > 0) {
          actions.push({ type: 'HEAL', amount: effect.amount });
        } else {
          actions.push({ type: 'DAMAGE_SELF', amount: Math.abs(effect.amount) });
        }
      }
      break;

    case 'DEBUFF':
      resolveDebuffEffect(effect, ctx, actions);
      break;

    case 'BUFF':
      resolveBuffEffect(effect, actions);
      break;
  }
}

function resolveDamageEffect(
  effect: CardEffect,
  card: Card,
  damageType: DamageType,
  ctx: ResolveContext,
  actions: EffectAction[]
): void {
  let baseAmount = effect.amount ?? 0;
  // 물리 피해 스케일링 보너스 적용 (청테이프 공학)
  if (damageType === 'PHYSICAL' && ctx.physicalScalingBonus > 0) {
    baseAmount += ctx.physicalScalingBonus;
  }
  // 무기 개조 보너스 적용
  if ((ctx.nextAttackBonus ?? 0) > 0) {
    baseAmount += ctx.nextAttackBonus!;
  }
  // 광기 파워: HP 50% 이하 시 추가 피해
  if ((ctx.powerFrenzyAmount ?? 0) > 0 && ctx.playerHp != null && ctx.playerMaxHp != null) {
    if (ctx.playerHp <= ctx.playerMaxHp / 2) {
      baseAmount += ctx.powerFrenzyAmount!;
    }
  }

  // [과충전 코일건] 탄약 소모량 비례
  if (effect.condition === 'PER_AMMO_CONSUMED') {
    if (ctx.targetEnemyId) {
      actions.push({ type: 'DAMAGE_ENEMY', enemyId: ctx.targetEnemyId, amount: baseAmount * ctx.consumedAmmoAmount, damageType });
    }
    return;
  }

  // [광전사의 일격] 잃은 HP 비례
  if (effect.condition === 'PER_MISSING_HP_HALF' || effect.condition === 'PER_MISSING_HP_FULL') {
    if (ctx.targetEnemyId && ctx.playerHp != null && ctx.playerMaxHp != null) {
      const missingHp = ctx.playerMaxHp - ctx.playerHp;
      const dmg = effect.condition === 'PER_MISSING_HP_HALF' ? Math.floor(missingHp / 2) : missingHp;
      const finalDmg = dmg + ctx.physicalScalingBonus;
      actions.push({ type: 'DAMAGE_ENEMY', enemyId: ctx.targetEnemyId, amount: finalDmg, damageType });
      actions.push({ type: 'TOAST', message: `잃은 HP ${missingHp} → 피해 ${finalDmg}!` });
    }
    return;
  }

  // [폭주] 전투 중 사용할 때마다 피해 증가
  if (effect.condition?.startsWith('RAMPAGE_')) {
    if (ctx.targetEnemyId) {
      const increment = parseInt(effect.condition.split('_')[1], 10) || 4;
      const uses = ctx.rampageCounts?.[card.baseId] ?? 0;
      const finalDmg = baseAmount + (increment * uses);
      actions.push({ type: 'DAMAGE_ENEMY', enemyId: ctx.targetEnemyId, amount: finalDmg, damageType });
      if (uses > 0) {
        actions.push({ type: 'TOAST', message: `폭주! 피해 ${finalDmg} (${uses}회 스택)` });
      }
    }
    return;
  }

  // [방패로 밀치기] 현재 물리 방어도만큼 피해
  if (effect.condition === 'SHIELD_AS_DAMAGE') {
    if (ctx.targetEnemyId && ctx.playerShield != null) {
      actions.push({ type: 'DAMAGE_ENEMY', enemyId: ctx.targetEnemyId, amount: ctx.playerShield, damageType });
      if (ctx.playerShield > 0) {
        actions.push({ type: 'TOAST', message: `방어도 ${ctx.playerShield} → 피해!` });
      }
    }
    return;
  }

  // [대물 저격 사격] 적이 '공격' 의도일 때 추가 데미지
  if (effect.condition?.startsWith('BONUS_IF_ATTACKING_')) {
    if (ctx.targetEnemy && ctx.targetEnemyId) {
      const bonus = parseInt(effect.condition.split('_')[3], 10) || 0;
      let finalDamage = baseAmount;
      if (ctx.targetEnemy.currentIntent?.type === 'ATTACK') {
        finalDamage += bonus;
        actions.push({ type: 'TOAST', message: `카운터! +${bonus} 추가 피해` });
      }
      actions.push({ type: 'DAMAGE_ENEMY', enemyId: ctx.targetEnemyId, amount: finalDamage, damageType });
    }
    return;
  }

  // [분쇄] 대상이 취약 시 추가 피해
  if (effect.condition?.startsWith('BONUS_IF_VULNERABLE_')) {
    if (ctx.targetEnemy && ctx.targetEnemyId) {
      const bonus = parseInt(effect.condition.split('_')[3], 10) || 0;
      let finalDamage = baseAmount;
      if ((ctx.targetEnemy.statuses?.['VULNERABLE'] ?? 0) > 0) {
        finalDamage += bonus;
        actions.push({ type: 'TOAST', message: `취약 연계! +${bonus} 추가 피해` });
      }
      actions.push({ type: 'DAMAGE_ENEMY', enemyId: ctx.targetEnemyId, amount: finalDamage, damageType });
    }
    return;
  }

  // [다단 히트] MULTI_HIT_N
  if (effect.condition?.startsWith('MULTI_HIT_')) {
    if (ctx.targetEnemyId) {
      const hits = parseInt(effect.condition.split('_')[2], 10) || 1;
      for (let i = 0; i < hits; i++) {
        actions.push({ type: 'DAMAGE_ENEMY', enemyId: ctx.targetEnemyId, amount: baseAmount, damageType });
      }
    }
    return;
  }

  // 전체 공격
  if (effect.target === 'ALL_ENEMIES') {
    actions.push({ type: 'DAMAGE_ALL_ENEMIES', amount: baseAmount, damageType });
    return;
  }

  // 일반 단일 공격
  if (ctx.targetEnemyId && baseAmount > 0) {
    actions.push({ type: 'DAMAGE_ENEMY', enemyId: ctx.targetEnemyId, amount: baseAmount, damageType });
  }
}

function resolveDebuffEffect(
  effect: CardEffect,
  ctx: ResolveContext,
  actions: EffectAction[]
): void {
  const amount = effect.amount || 1;

  if (effect.target === 'ALL_ENEMIES') {
    actions.push({ type: 'DEBUFF_ALL_ENEMIES', status: effect.condition!, amount });
    actions.push({ type: 'TOAST', message: `전체 ${effect.condition} x${amount}!` });
    return;
  }

  if (effect.target === 'PLAYER') {
    if (effect.condition === 'CANNOT_PLAY_PHYSICAL_ATTACK') {
      actions.push({ type: 'DEBUFF_PLAYER', condition: effect.condition });
      actions.push({ type: 'TOAST', message: '이번 턴 물리 공격 사용 불가!' });
    }
    return;
  }

  if (effect.condition?.startsWith('MARK_OF_FATE_')) {
    if (ctx.targetEnemy && ctx.targetEnemyId) {
      const parts = effect.condition.split('_');
      const healAmount = parseInt(parts[3], 10) || 0;
      const ammoAmount = parseInt(parts[4], 10) || 0;
      actions.push({ type: 'MARK_OF_FATE', enemyId: ctx.targetEnemyId, healAmount, ammoAmount });
      actions.push({ type: 'TOAST', message: `${ctx.targetEnemy.name}에게 운명의 낙인!` });
    }
    return;
  }

  // [약탈] 적 사망 시 드로우 + 탄약
  if (effect.condition?.startsWith('MARK_OF_PLUNDER_')) {
    if (ctx.targetEnemy && ctx.targetEnemyId) {
      const parts = effect.condition.split('_');
      const drawAmount = parseInt(parts[3], 10) || 0;
      const ammoAmount = parseInt(parts[4], 10) || 0;
      actions.push({ type: 'MARK_OF_FATE', enemyId: ctx.targetEnemyId, healAmount: -(drawAmount * 100 + ammoAmount), ammoAmount: 0 });
      // 약탈 마크를 MARK_OF_FATE로 재활용 (음수 healAmount로 구분, 추후 전용 액션 추가 가능)
      actions.push({ type: 'TOAST', message: `${ctx.targetEnemy.name}에게 약탈 표식! (사망 시 드로우 ${drawAmount}, 탄약 ${ammoAmount})` });
    }
    return;
  }

  if (ctx.targetEnemy && ctx.targetEnemyId) {
    actions.push({ type: 'DEBUFF_ENEMY', enemyId: ctx.targetEnemyId, status: effect.condition!, amount });
    actions.push({ type: 'TOAST', message: `${ctx.targetEnemy.name} -- ${effect.condition} x${amount}!` });
  }
}

function resolveBuffEffect(
  effect: CardEffect,
  actions: EffectAction[]
): void {
  if (!effect.condition) return;

  // 각 버프 조건별 토스트 메시지 매핑
  const buffToastMap: Record<string, string> = {
    NEXT_PHYSICAL_FREE: '다음 물리 공격 AP 소모 0!',
    POWER_DEFENSE_AMMO_50: '[지속] 방어 카드 사용 시 50% 확률로 탄약 획득!',
  };

  // ADD_AP_N 패턴
  if (effect.condition.startsWith('ADD_AP_')) {
    actions.push({ type: 'BUFF', condition: effect.condition, target: effect.target });
    return;
  }

  // PURIFY_1, PURIFY_ALL
  if (effect.condition === 'PURIFY_1' || effect.condition === 'PURIFY_ALL') {
    actions.push({ type: 'BUFF', condition: effect.condition, target: effect.target });
    const msg = effect.condition === 'PURIFY_ALL' ? '모든 디버프 해제!' : '디버프 1개 해제!';
    actions.push({ type: 'TOAST', message: msg });
    return;
  }

  // RETAIN_N_CARD 패턴
  if (effect.condition.startsWith('RETAIN_')) {
    const retainCount = parseInt(effect.condition.split('_')[1], 10) || 1;
    actions.push({ type: 'BUFF', condition: effect.condition, target: effect.target });
    actions.push({ type: 'TOAST', message: `턴 종료 시 카드 ${retainCount}장 보존!` });
    return;
  }

  // REFLECT_PHYSICAL_N
  if (effect.condition.startsWith('REFLECT_PHYSICAL_')) {
    const reflectAmount = parseInt(effect.condition.split('_')[2], 10) || 0;
    actions.push({ type: 'BUFF', condition: effect.condition, target: effect.target });
    actions.push({ type: 'TOAST', message: `물리 피격 시 ${reflectAmount} 반사!` });
    return;
  }

  // AP_ON_SPECIAL_DEFEND_N
  if (effect.condition.startsWith('AP_ON_SPECIAL_DEFEND_')) {
    const apAmount = parseInt(effect.condition.split('_')[4], 10) || 0;
    actions.push({ type: 'BUFF', condition: effect.condition, target: effect.target });
    actions.push({ type: 'TOAST', message: `특수 방어 시 다음 턴 AP +${apAmount}!` });
    return;
  }

  // AMMO_ON_SPECIAL_DEFEND_N
  if (effect.condition.startsWith('AMMO_ON_SPECIAL_DEFEND_')) {
    const ammoAmount = parseInt(effect.condition.split('_')[4], 10) || 0;
    actions.push({ type: 'BUFF', condition: effect.condition, target: effect.target });
    actions.push({ type: 'TOAST', message: `특수 방어 시 탄약 ${ammoAmount} 획득!` });
    return;
  }

  // POWER_PHYSICAL_SCALING_N
  if (effect.condition.startsWith('POWER_PHYSICAL_SCALING_')) {
    actions.push({ type: 'BUFF', condition: effect.condition, target: effect.target });
    actions.push({ type: 'TOAST', message: '[지속] 물리 공격마다 물리 피해 영구 증가!' });
    return;
  }

  // POWER_FORTIFY_N — 매 턴 방어도 N 획득
  if (effect.condition.startsWith('POWER_FORTIFY_')) {
    const amount = parseInt(effect.condition.split('_')[2], 10) || 4;
    actions.push({ type: 'BUFF', condition: effect.condition, target: effect.target });
    actions.push({ type: 'TOAST', message: `[지속] 매 턴 물리 방어도 ${amount} 획득!` });
    return;
  }

  // POWER_RAGE_N — 물리 피격 시 방어도 N 획득
  if (effect.condition.startsWith('POWER_RAGE_')) {
    const amount = parseInt(effect.condition.split('_')[2], 10) || 3;
    actions.push({ type: 'BUFF', condition: effect.condition, target: effect.target });
    actions.push({ type: 'TOAST', message: `[지속] 물리 피해 받을 때 방어도 ${amount}!` });
    return;
  }

  // POWER_FRENZY_N — HP 50% 이하 시 공격 피해 +N
  if (effect.condition.startsWith('POWER_FRENZY_')) {
    const amount = parseInt(effect.condition.split('_')[2], 10) || 5;
    actions.push({ type: 'BUFF', condition: effect.condition, target: effect.target });
    actions.push({ type: 'TOAST', message: `[지속] HP 50% 이하 시 공격 +${amount}!` });
    return;
  }

  // POWER_PHOENIX_N — 카드 소멸 시 방어도 N+N
  if (effect.condition.startsWith('POWER_PHOENIX_')) {
    const amount = parseInt(effect.condition.split('_')[2], 10) || 5;
    actions.push({ type: 'BUFF', condition: effect.condition, target: effect.target });
    actions.push({ type: 'TOAST', message: `[지속] 카드 소멸 시 방어도 ${amount}+${amount}!` });
    return;
  }

  // EXHAUST_FROM_HAND_FOR_AP_N — 손패 소멸 → AP 획득
  if (effect.condition.startsWith('EXHAUST_FROM_HAND_FOR_AP_')) {
    actions.push({ type: 'BUFF', condition: effect.condition, target: effect.target });
    return;
  }

  // EXHAUST_FROM_HAND_FOR_DAMAGE_N — 손패 소멸 → 다음 공격 버프
  if (effect.condition.startsWith('EXHAUST_FROM_HAND_FOR_DAMAGE_')) {
    actions.push({ type: 'BUFF', condition: effect.condition, target: effect.target });
    return;
  }

  // 매핑된 토스트 메시지가 있는 경우
  const toast = buffToastMap[effect.condition];
  actions.push({ type: 'BUFF', condition: effect.condition, target: effect.target });
  if (toast) {
    actions.push({ type: 'TOAST', message: toast });
  } else {
    actions.push({ type: 'TOAST', message: `${effect.condition} 발동!` });
  }
}
