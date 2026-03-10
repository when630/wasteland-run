import type { Card } from '../../types/gameTypes';
import { CardType } from '../../types/gameTypes';
import { generateUniqueId } from '../../utils/rng';

/**
 * 기본 시작 캐릭터에게 지급될 공통 덱의 원형 객체 모음.
 * 이 객체들을 복사하여 덱(Draw Pile, Hand 등)에 추가합니다.
 */
export const ALL_CARDS: Partial<Card>[] = [
  // --- 공통/기본 카드 (STARTING_CARDS) ---
  {
    baseId: 'old_pipe',
    name: '낡은 쇠파이프',
    type: CardType.PHYSICAL_ATTACK,
    tier: 'BASIC',
    costAp: 1,
    costAmmo: 0,
    description: '물리 피해 6을 줍니다.',
    effects: [{ type: 'DAMAGE', amount: 6 }],
  },
  {
    baseId: 'take_cover',
    name: '엄폐',
    type: CardType.PHYSICAL_DEFENSE,
    tier: 'BASIC',
    costAp: 1,
    costAmmo: 0,
    description: '물리 방어도 5를 얻습니다.',
    effects: [{ type: 'SHIELD', amount: 5 }],
  },
  {
    baseId: 'wet_cloth',
    name: '젖은 천 두르기',
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
    description: '특수 피해 15를 줍니다.', // 관통 등 복잡한 설정 전에 우선 수치로 차별화 (원래 10, 기존 코드 15 유지)
    effects: [{ type: 'DAMAGE', amount: 15 }],
  },
  {
    baseId: 'scavenge',
    name: '잔해 뒤지기',
    type: CardType.UTILITY,
    tier: 'BASIC',
    costAp: 1,
    costAmmo: 0,
    description: '탄약을 2개 얻습니다.', // 원본 기획 1, 기존 코드 2 유지
    effects: [{ type: 'ADD_AMMO', amount: 2 }],
  },

  // --- 물리 공격 ---
  {
    baseId: 'chainsaw_grind',
    name: '전기톱 갈아버리기',
    type: CardType.PHYSICAL_ATTACK,
    tier: 'RARE',
    costAp: 2,
    costAmmo: 0,
    description: '적에게 4 물리 피해를 3번 연속 가함. 타격당 탄약 1 획득.',
    effects: [{ type: 'DAMAGE', amount: 4, condition: 'MULTI_HIT_3' }, { type: 'ADD_AMMO', amount: 3 }],
  },
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
    description: '적에게 14 물리 피해. 취약(받는 물리 피해 50% 증가) 1턴 부여.',
    effects: [{ type: 'DAMAGE', amount: 14 }, { type: 'DEBUFF', condition: 'VULNERABLE', amount: 1 }],
  },
  {
    baseId: 'knee_crush',
    name: '무릎 으깨기',
    type: CardType.PHYSICAL_ATTACK,
    tier: 'COMMON',
    costAp: 1,
    costAmmo: 0,
    description: '적에게 4 물리 피해. 약화(물리 피해 25% 감소) 1턴 부여. 타격 시 탄약 1 획득.',
    effects: [{ type: 'DAMAGE', amount: 4 }, { type: 'DEBUFF', condition: 'WEAK', amount: 1 }, { type: 'ADD_AMMO', amount: 1 }],
  },

  // --- 특수 공격 ---
  {
    baseId: 'makeshift_napalm',
    name: '급조된 네이팜',
    type: CardType.SPECIAL_ATTACK,
    tier: 'RARE',
    costAp: 1,
    costAmmo: 2,
    description: '모든 적에게 12 특수 피해, 2턴 화상(매 턴 3 피해) 부여.',
    effects: [{ type: 'DAMAGE', amount: 12, target: 'ALL_ENEMIES' }, { type: 'DEBUFF', condition: 'BURN', amount: 2, target: 'ALL_ENEMIES' }],
  },
  {
    baseId: 'anti_materiel_snipe',
    name: '대물 저격 사격',
    type: CardType.SPECIAL_ATTACK,
    tier: 'UNCOMMON',
    costAp: 2,
    costAmmo: 1,
    description: '적에게 18 특수 피해. 대상 다음 의도가 \'공격\'이면 추가 10 피해.',
    effects: [{ type: 'DAMAGE', amount: 18, condition: 'BONUS_IF_ATTACKING_10' }],
  },
  {
    baseId: 'overcharge_coilgun',
    name: '과충전 코일건',
    type: CardType.SPECIAL_ATTACK,
    tier: 'RARE',
    costAp: 1,
    costAmmo: 0, // X 코스트 (보유한 모든 탄약 소모 로직 필요)
    description: '소모한 탄약 1당 8 특수 피해. (모든 탄약 소모) (소멸)',
    effects: [{ type: 'DAMAGE', amount: 8, condition: 'PER_AMMO_CONSUMED' }],
    isExhaust: true,
  },
  {
    baseId: 'toxic_gas_grenade',
    name: '수제 독성 가스탄',
    type: CardType.SPECIAL_ATTACK,
    tier: 'UNCOMMON',
    costAp: 1,
    costAmmo: 1,
    description: '모든 적에게 4 특수 피해, 맹독(방어 무시 지속 피해) 3스택 부여.',
    effects: [{ type: 'DAMAGE', amount: 4, target: 'ALL_ENEMIES' }, { type: 'DEBUFF', condition: 'POISON', amount: 3, target: 'ALL_ENEMIES' }],
  },

  // --- 물리 방어 ---
  {
    baseId: 'spiked_barricade',
    name: '가시 돋친 바리케이드',
    type: CardType.PHYSICAL_DEFENSE,
    tier: 'UNCOMMON',
    costAp: 2,
    costAmmo: 0,
    description: '12 물리 방어도. 이번 턴 물리 피격 시 4 물리 피해 반사.',
    effects: [{ type: 'SHIELD', amount: 12 }, { type: 'BUFF', condition: 'REFLECT_PHYSICAL_4' }],
  },
  {
    baseId: 'tactical_roll',
    name: '전술적 구르기',
    type: CardType.PHYSICAL_DEFENSE,
    tier: 'COMMON',
    costAp: 1,
    costAmmo: 0,
    description: '5 물리 방어도. 다음에 사용하는 \'물리 공격\' 카드의 AP 소모가 0이 됨.',
    effects: [{ type: 'SHIELD', amount: 5 }, { type: 'BUFF', condition: 'NEXT_PHYSICAL_FREE' }],
  },
  {
    baseId: 'torn_car_door',
    name: '뜯어낸 차 문짝',
    type: CardType.PHYSICAL_DEFENSE,
    tier: 'COMMON',
    costAp: 1,
    costAmmo: 0,
    description: '7 물리 방어도. 턴 종료 시 손패 1장을 다음 턴으로 보존(Retain).',
    effects: [{ type: 'SHIELD', amount: 7 }, { type: 'BUFF', condition: 'RETAIN_1_CARD' }],
  },
  {
    baseId: 'last_stand',
    name: '결사항전',
    type: CardType.PHYSICAL_DEFENSE,
    tier: 'UNCOMMON',
    costAp: 0,
    costAmmo: 0,
    description: '9 물리 방어도. 이번 턴 더 이상 \'물리 공격\' 카드 사용 불가.',
    effects: [{ type: 'SHIELD', amount: 9 }, { type: 'DEBUFF', condition: 'CANNOT_PLAY_PHYSICAL_ATTACK', target: 'PLAYER' }],
  },

  // --- 특수 방어 ---
  {
    baseId: 'lead_coated_cloak',
    name: '납 코팅 망토',
    type: CardType.SPECIAL_DEFENSE,
    tier: 'UNCOMMON',
    costAp: 2,
    costAmmo: 0,
    description: '15 특수 방어도. 이번 턴 특수 공격 방어 시 다음 턴 1 AP 추가.',
    effects: [{ type: 'RESIST', amount: 15 }, { type: 'BUFF', condition: 'AP_ON_SPECIAL_DEFEND_1' }],
  },
  {
    baseId: 'emp_grenade',
    name: '소형 EMP 투척',
    type: CardType.SPECIAL_DEFENSE,
    tier: 'UNCOMMON',
    costAp: 1,
    costAmmo: 0,
    description: '7 특수 방어도. 모든 적에게 약화(물리 타격 감소) 1턴 부여.',
    effects: [{ type: 'RESIST', amount: 7 }, { type: 'DEBUFF', condition: 'WEAK', amount: 1, target: 'ALL_ENEMIES' }],
  },
  {
    baseId: 'emergency_antidote',
    name: '비상용 해독 주사',
    type: CardType.SPECIAL_DEFENSE,
    tier: 'UNCOMMON',
    costAp: 1,
    costAmmo: 0,
    description: '5 특수 방어도. 플레이어에게 걸린 무작위 디버프 1개 즉시 해제.',
    effects: [{ type: 'RESIST', amount: 5 }, { type: 'BUFF', condition: 'PURIFY_1', target: 'PLAYER' }],
  },
  {
    baseId: 'current_absorber',
    name: '전류 흡수망',
    type: CardType.SPECIAL_DEFENSE,
    tier: 'RARE',
    costAp: 2,
    costAmmo: 0,
    description: '12 특수 방어도. 적의 특수 공격을 방어할 때마다 탄약 1 획득.',
    effects: [{ type: 'RESIST', amount: 12 }, { type: 'BUFF', condition: 'AMMO_ON_SPECIAL_DEFEND_1' }],
  },

  // --- 변화 (UTILITY) ---
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
    description: '[지속] 이번 전투 중 방어 카드(물리/특수) 사용 시 50% 확률로 탄약 1 획득.',
    effects: [{ type: 'BUFF', condition: 'POWER_DEFENSE_AMMO_50' }],
    // powers can be exhausted automatically or not, usually powers are exhausted in Slay the Spire
    isExhaust: true,
  },
  {
    baseId: 'survival_of_fittest',
    name: '약육강식',
    type: CardType.UTILITY,
    tier: 'UNCOMMON',
    costAp: 1,
    costAmmo: 0,
    description: '적 1명 지정. 이번 턴 해당 적 사망 시 체력 4 회복, 탄약 2 획득.',
    effects: [{ type: 'DEBUFF', condition: 'MARK_OF_FATE_4_2' }],
  },
  {
    baseId: 'duct_tape_engineering',
    name: '청테이프 공학',
    type: CardType.UTILITY,
    tier: 'RARE',
    costAp: 2,
    costAmmo: 0,
    description: '[지속] \'물리 공격\' 카드 사용할 때마다 가하는 물리 피해 영구 2 증가.',
    effects: [{ type: 'BUFF', condition: 'POWER_PHYSICAL_SCALING_2' }],
    isExhaust: true,
  },
];

export const STARTING_CARDS: Partial<Card>[] = ALL_CARDS.filter(c => c.tier === 'BASIC');

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
    description: '[상태이상] 사용할 수 있지만 아무런 효과가 없고 손패와 덱을 막습니다. (생체공학 배양 심장)',
    effects: [],
  }
];

/**
 * 10장짜리 기본덱 세트를 생성하는 헬퍼 함수
 * 물리 공격 x 4, 물리 방어 x 3, 특수 방어 x 1, 특수 공격 x 1, 보조 x 1
 */
export const createStartingDeck = (): Card[] => {
  const deck: Card[] = [];

  const getCard = (baseId: string) => STARTING_CARDS.find(c => c.baseId === baseId) as Card;

  const oldPipe = getCard('old_pipe');
  const takeCover = getCard('take_cover');
  const wetCloth = getCard('wet_cloth');
  const rustyPistol = getCard('rusty_pistol');
  const scavenge = getCard('scavenge');

  // 물리 공격 4장
  for (let i = 0; i < 4; i++) {
    deck.push({ ...oldPipe, id: generateUniqueId() } as Card);
  }
  // 물리 방어 3장
  for (let i = 0; i < 3; i++) {
    deck.push({ ...takeCover, id: generateUniqueId() } as Card);
  }
  // 특수 방어 1장
  deck.push({ ...wetCloth, id: generateUniqueId() } as Card);

  // 특수 공격(녹슨 권총) 1장
  deck.push({ ...rustyPistol, id: generateUniqueId() } as Card);

  // 변화(잔해 뒤지기) 1장
  deck.push({ ...scavenge, id: generateUniqueId() } as Card);

  return deck;
};
