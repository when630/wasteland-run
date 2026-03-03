import { create } from 'zustand';
import { Card } from '../types/gameTypes';
import { customShuffle } from '../utils/rng';

export type PileType = 'NONE' | 'DECK' | 'DRAW' | 'DISCARD' | 'EXHAUST';

interface DeckState {
  drawPile: Card[];
  hand: Card[];
  discardPile: Card[];
  exhaustPile: Card[];
  viewingPile: PileType; // 현재 열려있는 덱 뷰어의 종류

  // Actions
  initDeck: (deckArray: Card[]) => void;
  drawCards: (count: number) => void;
  playCardFromHand: (cardId: string) => void;
  discardHand: () => void;
  setViewingPile: (pile: PileType) => void;
}

export const useDeckStore = create<DeckState>((set, get) => ({
  drawPile: [],
  hand: [],
  discardPile: [],
  exhaustPile: [], // 이번 전투 중 영구히 사용 불가능한 상태
  viewingPile: 'NONE',

  // 새로운 런이나 전투 시작 시 덱을 받고 섞음
  initDeck: (deckArray: Card[]) => {
    set({
      drawPile: customShuffle(deckArray),
      hand: [],
      discardPile: [],
      exhaustPile: [],
    });
  },

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
}));
