import type { Card } from '../../types/gameTypes';
import { CardType } from '../../types/gameTypes';
import { generateUniqueId } from '../../utils/rng';

/**
 * 전체 카드 풀 (75장). 챕터 구분 없이 등급(tier)으로만 관리.
 * 물리 공격 = 근접/육탄전, 특수 공격 = 총기/화기
 */
export const ALL_CARDS: Partial<Card>[] = [
  // ═══════════════════════════════════════
  // 기본 카드 (BASIC) — 5종
  // ═══════════════════════════════════════
  {
    baseId: 'strike',
    name: '타격',
    type: CardType.PHYSICAL_ATTACK,
    tier: 'BASIC',
    costAp: 1,
    costAmmo: 0,
    description: '물리 피해 6을 줍니다.',
    effects: [{ type: 'DAMAGE', amount: 6 }],
  },
  {
    baseId: 'defend',
    name: '수비',
    type: CardType.PHYSICAL_DEFENSE,
    tier: 'BASIC',
    costAp: 1,
    costAmmo: 0,
    description: '물리 방어도 5를 얻습니다.',
    effects: [{ type: 'SHIELD', amount: 5 }],
  },
  {
    baseId: 'protect',
    name: '보호',
    type: CardType.SPECIAL_DEFENSE,
    tier: 'BASIC',
    costAp: 1,
    costAmmo: 0,
    description: '특수 방어도 5를 얻습니다.',
    effects: [{ type: 'RESIST', amount: 5 }],
  },
  {
    baseId: 'rusty_pistol',
    name: '녹슨 권총',
    type: CardType.SPECIAL_ATTACK,
    tier: 'BASIC',
    costAp: 1,
    costAmmo: 1,
    description: '특수 피해 15를 줍니다.',
    effects: [{ type: 'DAMAGE', amount: 15 }],
  },
  {
    baseId: 'scavenge',
    name: '잔해 뒤지기',
    type: CardType.UTILITY,
    tier: 'BASIC',
    costAp: 1,
    costAmmo: 0,
    description: '탄약을 2개 얻습니다.',
    effects: [{ type: 'ADD_AMMO', amount: 2 }],
  },

  // ═══════════════════════════════════════
  // 물리 공격 (14종) — 근접/육탄전
  // ═══════════════════════════════════════

  // --- 일반 (4) ---
  {
    baseId: 'knee_crush',
    name: '무릎 으깨기',
    type: CardType.PHYSICAL_ATTACK,
    tier: 'COMMON',
    costAp: 1,
    costAmmo: 0,
    description: '적에게 4 물리 피해. 약화 1턴 부여. 탄약 1 획득.',
    effects: [{ type: 'DAMAGE', amount: 4 }, { type: 'DEBUFF', condition: 'WEAK', amount: 1 }, { type: 'ADD_AMMO', amount: 1 }],
  },
  {
    baseId: 'subway_slam',
    name: '지하철 강타',
    type: CardType.PHYSICAL_ATTACK,
    tier: 'COMMON',
    costAp: 1,
    costAmmo: 0,
    description: '적에게 8 물리 피해. 탄약 1 획득.',
    effects: [{ type: 'DAMAGE', amount: 8 }, { type: 'ADD_AMMO', amount: 1 }],
  },
  {
    baseId: 'ark_breach',
    name: '방주 돌파',
    type: CardType.PHYSICAL_ATTACK,
    tier: 'COMMON',
    costAp: 1,
    costAmmo: 0,
    description: '적에게 9 물리 피해. 카드 1장 드로우.',
    effects: [{ type: 'DAMAGE', amount: 9 }, { type: 'DRAW', amount: 1 }],
  },
  {
    baseId: 'security_bypass',
    name: '보안 우회',
    type: CardType.PHYSICAL_ATTACK,
    tier: 'COMMON',
    costAp: 1,
    costAmmo: 0,
    description: '적에게 6 물리 피해. 약화 1턴 부여. 탄약 1 획득.',
    effects: [{ type: 'DAMAGE', amount: 6 }, { type: 'DEBUFF', condition: 'WEAK', amount: 1 }, { type: 'ADD_AMMO', amount: 1 }],
  },

  // --- 특별 (6) ---
  {
    baseId: 'blind_spot_stab',
    name: '사각지대 찌르기',
    type: CardType.PHYSICAL_ATTACK,
    tier: 'UNCOMMON',
    costAp: 1,
    costAmmo: 0,
    description: '적에게 5 물리 피해. 카드 1장 드로우. 탄약 1 획득.',
    effects: [{ type: 'DAMAGE', amount: 5 }, { type: 'DRAW', amount: 1 }, { type: 'ADD_AMMO', amount: 1 }],
  },
  {
    baseId: 'sledgehammer_smash',
    name: '대형 오함마 강타',
    type: CardType.PHYSICAL_ATTACK,
    tier: 'UNCOMMON',
    costAp: 2,
    costAmmo: 0,
    description: '적에게 14 물리 피해. 취약 1턴 부여.',
    effects: [{ type: 'DAMAGE', amount: 14 }, { type: 'DEBUFF', condition: 'VULNERABLE', amount: 1 }],
  },
  {
    baseId: 'rail_spike',
    name: '레일 스파이크',
    type: CardType.PHYSICAL_ATTACK,
    tier: 'UNCOMMON',
    costAp: 2,
    costAmmo: 0,
    description: '적에게 11 물리 피해. 약화 2턴 부여.',
    effects: [{ type: 'DAMAGE', amount: 11 }, { type: 'DEBUFF', condition: 'WEAK', amount: 2 }],
  },
  {
    baseId: 'flurry',
    name: '연타',
    type: CardType.PHYSICAL_ATTACK,
    tier: 'UNCOMMON',
    costAp: 1,
    costAmmo: 0,
    description: '적에게 3 물리 피해를 2번 가함.',
    effects: [{ type: 'DAMAGE', amount: 3, condition: 'MULTI_HIT_2' }],
  },
  {
    baseId: 'crush',
    name: '분쇄',
    type: CardType.PHYSICAL_ATTACK,
    tier: 'UNCOMMON',
    costAp: 2,
    costAmmo: 0,
    description: '적에게 10 물리 피해. 대상이 취약 시 추가 8 피해.',
    effects: [{ type: 'DAMAGE', amount: 10, condition: 'BONUS_IF_VULNERABLE_8' }],
  },
  {
    baseId: 'iron_fist',
    name: '강철 주먹',
    type: CardType.PHYSICAL_ATTACK,
    tier: 'UNCOMMON',
    costAp: 0,
    costAmmo: 0,
    description: '적에게 4 물리 피해.',
    effects: [{ type: 'DAMAGE', amount: 4 }],
  },

  // --- 희귀 (4) ---
  {
    baseId: 'chainsaw_grind',
    name: '전기톱 갈아버리기',
    type: CardType.PHYSICAL_ATTACK,
    tier: 'RARE',
    costAp: 2,
    costAmmo: 0,
    description: '적에게 4 물리 피해를 3번 연속 가함. 탄약 3 획득.',
    effects: [{ type: 'DAMAGE', amount: 4, condition: 'MULTI_HIT_3' }, { type: 'ADD_AMMO', amount: 3 }],
  },
  {
    baseId: 'storm_barrage',
    name: '폭풍 난타',
    type: CardType.PHYSICAL_ATTACK,
    tier: 'RARE',
    costAp: 2,
    costAmmo: 0,
    description: '모든 적에게 8 물리 피해.',
    effects: [{ type: 'DAMAGE', amount: 8, target: 'ALL_ENEMIES' }],
  },
  {
    baseId: 'berserker_strike',
    name: '광전사의 일격',
    type: CardType.PHYSICAL_ATTACK,
    tier: 'RARE',
    costAp: 1,
    costAmmo: 0,
    description: '적에게 잃은 HP의 절반만큼 물리 피해.',
    effects: [{ type: 'DAMAGE', amount: 0, condition: 'PER_MISSING_HP_HALF' }],
  },
  {
    baseId: 'rampage',
    name: '폭주',
    type: CardType.PHYSICAL_ATTACK,
    tier: 'RARE',
    costAp: 1,
    costAmmo: 0,
    description: '적에게 8 물리 피해. 전투 중 사용할 때마다 피해 +4.',
    effects: [{ type: 'DAMAGE', amount: 8, condition: 'RAMPAGE_4' }],
  },

  // ═══════════════════════════════════════
  // 특수 공격 (14종) — 총기/화기
  // ═══════════════════════════════════════

  // --- 일반 (4) ---
  {
    baseId: 'rapid_fire',
    name: '속사',
    type: CardType.SPECIAL_ATTACK,
    tier: 'COMMON',
    costAp: 1,
    costAmmo: 1,
    description: '적에게 5 특수 피해를 2번 가함.',
    effects: [{ type: 'DAMAGE', amount: 5, condition: 'MULTI_HIT_2' }],
  },
  {
    baseId: 'shotgun_blast',
    name: '산탄 사격',
    type: CardType.SPECIAL_ATTACK,
    tier: 'COMMON',
    costAp: 1,
    costAmmo: 1,
    description: '모든 적에게 7 특수 피해.',
    effects: [{ type: 'DAMAGE', amount: 7, target: 'ALL_ENEMIES' }],
  },
  {
    baseId: 'piercing_round',
    name: '관통탄',
    type: CardType.SPECIAL_ATTACK,
    tier: 'COMMON',
    costAp: 1,
    costAmmo: 1,
    description: '적에게 12 특수 피해.',
    effects: [{ type: 'DAMAGE', amount: 12 }],
  },
  {
    baseId: 'aimed_shot',
    name: '조준 사격',
    type: CardType.SPECIAL_ATTACK,
    tier: 'COMMON',
    costAp: 1,
    costAmmo: 1,
    description: '적에게 10 특수 피해. 탄약 1 획득.',
    effects: [{ type: 'DAMAGE', amount: 10 }, { type: 'ADD_AMMO', amount: 1 }],
  },

  // --- 특별 (6) ---
  {
    baseId: 'anti_materiel_snipe',
    name: '대물 저격 사격',
    type: CardType.SPECIAL_ATTACK,
    tier: 'UNCOMMON',
    costAp: 2,
    costAmmo: 1,
    description: '적에게 18 특수 피해. 대상 의도가 \'공격\'이면 추가 10 피해.',
    effects: [{ type: 'DAMAGE', amount: 18, condition: 'BONUS_IF_ATTACKING_10' }],
  },
  {
    baseId: 'toxic_gas_grenade',
    name: '수제 독성 가스탄',
    type: CardType.SPECIAL_ATTACK,
    tier: 'UNCOMMON',
    costAp: 1,
    costAmmo: 1,
    description: '모든 적에게 4 특수 피해. 맹독 3스택 부여.',
    effects: [{ type: 'DAMAGE', amount: 4, target: 'ALL_ENEMIES' }, { type: 'DEBUFF', condition: 'POISON', amount: 3, target: 'ALL_ENEMIES' }],
  },
  {
    baseId: 'tunnel_vision',
    name: '터널 시야',
    type: CardType.SPECIAL_ATTACK,
    tier: 'UNCOMMON',
    costAp: 1,
    costAmmo: 1,
    description: '적에게 14 특수 피해. 카드 1장 드로우.',
    effects: [{ type: 'DAMAGE', amount: 14 }, { type: 'DRAW', amount: 1 }],
  },
  {
    baseId: 'plasma_cutter',
    name: '플라즈마 절단기',
    type: CardType.SPECIAL_ATTACK,
    tier: 'UNCOMMON',
    costAp: 1,
    costAmmo: 1,
    description: '적에게 16 특수 피해. 취약 1턴 부여.',
    effects: [{ type: 'DAMAGE', amount: 16 }, { type: 'DEBUFF', condition: 'VULNERABLE', amount: 1 }],
  },
  {
    baseId: 'seismic_charge',
    name: '지진 폭탄',
    type: CardType.SPECIAL_ATTACK,
    tier: 'UNCOMMON',
    costAp: 2,
    costAmmo: 1,
    description: '모든 적에게 10 특수 피해. 전체 취약 1턴. (소멸)',
    effects: [{ type: 'DAMAGE', amount: 10, target: 'ALL_ENEMIES' }, { type: 'DEBUFF', condition: 'VULNERABLE', amount: 1, target: 'ALL_ENEMIES' }],
    isExhaust: true,
  },
  {
    baseId: 'emp_overload',
    name: 'EMP 과부하',
    type: CardType.SPECIAL_ATTACK,
    tier: 'UNCOMMON',
    costAp: 2,
    costAmmo: 2,
    description: '모든 적에게 15 특수 피해. 전체 약화 1턴. (소멸)',
    effects: [{ type: 'DAMAGE', amount: 15, target: 'ALL_ENEMIES' }, { type: 'DEBUFF', condition: 'WEAK', amount: 1, target: 'ALL_ENEMIES' }],
    isExhaust: true,
  },

  // --- 희귀 (4) ---
  {
    baseId: 'makeshift_napalm',
    name: '급조된 네이팜',
    type: CardType.SPECIAL_ATTACK,
    tier: 'RARE',
    costAp: 1,
    costAmmo: 2,
    description: '모든 적에게 12 특수 피해. 화상 2턴 부여.',
    effects: [{ type: 'DAMAGE', amount: 12, target: 'ALL_ENEMIES' }, { type: 'DEBUFF', condition: 'BURN', amount: 2, target: 'ALL_ENEMIES' }],
  },
  {
    baseId: 'overcharge_coilgun',
    name: '과충전 코일건',
    type: CardType.SPECIAL_ATTACK,
    tier: 'RARE',
    costAp: 1,
    costAmmo: 0,
    description: '소모한 탄약 1당 8 특수 피해. (모든 탄약 소모) (소멸)',
    effects: [{ type: 'DAMAGE', amount: 8, condition: 'PER_AMMO_CONSUMED' }],
    isExhaust: true,
  },
  {
    baseId: 'third_rail_shock',
    name: '제3 레일 충격',
    type: CardType.SPECIAL_ATTACK,
    tier: 'RARE',
    costAp: 1,
    costAmmo: 2,
    description: '적에게 20 특수 피해. 화상 2턴 부여.',
    effects: [{ type: 'DAMAGE', amount: 20 }, { type: 'DEBUFF', condition: 'BURN', amount: 2 }],
  },
  {
    baseId: 'arc_cannon',
    name: '아크 캐논',
    type: CardType.SPECIAL_ATTACK,
    tier: 'RARE',
    costAp: 2,
    costAmmo: 1,
    description: '적에게 25 특수 피해. 화상 3턴 부여.',
    effects: [{ type: 'DAMAGE', amount: 25 }, { type: 'DEBUFF', condition: 'BURN', amount: 3 }],
  },

  // ═══════════════════════════════════════
  // 물리 방어 (11종) — 방패/회피/카운터
  // ═══════════════════════════════════════

  // --- 일반 (3) ---
  {
    baseId: 'tactical_roll',
    name: '전술적 구르기',
    type: CardType.PHYSICAL_DEFENSE,
    tier: 'COMMON',
    costAp: 1,
    costAmmo: 0,
    description: '5 물리 방어도. 다음 물리 공격 AP 소모 0.',
    effects: [{ type: 'SHIELD', amount: 5 }, { type: 'BUFF', condition: 'NEXT_PHYSICAL_FREE' }],
  },
  {
    baseId: 'torn_car_door',
    name: '뜯어낸 차 문짝',
    type: CardType.PHYSICAL_DEFENSE,
    tier: 'COMMON',
    costAp: 1,
    costAmmo: 0,
    description: '7 물리 방어도. 턴 종료 시 손패 1장 보존(Retain).',
    effects: [{ type: 'SHIELD', amount: 7 }, { type: 'BUFF', condition: 'RETAIN_1_CARD' }],
  },
  {
    baseId: 'emergency_brake',
    name: '비상 브레이크',
    type: CardType.PHYSICAL_DEFENSE,
    tier: 'COMMON',
    costAp: 1,
    costAmmo: 0,
    description: '6 물리 방어도.',
    effects: [{ type: 'SHIELD', amount: 6 }],
  },

  // --- 특별 (5) ---
  {
    baseId: 'spiked_barricade',
    name: '가시 돋친 바리케이드',
    type: CardType.PHYSICAL_DEFENSE,
    tier: 'UNCOMMON',
    costAp: 2,
    costAmmo: 0,
    description: '12 물리 방어도. 물리 피격 시 4 반사.',
    effects: [{ type: 'SHIELD', amount: 12 }, { type: 'BUFF', condition: 'REFLECT_PHYSICAL_4' }],
  },
  {
    baseId: 'last_stand',
    name: '결사항전',
    type: CardType.PHYSICAL_DEFENSE,
    tier: 'UNCOMMON',
    costAp: 0,
    costAmmo: 0,
    description: '9 물리 방어도. 이번 턴 물리 공격 사용 불가.',
    effects: [{ type: 'SHIELD', amount: 9 }, { type: 'DEBUFF', condition: 'CANNOT_PLAY_PHYSICAL_ATTACK', target: 'PLAYER' }],
  },
  {
    baseId: 'containment_protocol',
    name: '격리 프로토콜',
    type: CardType.PHYSICAL_DEFENSE,
    tier: 'UNCOMMON',
    costAp: 2,
    costAmmo: 0,
    description: '14 물리 방어도. 피격 시 4 반사.',
    effects: [{ type: 'SHIELD', amount: 14 }, { type: 'BUFF', condition: 'REFLECT_PHYSICAL_4' }],
  },
  {
    baseId: 'blast_door',
    name: '방폭문 배리어',
    type: CardType.PHYSICAL_DEFENSE,
    tier: 'UNCOMMON',
    costAp: 1,
    costAmmo: 0,
    description: '8 물리 방어도.',
    effects: [{ type: 'SHIELD', amount: 8 }],
  },
  {
    baseId: 'shield_bash',
    name: '방패로 밀치기',
    type: CardType.PHYSICAL_DEFENSE,
    tier: 'UNCOMMON',
    costAp: 1,
    costAmmo: 0,
    description: '6 물리 방어도. 현재 물리 방어도만큼 적에게 물리 피해.',
    effects: [{ type: 'SHIELD', amount: 6 }, { type: 'DAMAGE', amount: 0, condition: 'SHIELD_AS_DAMAGE' }],
  },

  // --- 희귀 (3) ---
  {
    baseId: 'iron_wall',
    name: '철벽',
    type: CardType.PHYSICAL_DEFENSE,
    tier: 'RARE',
    costAp: 2,
    costAmmo: 0,
    description: '20 물리 방어도. (소멸)',
    effects: [{ type: 'SHIELD', amount: 20 }],
    isExhaust: true,
  },
  {
    baseId: 'counter_stance',
    name: '반격 태세',
    type: CardType.PHYSICAL_DEFENSE,
    tier: 'RARE',
    costAp: 2,
    costAmmo: 0,
    description: '10 물리 방어도. 물리 피격 시 8 반사.',
    effects: [{ type: 'SHIELD', amount: 10 }, { type: 'BUFF', condition: 'REFLECT_PHYSICAL_8' }],
  },
  {
    baseId: 'fortify',
    name: '요새화',
    type: CardType.PHYSICAL_DEFENSE,
    tier: 'RARE',
    costAp: 2,
    costAmmo: 0,
    description: '[지속] 매 턴 시작 시 물리 방어도 4 획득. (소멸)',
    effects: [{ type: 'BUFF', condition: 'POWER_FORTIFY_4' }],
    isExhaust: true,
  },

  // ═══════════════════════════════════════
  // 특수 방어 (11종) — 저항/정화/흡수
  // ═══════════════════════════════════════

  // --- 일반 (3) ---
  {
    baseId: 'first_aid',
    name: '응급 처치',
    type: CardType.SPECIAL_DEFENSE,
    tier: 'COMMON',
    costAp: 1,
    costAmmo: 0,
    description: '4 특수 방어도. 체력 3 회복.',
    effects: [{ type: 'RESIST', amount: 4 }, { type: 'HEAL', amount: 3, target: 'PLAYER' }],
  },
  {
    baseId: 'contamination_block',
    name: '오염 차단',
    type: CardType.SPECIAL_DEFENSE,
    tier: 'COMMON',
    costAp: 1,
    costAmmo: 0,
    description: '7 특수 방어도.',
    effects: [{ type: 'RESIST', amount: 7 }],
  },
  {
    baseId: 'debris_cover',
    name: '잔해 은폐',
    type: CardType.SPECIAL_DEFENSE,
    tier: 'COMMON',
    costAp: 1,
    costAmmo: 0,
    description: '6 특수 방어도. 카드 1장 드로우.',
    effects: [{ type: 'RESIST', amount: 6 }, { type: 'DRAW', amount: 1 }],
  },

  // --- 특별 (5) ---
  {
    baseId: 'lead_coated_cloak',
    name: '납 코팅 망토',
    type: CardType.SPECIAL_DEFENSE,
    tier: 'UNCOMMON',
    costAp: 2,
    costAmmo: 0,
    description: '15 특수 방어도. 특수 방어 시 다음 턴 1 AP 추가.',
    effects: [{ type: 'RESIST', amount: 15 }, { type: 'BUFF', condition: 'AP_ON_SPECIAL_DEFEND_1' }],
  },
  {
    baseId: 'emp_grenade',
    name: '소형 EMP 투척',
    type: CardType.SPECIAL_DEFENSE,
    tier: 'UNCOMMON',
    costAp: 1,
    costAmmo: 0,
    description: '7 특수 방어도. 모든 적에게 약화 1턴.',
    effects: [{ type: 'RESIST', amount: 7 }, { type: 'DEBUFF', condition: 'WEAK', amount: 1, target: 'ALL_ENEMIES' }],
  },
  {
    baseId: 'emergency_antidote',
    name: '비상용 해독 주사',
    type: CardType.SPECIAL_DEFENSE,
    tier: 'UNCOMMON',
    costAp: 1,
    costAmmo: 0,
    description: '5 특수 방어도. 디버프 1개 해제.',
    effects: [{ type: 'RESIST', amount: 5 }, { type: 'BUFF', condition: 'PURIFY_1', target: 'PLAYER' }],
  },
  {
    baseId: 'gas_mask_filter',
    name: '방독면 필터',
    type: CardType.SPECIAL_DEFENSE,
    tier: 'UNCOMMON',
    costAp: 1,
    costAmmo: 0,
    description: '9 특수 방어도. 디버프 1개 해제.',
    effects: [{ type: 'RESIST', amount: 9 }, { type: 'BUFF', condition: 'PURIFY_1', target: 'PLAYER' }],
  },
  {
    baseId: 'rad_shield_gen',
    name: '방사선 차폐 발생기',
    type: CardType.SPECIAL_DEFENSE,
    tier: 'UNCOMMON',
    costAp: 1,
    costAmmo: 0,
    description: '10 특수 방어도.',
    effects: [{ type: 'RESIST', amount: 10 }],
  },

  // --- 희귀 (3) ---
  {
    baseId: 'current_absorber',
    name: '전류 흡수망',
    type: CardType.SPECIAL_DEFENSE,
    tier: 'RARE',
    costAp: 2,
    costAmmo: 0,
    description: '12 특수 방어도. 특수 방어 시 탄약 1 획득.',
    effects: [{ type: 'RESIST', amount: 12 }, { type: 'BUFF', condition: 'AMMO_ON_SPECIAL_DEFEND_1' }],
  },
  {
    baseId: 'energy_convert',
    name: '에너지 전환',
    type: CardType.SPECIAL_DEFENSE,
    tier: 'RARE',
    costAp: 2,
    costAmmo: 0,
    description: '10 특수 방어도. 특수 방어 시 탄약 2 획득.',
    effects: [{ type: 'RESIST', amount: 10 }, { type: 'BUFF', condition: 'AMMO_ON_SPECIAL_DEFEND_2' }],
  },
  {
    baseId: 'full_purify',
    name: '완전 정화',
    type: CardType.SPECIAL_DEFENSE,
    tier: 'RARE',
    costAp: 2,
    costAmmo: 0,
    description: '8 특수 방어도. 모든 디버프 해제. (소멸)',
    effects: [{ type: 'RESIST', amount: 8 }, { type: 'BUFF', condition: 'PURIFY_ALL', target: 'PLAYER' }],
    isExhaust: true,
  },

  // ═══════════════════════════════════════
  // 변화 / UTILITY (20종) — 보조/파워/자원
  // ═══════════════════════════════════════

  // --- 일반 (5) ---
  {
    baseId: 'ammo_maintenance',
    name: '탄약 정비',
    type: CardType.UTILITY,
    tier: 'COMMON',
    costAp: 0,
    costAmmo: 0,
    description: '탄약 1 획득.',
    effects: [{ type: 'ADD_AMMO', amount: 1 }],
  },
  {
    baseId: 'alertness',
    name: '경계 태세',
    type: CardType.UTILITY,
    tier: 'COMMON',
    costAp: 0,
    costAmmo: 0,
    description: '카드 1장 드로우.',
    effects: [{ type: 'DRAW', amount: 1 }],
  },
  {
    baseId: 'emergency_repair',
    name: '응급 수리',
    type: CardType.UTILITY,
    tier: 'COMMON',
    costAp: 1,
    costAmmo: 0,
    description: '체력 5 회복.',
    effects: [{ type: 'HEAL', amount: 5, target: 'PLAYER' }],
  },
  {
    baseId: 'loot_search',
    name: '전리품 수색',
    type: CardType.UTILITY,
    tier: 'COMMON',
    costAp: 1,
    costAmmo: 0,
    description: '탄약 2 획득. 카드 1장 드로우.',
    effects: [{ type: 'ADD_AMMO', amount: 2 }, { type: 'DRAW', amount: 1 }],
  },
  {
    baseId: 'underground_supplies',
    name: '지하 보급품',
    type: CardType.UTILITY,
    tier: 'COMMON',
    costAp: 1,
    costAmmo: 0,
    description: '탄약 3 획득. 체력 3 회복.',
    effects: [{ type: 'ADD_AMMO', amount: 3 }, { type: 'HEAL', amount: 3, target: 'PLAYER' }],
  },

  // --- 특별 (9) ---
  {
    baseId: 'survival_of_fittest',
    name: '약육강식',
    type: CardType.UTILITY,
    tier: 'UNCOMMON',
    costAp: 1,
    costAmmo: 0,
    description: '적 1명 지정. 이번 턴 사망 시 체력 4 회복, 탄약 2 획득.',
    effects: [{ type: 'DEBUFF', condition: 'MARK_OF_FATE_4_2' }],
  },
  {
    baseId: 'nano_repair',
    name: '나노 수복',
    type: CardType.UTILITY,
    tier: 'UNCOMMON',
    costAp: 1,
    costAmmo: 0,
    description: '체력 5 회복. 물리 방어도 4. 특수 방어도 4.',
    effects: [{ type: 'HEAL', amount: 5, target: 'PLAYER' }, { type: 'SHIELD', amount: 4 }, { type: 'RESIST', amount: 4 }],
  },
  {
    baseId: 'blood_price',
    name: '피의 대가',
    type: CardType.UTILITY,
    tier: 'UNCOMMON',
    costAp: 0,
    costAmmo: 0,
    description: '체력 4 감소. 카드 2장 드로우.',
    effects: [{ type: 'HEAL', amount: -4, target: 'PLAYER' }, { type: 'DRAW', amount: 2 }],
  },
  {
    baseId: 'rage',
    name: '분노',
    type: CardType.UTILITY,
    tier: 'UNCOMMON',
    costAp: 1,
    costAmmo: 0,
    description: '[지속] 물리 피해 받을 때마다 물리 방어도 3 획득. (소멸)',
    effects: [{ type: 'BUFF', condition: 'POWER_RAGE_3' }],
    isExhaust: true,
  },
  {
    baseId: 'sacrifice',
    name: '희생',
    type: CardType.UTILITY,
    tier: 'UNCOMMON',
    costAp: 0,
    costAmmo: 0,
    description: '손패에서 카드 1장 소멸. 2 AP 획득.',
    effects: [{ type: 'BUFF', condition: 'EXHAUST_FROM_HAND_FOR_AP_2' }],
  },
  {
    baseId: 'weapon_mod',
    name: '무기 개조',
    type: CardType.UTILITY,
    tier: 'UNCOMMON',
    costAp: 1,
    costAmmo: 0,
    description: '손패에서 카드 1장 소멸. 다음 공격 피해 +10.',
    effects: [{ type: 'BUFF', condition: 'EXHAUST_FROM_HAND_FOR_DAMAGE_10' }],
  },
  {
    baseId: 'battle_meditation',
    name: '전투 명상',
    type: CardType.UTILITY,
    tier: 'UNCOMMON',
    costAp: 1,
    costAmmo: 0,
    description: '카드 2장 드로우.',
    effects: [{ type: 'DRAW', amount: 2 }],
  },
  {
    baseId: 'plunder',
    name: '약탈',
    type: CardType.UTILITY,
    tier: 'UNCOMMON',
    costAp: 1,
    costAmmo: 0,
    description: '적 1명 지정. 이번 턴 사망 시 카드 2장 드로우, 탄약 1 획득.',
    effects: [{ type: 'DEBUFF', condition: 'MARK_OF_PLUNDER_2_1' }],
  },
  {
    baseId: 'makeshift_armor',
    name: '임시 장갑',
    type: CardType.UTILITY,
    tier: 'UNCOMMON',
    costAp: 1,
    costAmmo: 0,
    description: '물리 방어도 4. 특수 방어도 4.',
    effects: [{ type: 'SHIELD', amount: 4 }, { type: 'RESIST', amount: 4 }],
  },

  // --- 희귀 (6) ---
  {
    baseId: 'illegal_stimulant',
    name: '불법 전투 자극제',
    type: CardType.UTILITY,
    tier: 'RARE',
    costAp: 0,
    costAmmo: 0,
    description: '체력 3 감소. 2 AP 획득, 카드 2장 드로우. (소멸)',
    effects: [{ type: 'HEAL', amount: -3, target: 'PLAYER' }, { type: 'BUFF', condition: 'ADD_AP_2' }, { type: 'DRAW', amount: 2 }],
    isExhaust: true,
  },
  {
    baseId: 'scrap_recycling',
    name: '고철 재활용 공학',
    type: CardType.UTILITY,
    tier: 'RARE',
    costAp: 2,
    costAmmo: 0,
    description: '[지속] 방어 카드 사용 시 50% 확률로 탄약 1 획득. (소멸)',
    effects: [{ type: 'BUFF', condition: 'POWER_DEFENSE_AMMO_50' }],
    isExhaust: true,
  },
  {
    baseId: 'duct_tape_engineering',
    name: '청테이프 공학',
    type: CardType.UTILITY,
    tier: 'RARE',
    costAp: 2,
    costAmmo: 0,
    description: '[지속] 물리 공격 사용 시 물리 피해 영구 +2. (소멸)',
    effects: [{ type: 'BUFF', condition: 'POWER_PHYSICAL_SCALING_2' }],
    isExhaust: true,
  },
  {
    baseId: 'corporate_secrets',
    name: '기업 기밀 문서',
    type: CardType.UTILITY,
    tier: 'RARE',
    costAp: 0,
    costAmmo: 0,
    description: '카드 3장 드로우. 탄약 2 획득. (소멸)',
    effects: [{ type: 'DRAW', amount: 3 }, { type: 'ADD_AMMO', amount: 2 }],
    isExhaust: true,
  },
  {
    baseId: 'phoenix_ash',
    name: '불사조의 재',
    type: CardType.UTILITY,
    tier: 'RARE',
    costAp: 2,
    costAmmo: 0,
    description: '[지속] 카드 소멸 시 물리 방어도 5, 특수 방어도 5 획득. (소멸)',
    effects: [{ type: 'BUFF', condition: 'POWER_PHOENIX_5' }],
    isExhaust: true,
  },
  {
    baseId: 'frenzy',
    name: '광기',
    type: CardType.UTILITY,
    tier: 'RARE',
    costAp: 1,
    costAmmo: 0,
    description: '[지속] HP가 최대의 50% 이하일 때 모든 공격 피해 +5. (소멸)',
    effects: [{ type: 'BUFF', condition: 'POWER_FRENZY_5' }],
    isExhaust: true,
  },
];

export const STARTING_CARDS: Partial<Card>[] = ALL_CARDS.filter(c => c.tier === 'BASIC');

/**
 * 디버그용: 모든 카드를 1장씩 포함하는 테스트 덱
 */
export const createAllCardsDeck = (): Card[] => {
  return ALL_CARDS
    .filter(c => !c.type?.toString().startsWith('STATUS_'))
    .map(c => ({ ...c, id: generateUniqueId() } as Card));
};

export const STATUS_CARDS: Card[] = [
  {
    baseId: 'status_burn',
    id: 'status_burn_base',
    name: '화상',
    type: CardType.STATUS_BURN,
    tier: 'COMMON',
    costAp: 1,
    costAmmo: 0,
    description: '[상태이상] 사용할 수 있지만 아무런 효과가 없고 손패와 덱을 막습니다.',
    effects: [],
  },
  {
    baseId: 'status_radiation',
    id: 'status_radiation_base',
    name: '방사능 오염',
    type: CardType.STATUS_RADIATION,
    tier: 'COMMON',
    costAp: 1,
    costAmmo: 0,
    description: '[상태이상] 사용할 수 있지만 아무런 효과가 없고 손패와 덱을 막습니다.',
    effects: [],
  }
];

/**
 * 10장짜리 기본덱 생성
 * 타격×4, 수비×2, 보호×2, 녹슨 권총×1, 잔해 뒤지기×1
 */
export const createStartingDeck = (): Card[] => {
  const deck: Card[] = [];

  const getCard = (baseId: string) => STARTING_CARDS.find(c => c.baseId === baseId) as Card;

  const strike = getCard('strike');
  const defend = getCard('defend');
  const protect = getCard('protect');
  const rustyPistol = getCard('rusty_pistol');
  const scavenge = getCard('scavenge');

  // 타격 4장
  for (let i = 0; i < 4; i++) {
    deck.push({ ...strike, id: generateUniqueId() } as Card);
  }
  // 수비 2장
  for (let i = 0; i < 2; i++) {
    deck.push({ ...defend, id: generateUniqueId() } as Card);
  }
  // 보호 2장
  for (let i = 0; i < 2; i++) {
    deck.push({ ...protect, id: generateUniqueId() } as Card);
  }
  // 녹슨 권총 1장
  deck.push({ ...rustyPistol, id: generateUniqueId() } as Card);
  // 잔해 뒤지기 1장
  deck.push({ ...scavenge, id: generateUniqueId() } as Card);

  return deck;
};
