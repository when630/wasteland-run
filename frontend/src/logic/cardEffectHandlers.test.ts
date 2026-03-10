import { describe, it, expect } from 'vitest';
import { resolveCardEffects, type EffectAction } from './cardEffectHandlers';
import type { Card } from '../types/gameTypes';
import type { Enemy } from '../types/enemyTypes';

function makeCard(overrides: Partial<Card> = {}): Card {
  return {
    id: 'c1', baseId: 'test', name: 'Test Card',
    type: 'PHYSICAL_ATTACK', costAp: 1, costAmmo: 0,
    description: '', effects: [],
    ...overrides,
  };
}

function makeEnemy(overrides: Partial<Enemy> = {}): Enemy {
  return {
    id: 'e1', baseId: 'test', tier: 'NORMAL', name: 'Test Enemy',
    maxHp: 50, currentHp: 50, shield: 0, resist: 0, currentIntent: null,
    ...overrides,
  };
}

const baseCtx = {
  targetEnemyId: 'e1',
  targetEnemy: makeEnemy(),
  enemies: [makeEnemy()],
  consumedAmmoAmount: 0,
  physicalScalingBonus: 0,
};

describe('resolveCardEffects', () => {
  it('단일 타겟 DAMAGE', () => {
    const card = makeCard({ effects: [{ type: 'DAMAGE', amount: 10 }] });
    const actions = resolveCardEffects(card, baseCtx);
    expect(actions).toContainEqual({ type: 'DAMAGE_ENEMY', enemyId: 'e1', amount: 10, damageType: 'PHYSICAL' });
  });

  it('특수 공격 damageType', () => {
    const card = makeCard({ type: 'SPECIAL_ATTACK', effects: [{ type: 'DAMAGE', amount: 15 }] });
    const actions = resolveCardEffects(card, baseCtx);
    expect(actions).toContainEqual({ type: 'DAMAGE_ENEMY', enemyId: 'e1', amount: 15, damageType: 'SPECIAL' });
  });

  it('전체 공격 (ALL_ENEMIES)', () => {
    const card = makeCard({ effects: [{ type: 'DAMAGE', amount: 8, target: 'ALL_ENEMIES' }] });
    const actions = resolveCardEffects(card, baseCtx);
    expect(actions).toContainEqual({ type: 'DAMAGE_ALL_ENEMIES', amount: 8, damageType: 'PHYSICAL' });
  });

  it('MULTI_HIT_3 다단 히트', () => {
    const card = makeCard({ effects: [{ type: 'DAMAGE', amount: 4, condition: 'MULTI_HIT_3' }] });
    const actions = resolveCardEffects(card, baseCtx);
    const dmgActions = actions.filter(a => a.type === 'DAMAGE_ENEMY');
    expect(dmgActions).toHaveLength(3);
    dmgActions.forEach(a => {
      if (a.type === 'DAMAGE_ENEMY') expect(a.amount).toBe(4);
    });
  });

  it('PER_AMMO_CONSUMED', () => {
    const card = makeCard({ type: 'SPECIAL_ATTACK', effects: [{ type: 'DAMAGE', amount: 10, condition: 'PER_AMMO_CONSUMED' }] });
    const actions = resolveCardEffects(card, { ...baseCtx, consumedAmmoAmount: 3 });
    expect(actions).toContainEqual({ type: 'DAMAGE_ENEMY', enemyId: 'e1', amount: 30, damageType: 'SPECIAL' });
  });

  it('BONUS_IF_ATTACKING: 적이 공격 의도일 때 보너스', () => {
    const enemy = makeEnemy({ currentIntent: { type: 'ATTACK', amount: 10, description: '⚔️ 공격' } });
    const card = makeCard({ type: 'SPECIAL_ATTACK', effects: [{ type: 'DAMAGE', amount: 20, condition: 'BONUS_IF_ATTACKING_10' }] });
    const actions = resolveCardEffects(card, { ...baseCtx, targetEnemy: enemy });
    const dmg = actions.find(a => a.type === 'DAMAGE_ENEMY') as Extract<EffectAction, { type: 'DAMAGE_ENEMY' }>;
    expect(dmg.amount).toBe(30); // 20 + 10 보너스
  });

  it('BONUS_IF_ATTACKING: 적이 버프 의도일 때 보너스 없음', () => {
    const enemy = makeEnemy({ currentIntent: { type: 'BUFF', amount: 5, description: '방어' } });
    const card = makeCard({ type: 'SPECIAL_ATTACK', effects: [{ type: 'DAMAGE', amount: 20, condition: 'BONUS_IF_ATTACKING_10' }] });
    const actions = resolveCardEffects(card, { ...baseCtx, targetEnemy: enemy });
    const dmg = actions.find(a => a.type === 'DAMAGE_ENEMY') as Extract<EffectAction, { type: 'DAMAGE_ENEMY' }>;
    expect(dmg.amount).toBe(20);
  });

  it('물리 스케일링 보너스 적용', () => {
    const card = makeCard({ effects: [{ type: 'DAMAGE', amount: 6 }] });
    const actions = resolveCardEffects(card, { ...baseCtx, physicalScalingBonus: 4 });
    expect(actions).toContainEqual({ type: 'DAMAGE_ENEMY', enemyId: 'e1', amount: 10, damageType: 'PHYSICAL' });
  });

  it('SHIELD 효과', () => {
    const card = makeCard({ type: 'PHYSICAL_DEFENSE', effects: [{ type: 'SHIELD', amount: 8 }] });
    const actions = resolveCardEffects(card, baseCtx);
    expect(actions).toContainEqual({ type: 'SHIELD', amount: 8 });
  });

  it('RESIST 효과', () => {
    const card = makeCard({ type: 'SPECIAL_DEFENSE', effects: [{ type: 'RESIST', amount: 12 }] });
    const actions = resolveCardEffects(card, baseCtx);
    expect(actions).toContainEqual({ type: 'RESIST', amount: 12 });
  });

  it('DRAW / ADD_AMMO / HEAL 효과', () => {
    const card = makeCard({ effects: [{ type: 'DRAW', amount: 2 }, { type: 'ADD_AMMO', amount: 3 }, { type: 'HEAL', amount: 5 }] });
    const actions = resolveCardEffects(card, baseCtx);
    expect(actions).toContainEqual({ type: 'DRAW', amount: 2 });
    expect(actions).toContainEqual({ type: 'ADD_AMMO', amount: 3 });
    expect(actions).toContainEqual({ type: 'HEAL', amount: 5 });
  });

  it('음수 HEAL → DAMAGE_SELF', () => {
    const card = makeCard({ effects: [{ type: 'HEAL', amount: -5, target: 'PLAYER' }] });
    const actions = resolveCardEffects(card, baseCtx);
    expect(actions).toContainEqual({ type: 'DAMAGE_SELF', amount: 5 });
  });

  it('DEBUFF 단일 적', () => {
    const card = makeCard({ effects: [{ type: 'DEBUFF', condition: 'VULNERABLE', amount: 2 }] });
    const actions = resolveCardEffects(card, baseCtx);
    expect(actions).toContainEqual({ type: 'DEBUFF_ENEMY', enemyId: 'e1', status: 'VULNERABLE', amount: 2 });
  });

  it('DEBUFF 전체 적', () => {
    const card = makeCard({ effects: [{ type: 'DEBUFF', condition: 'WEAK', amount: 1, target: 'ALL_ENEMIES' }] });
    const actions = resolveCardEffects(card, baseCtx);
    expect(actions).toContainEqual({ type: 'DEBUFF_ALL_ENEMIES', status: 'WEAK', amount: 1 });
  });

  it('BUFF NEXT_PHYSICAL_FREE', () => {
    const card = makeCard({ effects: [{ type: 'BUFF', condition: 'NEXT_PHYSICAL_FREE' }] });
    const actions = resolveCardEffects(card, baseCtx);
    expect(actions.some(a => a.type === 'BUFF' && a.condition === 'NEXT_PHYSICAL_FREE')).toBe(true);
  });

  it('BUFF RETAIN_1_CARD', () => {
    const card = makeCard({ effects: [{ type: 'BUFF', condition: 'RETAIN_1_CARD' }] });
    const actions = resolveCardEffects(card, baseCtx);
    expect(actions.some(a => a.type === 'BUFF' && a.condition === 'RETAIN_1_CARD')).toBe(true);
  });

  it('MARK_OF_FATE 파싱', () => {
    const card = makeCard({ effects: [{ type: 'DEBUFF', condition: 'MARK_OF_FATE_5_2' }] });
    const actions = resolveCardEffects(card, baseCtx);
    expect(actions).toContainEqual({ type: 'MARK_OF_FATE', enemyId: 'e1', healAmount: 5, ammoAmount: 2 });
  });
});
