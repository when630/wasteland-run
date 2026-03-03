import { create } from 'zustand';

interface RunState {
  playerHp: number;
  playerMaxHp: number;
  gold: number;
  currentMapNode: string | null;
  currentScene: 'MAP' | 'BATTLE' | 'REST' | 'EVENT' | 'SHOP' | 'BOSS'; // 🌟 전역 씬 상태

  // Actions
  healPlayer: (amount: number) => void;
  damagePlayer: (amount: number) => void;
  addGold: (amount: number) => void;
  setMapNode: (nodeId: string) => void;
  setScene: (scene: RunState['currentScene']) => void; // 🌟 씬 전환 액션
}

export const useRunStore = create<RunState>((set) => ({
  playerHp: 50,
  playerMaxHp: 70,
  gold: 0,
  currentMapNode: null,
  currentScene: 'MAP', // 기본 씬은 맵으로 시작

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
  })
}));
