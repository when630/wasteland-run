import { create } from 'zustand';

interface RunState {
  playerHp: number;
  playerMaxHp: number;
  gold: number;
  currentMapNode: string | null;
  currentScene: 'MAP' | 'BATTLE' | 'ELITE' | 'REST' | 'EVENT' | 'SHOP' | 'BOSS'; // 🌟 씬 타입 확장
  relics: string[];
  toastMessage: string | null; // 🌟 전역 알림 메시지 상태 // 🌟 획득한 유물 ID 배열

  // Actions
  healPlayer: (amount: number) => void;
  damagePlayer: (amount: number) => void;
  addGold: (amount: number) => void;
  setMapNode: (nodeId: string) => void;
  setScene: (scene: RunState['currentScene']) => void; // 🌟 씬 전환 액션
  addRelic: (relicId: string) => void; // 🌟 유물 추가 액션
  setToastMessage: (msg: string | null) => void; // 🌟 토스트 메시지 액션
}

export const useRunStore = create<RunState>((set) => ({
  playerHp: 50,
  playerMaxHp: 70,
  gold: 0,
  currentMapNode: null,
  currentScene: 'MAP', // 기본 씬은 맵으로 시작
  relics: [],
  toastMessage: null,

  healPlayer: (amount: number) => set((state) => ({
    playerHp: Math.min(state.playerHp + amount, state.playerMaxHp)
  })),

  damagePlayer: (amount: number) => set((state) => ({
    playerHp: Math.max(state.playerHp - amount, 0)
  })),

  addGold: (amount: number) => set((state) => ({
    gold: state.gold + amount
  })),

  setMapNode: (nodeId: string) => set({
    currentMapNode: nodeId
  }),

  setScene: (scene) => set({
    currentScene: scene
  }),

  addRelic: (relicId) => set((state) => ({
    relics: [...state.relics, relicId]
  })),

  setToastMessage: (msg) => set({ toastMessage: msg })
}));
