import { create } from 'zustand';

type TurnState = 'PLAYER' | 'ENEMY' | 'RESOLVE';

interface BattleState {
  currentTurn: TurnState;
  turnCount: number;
  playerActionPoints: number;
  playerAmmo: number;
  // Actions
  startPlayerTurn: () => void;
  endPlayerTurn: () => void;
  useAp: (amount: number) => boolean;
  addAmmo: (amount: number) => void;
}

export const useBattleStore = create<BattleState>((set, get) => ({
  currentTurn: 'PLAYER',
  turnCount: 1,
  playerActionPoints: 3,
  playerAmmo: 0,

  startPlayerTurn: () => set((state) => ({
    currentTurn: 'PLAYER',
    playerActionPoints: 3,
    turnCount: state.turnCount + 1
  })),

  endPlayerTurn: () => set({ currentTurn: 'ENEMY' }),

  useAp: (amount: number) => {
    const { playerActionPoints } = get();
    if (playerActionPoints >= amount) {
      set({ playerActionPoints: playerActionPoints - amount });
      return true;
    }
    return false;
  },

  addAmmo: (amount: number) => set((state) => ({
    playerAmmo: state.playerAmmo + amount
  })),
}));
