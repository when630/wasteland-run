/**
 * 보급품 효과 중앙화 모듈
 * 각 보급품 사용 시 발생하는 효과를 순수 함수로 계산
 */

export interface SupplyEffectContext {
  isInCombat: boolean;
  relics: string[];
  playerHp: number;
  playerMaxHp: number;
}

export interface SupplyEffectResult {
  // 즉시 효과
  heal: number;
  maxHpBonus: number;             // 영구 최대 HP 증가 (비전투 bio_enhancer)
  tempMaxHpBonus: number;         // 전투 중 임시 최대 HP (전투 bio_enhancer)
  ap: number;
  ammo: number;
  draw: number;
  shield: number;
  resist: number;
  damageAllEnemies: number;
  damageAllEnemiesType: 'PHYSICAL' | 'SPECIAL';
  damageSingleEnemy: number;      // 단일 대상 (sticky_bomb)
  needsTarget: boolean;           // true면 적 선택 UI 필요

  // 디버프/상태이상
  weakAllEnemies: number;
  vulnerableAllEnemies: number;
  removeDebuffCount: number;      // 0=없음, 1=하나, 99=전부

  // 턴 지속 효과 (배틀 스토어에서 관리)
  attackBonusTurn: number;        // 이번 턴 공격 보너스
  firstSpecialBonusTurn: number;  // 이번 턴 첫 특수공격 보너스
  damageReductionFlat: number;    // 이번 턴 받는 피해 고정 감소
  damageReductionPercent: number; // 다수 턴 받는 피해 % 감소
  damageReductionPercentTurns: number;
  regenPerTurn: number;           // 턴 시작 시 회복
  regenTurns: number;
  berserkerSelfDamage: number;    // 턴 종료 시 자해
  extraTurn: boolean;             // 추가 턴

  // 특수 효과
  discardAndRedraw: boolean;      // 손패 전부 버리고 새로 드로우 (full_resupply)
  fullApRestore: boolean;         // AP 전회복 (full_resupply)
  fullAmmoRestore: number;        // 탄약 전회복 값 (full_resupply)
  purgeStatusCards: boolean;      // 덱 전체 상태이상 소멸 (quantum_purifier)
  exhaustStatusFromHand: number;  // 손패 상태이상 소멸 수 (detox_kit)
  upgradeCardFromHand: boolean;   // 손패 카드 강화 (field_repair_tool 전투)
  permanentUpgradeCard: boolean;  // 영구 카드 강화 (field_repair_tool 비전투)

  // 유물 연동 보너스
  relicBonusHeal: number;         // 응급 처치 교범
  relicBonusDraw: number;         // 폐품 증류기
}

function createEmptyResult(): SupplyEffectResult {
  return {
    heal: 0, maxHpBonus: 0, tempMaxHpBonus: 0,
    ap: 0, ammo: 0, draw: 0, shield: 0, resist: 0,
    damageAllEnemies: 0, damageAllEnemiesType: 'PHYSICAL',
    damageSingleEnemy: 0, needsTarget: false,
    weakAllEnemies: 0, vulnerableAllEnemies: 0,
    removeDebuffCount: 0,
    attackBonusTurn: 0, firstSpecialBonusTurn: 0,
    damageReductionFlat: 0,
    damageReductionPercent: 0, damageReductionPercentTurns: 0,
    regenPerTurn: 0, regenTurns: 0,
    berserkerSelfDamage: 0, extraTurn: false,
    discardAndRedraw: false, fullApRestore: false, fullAmmoRestore: 0,
    purgeStatusCards: false, exhaustStatusFromHand: 0,
    upgradeCardFromHand: false, permanentUpgradeCard: false,
    relicBonusHeal: 0, relicBonusDraw: 0,
  };
}

/** 보급품 사용 가능 여부 확인 */
export function canUseSupply(relics: string[]): boolean {
  return !relics.includes('vow_of_abstinence');
}

/** 보급품 최대 소지 슬롯 계산 */
export function getMaxSupplySlots(relics: string[], mutationStage: number = 0): number {
  let slots = 3;
  if (relics.includes('large_backpack')) slots += 1;
  if (relics.includes('supply_officer_armband')) slots += 2;
  // 변이 13단계: 소지 한도 -1
  if (mutationStage >= 13) slots -= 1;
  return Math.max(1, slots);
}

/** 보급품 효과 계산 */
export function resolveSupplyEffect(
  supplyId: string,
  ctx: SupplyEffectContext,
): SupplyEffectResult {
  const r = createEmptyResult();

  // 유물 연동 보너스 (모든 보급품 공통)
  if (ctx.relics.includes('first_aid_manual')) r.relicBonusHeal = 3;
  if (ctx.relics.includes('scrap_distiller')) r.relicBonusDraw = 1;

  switch (supplyId) {
    // ── COMMON ──
    case 'emergency_ration':
      r.heal = 12;
      break;
    case 'purified_water':
      r.removeDebuffCount = 1;
      break;
    case 'energy_gel':
      r.ap = 1;
      break;
    case 'spare_magazine':
      r.ammo = 2;
      break;
    case 'stimulant_shot':
      r.draw = 2;
      break;
    case 'emergency_tourniquet':
      r.shield = 10;
      break;
    case 'shielding_panel':
      r.resist = 10;
      break;
    case 'rusty_grenade':
      r.damageAllEnemies = 8;
      r.damageAllEnemiesType = 'PHYSICAL';
      break;
    case 'smoke_canister':
      r.weakAllEnemies = 1;
      break;
    case 'flashbang':
      r.vulnerableAllEnemies = 1;
      break;
    case 'sticky_bomb':
      r.damageSingleEnemy = 15;
      r.needsTarget = true;
      break;
    case 'old_painkiller':
      r.damageReductionFlat = 5;
      break;

    // ── UNCOMMON ──
    case 'military_ration':
      r.heal = 25;
      break;
    case 'combat_stimulant':
      r.attackBonusTurn = 4;
      break;
    case 'overcharge_cell':
      r.ap = 2;
      break;
    case 'tactical_ammo_belt':
      r.ammo = 3;
      r.firstSpecialBonusTurn = 5;
      break;
    case 'composite_plate':
      r.shield = 12;
      r.resist = 12;
      break;
    case 'detox_kit':
      r.removeDebuffCount = 99; // 전부 해제
      r.exhaustStatusFromHand = 2;
      break;
    case 'chemical_bomb':
      r.vulnerableAllEnemies = 2;
      r.weakAllEnemies = 1;
      break;
    case 'emp_grenade':
      r.damageAllEnemies = 15;
      r.damageAllEnemiesType = 'SPECIAL';
      break;
    case 'field_repair_tool':
      if (ctx.isInCombat) {
        r.upgradeCardFromHand = true;
      } else {
        r.permanentUpgradeCard = true;
      }
      break;
    case 'blood_transfusion':
      r.heal = 15;
      r.regenPerTurn = 3;
      r.regenTurns = 3;
      break;

    // ── RARE ──
    case 'nano_repair_shot':
      r.heal = Math.ceil(ctx.playerMaxHp * 0.35);
      break;
    case 'berserker_serum':
      r.ap = 3;
      r.attackBonusTurn = 5;
      r.berserkerSelfDamage = 8;
      break;
    case 'quantum_purifier':
      r.purgeStatusCards = true;
      break;
    case 'tactical_warhead':
      r.damageAllEnemies = 30;
      r.damageAllEnemiesType = 'PHYSICAL';
      r.vulnerableAllEnemies = 2;
      break;
    case 'nano_field':
      r.damageReductionPercent = 50;
      r.damageReductionPercentTurns = 3;
      break;
    case 'time_distorter':
      r.extraTurn = true;
      break;
    case 'full_resupply':
      r.discardAndRedraw = true;
      r.fullApRestore = true;
      r.fullAmmoRestore = 5;
      break;
    case 'bio_enhancer':
      if (ctx.isInCombat) {
        r.tempMaxHpBonus = 15;
        r.heal = 15;
      } else {
        r.maxHpBonus = 8;
        r.heal = 8;
      }
      break;
  }

  return r;
}
