import type { Card } from '../../types/gameTypes';
import { CardType } from '../../types/gameTypes';
import { generateUniqueId } from '../../utils/rng';

/**
 * 기본 시작 캐릭터에게 지급될 공통 덱의 원형 객체 모음.
 * 이 객체들을 복사하여 덱(Draw Pile, Hand 등)에 추가합니다.
 */
export const STARTING_CARDS: Partial<Card>[] = [
  {
    baseId: 'old_pipe',
    name: '낡은 쇠파이프',
    type: CardType.PHYSICAL_ATTACK,
    costAp: 1,
    costAmmo: 0,
    description: '물리 피해 6을 줍니다.',
    effects: [{ type: 'DAMAGE', amount: 6 }],
  },
  {
    baseId: 'take_cover',
    name: '엄폐',
    type: CardType.PHYSICAL_DEFENSE,
    costAp: 1,
    costAmmo: 0,
    description: '물리 방어도 5를 얻습니다.',
    effects: [{ type: 'SHIELD', amount: 5 }],
  },
  {
    baseId: 'wet_cloth',
    name: '젖은 천 두르기',
    type: CardType.SPECIAL_DEFENSE,
    costAp: 1,
    costAmmo: 0,
    description: '특수 방어도 5를 얻습니다.',
    effects: [{ type: 'RESIST', amount: 5 }],
  },
];

/**
 * 10장짜리 기본덱 세트를 생성하는 헬퍼 함수
 * 물리 공격 x 4, 물리 방어 x 3, 특수 방어 x 1, 특수 공격/변화는 나중에 2추가 예정
 */
export const createStartingDeck = (): Card[] => {
  const deck: Card[] = [];

  // 물리 공격 4장
  for (let i = 0; i < 4; i++) {
    deck.push({ ...STARTING_CARDS[0], id: generateUniqueId() } as Card);
  }
  // 물리 방어 3장
  for (let i = 0; i < 3; i++) {
    deck.push({ ...STARTING_CARDS[1], id: generateUniqueId() } as Card);
  }
  // 특수 방어 1장 (시작 덱 용)
  deck.push({ ...STARTING_CARDS[2], id: generateUniqueId() } as Card);

  return deck;
};
