import { create } from 'zustand';
import type { Card } from '../types/gameTypes';
import { customShuffle } from '../utils/rng';
import { useAudioStore } from './useAudioStore';

export type PileType = 'NONE' | 'DECK' | 'DRAW' | 'DISCARD' | 'EXHAUST';

interface DeckState {
  masterDeck: Card[]; // 🌟 플레이어가 런 시작부터 끝까지 보유하는 '진짜 덱' 원본 데이터
  drawPile: Card[];
  hand: Card[];
  discardPile: Card[];
  exhaustPile: Card[];
  viewingPile: PileType; // 현재 열려있는 덱 뷰어의 종류

  // Actions
  setMasterDeck: (deckArray: Card[]) => void;
  addCardToMasterDeck: (card: Omit<Card, 'id'>) => void;
  upgradeCard: (cardId: string) => void; // 🌟 덱 압축/강화를 위한 액션
  initDeck: () => void;
  drawCards: (count: number) => void;
  playCardFromHand: (cardId: string) => void;
  discardHand: () => void;
  setViewingPile: (pile: PileType) => void;
  addCardToDiscardPile: (cardBlueprint: Omit<Card, 'id'>) => void; // 🌟 몹의 패턴 등에 의해 강제로 카드를 욱여넣을 때 사용
}

export const useDeckStore = create<DeckState>((set) => ({
  masterDeck: [],
  drawPile: [],
  hand: [],
  discardPile: [],
  exhaustPile: [], // 이번 전투 중 영구히 사용 불가능한 상태
  viewingPile: 'NONE',

  setMasterDeck: (deckArray: Card[]) => set({ masterDeck: deckArray }),

  // 전리품 등에서 새 카드를 획득했을 때 (고유 ID 생성하여 푸시)
  addCardToMasterDeck: (cardBlueprint: Omit<Card, 'id'>) => set((state) => {
    const newCard: Card = {
      ...cardBlueprint,
      id: `${cardBlueprint.type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };
    return { masterDeck: [...state.masterDeck, newCard] };
  }),

  // 카드 영구 강화 액션
  upgradeCard: (cardId: string) => set((state) => {
    const newMasterDeck = state.masterDeck.map(card => {
      if (card.id !== cardId) return card;

      const upgradedCard = { ...card, isUpgraded: true };

      // baseId 기획에 맞춘 개별 수치 보정 적용
      switch (card.baseId) {
        // --- 공통/기본 카드 ---
        case 'old_pipe':
          upgradedCard.name = '낡은 쇠파이프+';
          upgradedCard.effects = [{ type: 'DAMAGE', amount: 9 }];
          upgradedCard.description = '물리 피해 9를 줍니다.';
          break;
        case 'take_cover':
          upgradedCard.name = '엄폐+';
          upgradedCard.effects = [{ type: 'SHIELD', amount: 8 }];
          upgradedCard.description = '물리 방어도 8을 얻습니다.';
          break;
        case 'wet_cloth':
          upgradedCard.name = '젖은 천 두르기+';
          upgradedCard.effects = [{ type: 'RESIST', amount: 8 }];
          upgradedCard.description = '특수 방어도 8을 얻습니다.';
          break;
        case 'rusty_pistol':
          upgradedCard.name = '녹슨 권총+';
          upgradedCard.effects = [{ type: 'DAMAGE', amount: 20 }];
          upgradedCard.description = '특수 피해 20을 줍니다.';
          break;
        case 'scavenge':
          upgradedCard.name = '잔해 뒤지기+';
          upgradedCard.costAp = 0; // 강화 시 0코스트로 변환되어 덱 사이클 가속
          upgradedCard.description = '탄약을 2개 얻습니다.';
          break;

        // --- 물리 공격 ---
        case 'chainsaw_grind':
          upgradedCard.name = '전기톱 갈아버리기+';
          upgradedCard.effects = [{ type: 'DAMAGE', amount: 5, condition: 'MULTI_HIT_3' }, { type: 'ADD_AMMO', amount: 3 }];
          upgradedCard.description = '적에게 5 물리 피해를 3번 연속 가함. 타격당 탄약 1 획득.';
          break;
        case 'blind_spot_stab':
          upgradedCard.name = '사각지대 찌르기+';
          upgradedCard.effects = [{ type: 'DAMAGE', amount: 8 }, { type: 'DRAW', amount: 1 }, { type: 'ADD_AMMO', amount: 1 }];
          upgradedCard.description = '적에게 8 물리 피해. 카드 1장 드로우. 탄약 1 획득.';
          break;
        case 'sledgehammer_smash':
          upgradedCard.name = '대형 오함마 강타+';
          upgradedCard.effects = [{ type: 'DAMAGE', amount: 18 }, { type: 'DEBUFF', condition: 'VULNERABLE', amount: 2 }];
          upgradedCard.description = '적에게 18 물리 피해. 취약(받는 물리 피해 50% 증가) 2턴 부여.';
          break;
        case 'knee_crush':
          upgradedCard.name = '무릎 으깨기+';
          upgradedCard.effects = [{ type: 'DAMAGE', amount: 6 }, { type: 'DEBUFF', condition: 'WEAK', amount: 2 }, { type: 'ADD_AMMO', amount: 1 }];
          upgradedCard.description = '적에게 6 물리 피해. 약화(물리 피해 25% 감소) 2턴 부여. 타격 시 탄약 1 획득.';
          break;

        // --- 특수 공격 ---
        case 'makeshift_napalm':
          upgradedCard.name = '급조된 네이팜+';
          upgradedCard.effects = [{ type: 'DAMAGE', amount: 16, target: 'ALL_ENEMIES' }, { type: 'DEBUFF', condition: 'BURN', amount: 3, target: 'ALL_ENEMIES' }];
          upgradedCard.description = '모든 적에게 16 특수 피해, 3턴 화상(매 턴 3 피해) 부여.';
          break;
        case 'anti_materiel_snipe':
          upgradedCard.name = '대물 저격 사격+';
          upgradedCard.effects = [{ type: 'DAMAGE', amount: 24, condition: 'BONUS_IF_ATTACKING_14' }];
          upgradedCard.description = '적에게 24 특수 피해. 대상 다음 의도가 \'공격\'이면 추가 14 피해.';
          break;
        case 'overcharge_coilgun':
          upgradedCard.name = '과충전 코일건+';
          upgradedCard.effects = [{ type: 'DAMAGE', amount: 11, condition: 'PER_AMMO_CONSUMED' }];
          upgradedCard.description = '소모한 탄약 1당 11 특수 피해. (모든 탄약 소모) (소멸)';
          break;
        case 'toxic_gas_grenade':
          upgradedCard.name = '수제 독성 가스탄+';
          upgradedCard.effects = [{ type: 'DAMAGE', amount: 6, target: 'ALL_ENEMIES' }, { type: 'DEBUFF', condition: 'POISON', amount: 5, target: 'ALL_ENEMIES' }];
          upgradedCard.description = '모든 적에게 6 특수 피해, 맹독(방어 무시 지속 피해) 5스택 부여.';
          break;

        // --- 물리 방어 ---
        case 'spiked_barricade':
          upgradedCard.name = '가시 돋친 바리케이드+';
          upgradedCard.effects = [{ type: 'SHIELD', amount: 16 }, { type: 'BUFF', condition: 'REFLECT_PHYSICAL_6' }];
          upgradedCard.description = '16 물리 방어도. 이번 턴 물리 피격 시 6 물리 피해 반사.';
          break;
        case 'tactical_roll':
          upgradedCard.name = '전술적 구르기+';
          upgradedCard.effects = [{ type: 'SHIELD', amount: 8 }, { type: 'BUFF', condition: 'NEXT_PHYSICAL_FREE' }];
          upgradedCard.description = '8 물리 방어도. 다음에 사용하는 \'물리 공격\' 카드의 AP 소모가 0이 됨.';
          break;
        case 'torn_car_door':
          upgradedCard.name = '뜯어낸 차 문짝+';
          upgradedCard.effects = [{ type: 'SHIELD', amount: 10 }, { type: 'BUFF', condition: 'RETAIN_2_CARD' }];
          upgradedCard.description = '10 물리 방어도. 턴 종료 시 손패 2장을 다음 턴으로 보존(Retain).';
          break;
        case 'last_stand':
          upgradedCard.name = '결사항전+';
          upgradedCard.effects = [{ type: 'SHIELD', amount: 14 }];
          upgradedCard.description = '14 물리 방어도. 이번 턴 더 이상 \'물리 공격\' 카드 사용 불가.';
          break;

        // --- 특수 방어 ---
        case 'lead_coated_cloak':
          upgradedCard.name = '납 코팅 망토+';
          upgradedCard.effects = [{ type: 'RESIST', amount: 20 }, { type: 'BUFF', condition: 'AP_ON_SPECIAL_DEFEND_1' }];
          upgradedCard.description = '20 특수 방어도. 이번 턴 특수 공격 방어 시 다음 턴 1 AP 추가.';
          break;
        case 'emp_grenade':
          upgradedCard.name = '소형 EMP 투척+';
          upgradedCard.effects = [{ type: 'RESIST', amount: 10 }, { type: 'DEBUFF', condition: 'WEAK', amount: 2, target: 'ALL_ENEMIES' }];
          upgradedCard.description = '10 특수 방어도. 모든 적에게 약화(물리 타격 감소) 2턴 부여.';
          break;
        case 'emergency_antidote':
          upgradedCard.name = '비상용 해독 주사+';
          upgradedCard.costAp = 0;
          upgradedCard.effects = [{ type: 'RESIST', amount: 5 }, { type: 'BUFF', condition: 'PURIFY_1', target: 'PLAYER' }];
          upgradedCard.description = '5 특수 방어도. 플레이어에게 걸린 무작위 디버프 1개 즉시 해제.';
          break;
        case 'current_absorber':
          upgradedCard.name = '전류 흡수망+';
          upgradedCard.effects = [{ type: 'RESIST', amount: 16 }, { type: 'BUFF', condition: 'AMMO_ON_SPECIAL_DEFEND_2' }];
          upgradedCard.description = '16 특수 방어도. 적의 특수 공격을 방어할 때마다 탄약 2 획득.';
          break;

        // --- 변화 (UTILITY) ---
        case 'illegal_stimulant':
          upgradedCard.name = '불법 전투 자극제+';
          upgradedCard.effects = [{ type: 'HEAL', amount: -3, target: 'PLAYER' }, { type: 'BUFF', condition: 'ADD_AP_3' }, { type: 'DRAW', amount: 3 }];
          upgradedCard.description = '체력 3 감소. 3 AP 획득, 카드 3장 드로우. (소멸)';
          break;
        case 'scrap_recycling':
          upgradedCard.name = '고철 재활용 공학+';
          upgradedCard.costAp = 1;
          upgradedCard.description = '[지속] 이번 전투 중 방어 카드(물리/특수) 사용 시 50% 확률로 탄약 1 획득.';
          break;
        case 'survival_of_fittest':
          upgradedCard.name = '약육강식+';
          upgradedCard.effects = [{ type: 'DEBUFF', condition: 'MARK_OF_FATE_6_3' }];
          upgradedCard.description = '적 1명 지정. 이번 턴 해당 적 사망 시 체력 6 회복, 탄약 3 획득.';
          break;
        case 'duct_tape_engineering':
          upgradedCard.name = '청테이프 공학+';
          upgradedCard.costAp = 1;
          upgradedCard.description = '[지속] \'물리 공격\' 카드 사용할 때마다 가하는 물리 피해 영구 2 증가.';
          break;
      }

      return upgradedCard;
    });

    return { masterDeck: newMasterDeck };
  }),

  // 새로운 전투 시작 시 masterDeck의 복사본을 받아 셔플하여 drawPile로 세팅
  initDeck: () => {
    useAudioStore.getState().playDraw(); // 덱 초기 셔플음
    set((state) => ({
      drawPile: customShuffle([...state.masterDeck]),
      hand: [],
      discardPile: [],
      exhaustPile: [],
    }));
  },

  // 덱(Draw Pile)에서 핸드(Hand)로 카드 이동 처리
  drawCards: (count: number) => {
    if (count > 0) useAudioStore.getState().playDraw(); // 카드 뽑는 소리
    set((state) => {
      let currentDraw = [...state.drawPile];
      let currentDiscard = [...state.discardPile];
      const newHand = [...state.hand];

      for (let i = 0; i < count; i++) {
        if (currentDraw.length === 0) {
          if (currentDiscard.length === 0) {
            // 뽑을 카드도 버려진 카드도 없다면 반복 종료(덱 텅 빔 무한루프 방지)
            break;
          }
          // 뽑을 카드가 다 떨어지면 버려진 카드뭉치를 셔플하여 다시 DrawPile로 옮김
          currentDraw = customShuffle(currentDiscard);
          currentDiscard = [];
        }

        const drawnCard = currentDraw.shift();
        if (drawnCard) {
          // 🌟 핸드 최대 10장 제한
          if (newHand.length >= 10) break;
          newHand.push(drawnCard);
        }
      }

      return {
        drawPile: currentDraw,
        discardPile: currentDiscard,
        hand: newHand,
      };
    });
  },

  // 핸드에서 카드를 빼서 버림/소멸 영역으로 보냄 (효과 적용은 useCardPlay.ts 훅에서 관장)
  playCardFromHand: (cardId: string) => {
    set((state) => {
      const cardIndex = state.hand.findIndex((c) => c.id === cardId);
      if (cardIndex === -1) return state;

      const playedCard = state.hand[cardIndex];
      const newHand = [...state.hand];
      newHand.splice(cardIndex, 1);

      if (playedCard.isExhaust) {
        return {
          hand: newHand,
          exhaustPile: [...state.exhaustPile, playedCard],
        };
      }

      return {
        hand: newHand,
        discardPile: [...state.discardPile, playedCard],
      };
    });
  },

  // 턴 종류 시 손에 쥔 모든 카드를 버린뭉치로 보내기 
  discardHand: () => {
    set((state) => ({
      hand: [],
      discardPile: [...state.discardPile, ...state.hand],
    }));
  },

  // 특정 형태의 덱 뷰어 띄우기 (또는 NONE으로 닫기)
  setViewingPile: (pile: PileType) => set({ viewingPile: pile }),

  // 몹의 패턴/이벤트 등으로 덱(버린 카드 더미)에 강제로 카드를 한 장 삽입
  addCardToDiscardPile: (cardBlueprint: Omit<Card, 'id'>) => set((state) => {
    const newCard: Card = {
      ...cardBlueprint,
      id: `${cardBlueprint.type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };
    return { discardPile: [...state.discardPile, newCard] };
  }),
}));
