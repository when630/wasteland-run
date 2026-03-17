import type { Card } from '../types/gameTypes';

/**
 * 유물 효과 중앙화 모듈
 * 트리거 포인트별 순수 함수로 유물 효과를 계산
 */

/** 전투 시작 시 유물 효과 */
export interface BattleStartEffects {
  ammo: number;
  shield: number;
  resist: number;
  extraAp: number;
  extraDraw: number;
  healAmount: number;
  statusCardBaseId: string | null;
  statusCardCount: number;
  vulnerableAllEnemies: number; // 적 전체 취약
  weakAllEnemies: number;      // 적 전체 약화
}

export function onBattleStart(relics: string[], scene: string): BattleStartEffects {
  const result: BattleStartEffects = {
    ammo: 0, shield: 0, resist: 0,
    extraAp: 0, extraDraw: 0, healAmount: 0,
    statusCardBaseId: null, statusCardCount: 0,
    vulnerableAllEnemies: 0, weakAllEnemies: 0,
  };

  // [피 묻은 가죽 탄띠] 탄약 +1
  if (relics.includes('bloody_bandolier')) result.ammo += 1;

  // [구시대의 보안관 배지] 물리 방어도 8
  if (relics.includes('old_sheriff_badge')) result.shield += 8;

  // [철모] 특수 방어도 6
  if (relics.includes('steel_helmet')) result.resist += 6;

  // [행운의 탄피] 첫 턴 카드 2장 추가 드로우
  if (relics.includes('lucky_casing')) result.extraDraw += 2;

  // [응급 붕대] 체력 4 회복
  if (relics.includes('emergency_bandage')) result.healAmount += 4;

  // [구호물자 상자] 카드 1장 추가 드로우
  if (relics.includes('relief_crate')) result.extraDraw += 1;

  // [대형 탄약통] 탄약 3
  if (relics.includes('large_ammo_case')) result.ammo += 3;

  // [즉석 함정] 랜덤 적 취약 1턴
  if (relics.includes('makeshift_trap')) result.vulnerableAllEnemies += 1;

  // [폐허의 부적] 적 전체 약화 1턴
  if (relics.includes('ruin_charm')) result.weakAllEnemies += 1;

  // [도박사의 주사위] 전투 시작 시 랜덤 보너스
  if (relics.includes('gambler_dice')) {
    const roll = Math.floor(Math.random() * 4);
    if (roll === 0) result.ammo += 2;
    else if (roll === 1) result.extraAp += 1;
    else if (roll === 2) result.shield += 10;
    else result.extraDraw += 2;
  }

  // [금이 간 황동 나침반] 엘리트 전투 시
  if (relics.includes('cracked_brass_compass') && scene === 'ELITE') {
    result.extraAp += 2;
    result.extraDraw += 2;
  }

  // [생체공학 배양 심장] 방사능 오염 카드 2장 혼입
  if (relics.includes('bionic_culture_heart')) {
    result.statusCardBaseId = 'status_radiation';
    result.statusCardCount = 2;
  }

  // [고대 전투 보철] 화상 카드 1장 혼입
  if (relics.includes('ancient_prosthetic')) {
    result.statusCardBaseId = result.statusCardBaseId || 'status_burn';
    result.statusCardCount += 1;
  }

  return result;
}

/** 전투 리셋 시 유물 효과 (maxAp, startingAp 계산) */
export interface BattleResetEffects {
  maxAp: number;
  startingAp: number;
}

const PERMANENT_AP_RELICS = [
  'arc_heart', 'bionic_culture_heart', 'red_eye_surveillance_module',
  'cracked_sunstone_reactor', 'adrenaline_injector', 'quantum_core',
  'ancient_prosthetic', 'unstable_teleporter',
];

export function onBattleReset(relics: string[]): BattleResetEffects {
  let maxAp = 3;
  PERMANENT_AP_RELICS.forEach(id => {
    if (relics.includes(id)) maxAp += 1;
  });

  let startingAp = maxAp;
  if (relics.includes('glow_watch')) startingAp += 1;

  return { maxAp, startingAp };
}

/** 모닥불/이벤트 진입 시 유물 효과 */
export interface RestOrEventEffects {
  healAmount: number;
  canUpgrade: boolean;
  restHealBonus: number; // 휴식 회복량 추가 비율 (0.3 = +30%)
  canRemoveCard: boolean; // 카드 제거 가능 여부
}

export function onRestOrEventEnter(relics: string[], maxHp: number): RestOrEventEffects {
  let healAmount = 0;

  if (relics.includes('burnt_operation_map')) {
    healAmount = Math.ceil(maxHp * 0.05);
  }

  const canUpgrade = !relics.includes('cracked_sunstone_reactor');
  const restHealBonus = relics.includes('canned_food') ? 0.3 : 0;
  const canRemoveCard = relics.includes('universal_repair_tool');

  return { healAmount, canUpgrade, restHealBonus, canRemoveCard };
}

/** 특수 공격으로 적 처치 시 유물 효과 */
export function onEnemyKilledBySpecial(relics: string[]): number {
  if (relics.includes('old_medkit')) return 3;
  return 0;
}

/** 물리 공격으로 적 처치 시 유물 효과 */
export interface PhysicalKillEffects {
  splashDamage: number; // 전체 적에게 물리 피해
}

export function onEnemyKilledByPhysical(relics: string[]): PhysicalKillEffects {
  return {
    splashDamage: relics.includes('welding_gauntlet') ? 4 : 0,
  };
}

/** 적 처치 시 (공격 타입 무관) 유물 효과 */
export function onEnemyKilled(relics: string[]): { ammo: number } {
  return {
    ammo: relics.includes('ammo_magnet') ? 1 : 0,
  };
}

/** 전투 종료 시 유물 효과 */
export function onBattleEnd(relics: string[]): { healAmount: number } {
  return {
    healAmount: relics.includes('survivor_dog_tag') ? 6 : 0,
  };
}

/** 치명적 피해 시 부활 유물 효과 */
export interface FatalDamageEffects {
  shouldRevive: boolean;
  reviveHpPercent: number;
  relicToRemove: string | null;
}

export function onFatalDamage(relics: string[]): FatalDamageEffects {
  if (relics.includes('faded_family_photo')) {
    return { shouldRevive: true, reviveHpPercent: 0.3, relicToRemove: 'faded_family_photo' };
  }
  return { shouldRevive: false, reviveHpPercent: 0, relicToRemove: null };
}

/** 카드 사용 후 유물 효과 */
export interface CardPlayedRelicEffects {
  bonusShield: number;
  bonusResist: number;
  bonusDamage: number; // 패시브 피해 보너스
  spikedDamage: number; // 가시 어깨받이: 방어 카드 사용 시 피해
  healAmount: number;   // 재생 연고: 특수 방어 시 힐
}

export function onCardPlayed(relics: string[], card: Card): CardPlayedRelicEffects {
  const result: CardPlayedRelicEffects = {
    bonusShield: 0, bonusResist: 0, bonusDamage: 0, spikedDamage: 0, healAmount: 0,
  };

  // [이중 합금 장갑판] 크로스 방어
  if (relics.includes('alloy_plating')) {
    if (card.type === 'PHYSICAL_DEFENSE') result.bonusResist += 2;
    else if (card.type === 'SPECIAL_DEFENSE') result.bonusShield += 2;
  }

  // [강화 장갑] 물리 방어 +3
  if (relics.includes('reinforced_gloves') && card.type === 'PHYSICAL_DEFENSE') {
    result.bonusShield += 3;
  }

  // [납판 삽입물] 특수 방어 +3
  if (relics.includes('lead_insert') && card.type === 'SPECIAL_DEFENSE') {
    result.bonusResist += 3;
  }

  // [가시 어깨받이] 물리 방어 카드 → 랜덤 적 피해 3
  if (relics.includes('spiked_pauldron') && card.type === 'PHYSICAL_DEFENSE') {
    result.spikedDamage += 3;
  }

  // [재생 연고] 특수 방어 카드 → 체력 2 회복
  if (relics.includes('regen_salve') && card.type === 'SPECIAL_DEFENSE') {
    result.healAmount += 2;
  }

  return result;
}

/** 패시브 피해 보너스 (녹슨 너클, 즉석 소음기, 조준경, 광전사 문양, 고대 보철) */
export interface PassiveDamageBonus {
  physicalBonus: number;
  specialBonus: number;
  singleTargetBonus: number;
}

export function getPassiveDamageBonus(relics: string[], playerHp: number, playerMaxHp: number): PassiveDamageBonus {
  let physicalBonus = 0;
  let specialBonus = 0;
  let singleTargetBonus = 0;

  if (relics.includes('rusty_knuckle')) physicalBonus += 2;
  if (relics.includes('makeshift_silencer')) specialBonus += 2;
  if (relics.includes('ancient_prosthetic')) physicalBonus += 4;
  if (relics.includes('scope')) singleTargetBonus += 3;
  if (relics.includes('berserker_mark') && playerHp <= playerMaxHp / 2) {
    physicalBonus += 3;
    specialBonus += 3;
  }

  return { physicalBonus, specialBonus, singleTargetBonus };
}

/** 턴 시작 시 유물 효과 */
export interface TurnStartEffects {
  ammo: number;
  extraDraw: number;
  selfDamage: number; // 아드레날린 주입기
  randomEnemyDamage: number; // 돌연변이 발톱
}

export function onTurnStart(relics: string[], turnCount: number, playerHp: number, playerMaxHp: number): TurnStartEffects {
  const result: TurnStartEffects = { ammo: 0, extraDraw: 0, selfDamage: 0, randomEnemyDamage: 0 };

  // [자동 장전기] 탄약 0일 때 → 별도 체크 필요 (caller에서 확인)
  // [소형 배터리] 매 2턴
  if (relics.includes('small_battery') && turnCount % 2 === 0) result.ammo += 1;

  // [화기 정비 키트] 매 턴 탄약 1
  if (relics.includes('weapon_maintenance_kit')) result.ammo += 1;

  // [모래시계] 매 3턴 AP +1 → caller에서 처리

  // [해골 부적] HP 50% 이하 시 드로우 +1
  if (relics.includes('skull_charm') && playerHp <= playerMaxHp / 2) result.extraDraw += 1;

  // [전술 HUD] 매 턴 드로우 +1
  if (relics.includes('tactical_hud')) result.extraDraw += 1;

  // [아드레날린 주입기] 매 턴 자해 3
  if (relics.includes('adrenaline_injector')) result.selfDamage += 3;

  // [돌연변이 발톱] 매 턴 랜덤 적 피해 3
  if (relics.includes('mutant_claw')) result.randomEnemyDamage += 3;

  return result;
}
