import { describe, it, expect } from 'vitest';
import { calculateDamageToEnemy, calculateDamageToPlayer } from './damageCalculation';
import type { Enemy } from '../types/enemyTypes';

function makeEnemy(overrides: Partial<Enemy> = {}): Enemy {
  return {
    id: 'e1', baseId: 'test', tier: 'NORMAL', name: 'Test',
    maxHp: 50, currentHp: 50, shield: 0, resist: 0, currentIntent: null,
    ...overrides,
  };
}

describe('calculateDamageToEnemy', () => {
  it('기본 물리 데미지 (방어 없음)', () => {
    const r = calculateDamageToEnemy(makeEnemy(), 10, 'PHYSICAL');
    expect(r.finalHp).toBe(40);
    expect(r.actualDamage).toBe(10);
    expect(r.isKilled).toBe(false);
  });

  it('기본 특수 데미지 (방어 없음)', () => {
    const r = calculateDamageToEnemy(makeEnemy(), 15, 'SPECIAL');
    expect(r.finalHp).toBe(35);
    expect(r.actualDamage).toBe(15);
  });

  it('쉴드가 물리 데미지 흡수', () => {
    const r = calculateDamageToEnemy(makeEnemy({ shield: 8 }), 10, 'PHYSICAL');
    expect(r.newShield).toBe(0);
    expect(r.finalHp).toBe(48); // 10-8=2 관통
    expect(r.actualDamage).toBe(2);
  });

  it('쉴드가 물리 데미지 완전 차단', () => {
    const r = calculateDamageToEnemy(makeEnemy({ shield: 15 }), 10, 'PHYSICAL');
    expect(r.newShield).toBe(5);
    expect(r.finalHp).toBe(50);
    expect(r.actualDamage).toBe(0);
  });

  it('레지스트가 특수 데미지 흡수', () => {
    const r = calculateDamageToEnemy(makeEnemy({ resist: 6 }), 10, 'SPECIAL');
    expect(r.newResist).toBe(0);
    expect(r.finalHp).toBe(46); // 10-6=4 관통
  });

  it('쉴드는 특수 공격에 영향 없음', () => {
    const r = calculateDamageToEnemy(makeEnemy({ shield: 20 }), 10, 'SPECIAL');
    expect(r.newShield).toBe(20);
    expect(r.finalHp).toBe(40);
  });

  it('VULNERABLE 상태 시 50% 추가 피해', () => {
    const r = calculateDamageToEnemy(makeEnemy({ statuses: { VULNERABLE: 2 } }), 10, 'PHYSICAL');
    expect(r.finalHp).toBe(35); // floor(10*1.5)=15
    expect(r.actualDamage).toBe(15);
  });

  it('VULNERABLE + 쉴드 조합', () => {
    const r = calculateDamageToEnemy(makeEnemy({ shield: 5, statuses: { VULNERABLE: 1 } }), 10, 'PHYSICAL');
    // floor(10*1.5)=15, 쉴드 5 흡수, 10 관통
    expect(r.newShield).toBe(0);
    expect(r.finalHp).toBe(40);
  });

  it('HP 0 이하로 떨어지면 0으로 바닥', () => {
    const r = calculateDamageToEnemy(makeEnemy({ currentHp: 5 }), 20, 'PHYSICAL');
    expect(r.finalHp).toBe(0);
    expect(r.isKilled).toBe(true);
  });

  it('정확히 치사량 데미지', () => {
    const r = calculateDamageToEnemy(makeEnemy({ currentHp: 10 }), 10, 'PHYSICAL');
    expect(r.finalHp).toBe(0);
    expect(r.isKilled).toBe(true);
    expect(r.actualDamage).toBe(10);
  });

  it('이미 죽은 적에게 데미지 → isKilled false', () => {
    const r = calculateDamageToEnemy(makeEnemy({ currentHp: 0 }), 10, 'PHYSICAL');
    expect(r.finalHp).toBe(0);
    expect(r.isKilled).toBe(false); // currentHp가 이미 0이었으므로
  });
});

describe('calculateDamageToPlayer', () => {
  it('기본 물리 데미지 (방어 없음)', () => {
    const r = calculateDamageToPlayer(8, 1, false, { shield: 0, resist: 0 }, '⚔️ 공격 8');
    expect(r.totalDamage).toBe(8);
    expect(r.hitQueue).toHaveLength(1);
    expect(r.hitQueue[0].type).toBe('DAMAGE');
  });

  it('쉴드로 물리 데미지 흡수', () => {
    const r = calculateDamageToPlayer(8, 1, false, { shield: 10, resist: 0 }, '⚔️ 공격 8');
    expect(r.totalDamage).toBe(0);
    expect(r.newShield).toBe(2);
    expect(r.hitQueue).toHaveLength(0);
  });

  it('레지스트로 특수 데미지 흡수 + specialDefended', () => {
    const r = calculateDamageToPlayer(8, 1, true, { shield: 0, resist: 10 }, '☣️ 특수 8');
    expect(r.totalDamage).toBe(0);
    expect(r.newResist).toBe(2);
    expect(r.specialDefended).toBe(true);
  });

  it('멀티히트 물리 (3히트)', () => {
    const r = calculateDamageToPlayer(4, 3, false, { shield: 5, resist: 0 }, '⚔️ 연타 4x3');
    // 1히트: 4 → 쉴드 5→1, dmg 0
    // 2히트: 4 → 쉴드 1→0, dmg 3
    // 3히트: 4 → 쉴드 0, dmg 4
    expect(r.totalDamage).toBe(7);
    expect(r.newShield).toBe(0);
  });

  it('독 히트타입 감지', () => {
    const r = calculateDamageToPlayer(5, 1, true, { shield: 0, resist: 0 }, '☣️ 독 침 5');
    expect(r.hitQueue[0].type).toBe('POISON');
  });

  it('화상 히트타입 감지', () => {
    const r = calculateDamageToPlayer(10, 1, true, { shield: 0, resist: 0 }, '소이탄 10');
    expect(r.hitQueue[0].type).toBe('BURN');
  });
});
