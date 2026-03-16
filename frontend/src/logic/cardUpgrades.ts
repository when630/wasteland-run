import type { Card, CardEffect } from '../types/gameTypes';

/**
 * 카드 업그레이드 데이터 테이블
 * baseId -> 업그레이드 시 변경되는 필드들의 부분 객체
 */
interface UpgradeEntry {
  name: string;
  effects?: CardEffect[];
  costAp?: number;
  description: string;
}

const UPGRADE_TABLE: Record<string, UpgradeEntry> = {
  // ═══ 기본 카드 ═══
  strike: {
    name: '타격+',
    effects: [{ type: 'DAMAGE', amount: 9 }],
    description: '물리 피해 9를 줍니다.',
  },
  defend: {
    name: '수비+',
    effects: [{ type: 'SHIELD', amount: 8 }],
    description: '물리 방어도 8을 얻습니다.',
  },
  protect: {
    name: '보호+',
    effects: [{ type: 'RESIST', amount: 8 }],
    description: '특수 방어도 8을 얻습니다.',
  },
  rusty_pistol: {
    name: '녹슨 권총+',
    effects: [{ type: 'DAMAGE', amount: 20 }],
    description: '특수 피해 20을 줍니다.',
  },
  scavenge: {
    name: '잔해 뒤지기+',
    costAp: 0,
    description: '탄약을 2개 얻습니다.',
  },

  // ═══ 물리 공격 ═══
  knee_crush: {
    name: '무릎 으깨기+',
    effects: [{ type: 'DAMAGE', amount: 6 }, { type: 'DEBUFF', condition: 'WEAK', amount: 2 }, { type: 'ADD_AMMO', amount: 1 }],
    description: '적에게 6 물리 피해. 약화 2턴 부여. 탄약 1 획득.',
  },
  subway_slam: {
    name: '지하철 강타+',
    effects: [{ type: 'DAMAGE', amount: 11 }, { type: 'ADD_AMMO', amount: 1 }],
    description: '적에게 11 물리 피해. 탄약 1 획득.',
  },
  ark_breach: {
    name: '방주 돌파+',
    effects: [{ type: 'DAMAGE', amount: 12 }, { type: 'DRAW', amount: 1 }],
    description: '적에게 12 물리 피해. 카드 1장 드로우.',
  },
  security_bypass: {
    name: '보안 우회+',
    effects: [{ type: 'DAMAGE', amount: 9 }, { type: 'DEBUFF', condition: 'WEAK', amount: 1 }, { type: 'ADD_AMMO', amount: 1 }],
    description: '적에게 9 물리 피해. 약화 1턴 부여. 탄약 1 획득.',
  },
  blind_spot_stab: {
    name: '사각지대 찌르기+',
    effects: [{ type: 'DAMAGE', amount: 8 }, { type: 'DRAW', amount: 1 }, { type: 'ADD_AMMO', amount: 1 }],
    description: '적에게 8 물리 피해. 카드 1장 드로우. 탄약 1 획득.',
  },
  sledgehammer_smash: {
    name: '대형 오함마 강타+',
    effects: [{ type: 'DAMAGE', amount: 18 }, { type: 'DEBUFF', condition: 'VULNERABLE', amount: 2 }],
    description: '적에게 18 물리 피해. 취약 2턴 부여.',
  },
  rail_spike: {
    name: '레일 스파이크+',
    effects: [{ type: 'DAMAGE', amount: 14 }, { type: 'DEBUFF', condition: 'WEAK', amount: 3 }],
    description: '적에게 14 물리 피해. 약화 3턴 부여.',
  },
  flurry: {
    name: '연타+',
    effects: [{ type: 'DAMAGE', amount: 4, condition: 'MULTI_HIT_2' }],
    description: '적에게 4 물리 피해를 2번 가함.',
  },
  crush: {
    name: '분쇄+',
    effects: [{ type: 'DAMAGE', amount: 14, condition: 'BONUS_IF_VULNERABLE_10' }],
    description: '적에게 14 물리 피해. 취약 시 추가 10 피해.',
  },
  iron_fist: {
    name: '강철 주먹+',
    effects: [{ type: 'DAMAGE', amount: 6 }],
    description: '적에게 6 물리 피해.',
  },
  chainsaw_grind: {
    name: '전기톱 갈아버리기+',
    effects: [{ type: 'DAMAGE', amount: 5, condition: 'MULTI_HIT_3' }, { type: 'ADD_AMMO', amount: 3 }],
    description: '적에게 5 물리 피해를 3번. 탄약 3 획득.',
  },
  storm_barrage: {
    name: '폭풍 난타+',
    effects: [{ type: 'DAMAGE', amount: 11, target: 'ALL_ENEMIES' }],
    description: '모든 적에게 11 물리 피해.',
  },
  berserker_strike: {
    name: '광전사의 일격+',
    effects: [{ type: 'DAMAGE', amount: 0, condition: 'PER_MISSING_HP_FULL' }],
    description: '적에게 잃은 HP만큼 물리 피해.',
  },
  rampage: {
    name: '폭주+',
    effects: [{ type: 'DAMAGE', amount: 12, condition: 'RAMPAGE_5' }],
    description: '적에게 12 물리 피해. 사용할 때마다 피해 +5.',
  },

  // ═══ 특수 공격 ═══
  rapid_fire: {
    name: '속사+',
    effects: [{ type: 'DAMAGE', amount: 7, condition: 'MULTI_HIT_2' }],
    description: '적에게 7 특수 피해를 2번 가함.',
  },
  shotgun_blast: {
    name: '산탄 사격+',
    effects: [{ type: 'DAMAGE', amount: 10, target: 'ALL_ENEMIES' }],
    description: '모든 적에게 10 특수 피해.',
  },
  piercing_round: {
    name: '관통탄+',
    effects: [{ type: 'DAMAGE', amount: 16 }],
    description: '적에게 16 특수 피해.',
  },
  aimed_shot: {
    name: '조준 사격+',
    effects: [{ type: 'DAMAGE', amount: 14 }, { type: 'ADD_AMMO', amount: 1 }],
    description: '적에게 14 특수 피해. 탄약 1 획득.',
  },
  anti_materiel_snipe: {
    name: '대물 저격 사격+',
    effects: [{ type: 'DAMAGE', amount: 24, condition: 'BONUS_IF_ATTACKING_14' }],
    description: '적에게 24 특수 피해. 의도 \'공격\' 시 추가 14 피해.',
  },
  toxic_gas_grenade: {
    name: '수제 독성 가스탄+',
    effects: [{ type: 'DAMAGE', amount: 6, target: 'ALL_ENEMIES' }, { type: 'DEBUFF', condition: 'POISON', amount: 5, target: 'ALL_ENEMIES' }],
    description: '모든 적에게 6 특수 피해. 맹독 5스택.',
  },
  tunnel_vision: {
    name: '터널 시야+',
    effects: [{ type: 'DAMAGE', amount: 18 }, { type: 'DRAW', amount: 2 }],
    description: '적에게 18 특수 피해. 카드 2장 드로우.',
  },
  plasma_cutter: {
    name: '플라즈마 절단기+',
    effects: [{ type: 'DAMAGE', amount: 20 }, { type: 'DEBUFF', condition: 'VULNERABLE', amount: 2 }],
    description: '적에게 20 특수 피해. 취약 2턴.',
  },
  seismic_charge: {
    name: '지진 폭탄+',
    effects: [{ type: 'DAMAGE', amount: 14, target: 'ALL_ENEMIES' }, { type: 'DEBUFF', condition: 'VULNERABLE', amount: 2, target: 'ALL_ENEMIES' }],
    description: '모든 적에게 14 특수 피해. 전체 취약 2턴. (소멸)',
  },
  emp_overload: {
    name: 'EMP 과부하+',
    effects: [{ type: 'DAMAGE', amount: 20, target: 'ALL_ENEMIES' }, { type: 'DEBUFF', condition: 'WEAK', amount: 2, target: 'ALL_ENEMIES' }],
    description: '모든 적에게 20 특수 피해. 전체 약화 2턴. (소멸)',
  },
  makeshift_napalm: {
    name: '급조된 네이팜+',
    effects: [{ type: 'DAMAGE', amount: 16, target: 'ALL_ENEMIES' }, { type: 'DEBUFF', condition: 'BURN', amount: 3, target: 'ALL_ENEMIES' }],
    description: '모든 적에게 16 특수 피해. 화상 3턴.',
  },
  overcharge_coilgun: {
    name: '과충전 코일건+',
    effects: [{ type: 'DAMAGE', amount: 11, condition: 'PER_AMMO_CONSUMED' }],
    description: '탄약 1당 11 특수 피해. (소멸)',
  },
  third_rail_shock: {
    name: '제3 레일 충격+',
    effects: [{ type: 'DAMAGE', amount: 26 }, { type: 'DEBUFF', condition: 'BURN', amount: 3 }],
    description: '적에게 26 특수 피해. 화상 3턴.',
  },
  arc_cannon: {
    name: '아크 캐논+',
    effects: [{ type: 'DAMAGE', amount: 32 }, { type: 'DEBUFF', condition: 'BURN', amount: 4 }],
    description: '적에게 32 특수 피해. 화상 4턴.',
  },

  // ═══ 물리 방어 ═══
  tactical_roll: {
    name: '전술적 구르기+',
    effects: [{ type: 'SHIELD', amount: 8 }, { type: 'BUFF', condition: 'NEXT_PHYSICAL_FREE' }],
    description: '8 물리 방어도. 다음 물리 공격 AP 0.',
  },
  torn_car_door: {
    name: '뜯어낸 차 문짝+',
    effects: [{ type: 'SHIELD', amount: 10 }, { type: 'BUFF', condition: 'RETAIN_2_CARD' }],
    description: '10 물리 방어도. 손패 2장 보존.',
  },
  emergency_brake: {
    name: '비상 브레이크+',
    effects: [{ type: 'SHIELD', amount: 9 }],
    description: '9 물리 방어도.',
  },
  spiked_barricade: {
    name: '가시 돋친 바리케이드+',
    effects: [{ type: 'SHIELD', amount: 16 }, { type: 'BUFF', condition: 'REFLECT_PHYSICAL_6' }],
    description: '16 물리 방어도. 피격 시 6 반사.',
  },
  last_stand: {
    name: '결사항전+',
    effects: [{ type: 'SHIELD', amount: 14 }],
    description: '14 물리 방어도. 물리 공격 사용 불가.',
  },
  containment_protocol: {
    name: '격리 프로토콜+',
    effects: [{ type: 'SHIELD', amount: 18 }, { type: 'BUFF', condition: 'REFLECT_PHYSICAL_6' }],
    description: '18 물리 방어도. 피격 시 6 반사.',
  },
  blast_door: {
    name: '방폭문 배리어+',
    effects: [{ type: 'SHIELD', amount: 12 }],
    description: '12 물리 방어도.',
  },
  shield_bash: {
    name: '방패로 밀치기+',
    effects: [{ type: 'SHIELD', amount: 9 }, { type: 'DAMAGE', amount: 0, condition: 'SHIELD_AS_DAMAGE' }],
    description: '9 물리 방어도. 물리 방어도만큼 물리 피해.',
  },
  iron_wall: {
    name: '철벽+',
    effects: [{ type: 'SHIELD', amount: 28 }],
    description: '28 물리 방어도. (소멸)',
  },
  counter_stance: {
    name: '반격 태세+',
    effects: [{ type: 'SHIELD', amount: 14 }, { type: 'BUFF', condition: 'REFLECT_PHYSICAL_12' }],
    description: '14 물리 방어도. 피격 시 12 반사.',
  },
  fortify: {
    name: '요새화+',
    effects: [{ type: 'BUFF', condition: 'POWER_FORTIFY_6' }],
    description: '[지속] 매 턴 물리 방어도 6 획득. (소멸)',
  },

  // ═══ 특수 방어 ═══
  first_aid: {
    name: '응급 처치+',
    effects: [{ type: 'RESIST', amount: 6 }, { type: 'HEAL', amount: 5, target: 'PLAYER' }],
    description: '6 특수 방어도. 체력 5 회복.',
  },
  contamination_block: {
    name: '오염 차단+',
    effects: [{ type: 'RESIST', amount: 10 }],
    description: '10 특수 방어도.',
  },
  debris_cover: {
    name: '잔해 은폐+',
    effects: [{ type: 'RESIST', amount: 9 }, { type: 'DRAW', amount: 1 }],
    description: '9 특수 방어도. 카드 1장 드로우.',
  },
  lead_coated_cloak: {
    name: '납 코팅 망토+',
    effects: [{ type: 'RESIST', amount: 20 }, { type: 'BUFF', condition: 'AP_ON_SPECIAL_DEFEND_1' }],
    description: '20 특수 방어도. 특수 방어 시 다음 턴 1 AP.',
  },
  emp_grenade: {
    name: '소형 EMP 투척+',
    effects: [{ type: 'RESIST', amount: 10 }, { type: 'DEBUFF', condition: 'WEAK', amount: 2, target: 'ALL_ENEMIES' }],
    description: '10 특수 방어도. 전체 약화 2턴.',
  },
  emergency_antidote: {
    name: '비상용 해독 주사+',
    costAp: 0,
    effects: [{ type: 'RESIST', amount: 5 }, { type: 'BUFF', condition: 'PURIFY_1', target: 'PLAYER' }],
    description: '5 특수 방어도. 디버프 1개 해제.',
  },
  gas_mask_filter: {
    name: '방독면 필터+',
    effects: [{ type: 'RESIST', amount: 12 }, { type: 'BUFF', condition: 'PURIFY_1', target: 'PLAYER' }],
    description: '12 특수 방어도. 디버프 1개 해제.',
  },
  rad_shield_gen: {
    name: '방사선 차폐 발생기+',
    effects: [{ type: 'RESIST', amount: 14 }],
    description: '14 특수 방어도.',
  },
  current_absorber: {
    name: '전류 흡수망+',
    effects: [{ type: 'RESIST', amount: 16 }, { type: 'BUFF', condition: 'AMMO_ON_SPECIAL_DEFEND_2' }],
    description: '16 특수 방어도. 특수 방어 시 탄약 2.',
  },
  energy_convert: {
    name: '에너지 전환+',
    effects: [{ type: 'RESIST', amount: 14 }, { type: 'BUFF', condition: 'AMMO_ON_SPECIAL_DEFEND_3' }],
    description: '14 특수 방어도. 특수 방어 시 탄약 3.',
  },
  full_purify: {
    name: '완전 정화+',
    effects: [{ type: 'RESIST', amount: 12 }, { type: 'BUFF', condition: 'PURIFY_ALL', target: 'PLAYER' }],
    description: '12 특수 방어도. 모든 디버프 해제. (소멸)',
  },

  // ═══ 변화 (UTILITY) ═══
  ammo_maintenance: {
    name: '탄약 정비+',
    effects: [{ type: 'ADD_AMMO', amount: 2 }],
    description: '탄약 2 획득.',
  },
  alertness: {
    name: '경계 태세+',
    effects: [{ type: 'DRAW', amount: 2 }],
    description: '카드 2장 드로우.',
  },
  emergency_repair: {
    name: '응급 수리+',
    effects: [{ type: 'HEAL', amount: 8, target: 'PLAYER' }],
    description: '체력 8 회복.',
  },
  loot_search: {
    name: '전리품 수색+',
    effects: [{ type: 'ADD_AMMO', amount: 3 }, { type: 'DRAW', amount: 1 }],
    description: '탄약 3 획득. 카드 1장 드로우.',
  },
  underground_supplies: {
    name: '지하 보급품+',
    effects: [{ type: 'ADD_AMMO', amount: 4 }, { type: 'HEAL', amount: 5, target: 'PLAYER' }],
    description: '탄약 4 획득. 체력 5 회복.',
  },
  survival_of_fittest: {
    name: '약육강식+',
    effects: [{ type: 'DEBUFF', condition: 'MARK_OF_FATE_6_3' }],
    description: '적 사망 시 체력 6 회복, 탄약 3 획득.',
  },
  nano_repair: {
    name: '나노 수복+',
    effects: [{ type: 'HEAL', amount: 8, target: 'PLAYER' }, { type: 'SHIELD', amount: 6 }, { type: 'RESIST', amount: 6 }],
    description: '체력 8 회복. 물리 방어도 6. 특수 방어도 6.',
  },
  blood_price: {
    name: '피의 대가+',
    effects: [{ type: 'HEAL', amount: -4, target: 'PLAYER' }, { type: 'DRAW', amount: 3 }],
    description: '체력 4 감소. 카드 3장 드로우.',
  },
  rage: {
    name: '분노+',
    effects: [{ type: 'BUFF', condition: 'POWER_RAGE_5' }],
    description: '[지속] 물리 피해 받을 때 방어도 5. (소멸)',
  },
  sacrifice: {
    name: '희생+',
    effects: [{ type: 'BUFF', condition: 'EXHAUST_FROM_HAND_FOR_AP_3' }],
    description: '카드 1장 소멸. 3 AP 획득.',
  },
  weapon_mod: {
    name: '무기 개조+',
    effects: [{ type: 'BUFF', condition: 'EXHAUST_FROM_HAND_FOR_DAMAGE_15' }],
    description: '카드 1장 소멸. 다음 공격 +15.',
  },
  battle_meditation: {
    name: '전투 명상+',
    effects: [{ type: 'DRAW', amount: 3 }],
    description: '카드 3장 드로우.',
  },
  plunder: {
    name: '약탈+',
    effects: [{ type: 'DEBUFF', condition: 'MARK_OF_PLUNDER_3_2' }],
    description: '적 사망 시 카드 3장 드로우, 탄약 2 획득.',
  },
  makeshift_armor: {
    name: '임시 장갑+',
    effects: [{ type: 'SHIELD', amount: 6 }, { type: 'RESIST', amount: 6 }],
    description: '물리 방어도 6. 특수 방어도 6.',
  },
  illegal_stimulant: {
    name: '불법 전투 자극제+',
    effects: [{ type: 'HEAL', amount: -3, target: 'PLAYER' }, { type: 'BUFF', condition: 'ADD_AP_3' }, { type: 'DRAW', amount: 3 }],
    description: '체력 3 감소. 3 AP. 카드 3장 드로우. (소멸)',
  },
  scrap_recycling: {
    name: '고철 재활용 공학+',
    costAp: 1,
    description: '[지속] 방어 카드 사용 시 50% 확률로 탄약 1. (소멸)',
  },
  duct_tape_engineering: {
    name: '청테이프 공학+',
    costAp: 1,
    description: '[지속] 물리 공격 시 물리 피해 영구 +2. (소멸)',
  },
  corporate_secrets: {
    name: '기업 기밀 문서+',
    effects: [{ type: 'DRAW', amount: 4 }, { type: 'ADD_AMMO', amount: 3 }],
    description: '카드 4장 드로우. 탄약 3 획득. (소멸)',
  },
  phoenix_ash: {
    name: '불사조의 재+',
    effects: [{ type: 'BUFF', condition: 'POWER_PHOENIX_7' }],
    description: '[지속] 소멸 시 방어도 7+7. (소멸)',
  },
  frenzy: {
    name: '광기+',
    effects: [{ type: 'BUFF', condition: 'POWER_FRENZY_8' }],
    description: '[지속] HP 50% 이하 시 공격 +8. (소멸)',
  },
};

/**
 * 카드에 업그레이드를 적용하여 새 카드 객체를 반환
 */
export function applyUpgrade(card: Card): Card {
  const entry = UPGRADE_TABLE[card.baseId];
  if (!entry) {
    // 테이블에 없는 카드는 isUpgraded만 표시
    return { ...card, isUpgraded: true };
  }

  const upgraded: Card = {
    ...card,
    isUpgraded: true,
    name: entry.name,
    description: entry.description,
  };

  if (entry.effects !== undefined) {
    upgraded.effects = entry.effects;
  }
  if (entry.costAp !== undefined) {
    upgraded.costAp = entry.costAp;
  }

  return upgraded;
}
