// 카드 baseId → VFX 프로필 매핑 테이블
// 프로필이 없는 카드는 기존 넉백+데미지넘버만 폴백

import type { VfxProfile } from './types';

const NO_SHAKE = { intensity: 0, axis: 'XY' as const, durationMs: 0, decayRate: 1 };

export const VFX_PROFILES: Record<string, VfxProfile> = {

  // ═══════════════════════════════════════════════════
  // 물리 공격 — Blade Slash (빠른 슬래시 아크)
  // ═══════════════════════════════════════════════════
  strike: {
    category: 'BLADE_SLASH',
    color: 0x99aabb,
    hitStopMs: 40,
    shakeProfile: { intensity: 6, axis: 'Y', durationMs: 180, decayRate: 0.88 },
    isAoe: false,
    multiHitCount: 1,
  },
  flurry: {
    category: 'BLADE_SLASH',
    color: 0xccccdd,
    hitStopMs: 25,
    shakeProfile: { intensity: 4, axis: 'XY', durationMs: 120, decayRate: 0.9 },
    isAoe: false,
    multiHitCount: 2,
  },
  iron_fist: {
    category: 'BLADE_SLASH',
    color: 0xaabbcc,
    hitStopMs: 30,
    shakeProfile: { intensity: 5, axis: 'Y', durationMs: 150, decayRate: 0.89 },
    isAoe: false,
    multiHitCount: 1,
  },

  // ═══════════════════════════════════════════════════
  // 물리 공격 — Heavy Kinetic (둔탁한 파편 + 강한 Y축 쉐이크)
  // ═══════════════════════════════════════════════════
  sledgehammer_smash: {
    category: 'HEAVY_KINETIC',
    color: 0x999988,
    hitStopMs: 100,
    shakeProfile: { intensity: 14, axis: 'Y', durationMs: 300, decayRate: 0.82 },
    isAoe: false,
    multiHitCount: 1,
  },
  subway_slam: {
    category: 'HEAVY_KINETIC',
    color: 0x8888aa,
    hitStopMs: 80,
    shakeProfile: { intensity: 12, axis: 'Y', durationMs: 280, decayRate: 0.83 },
    isAoe: false,
    multiHitCount: 1,
  },
  ark_breach: {
    category: 'HEAVY_KINETIC',
    color: 0xaaaacc,
    hitStopMs: 90,
    shakeProfile: { intensity: 13, axis: 'Y', durationMs: 300, decayRate: 0.82 },
    isAoe: false,
    multiHitCount: 1,
  },
  rail_spike: {
    category: 'HEAVY_KINETIC',
    color: 0x776655,
    hitStopMs: 70,
    shakeProfile: { intensity: 11, axis: 'Y', durationMs: 250, decayRate: 0.84 },
    isAoe: false,
    multiHitCount: 1,
  },
  knee_crush: {
    category: 'HEAVY_KINETIC',
    color: 0x997766,
    hitStopMs: 80,
    shakeProfile: { intensity: 10, axis: 'Y', durationMs: 250, decayRate: 0.85 },
    isAoe: false,
    multiHitCount: 1,
  },
  blind_spot_stab: {
    category: 'HEAVY_KINETIC',
    color: 0x666688,
    hitStopMs: 50,
    shakeProfile: { intensity: 8, axis: 'XY', durationMs: 200, decayRate: 0.88 },
    isAoe: false,
    multiHitCount: 1,
  },
  security_bypass: {
    category: 'HEAVY_KINETIC',
    color: 0x88aacc,
    hitStopMs: 60,
    shakeProfile: { intensity: 9, axis: 'XY', durationMs: 220, decayRate: 0.86 },
    isAoe: false,
    multiHitCount: 1,
  },

  // ═══════════════════════════════════════════════════
  // 물리 공격 — Ground Pound (지면 충격파 + 먼지)
  // ═══════════════════════════════════════════════════
  crush: {
    category: 'GROUND_POUND',
    color: 0xaa8866,
    hitStopMs: 80,
    shakeProfile: { intensity: 12, axis: 'Y', durationMs: 280, decayRate: 0.83 },
    isAoe: false,
    multiHitCount: 1,
  },
  storm_barrage: {
    category: 'GROUND_POUND',
    color: 0x998877,
    hitStopMs: 90,
    shakeProfile: { intensity: 14, axis: 'Y', durationMs: 320, decayRate: 0.82 },
    isAoe: true,
    multiHitCount: 1,
  },

  // ═══════════════════════════════════════════════════
  // 물리 공격 — Berserk (분노 폭발 + 붉은 플래시)
  // ═══════════════════════════════════════════════════
  berserker_strike: {
    category: 'BERSERK',
    color: 0xff3333,
    hitStopMs: 70,
    shakeProfile: { intensity: 12, axis: 'XY', durationMs: 280, decayRate: 0.83 },
    isAoe: false,
    multiHitCount: 1,
  },
  rampage: {
    category: 'BERSERK',
    color: 0xff6622,
    hitStopMs: 60,
    shakeProfile: { intensity: 10, axis: 'XY', durationMs: 250, decayRate: 0.85 },
    isAoe: false,
    multiHitCount: 1,
  },

  // ═══════════════════════════════════════════════════
  // 물리 공격 — High RPM Friction (부채꼴 스파크)
  // ═══════════════════════════════════════════════════
  chainsaw_grind: {
    category: 'HIGH_RPM_FRICTION',
    color: 0xff8800,
    hitStopMs: 30,
    shakeProfile: { intensity: 4, axis: 'XY', durationMs: 100, decayRate: 0.92 },
    isAoe: false,
    multiHitCount: 3,
  },

  // ═══════════════════════════════════════════════════
  // 특수 공격 — Electromagnetic (선 궤적 + X축 반동)
  // ═══════════════════════════════════════════════════
  rusty_pistol: {
    category: 'ELECTROMAGNETIC',
    color: 0xffff44,
    hitStopMs: 30,
    shakeProfile: { intensity: 6, axis: 'X', durationMs: 150, decayRate: 0.9 },
    isAoe: false,
    multiHitCount: 1,
  },
  rapid_fire: {
    category: 'ELECTROMAGNETIC',
    color: 0xffaa22,
    hitStopMs: 25,
    shakeProfile: { intensity: 5, axis: 'X', durationMs: 120, decayRate: 0.91 },
    isAoe: false,
    multiHitCount: 2,
  },
  piercing_round: {
    category: 'ELECTROMAGNETIC',
    color: 0xddcc44,
    hitStopMs: 40,
    shakeProfile: { intensity: 8, axis: 'X', durationMs: 180, decayRate: 0.87 },
    isAoe: false,
    multiHitCount: 1,
  },
  aimed_shot: {
    category: 'ELECTROMAGNETIC',
    color: 0xeedd33,
    hitStopMs: 35,
    shakeProfile: { intensity: 7, axis: 'X', durationMs: 170, decayRate: 0.88 },
    isAoe: false,
    multiHitCount: 1,
  },
  overcharge_coilgun: {
    category: 'ELECTROMAGNETIC',
    color: 0x66ddff,
    hitStopMs: 50,
    shakeProfile: { intensity: 10, axis: 'X', durationMs: 200, decayRate: 0.85 },
    isAoe: false,
    multiHitCount: 1,
  },
  anti_materiel_snipe: {
    category: 'ELECTROMAGNETIC',
    color: 0xff4444,
    hitStopMs: 80,
    shakeProfile: { intensity: 14, axis: 'X', durationMs: 250, decayRate: 0.82 },
    isAoe: false,
    multiHitCount: 1,
  },
  tunnel_vision: {
    category: 'ELECTROMAGNETIC',
    color: 0xffcc22,
    hitStopMs: 40,
    shakeProfile: { intensity: 7, axis: 'X', durationMs: 180, decayRate: 0.88 },
    isAoe: false,
    multiHitCount: 1,
  },
  third_rail_shock: {
    category: 'ELECTROMAGNETIC',
    color: 0x44eeff,
    hitStopMs: 40,
    shakeProfile: { intensity: 8, axis: 'X', durationMs: 200, decayRate: 0.87 },
    isAoe: false,
    multiHitCount: 1,
  },
  plasma_cutter: {
    category: 'ELECTROMAGNETIC',
    color: 0xff44ff,
    hitStopMs: 50,
    shakeProfile: { intensity: 9, axis: 'X', durationMs: 200, decayRate: 0.86 },
    isAoe: false,
    multiHitCount: 1,
  },
  arc_cannon: {
    category: 'ELECTROMAGNETIC',
    color: 0x88ccff,
    hitStopMs: 60,
    shakeProfile: { intensity: 11, axis: 'X', durationMs: 220, decayRate: 0.84 },
    isAoe: false,
    multiHitCount: 1,
  },

  // ═══════════════════════════════════════════════════
  // 특수 공격 — Scatter Shot (산탄 부채꼴 다중 궤적)
  // ═══════════════════════════════════════════════════
  shotgun_blast: {
    category: 'SCATTER_SHOT',
    color: 0xff8844,
    hitStopMs: 40,
    shakeProfile: { intensity: 8, axis: 'X', durationMs: 200, decayRate: 0.87 },
    isAoe: true,
    multiHitCount: 1,
  },

  // ═══════════════════════════════════════════════════
  // 특수 공격 — Thermal/Chemical AoE (팽창 충격파 + 아지랑이)
  // ═══════════════════════════════════════════════════
  makeshift_napalm: {
    category: 'THERMAL_AOE',
    color: 0xff3300,
    hitStopMs: 40,
    shakeProfile: { intensity: 8, axis: 'XY', durationMs: 300, decayRate: 0.88 },
    isAoe: true,
    multiHitCount: 1,
  },
  toxic_gas_grenade: {
    category: 'THERMAL_AOE',
    color: 0x44ff44,
    hitStopMs: 30,
    shakeProfile: { intensity: 6, axis: 'XY', durationMs: 250, decayRate: 0.9 },
    isAoe: true,
    multiHitCount: 1,
  },
  emp_overload: {
    category: 'THERMAL_AOE',
    color: 0x44ccff,
    hitStopMs: 50,
    shakeProfile: { intensity: 10, axis: 'XY', durationMs: 300, decayRate: 0.85 },
    isAoe: true,
    multiHitCount: 1,
  },
  seismic_charge: {
    category: 'THERMAL_AOE',
    color: 0xffaa22,
    hitStopMs: 60,
    shakeProfile: { intensity: 12, axis: 'Y', durationMs: 350, decayRate: 0.83 },
    isAoe: true,
    multiHitCount: 1,
  },

  // ═══════════════════════════════════════════════════
  // 물리 방어 — Shield Barrier (파란 육각 파편 배리어)
  // ═══════════════════════════════════════════════════
  defend: {
    category: 'SHIELD_BARRIER',
    color: 0x3388dd,
    hitStopMs: 0,
    shakeProfile: NO_SHAKE,
    isAoe: false,
    multiHitCount: 1,
  },
  tactical_roll: {
    category: 'SHIELD_BARRIER',
    color: 0x3377ee,
    hitStopMs: 0,
    shakeProfile: NO_SHAKE,
    isAoe: false,
    multiHitCount: 1,
  },
  torn_car_door: {
    category: 'SHIELD_BARRIER',
    color: 0x6699cc,
    hitStopMs: 0,
    shakeProfile: NO_SHAKE,
    isAoe: false,
    multiHitCount: 1,
  },
  emergency_brake: {
    category: 'SHIELD_BARRIER',
    color: 0x5588dd,
    hitStopMs: 0,
    shakeProfile: NO_SHAKE,
    isAoe: false,
    multiHitCount: 1,
  },
  spiked_barricade: {
    category: 'SHIELD_BARRIER',
    color: 0x5599ff,
    hitStopMs: 0,
    shakeProfile: NO_SHAKE,
    isAoe: false,
    multiHitCount: 1,
  },
  last_stand: {
    category: 'SHIELD_BARRIER',
    color: 0x4466ff,
    hitStopMs: 0,
    shakeProfile: NO_SHAKE,
    isAoe: false,
    multiHitCount: 1,
  },
  blast_door: {
    category: 'SHIELD_BARRIER',
    color: 0x7799ee,
    hitStopMs: 0,
    shakeProfile: NO_SHAKE,
    isAoe: false,
    multiHitCount: 1,
  },
  containment_protocol: {
    category: 'SHIELD_BARRIER',
    color: 0x4477dd,
    hitStopMs: 0,
    shakeProfile: NO_SHAKE,
    isAoe: false,
    multiHitCount: 1,
  },
  shield_bash: {
    category: 'SHIELD_BARRIER',
    color: 0x4488cc,
    hitStopMs: 0,
    shakeProfile: NO_SHAKE,
    isAoe: false,
    multiHitCount: 1,
  },
  makeshift_armor: {
    category: 'SHIELD_BARRIER',
    color: 0x5588cc,
    hitStopMs: 0,
    shakeProfile: NO_SHAKE,
    isAoe: false,
    multiHitCount: 1,
  },

  // ═══════════════════════════════════════════════════
  // 물리 방어 — Fortress (다층 배리어, 희귀 전용)
  // ═══════════════════════════════════════════════════
  iron_wall: {
    category: 'FORTRESS',
    color: 0x5599ee,
    hitStopMs: 0,
    shakeProfile: NO_SHAKE,
    isAoe: false,
    multiHitCount: 1,
  },
  counter_stance: {
    category: 'FORTRESS',
    color: 0x6688dd,
    hitStopMs: 0,
    shakeProfile: NO_SHAKE,
    isAoe: false,
    multiHitCount: 1,
  },

  // ═══════════════════════════════════════════════════
  // 특수 방어 — Resist Ward (보라/시안 에너지 워드)
  // ═══════════════════════════════════════════════════
  protect: {
    category: 'RESIST_WARD',
    color: 0x9966ee,
    hitStopMs: 0,
    shakeProfile: NO_SHAKE,
    isAoe: false,
    multiHitCount: 1,
  },
  contamination_block: {
    category: 'RESIST_WARD',
    color: 0x77aadd,
    hitStopMs: 0,
    shakeProfile: NO_SHAKE,
    isAoe: false,
    multiHitCount: 1,
  },
  debris_cover: {
    category: 'RESIST_WARD',
    color: 0x8899bb,
    hitStopMs: 0,
    shakeProfile: NO_SHAKE,
    isAoe: false,
    multiHitCount: 1,
  },
  lead_coated_cloak: {
    category: 'RESIST_WARD',
    color: 0x9955ee,
    hitStopMs: 0,
    shakeProfile: NO_SHAKE,
    isAoe: false,
    multiHitCount: 1,
  },
  emp_grenade: {
    category: 'RESIST_WARD',
    color: 0x55ccff,
    hitStopMs: 0,
    shakeProfile: NO_SHAKE,
    isAoe: false,
    multiHitCount: 1,
  },
  emergency_antidote: {
    category: 'RESIST_WARD',
    color: 0x66ffaa,
    hitStopMs: 0,
    shakeProfile: NO_SHAKE,
    isAoe: false,
    multiHitCount: 1,
  },
  current_absorber: {
    category: 'RESIST_WARD',
    color: 0x44ddff,
    hitStopMs: 0,
    shakeProfile: NO_SHAKE,
    isAoe: false,
    multiHitCount: 1,
  },
  gas_mask_filter: {
    category: 'RESIST_WARD',
    color: 0x88bb66,
    hitStopMs: 0,
    shakeProfile: NO_SHAKE,
    isAoe: false,
    multiHitCount: 1,
  },
  rad_shield_gen: {
    category: 'RESIST_WARD',
    color: 0xbb88ff,
    hitStopMs: 0,
    shakeProfile: NO_SHAKE,
    isAoe: false,
    multiHitCount: 1,
  },
  energy_convert: {
    category: 'RESIST_WARD',
    color: 0x55ddee,
    hitStopMs: 0,
    shakeProfile: NO_SHAKE,
    isAoe: false,
    multiHitCount: 1,
  },

  // ═══════════════════════════════════════════════════
  // 특수 방어 — Heal Pulse (초록 힐링 파티클)
  // ═══════════════════════════════════════════════════
  first_aid: {
    category: 'HEAL_PULSE',
    color: 0x44cc88,
    hitStopMs: 0,
    shakeProfile: NO_SHAKE,
    isAoe: false,
    multiHitCount: 1,
  },

  // ═══════════════════════════════════════════════════
  // 특수 방어 — Purify Burst (백색 정화 폭발)
  // ═══════════════════════════════════════════════════
  full_purify: {
    category: 'PURIFY_BURST',
    color: 0xeeffff,
    hitStopMs: 0,
    shakeProfile: NO_SHAKE,
    isAoe: false,
    multiHitCount: 1,
  },

  // ═══════════════════════════════════════════════════
  // 유틸리티 — Buff Aura (금빛 상승 스파클)
  // ═══════════════════════════════════════════════════
  scavenge: {
    category: 'BUFF_AURA',
    color: 0xffcc44,
    hitStopMs: 0,
    shakeProfile: NO_SHAKE,
    isAoe: false,
    multiHitCount: 1,
  },
  ammo_maintenance: {
    category: 'BUFF_AURA',
    color: 0xccaa33,
    hitStopMs: 0,
    shakeProfile: NO_SHAKE,
    isAoe: false,
    multiHitCount: 1,
  },
  alertness: {
    category: 'BUFF_AURA',
    color: 0xdddd66,
    hitStopMs: 0,
    shakeProfile: NO_SHAKE,
    isAoe: false,
    multiHitCount: 1,
  },
  loot_search: {
    category: 'BUFF_AURA',
    color: 0xddbb44,
    hitStopMs: 0,
    shakeProfile: NO_SHAKE,
    isAoe: false,
    multiHitCount: 1,
  },
  battle_meditation: {
    category: 'BUFF_AURA',
    color: 0xaabb88,
    hitStopMs: 0,
    shakeProfile: NO_SHAKE,
    isAoe: false,
    multiHitCount: 1,
  },
  plunder: {
    category: 'BUFF_AURA',
    color: 0xddaa33,
    hitStopMs: 0,
    shakeProfile: NO_SHAKE,
    isAoe: false,
    multiHitCount: 1,
  },
  survival_of_fittest: {
    category: 'BUFF_AURA',
    color: 0xff8844,
    hitStopMs: 0,
    shakeProfile: NO_SHAKE,
    isAoe: false,
    multiHitCount: 1,
  },
  underground_supplies: {
    category: 'BUFF_AURA',
    color: 0xddaa44,
    hitStopMs: 0,
    shakeProfile: NO_SHAKE,
    isAoe: false,
    multiHitCount: 1,
  },
  corporate_secrets: {
    category: 'BUFF_AURA',
    color: 0xffdd66,
    hitStopMs: 0,
    shakeProfile: NO_SHAKE,
    isAoe: false,
    multiHitCount: 1,
  },

  // ═══════════════════════════════════════════════════
  // 유틸리티 — Heal Pulse (힐링 이펙트)
  // ═══════════════════════════════════════════════════
  emergency_repair: {
    category: 'HEAL_PULSE',
    color: 0x44dd88,
    hitStopMs: 0,
    shakeProfile: NO_SHAKE,
    isAoe: false,
    multiHitCount: 1,
  },
  nano_repair: {
    category: 'HEAL_PULSE',
    color: 0x44ffcc,
    hitStopMs: 0,
    shakeProfile: NO_SHAKE,
    isAoe: false,
    multiHitCount: 1,
  },

  // ═══════════════════════════════════════════════════
  // 유틸리티 — Blood Sacrifice (자해 + 금빛 이득)
  // ═══════════════════════════════════════════════════
  blood_price: {
    category: 'BLOOD_SACRIFICE',
    color: 0xff2222,
    hitStopMs: 0,
    shakeProfile: NO_SHAKE,
    isAoe: false,
    multiHitCount: 1,
  },
  sacrifice: {
    category: 'BLOOD_SACRIFICE',
    color: 0xcc3333,
    hitStopMs: 0,
    shakeProfile: NO_SHAKE,
    isAoe: false,
    multiHitCount: 1,
  },
  weapon_mod: {
    category: 'BLOOD_SACRIFICE',
    color: 0xdd4422,
    hitStopMs: 0,
    shakeProfile: NO_SHAKE,
    isAoe: false,
    multiHitCount: 1,
  },
  illegal_stimulant: {
    category: 'BLOOD_SACRIFICE',
    color: 0xff4433,
    hitStopMs: 0,
    shakeProfile: NO_SHAKE,
    isAoe: false,
    multiHitCount: 1,
  },

  // ═══════════════════════════════════════════════════
  // 유틸리티 — Power Surge (파워업 나선 오라)
  // ═══════════════════════════════════════════════════
  rage: {
    category: 'POWER_SURGE',
    color: 0xff4444,
    hitStopMs: 0,
    shakeProfile: NO_SHAKE,
    isAoe: false,
    multiHitCount: 1,
  },
  fortify: {
    category: 'POWER_SURGE',
    color: 0x4488ff,
    hitStopMs: 0,
    shakeProfile: NO_SHAKE,
    isAoe: false,
    multiHitCount: 1,
  },
  frenzy: {
    category: 'POWER_SURGE',
    color: 0xff3344,
    hitStopMs: 0,
    shakeProfile: NO_SHAKE,
    isAoe: false,
    multiHitCount: 1,
  },
  phoenix_ash: {
    category: 'POWER_SURGE',
    color: 0xff6644,
    hitStopMs: 0,
    shakeProfile: NO_SHAKE,
    isAoe: false,
    multiHitCount: 1,
  },
  duct_tape_engineering: {
    category: 'POWER_SURGE',
    color: 0x88ccaa,
    hitStopMs: 0,
    shakeProfile: NO_SHAKE,
    isAoe: false,
    multiHitCount: 1,
  },
  scrap_recycling: {
    category: 'POWER_SURGE',
    color: 0xaacc44,
    hitStopMs: 0,
    shakeProfile: NO_SHAKE,
    isAoe: false,
    multiHitCount: 1,
  },
};

// === 적 공격 VFX 프로필 (카드 baseId가 아닌 공격 유형별) ===
export const ENEMY_VFX: Record<string, VfxProfile> = {
  // 물리 근접 공격 — 임팩트 슬래시 + Y축 쉐이크
  MELEE: {
    category: 'ENEMY_MELEE',
    color: 0xff4444,
    hitStopMs: 40,
    shakeProfile: { intensity: 8, axis: 'Y', durationMs: 200, decayRate: 0.87 },
    isAoe: false,
    multiHitCount: 1,
  },
  // 특수/원거리 공격 — 에너지 탄환 궤적 + X축 쉐이크
  RANGED: {
    category: 'ENEMY_RANGED',
    color: 0xaa44ff,
    hitStopMs: 30,
    shakeProfile: { intensity: 6, axis: 'X', durationMs: 150, decayRate: 0.9 },
    isAoe: false,
    multiHitCount: 1,
  },
  // 적 버프 — 아군 강화 오라
  BUFF: {
    category: 'ENEMY_BUFF',
    color: 0x4488ff,
    hitStopMs: 0,
    shakeProfile: NO_SHAKE,
    isAoe: false,
    multiHitCount: 1,
  },
  // 화상 틱 — 주황/빨강 불꽃 파티클
  BURN_TICK: {
    category: 'STATUS_BURN',
    color: 0xff6600,
    hitStopMs: 0,
    shakeProfile: { intensity: 3, axis: 'Y', durationMs: 120, decayRate: 0.92 },
    isAoe: false,
    multiHitCount: 1,
  },
  // 맹독 틱 — 녹색 독 거품 파티클
  POISON_TICK: {
    category: 'STATUS_POISON',
    color: 0x22ff44,
    hitStopMs: 0,
    shakeProfile: { intensity: 2, axis: 'XY', durationMs: 100, decayRate: 0.94 },
    isAoe: false,
    multiHitCount: 1,
  },
  // 적 사망 — 파편 파괴 이펙트
  DEATH: {
    category: 'ENEMY_DEATH',
    color: 0xffffff,
    hitStopMs: 60,
    shakeProfile: { intensity: 6, axis: 'XY', durationMs: 200, decayRate: 0.88 },
    isAoe: false,
    multiHitCount: 1,
  },
  // 반사 데미지 — 가시 반사 이펙트
  REFLECT: {
    category: 'REFLECT',
    color: 0xff8844,
    hitStopMs: 20,
    shakeProfile: { intensity: 4, axis: 'X', durationMs: 150, decayRate: 0.9 },
    isAoe: false,
    multiHitCount: 1,
  },
};
