import type { Enemy, DamageType } from '../types/enemyTypes';

/**
 * 전투 데미지 계산 순수 함수
 */

export interface DamageToEnemyResult {
  finalHp: number;
  newShield: number;
  newResist: number;
  actualDamage: number;
  isKilled: boolean;
}

/**
 * 적에게 가하는 데미지 계산 (방어도/취약 등 반영)
 */
export function calculateDamageToEnemy(
  enemy: Enemy,
  rawAmount: number,
  type: DamageType
): DamageToEnemyResult {
  let finalAmount = rawAmount;

  // 취약(VULNERABLE) 상태 시 50% 추가 피해
  if (enemy.statuses?.VULNERABLE && enemy.statuses.VULNERABLE > 0) {
    finalAmount = Math.floor(finalAmount * 1.5);
  }

  let remainingDamage = finalAmount;
  let newShield = enemy.shield;
  let newResist = enemy.resist;

  // 물리 공격 → 방어도로 먼저 흡수
  if (type === 'PHYSICAL' && newShield > 0) {
    if (newShield >= remainingDamage) {
      newShield -= remainingDamage;
      remainingDamage = 0;
    } else {
      remainingDamage -= newShield;
      newShield = 0;
    }
  }

  // 특수 공격 → 저항으로 먼저 흡수
  if (type === 'SPECIAL' && newResist > 0) {
    if (newResist >= remainingDamage) {
      newResist -= remainingDamage;
      remainingDamage = 0;
    } else {
      remainingDamage -= newResist;
      newResist = 0;
    }
  }

  let finalHp = enemy.currentHp - remainingDamage;
  if (finalHp < 0) finalHp = 0;

  const actualDamage = enemy.currentHp - finalHp;

  return {
    finalHp,
    newShield,
    newResist,
    actualDamage,
    isKilled: finalHp === 0 && enemy.currentHp > 0,
  };
}

export interface PlayerDefenseState {
  shield: number;
  resist: number;
}

export interface DamageToPlayerResult {
  totalDamage: number;
  newShield: number;
  newResist: number;
  hitQueue: Array<{ type: 'DAMAGE' | 'BURN' | 'POISON' }>;
  specialDefended: boolean;
}

/**
 * 플레이어에게 가해지는 적 공격 데미지 계산
 */
export function calculateDamageToPlayer(
  rawDamage: number,
  hitCount: number,
  isSpecial: boolean,
  defenses: PlayerDefenseState,
  intentDescription: string,
): DamageToPlayerResult {
  let currentShield = defenses.shield;
  let currentResist = defenses.resist;
  const hitQueue: Array<{ type: 'DAMAGE' | 'BURN' | 'POISON' }> = [];
  let totalDamage = 0;
  let specialDefended = false;

  for (let i = 0; i < hitCount; i++) {
    let damageToPlayer = rawDamage;

    if (isSpecial) {
      if (currentResist > 0) {
        specialDefended = true;
        if (currentResist >= damageToPlayer) {
          currentResist -= damageToPlayer;
          damageToPlayer = 0;
        } else {
          damageToPlayer -= currentResist;
          currentResist = 0;
        }
      }
    } else {
      if (currentShield > 0) {
        if (currentShield >= damageToPlayer) {
          currentShield -= damageToPlayer;
          damageToPlayer = 0;
        } else {
          damageToPlayer -= currentShield;
          currentShield = 0;
        }
      }
    }

    totalDamage += damageToPlayer;

    if (damageToPlayer > 0) {
      let hitType: 'DAMAGE' | 'BURN' | 'POISON' = 'DAMAGE';
      if (intentDescription.includes('☣️') || intentDescription.includes('산성') || intentDescription.includes('독') || intentDescription.includes('맹독')) {
        hitType = 'POISON';
      } else if (intentDescription.includes('소이탄') || intentDescription.includes('화상') || intentDescription.includes('🔥') || intentDescription.includes('화염')) {
        hitType = 'BURN';
      }
      hitQueue.push({ type: hitType });
    }
  }

  return {
    totalDamage,
    newShield: currentShield,
    newResist: currentResist,
    hitQueue,
    specialDefended,
  };
}
