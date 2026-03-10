import { describe, it, expect } from 'vitest';
import { applyUpgrade } from './cardUpgrades';
import type { Card } from '../types/gameTypes';

function makeCard(baseId: string, overrides: Partial<Card> = {}): Card {
  return {
    id: 'c1', baseId, name: 'Original', type: 'PHYSICAL_ATTACK',
    costAp: 1, costAmmo: 0, description: 'original',
    effects: [{ type: 'DAMAGE', amount: 6 }],
    ...overrides,
  };
}

describe('applyUpgrade', () => {
  it('old_pipe 업그레이드 → 데미지 9', () => {
    const card = makeCard('old_pipe');
    const upgraded = applyUpgrade(card);
    expect(upgraded.isUpgraded).toBe(true);
    expect(upgraded.name).toBe('낡은 쇠파이프+');
    expect(upgraded.effects[0].amount).toBe(9);
  });

  it('scavenge 업그레이드 → costAp 0', () => {
    const card = makeCard('scavenge', { costAp: 1 });
    const upgraded = applyUpgrade(card);
    expect(upgraded.costAp).toBe(0);
    // effects는 entry에 없으므로 원본 유지
    expect(upgraded.effects).toEqual(card.effects);
  });

  it('chainsaw_grind → 다단히트 효과 교체', () => {
    const card = makeCard('chainsaw_grind');
    const upgraded = applyUpgrade(card);
    expect(upgraded.effects).toHaveLength(2);
    expect(upgraded.effects[0].condition).toBe('MULTI_HIT_3');
    expect(upgraded.effects[0].amount).toBe(5);
  });

  it('sledgehammer_smash → VULNERABLE 2턴', () => {
    const card = makeCard('sledgehammer_smash');
    const upgraded = applyUpgrade(card);
    const debuff = upgraded.effects.find(e => e.type === 'DEBUFF');
    expect(debuff?.amount).toBe(2);
    expect(debuff?.condition).toBe('VULNERABLE');
  });

  it('테이블에 없는 카드 → isUpgraded만 true', () => {
    const card = makeCard('unknown_card_xyz');
    const upgraded = applyUpgrade(card);
    expect(upgraded.isUpgraded).toBe(true);
    expect(upgraded.name).toBe('Original'); // 이름 변경 없음
    expect(upgraded.effects).toEqual(card.effects);
  });

  it('원본 카드 불변성 보장', () => {
    const card = makeCard('old_pipe');
    const originalEffects = [...card.effects];
    applyUpgrade(card);
    expect(card.effects).toEqual(originalEffects);
    expect(card.isUpgraded).toBeUndefined();
  });
});
