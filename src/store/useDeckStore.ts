import { create } from 'zustand';
import type { Card } from '../types/gameTypes';
import { customShuffle } from '../utils/rng';

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
          upgradedCard.effects = [{ type: 'DAMAGE', amount: 19 }];
          upgradedCard.description = '특수 피해 19를 줍니다.';
          break;
        case 'scavenge':
          upgradedCard.name = '잔해 뒤지기+';
          upgradedCard.effects = [{ type: 'ADD_AMMO', amount: 3 }];
          upgradedCard.description = '탄약을 3개 얻습니다.';
          break;
        // 추후 추가될 카드들은 여기에 정의
      }

      return upgradedCard;
    });

    return { masterDeck: newMasterDeck };
  }),

  // 새로운 전투 시작 시 masterDeck의 복사본을 받아 셔플하여 drawPile로 세팅
  initDeck: () => set((state) => ({
    drawPile: customShuffle([...state.masterDeck]),
    hand: [],
    discardPile: [],
    exhaustPile: [],
  })),

  // 덱(Draw Pile)에서 핸드(Hand)로 카드 이동 처리
  drawCards: (count: number) => {
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
          // TODO: 핸드 최대 장수 제한이 기획적으로 필요하다면 이 곳에 10장 같은 조건 추가
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
