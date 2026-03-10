import type { Enemy } from '../types/enemyTypes';

/**
 * 적 턴 로직 순수 함수
 */

type VisualEffectType = 'DAMAGE' | 'BUFF' | 'BURN_TICK' | 'POISON_TICK' | 'BURN_POISON_TICK' | 'ATTACKING';

export interface StatusDamageResult {
  newHp: number;
  vfx: { type: VisualEffectType; tick: number } | undefined;
  isDead: boolean;
}

/**
 * 적의 상태이상 데미지 처리 (화상, 독)
 */
export function processStatusDamage(enemy: Enemy): StatusDamageResult {
  const statuses = enemy.statuses || {};
  let currentHp = enemy.currentHp;
  let vfx: { type: VisualEffectType; tick: number } | undefined = undefined;

  const hasBurn = statuses.BURN && statuses.BURN > 0;
  const hasPoison = statuses.POISON && statuses.POISON > 0;

  if (hasBurn) currentHp -= statuses.BURN * 3;
  if (hasPoison) currentHp -= statuses.POISON;

  if (hasBurn && hasPoison) {
    vfx = { type: 'BURN_POISON_TICK', tick: Date.now() };
  } else if (hasBurn) {
    vfx = { type: 'BURN_TICK', tick: Date.now() };
  } else if (hasPoison) {
    vfx = { type: 'POISON_TICK', tick: Date.now() };
  }

  return { newHp: currentHp, vfx, isDead: currentHp <= 0 };
}

/**
 * 적 공격의 rawDamage와 hitCount 파싱
 */
export function parseAttackIntent(
  baseAmount: number,
  description: string,
  weakStacks: number,
  playerVulnerableStacks: number
): { rawDamage: number; hitCount: number } {
  let rawDamage = baseAmount;
  let hitCount = 1;

  // 다단 히트 패턴 파싱 (NxM 형태)
  const multiHitMatch = description.match(/(\d+)x(\d+)/);
  if (multiHitMatch) {
    rawDamage = parseInt(multiHitMatch[1], 10);
    hitCount = parseInt(multiHitMatch[2], 10);
  }

  // 약화(WEAK) 디버프 적용
  if (weakStacks > 0) {
    rawDamage = Math.floor(rawDamage * 0.75);
  }

  // 플레이어 VULNERABLE: 받는 피해 50% 증가
  if (playerVulnerableStacks > 0) {
    rawDamage = Math.floor(rawDamage * 1.5);
  }

  return { rawDamage, hitCount };
}

/**
 * 상태이상 턴 감소 처리
 */
export function processStatusDecay(statuses: Record<string, number>): Record<string, number> {
  const next: Record<string, number> = {};
  Object.entries(statuses).forEach(([key, val]) => {
    if (val > 1) next[key] = val - 1;
  });
  return next;
}
