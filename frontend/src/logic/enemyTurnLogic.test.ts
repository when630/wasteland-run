import { describe, it, expect } from 'vitest';
import { processStatusDamage, parseAttackIntent, processStatusDecay } from './enemyTurnLogic';
import type { Enemy } from '../types/enemyTypes';

function makeEnemy(overrides: Partial<Enemy> = {}): Enemy {
  return {
    id: 'e1', baseId: 'test', tier: 'NORMAL', name: 'Test',
    maxHp: 50, currentHp: 50, shield: 0, resist: 0, currentIntent: null,
    ...overrides,
  };
}

describe('processStatusDamage', () => {
  it('BURN 틱 데미지 (스택당 3)', () => {
    const r = processStatusDamage(makeEnemy({ statuses: { BURN: 2 } }));
    expect(r.newHp).toBe(44); // 50 - 2*3
    expect(r.vfx?.type).toBe('BURN_TICK');
    expect(r.isDead).toBe(false);
  });

  it('POISON 틱 데미지 (스택 수만큼)', () => {
    const r = processStatusDamage(makeEnemy({ statuses: { POISON: 5 } }));
    expect(r.newHp).toBe(45); // 50 - 5
    expect(r.vfx?.type).toBe('POISON_TICK');
  });

  it('BURN + POISON 복합', () => {
    const r = processStatusDamage(makeEnemy({ statuses: { BURN: 1, POISON: 3 } }));
    expect(r.newHp).toBe(44); // 50 - 3 - 3
    expect(r.vfx?.type).toBe('BURN_POISON_TICK');
  });

  it('치사 상태이상 데미지', () => {
    const r = processStatusDamage(makeEnemy({ currentHp: 5, statuses: { BURN: 3 } }));
    expect(r.newHp).toBeLessThanOrEqual(0); // 5 - 9
    expect(r.isDead).toBe(true);
  });

  it('상태이상 없으면 영향 없음', () => {
    const r = processStatusDamage(makeEnemy());
    expect(r.newHp).toBe(50);
    expect(r.vfx).toBeUndefined();
    expect(r.isDead).toBe(false);
  });
});

describe('parseAttackIntent', () => {
  it('일반 공격 파싱', () => {
    const r = parseAttackIntent(10, '⚔️ 공격 10', 0, 0);
    expect(r.rawDamage).toBe(10);
    expect(r.hitCount).toBe(1);
  });

  it('멀티히트 파싱 (4x2)', () => {
    const r = parseAttackIntent(8, '⚔️ 연발 (4x2)', 0, 0);
    expect(r.rawDamage).toBe(4);
    expect(r.hitCount).toBe(2);
  });

  it('멀티히트 파싱 (6x3)', () => {
    const r = parseAttackIntent(18, '⚔️ 광란 (6x3)', 0, 0);
    expect(r.rawDamage).toBe(6);
    expect(r.hitCount).toBe(3);
  });

  it('WEAK 디버프 → 25% 감소', () => {
    const r = parseAttackIntent(10, '⚔️ 공격 10', 1, 0);
    expect(r.rawDamage).toBe(7); // floor(10 * 0.75)
  });

  it('플레이어 VULNERABLE → 50% 증가', () => {
    const r = parseAttackIntent(10, '⚔️ 공격 10', 0, 1);
    expect(r.rawDamage).toBe(15); // floor(10 * 1.5)
  });

  it('WEAK + VULNERABLE 복합', () => {
    const r = parseAttackIntent(10, '⚔️ 공격 10', 1, 1);
    // floor(10 * 0.75) = 7, floor(7 * 1.5) = 10
    expect(r.rawDamage).toBe(10);
  });
});

describe('processStatusDecay', () => {
  it('스택 2 → 1로 감소', () => {
    const r = processStatusDecay({ BURN: 2, VULNERABLE: 1 });
    expect(r.BURN).toBe(1);
    expect(r.VULNERABLE).toBeUndefined(); // 1→0 제거
  });

  it('모든 스택 1이면 빈 객체', () => {
    const r = processStatusDecay({ WEAK: 1, POISON: 1 });
    expect(Object.keys(r)).toHaveLength(0);
  });

  it('빈 입력 → 빈 출력', () => {
    const r = processStatusDecay({});
    expect(Object.keys(r)).toHaveLength(0);
  });
});
