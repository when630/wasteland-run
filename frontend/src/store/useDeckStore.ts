import { create } from 'zustand';
import type { Card } from '../types/gameTypes';
import { customShuffle } from '../utils/rng';
import { useRngStore } from './useRngStore';
import { useAudioStore } from './useAudioStore';
import { applyUpgrade } from '../logic/cardUpgrades';
import { dispatchCardAnim, getDrawPilePos, getHandCenterPos, cardTypeToColor } from '../components/ui/cardAnimations';

// 드로우 세대 카운터 — Strict Mode 이중 마운트 시 이전 배치의 setTimeout 무효화
let drawGeneration = 0;

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
  discardHandWithRetain: (retainCount: number) => void;
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
      id: `${cardBlueprint.type}-${Date.now()}-${crypto.randomUUID()}`
    };
    return { masterDeck: [...state.masterDeck, newCard] };
  }),

  // 카드 영구 강화 액션
  upgradeCard: (cardId: string) => set((state) => ({
    masterDeck: state.masterDeck.map(card =>
      card.id === cardId ? applyUpgrade(card) : card
    ),
  })),

  // 새로운 전투 시작 시 masterDeck의 복사본을 받아 셔플하여 drawPile로 세팅
  initDeck: () => {
    drawGeneration++; // 이전 드로우 타이머 전부 무효화
    useAudioStore.getState().playDraw(); // 덱 초기 셔플음
    set((state) => ({
      drawPile: customShuffle([...state.masterDeck], useRngStore.getState().shuffleRng),
      hand: [],
      discardPile: [],
      exhaustPile: [],
    }));
  },

  // 덱(Draw Pile)에서 핸드(Hand)로 카드 이동 처리
  // 카드가 날아오는 애니메이션 도착 시점에 맞춰 핸드에 하나씩 추가
  drawCards: (count: number) => {
    if (count > 0) useAudioStore.getState().playDraw();

    // 현재 상태 스냅샷으로 뽑을 카드 결정
    const snap = useDeckStore.getState();
    let currentDraw = [...snap.drawPile];
    let currentDiscard = [...snap.discardPile];
    const drawnCards: Card[] = [];

    for (let i = 0; i < count; i++) {
      if (currentDraw.length === 0) {
        if (currentDiscard.length === 0) break;
        currentDraw = customShuffle(currentDiscard, useRngStore.getState().shuffleRng);
        currentDiscard = [];
      }

      const drawnCard = currentDraw.shift();
      if (drawnCard) {
        if (snap.hand.length + drawnCards.length >= 10) break;
        drawnCards.push(drawnCard);
      }
    }

    // 뽑을 덱/버린 덱 즉시 갱신 (카드가 덱에서 빠짐)
    set({ drawPile: currentDraw, discardPile: currentDiscard });

    // 애니메이션 디스패치 + 도착 시점에 핸드 추가
    const gen = drawGeneration; // 현재 세대 캡처
    const from = getDrawPilePos();
    const to = getHandCenterPos();
    drawnCards.forEach((card, i) => {
      const delay = i * 120;
      const duration = 400;

      dispatchCardAnim({
        type: 'DRAW',
        cardName: card.name,
        cardColor: cardTypeToColor(card.type),
        cardType: card.type,
        cardCostAp: card.costAp,
        fromX: from.x,
        fromY: from.y,
        toX: to.x + (i - (drawnCards.length - 1) / 2) * 30,
        toY: to.y,
        delay,
        duration,
      });

      // 애니메이션 도착 직전에 핸드에 카드 추가 (자연스러운 전환)
      setTimeout(() => {
        if (gen !== drawGeneration) return; // Strict Mode 이중 호출 방지
        set((s) => ({ hand: [...s.hand, card] }));
      }, delay + Math.round(duration * 0.85));
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

      // 카드 사용 애니메이션 디스패치
      const from = getHandCenterPos();
      const color = cardTypeToColor(playedCard.type);

      if (playedCard.isExhaust) {
        // 소멸: 제자리에서 위로 살짝 올라가며 파티클로 분해
        dispatchCardAnim({
          type: 'EXHAUST',
          cardName: playedCard.name,
          cardColor: color,
          cardType: playedCard.type,
          cardCostAp: playedCard.costAp,
          fromX: from.x,
          fromY: from.y,
          toX: from.x,
          toY: from.y - 80,
          delay: 0,
          duration: 400,
        });
        return {
          hand: newHand,
          exhaustPile: [...state.exhaustPile, playedCard],
        };
      }

      // 버리기: 버린 덱 쪽으로 날아감
      const discardPos = { x: window.innerWidth - 120, y: window.innerHeight - 55 };
      dispatchCardAnim({
        type: 'DISCARD',
        cardName: playedCard.name,
        cardColor: color,
        cardType: playedCard.type,
        cardCostAp: playedCard.costAp,
        fromX: from.x,
        fromY: from.y,
        toX: discardPos.x,
        toY: discardPos.y,
        delay: 0,
        duration: 350,
      });

      return {
        hand: newHand,
        discardPile: [...state.discardPile, playedCard],
      };
    });
  },

  // 턴 종료 시 손에 쥔 모든 카드를 버린뭉치로 보내기
  discardHand: () => {
    set((state) => {
      // 버리기 애니메이션
      const from = getHandCenterPos();
      const discardPos = { x: window.innerWidth - 120, y: window.innerHeight - 55 };
      state.hand.forEach((card, i) => {
        dispatchCardAnim({
          type: 'DISCARD',
          cardName: card.name,
          cardColor: cardTypeToColor(card.type),
          cardType: card.type,
          cardCostAp: card.costAp,
          fromX: from.x + (i - (state.hand.length - 1) / 2) * 20,
          fromY: from.y,
          toX: discardPos.x,
          toY: discardPos.y,
          delay: i * 50,
          duration: 250,
        });
      });
      return {
        hand: [],
        discardPile: [...state.discardPile, ...state.hand],
      };
    });
  },

  // 턴 종료 시 N장을 보존(Retain)하고 나머지만 버린뭉치로 보냄
  discardHandWithRetain: (retainCount: number) => {
    set((state) => {
      if (retainCount <= 0 || state.hand.length === 0) {
        return { hand: [], discardPile: [...state.discardPile, ...state.hand] };
      }
      const actualRetain = Math.min(retainCount, state.hand.length);
      const retained = state.hand.slice(0, actualRetain);
      const discarded = state.hand.slice(actualRetain);
      return { hand: retained, discardPile: [...state.discardPile, ...discarded] };
    });
  },

  // 특정 형태의 덱 뷰어 띄우기 (또는 NONE으로 닫기)
  setViewingPile: (pile: PileType) => set({ viewingPile: pile }),

  // 몹의 패턴/이벤트 등으로 덱(버린 카드 더미)에 강제로 카드를 한 장 삽입
  addCardToDiscardPile: (cardBlueprint: Omit<Card, 'id'>) => set((state) => {
    const newCard: Card = {
      ...cardBlueprint,
      id: `${cardBlueprint.type}-${Date.now()}-${crypto.randomUUID()}`
    };
    return { discardPile: [...state.discardPile, newCard] };
  }),
}));
