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
  // --- 공통/기본 카드 ---
  old_pipe: {
    name: '낡은 쇠파이프+',
    effects: [{ type: 'DAMAGE', amount: 9 }],
    description: '물리 피해 9를 줍니다.',
  },
  take_cover: {
    name: '엄폐+',
    effects: [{ type: 'SHIELD', amount: 8 }],
    description: '물리 방어도 8을 얻습니다.',
  },
  wet_cloth: {
    name: '젖은 천 두르기+',
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

  // --- 물리 공격 ---
  chainsaw_grind: {
    name: '전기톱 갈아버리기+',
    effects: [{ type: 'DAMAGE', amount: 5, condition: 'MULTI_HIT_3' }, { type: 'ADD_AMMO', amount: 3 }],
    description: '적에게 5 물리 피해를 3번 연속 가함. 타격당 탄약 1 획득.',
  },
  blind_spot_stab: {
    name: '사각지대 찌르기+',
    effects: [{ type: 'DAMAGE', amount: 8 }, { type: 'DRAW', amount: 1 }, { type: 'ADD_AMMO', amount: 1 }],
    description: '적에게 8 물리 피해. 카드 1장 드로우. 탄약 1 획득.',
  },
  sledgehammer_smash: {
    name: '대형 오함마 강타+',
    effects: [{ type: 'DAMAGE', amount: 18 }, { type: 'DEBUFF', condition: 'VULNERABLE', amount: 2 }],
    description: '적에게 18 물리 피해. 취약(받는 물리 피해 50% 증가) 2턴 부여.',
  },
  knee_crush: {
    name: '무릎 으깨기+',
    effects: [{ type: 'DAMAGE', amount: 6 }, { type: 'DEBUFF', condition: 'WEAK', amount: 2 }, { type: 'ADD_AMMO', amount: 1 }],
    description: '적에게 6 물리 피해. 약화(물리 피해 25% 감소) 2턴 부여. 타격 시 탄약 1 획득.',
  },

  // --- 특수 공격 ---
  makeshift_napalm: {
    name: '급조된 네이팜+',
    effects: [{ type: 'DAMAGE', amount: 16, target: 'ALL_ENEMIES' }, { type: 'DEBUFF', condition: 'BURN', amount: 3, target: 'ALL_ENEMIES' }],
    description: '모든 적에게 16 특수 피해, 3턴 화상(매 턴 3 피해) 부여.',
  },
  anti_materiel_snipe: {
    name: '대물 저격 사격+',
    effects: [{ type: 'DAMAGE', amount: 24, condition: 'BONUS_IF_ATTACKING_14' }],
    description: '적에게 24 특수 피해. 대상 다음 의도가 \'공격\'이면 추가 14 피해.',
  },
  overcharge_coilgun: {
    name: '과충전 코일건+',
    effects: [{ type: 'DAMAGE', amount: 11, condition: 'PER_AMMO_CONSUMED' }],
    description: '소모한 탄약 1당 11 특수 피해. (모든 탄약 소모) (소멸)',
  },
  toxic_gas_grenade: {
    name: '수제 독성 가스탄+',
    effects: [{ type: 'DAMAGE', amount: 6, target: 'ALL_ENEMIES' }, { type: 'DEBUFF', condition: 'POISON', amount: 5, target: 'ALL_ENEMIES' }],
    description: '모든 적에게 6 특수 피해, 맹독(방어 무시 지속 피해) 5스택 부여.',
  },

  // --- 물리 방어 ---
  spiked_barricade: {
    name: '가시 돋친 바리케이드+',
    effects: [{ type: 'SHIELD', amount: 16 }, { type: 'BUFF', condition: 'REFLECT_PHYSICAL_6' }],
    description: '16 물리 방어도. 이번 턴 물리 피격 시 6 물리 피해 반사.',
  },
  tactical_roll: {
    name: '전술적 구르기+',
    effects: [{ type: 'SHIELD', amount: 8 }, { type: 'BUFF', condition: 'NEXT_PHYSICAL_FREE' }],
    description: '8 물리 방어도. 다음에 사용하는 \'물리 공격\' 카드의 AP 소모가 0이 됨.',
  },
  torn_car_door: {
    name: '뜯어낸 차 문짝+',
    effects: [{ type: 'SHIELD', amount: 10 }, { type: 'BUFF', condition: 'RETAIN_2_CARD' }],
    description: '10 물리 방어도. 턴 종료 시 손패 2장을 다음 턴으로 보존(Retain).',
  },
  last_stand: {
    name: '결사항전+',
    effects: [{ type: 'SHIELD', amount: 14 }],
    description: '14 물리 방어도. 이번 턴 더 이상 \'물리 공격\' 카드 사용 불가.',
  },

  // --- 특수 방어 ---
  lead_coated_cloak: {
    name: '납 코팅 망토+',
    effects: [{ type: 'RESIST', amount: 20 }, { type: 'BUFF', condition: 'AP_ON_SPECIAL_DEFEND_1' }],
    description: '20 특수 방어도. 이번 턴 특수 공격 방어 시 다음 턴 1 AP 추가.',
  },
  emp_grenade: {
    name: '소형 EMP 투척+',
    effects: [{ type: 'RESIST', amount: 10 }, { type: 'DEBUFF', condition: 'WEAK', amount: 2, target: 'ALL_ENEMIES' }],
    description: '10 특수 방어도. 모든 적에게 약화(물리 타격 감소) 2턴 부여.',
  },
  emergency_antidote: {
    name: '비상용 해독 주사+',
    costAp: 0,
    effects: [{ type: 'RESIST', amount: 5 }, { type: 'BUFF', condition: 'PURIFY_1', target: 'PLAYER' }],
    description: '5 특수 방어도. 플레이어에게 걸린 무작위 디버프 1개 즉시 해제.',
  },
  current_absorber: {
    name: '전류 흡수망+',
    effects: [{ type: 'RESIST', amount: 16 }, { type: 'BUFF', condition: 'AMMO_ON_SPECIAL_DEFEND_2' }],
    description: '16 특수 방어도. 적의 특수 공격을 방어할 때마다 탄약 2 획득.',
  },

  // --- 변화 (UTILITY) ---
  illegal_stimulant: {
    name: '불법 전투 자극제+',
    effects: [{ type: 'HEAL', amount: -3, target: 'PLAYER' }, { type: 'BUFF', condition: 'ADD_AP_3' }, { type: 'DRAW', amount: 3 }],
    description: '체력 3 감소. 3 AP 획득, 카드 3장 드로우. (소멸)',
  },
  scrap_recycling: {
    name: '고철 재활용 공학+',
    costAp: 1,
    description: '[지속] 이번 전투 중 방어 카드(물리/특수) 사용 시 50% 확률로 탄약 1 획득.',
  },
  survival_of_fittest: {
    name: '약육강식+',
    effects: [{ type: 'DEBUFF', condition: 'MARK_OF_FATE_6_3' }],
    description: '적 1명 지정. 이번 턴 해당 적 사망 시 체력 6 회복, 탄약 3 획득.',
  },
  duct_tape_engineering: {
    name: '청테이프 공학+',
    costAp: 1,
    description: '[지속] \'물리 공격\' 카드 사용할 때마다 가하는 물리 피해 영구 2 증가.',
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
