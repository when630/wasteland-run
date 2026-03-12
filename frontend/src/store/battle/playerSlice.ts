import type { StateCreator } from 'zustand';
import type { BattleState, PlayerSlice } from './types';
import { DEFAULT_PLAYER_STATUS } from './types';

export const createPlayerSlice: StateCreator<BattleState, [], [], PlayerSlice> = (set, get) => ({
  playerActionPoints: 3,
  playerMaxAp: 3,
  playerAmmo: 0,
  playerStatus: { ...DEFAULT_PLAYER_STATUS },
  playerDebuffs: {},
  playerHitQueue: [],
  playerSpriteState: 'IDLE',
  hasPlayedUtilityThisTurn: false,
  powerDefenseAmmo50: false,
  powerPhysicalScalingActive: false,
  powerPhysicalScalingBonus: 0,
  bonusApNextTurn: 0,

  consumeAp: (amount: number) => {
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

  addPlayerShield: (amount: number) => set((state) => ({
    playerStatus: { ...state.playerStatus, shield: state.playerStatus.shield + amount }
  })),

  addPlayerResist: (amount: number) => set((state) => ({
    playerStatus: { ...state.playerStatus, resist: state.playerStatus.resist + amount }
  })),

  consumePlayerHitQueue: () => set((state) => ({
    playerHitQueue: state.playerHitQueue.slice(1)
  })),

  setPlayerSpriteState: (spriteState) => set({ playerSpriteState: spriteState }),

  setPlayerStatusField: (field) => set((state) => ({
    playerStatus: { ...state.playerStatus, ...field }
  })),

  setMarkOfFate: (enemyId, healAmount, ammoAmount) => set((state) => ({
    playerStatus: { ...state.playerStatus, markOfFate: { enemyId, healAmount, ammoAmount } }
  })),

  setPowerDefenseAmmo50: (active) => set({ powerDefenseAmmo50: active }),
  setPowerPhysicalScaling: (active) => set({ powerPhysicalScalingActive: active }),
  addPhysicalScalingBonus: (amount) => set((state) => ({
    powerPhysicalScalingBonus: state.powerPhysicalScalingBonus + amount
  })),
  setPlayedUtilityThisTurn: (value: boolean) => set({ hasPlayedUtilityThisTurn: value }),
});
