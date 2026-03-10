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

interface ResolveContext {
  targetEnemyId: string | null;
  targetEnemy: Enemy | null;
  enemies: Enemy[];
  consumedAmmoAmount: number;
  physicalScalingBonus: number;
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
  _card: Card,
  damageType: DamageType,
  ctx: ResolveContext,
  actions: EffectAction[]
): void {
  if (!effect.amount) return;

  let baseAmount = effect.amount;
  // 물리 피해 스케일링 보너스 적용 (청테이프 공학)
  if (damageType === 'PHYSICAL' && ctx.physicalScalingBonus > 0) {
    baseAmount += ctx.physicalScalingBonus;
  }

  // [과충전 코일건] 타격
  if (effect.condition === 'PER_AMMO_CONSUMED') {
    if (ctx.targetEnemyId) {
      actions.push({ type: 'DAMAGE_ENEMY', enemyId: ctx.targetEnemyId, amount: baseAmount * ctx.consumedAmmoAmount, damageType });
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

  // [전기톱 갈아버리기] 다단 히트
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
  if (ctx.targetEnemyId) {
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

  // PURIFY_1
  if (effect.condition === 'PURIFY_1') {
    actions.push({ type: 'BUFF', condition: effect.condition, target: effect.target });
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

  // 매핑된 토스트 메시지가 있는 경우
  const toast = buffToastMap[effect.condition];
  actions.push({ type: 'BUFF', condition: effect.condition, target: effect.target });
  if (toast) {
    actions.push({ type: 'TOAST', message: toast });
  } else {
    actions.push({ type: 'TOAST', message: `${effect.condition} 발동!` });
  }
}
