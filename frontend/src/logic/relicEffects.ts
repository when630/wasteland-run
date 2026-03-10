import type { Card } from '../types/gameTypes';

/**
 * 유물 효과 중앙화 모듈
 * 트리거 포인트별 순수 함수로 유물 효과를 계산
 */

/** 전투 시작 시 유물 효과 */
export interface BattleStartEffects {
  ammo: number;
  shield: number;
  extraAp: number;
  extraDraw: number;
  statusCardBaseId: string | null; // 상태이상 카드 삽입 (예: 'status_radiation')
  statusCardCount: number;
}

export function onBattleStart(relics: string[], scene: string): BattleStartEffects {
  const result: BattleStartEffects = {
    ammo: 0,
    shield: 0,
    extraAp: 0,
    extraDraw: 0,
    statusCardBaseId: null,
    statusCardCount: 0,
  };

  // [피 묻은 가죽 탄띠] 전투 시작 시 탄약 +1
  if (relics.includes('bloody_bandolier')) {
    result.ammo += 1;
  }

  // [구시대의 보안관 배지] 전투 시작 시 물리 방어도 8
  if (relics.includes('old_sheriff_badge')) {
    result.shield += 8;
  }

  // [금이 간 황동 나침반] 엘리트 전투 시 첫 턴 AP +2, 카드 2장 추가 드로우
  if (relics.includes('cracked_brass_compass') && scene === 'ELITE') {
    result.extraAp += 2;
    result.extraDraw += 2;
  }

  // [생체공학 배양 심장] 전투 시작 시 방사능 오염 카드 2장 혼합
  if (relics.includes('bionic_culture_heart')) {
    result.statusCardBaseId = 'status_radiation';
    result.statusCardCount = 2;
  }

  return result;
}

/** 전투 리셋 시 유물 효과 (maxAp, startingAp 계산) */
export interface BattleResetEffects {
  maxAp: number;
  startingAp: number;
}

const PERMANENT_AP_RELICS = ['arc_heart', 'bionic_culture_heart', 'red_eye_surveillance_module', 'cracked_sunstone_reactor'];

export function onBattleReset(relics: string[]): BattleResetEffects {
  let maxAp = 3;
  PERMANENT_AP_RELICS.forEach(id => {
    if (relics.includes(id)) maxAp += 1;
  });

  let startingAp = maxAp;
  // [야광 시계] 첫 턴 일시적 AP 보너스
  if (relics.includes('glow_watch')) startingAp += 1;

  return { maxAp, startingAp };
}

/** 모닥불/이벤트 진입 시 유물 효과 */
export interface RestOrEventEffects {
  healAmount: number;
  canUpgrade: boolean;
}

export function onRestOrEventEnter(relics: string[], maxHp: number): RestOrEventEffects {
  let healAmount = 0;

  // [불에 탄 작전 지도] 진입 시 최대 체력 5% 회복
  if (relics.includes('burnt_operation_map')) {
    healAmount = Math.ceil(maxHp * 0.05);
  }

  // [균열된 태양석 반응로] 강화 불가
  const canUpgrade = !relics.includes('cracked_sunstone_reactor');

  return { healAmount, canUpgrade };
}

/** 특수 공격으로 적 처치 시 유물 효과 */
export function onEnemyKilledBySpecial(relics: string[]): number {
  // [구시대의 구급상자] 특수 공격으로 처치 시 체력 3 회복
  if (relics.includes('old_medkit')) return 3;
  return 0;
}

/** 치명적 피해 시 부활 유물 효과 */
export interface FatalDamageEffects {
  shouldRevive: boolean;
  reviveHpPercent: number;
  relicToRemove: string | null;
}

export function onFatalDamage(relics: string[]): FatalDamageEffects {
  // [빛바랜 가족사진] 치명적 피해 시 부활
  if (relics.includes('faded_family_photo')) {
    return { shouldRevive: true, reviveHpPercent: 0.3, relicToRemove: 'faded_family_photo' };
  }
  return { shouldRevive: false, reviveHpPercent: 0, relicToRemove: null };
}

/** 카드 사용 후 유물 효과 */
export interface CardPlayedRelicEffects {
  bonusShield: number;
  bonusResist: number;
}

export function onCardPlayed(relics: string[], card: Card): CardPlayedRelicEffects {
  const result: CardPlayedRelicEffects = { bonusShield: 0, bonusResist: 0 };

  // [이중 합금 장갑판]
  if (relics.includes('alloy_plating')) {
    if (card.type === 'PHYSICAL_DEFENSE') {
      result.bonusResist += 2;
    } else if (card.type === 'SPECIAL_DEFENSE') {
      result.bonusShield += 2;
    }
  }

  return result;
}
